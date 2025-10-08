// ts/recipes.ts
import type { Recipe, RecipesResponse } from "./types";

/** Helpers */
const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: Document | HTMLElement = document) =>
  root.querySelector(sel) as T | null;

function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), wait);
  };
}

function escapeHtml(s: unknown): string {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, (c: string) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[c] ?? c;
  });
}

function renderStars(n: number | undefined): string {
  const stars = Math.max(0, Math.min(5, Math.round(Number(n || 0))));
  let out = "";
  for (let i = 0; i < 5; i++) out += i < stars ? "★" : "☆";
  return `<span style="color:#f59e0b">${out}</span>`;
}

document.addEventListener("DOMContentLoaded", () => {
  // Auth guard
  const firstName = localStorage.getItem("firstName");
  if (!firstName) {
    window.location.replace("index.html");
    return;
  }

  // DOM
  const userNameEl = $("#userName");
  const logoutBtn = $("#logoutBtn") as HTMLButtonElement | null;
  const searchInput = $("#searchInput") as HTMLInputElement | null;
  const cuisineFilter = $("#cuisineFilter") as HTMLSelectElement | null;
  const recipesContainer = $("#recipesContainer") as HTMLElement | null;
  const showMoreBtn = $("#showMoreBtn") as HTMLButtonElement | null;
  const errorEl = $("#error");
  const resultsInfo = $("#resultsInfo");
  const modal = $("#modal") as HTMLElement | null;
  const modalBody = $("#modalBody") as HTMLElement | null;
  const closeModalBtn = $("#closeModal") as HTMLButtonElement | null;

  if (!userNameEl || !logoutBtn || !searchInput || !cuisineFilter || !recipesContainer || !showMoreBtn || !modal || !modalBody) {
    console.warn("recipes.ts: missing required DOM elements, aborting init");
    return;
  }

  userNameEl.textContent = `Welcome, ${firstName}!`;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("firstName");
    localStorage.removeItem("userId");
    window.location.href = "index.html";
  });

  // State
  const API = "https://dummyjson.com/recipes?limit=1000";
  const pageSize = 9;
  let allRecipes: Recipe[] = [];
  let filtered: Recipe[] = [];
  let offset = 0;

  // Fetch
  async function fetchRecipes(): Promise<void> {
    setError("");
    setResultsInfo("Loading recipes…");
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to fetch recipes");
      const data = (await res.json()) as RecipesResponse;
      allRecipes = data.recipes || [];
      filtered = allRecipes.slice();
      hideError();
      populateCuisineOptions(allRecipes);
      renderMore(true);
      updateResultsInfo();
    } catch (err) {
      console.error(err);
      setError("Failed to load recipes. Please try again later.");
    }
  }

  // Cuisine dropdown
  function populateCuisineOptions(list: Recipe[]): void {
    cuisineFilter!.innerHTML = '<option value="">All Cuisines</option>';
    const set = new Set((list || []).map((r: Recipe) => r.cuisine).filter(Boolean) as string[]);
    const arr = Array.from(set).sort((a: string, b: string) => a.localeCompare(b));
    arr.forEach((c: string) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      cuisineFilter!.appendChild(opt);
    });
  }

  // Cards
  function renderCard(r: Recipe): HTMLElement {
    const el = document.createElement("article");
    el.className = "card";
    const imgSrc = r.image || r.thumbnail || "https://via.placeholder.com/400x250?text=No+Image";
    const cookMins = r.cookTimeMinutes ?? "—";
    const diff = r.difficulty || "—";
    const cui = r.cuisine || "—";
    const ingredients = (r.ingredients || []) as string[];
    const excerpt = `<strong>Ingredients:</strong> ${ingredients.slice(0, 4).join(", ")}${ingredients.length > 4 ? " + more" : ""}`;
    const tags = (r.tags || []).slice(0, 5).map((t: string) => `<span class="tag">${escapeHtml(t)}</span>`).join("");

    el.innerHTML = `
      <img src="${imgSrc}" alt="${escapeHtml(r.name)}" />
      <div class="card-body">
        <h3>${escapeHtml(r.name)}</h3>
        <div class="meta">
          <span class="badge">⏱ ${cookMins} mins</span>
          <span class="badge">${escapeHtml(diff)}</span>
          <span class="badge">${escapeHtml(cui)}</span>
        </div>
        <div class="excerpt">${excerpt}</div>
        <div class="tags">${tags}</div>
        <div class="card-footer">
          <div class="rating">${renderStars(r.rating)}</div>
          <div>
            <button class="btn btn-secondary view-btn" data-id="${r.id}">VIEW FULL RECIPE</button>
          </div>
        </div>
      </div>
    `;
    return el;
  }

  function clearCards(): void {
    recipesContainer!.innerHTML = "";
  }

  function renderMore(reset: boolean): void {
    if (reset) {
      offset = 0;
      clearCards();
    }
    const slice = filtered.slice(offset, offset + pageSize);
    slice.forEach((r: Recipe) => recipesContainer!.appendChild(renderCard(r)));
    offset += slice.length;
    showMoreBtn!.style.display = offset < filtered.length ? "inline-block" : "none";
    updateResultsInfo();
  }

  // Event delegation for view buttons
  recipesContainer!.addEventListener("click", (e: Event) => {
    const target = e.target as HTMLElement;
    const btn = target.closest(".view-btn") as HTMLButtonElement | null;
    if (!btn) return;
    const id = btn.dataset.id;
    const r = allRecipes.find((x: Recipe) => String(x.id) === String(id));
    if (r) showModal(r);
  });

  // Modal
  function showModal(r: Recipe): void {
    const img = r.image || r.thumbnail || "https://via.placeholder.com/700x350?text=No+Image";
    const steps: string[] = Array.isArray(r.instructions)
      ? (r.instructions as string[])
      : typeof r.instructions === "string"
      ? (r.instructions as string).split("\n").filter(Boolean)
      : [];

    modalBody!.innerHTML = `
      <h2>${escapeHtml(r.name)}</h2>
      <img src="${img}" alt="${escapeHtml(r.name)}" style="width:100%;height:auto;border-radius:8px;margin:8px 0;" />
      <p>
        <strong>Cook:</strong> ${r.cookTimeMinutes ?? "—"} mins
        &nbsp; <strong>Prep:</strong> ${r.prepTimeMinutes ?? "—"} mins
        &nbsp; <strong>Difficulty:</strong> ${escapeHtml(r.difficulty || "—")}
        &nbsp; <strong>Cuisine:</strong> ${escapeHtml(r.cuisine || "—")}
      </p>
      <h4>Ingredients</h4>
      <ul>${(r.ingredients || []).map((i: string) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
      <h4>Steps</h4>
      <ol>${steps.map((s: string) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
    `;
    modal!.style.display = "flex";
    document.body.style.overflow = "hidden"; // scroll lock
  }

  function closeModalFn(): void {
    modal!.style.display = "none";
    document.body.style.overflow = "";
  }

  closeModalBtn?.addEventListener("click", closeModalFn);
  modal!.addEventListener("click", (e: Event) => {
    if (e.target === modal) closeModalFn();
  });
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape" && modal!.style.display !== "none") closeModalFn();
  });

  // Filters
  function applyFilters(): void {
    const q = (searchInput!.value || "").toLowerCase().trim();
    const cuisine = cuisineFilter!.value;

    filtered = allRecipes.filter((r: Recipe) => {
      if (cuisine && r.cuisine !== cuisine) return false;
      if (!q) return true;
      const inName = (r.name || "").toLowerCase().includes(q);
      const inCuisine = (r.cuisine || "").toLowerCase().includes(q);
      const inIngredients = (r.ingredients || []).join(" ").toLowerCase().includes(q);
      const inTags = (r.tags || []).join(" ").toLowerCase().includes(q);
      return inName || inCuisine || inIngredients || inTags;
    });

    renderMore(true);
  }

  // Info & error
  function setResultsInfo(msg: string): void {
    if (resultsInfo) (resultsInfo as HTMLElement).textContent = msg;
  }

  function updateResultsInfo(): void {
    if (!resultsInfo) return;
    if (!filtered.length) {
      (resultsInfo as HTMLElement).textContent = "No results.";
      return;
    }
    (resultsInfo as HTMLElement).textContent = `Showing ${Math.min(offset, filtered.length)} of ${filtered.length} recipes`;
  }

  function setError(msg: string): void {
    if (!errorEl) return;
    const box = errorEl as HTMLElement;
    if (!msg) {
      box.style.display = "none";
      box.textContent = "";
    } else {
      box.style.display = "block";
      box.textContent = msg;
    }
  }
  function hideError(): void { setError(""); }

  // Events
  showMoreBtn!.addEventListener("click", () => renderMore(false));
  searchInput!.addEventListener("input", debounce(() => { applyFilters(); updateResultsInfo(); }, 300));
  cuisineFilter!.addEventListener("change", () => { applyFilters(); updateResultsInfo(); });

  // Init
  fetchRecipes();
});
