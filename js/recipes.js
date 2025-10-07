// Recipes page script
(function(){
	const API = 'https://dummyjson.com/recipes';
	const pageSize = 9; // cards per page
	let allRecipes = [];
	let filtered = [];
	let offset = 0;

	const userNameEl = document.getElementById('userName');
	const logoutBtn = document.getElementById('logoutBtn');
	const searchInput = document.getElementById('searchInput');
	const cuisineFilter = document.getElementById('cuisineFilter');
	const recipesContainer = document.getElementById('recipesContainer');
	const showMoreBtn = document.getElementById('showMoreBtn');
	const errorEl = document.getElementById('error');
	const modal = document.getElementById('modal');
	const modalBody = document.getElementById('modalBody');
	const closeModal = document.getElementById('closeModal');
	const resultsInfo = document.getElementById('resultsInfo');

	function requireLogin(){
		const name = localStorage.getItem('firstName');
		if (!name) { window.location.href = 'index.html'; return null; }
		userNameEl.textContent = `Welcome, ${name}!`;
		return name;
	}

	function showError(msg){ if (!errorEl) return; errorEl.textContent = msg; errorEl.style.display = 'block'; }
	function hideError(){ if (!errorEl) return; errorEl.style.display = 'none'; }

	async function fetchRecipes(){
		try{
			const res = await fetch(API);
			if (!res.ok) throw new Error('Failed to fetch recipes');
			const data = await res.json();
			allRecipes = data.recipes || [];
			filtered = allRecipes.slice();
			populateCuisineOptions(allRecipes);
			renderMore(true);
			updateResultsInfo();
		}catch(err){
			console.error(err);
			showError('Failed to load recipes. Please try again later.');
		}
	}

	function populateCuisineOptions(list){
		const set = new Set(list.map(r => r.cuisine).filter(Boolean));
		const arr = Array.from(set).sort();
		arr.forEach(c => {
			const opt = document.createElement('option');
			opt.value = c; opt.textContent = c;
			cuisineFilter.appendChild(opt);
		});
	}

	function renderCard(r){
		const el = document.createElement('article');
		el.className = 'card';
		el.innerHTML = `
			<img src="${r.thumbnail || r.image || 'https://via.placeholder.com/400x250?text=No+Image'}" alt="${escapeHtml(r.name)}" />
			<div class="card-body">
			  <h3>${escapeHtml(r.name)}</h3>
			  <div class="meta">
				<span class="badge">⏱ ${r.totalTime ?? r.time ?? '—'} mins</span>
				<span class="badge">${escapeHtml(r.difficulty || '—')}</span>
				<span class="badge">${escapeHtml(r.cuisine || '—')}</span>
			  </div>
			  <div class="excerpt"><strong>Ingredients:</strong> ${(r.ingredients||[]).slice(0,4).join(', ')}${(r.ingredients||[]).length>4? ' + more':''}</div>
			  <div class="tags">${(r.tags||[]).slice(0,5).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
			  <div class="card-footer">
				<div class="rating">${renderStars(r.spoonacularScore || r.aggregateLikes || r.rating || 0)}</div>
				<div>
					<button class="btn btn-secondary view-btn" data-id="${r.id}">VIEW FULL RECIPE</button>
				</div>
			  </div>
			</div>
		`;
		return el;
	}

	function renderStars(n){
		// n is variable—map to 0..5
		let score = Number(n) || 0;
		if (score > 5) score = Math.round((score / 10) * 5);
		const stars = Math.max(0, Math.min(5, Math.round(score)));
		let out = '';
		for(let i=0;i<5;i++) out += i<stars? '★':'☆';
		return `<span style="color:#f59e0b">${out}</span>`;
	}

	function escapeHtml(s){ if (!s && s!==0) return ''; return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

	function clearCards(){ recipesContainer.innerHTML = ''; }

	function renderMore(reset){
		if (reset){ offset = 0; clearCards(); }
		const slice = filtered.slice(offset, offset + pageSize);
		slice.forEach(r => recipesContainer.appendChild(renderCard(r)));
		offset += slice.length;
		showMoreBtn.style.display = offset < filtered.length ? 'inline-block' : 'none';
		attachViewButtons();
		updateResultsInfo();
	}

	function attachViewButtons(){
		document.querySelectorAll('.view-btn').forEach(b=>{
			b.removeEventListener('click', onViewClick);
			b.addEventListener('click', onViewClick);
		});
	}

	function onViewClick(e){
		const id = e.currentTarget.dataset.id;
		const r = allRecipes.find(x=>String(x.id)===String(id));
		if (!r) return;
		showModal(r);
	}

	function showModal(r){
		modalBody.innerHTML = `
			<h2>${escapeHtml(r.name)}</h2>
			<img src="${r.thumbnail || r.image || 'https://via.placeholder.com/700x350?text=No+Image'}" alt="${escapeHtml(r.name)}" style="width:100%;height:auto;border-radius:8px;margin:8px 0;" />
			<p><strong>Time:</strong> ${r.totalTime ?? r.time ?? '—'} mins &nbsp; <strong>Difficulty:</strong> ${escapeHtml(r.difficulty || '—')} &nbsp; <strong>Cuisine:</strong> ${escapeHtml(r.cuisine||'—')}</p>
			<h4>Ingredients</h4>
			<ul>${(r.ingredients||[]).map(i=>`<li>${escapeHtml(i)}</li>`).join('')}</ul>
			<h4>Steps</h4>
			<ol>${(Array.isArray(r.instructions) ? r.instructions : (typeof r.instructions === 'string' ? r.instructions.split('\n') : [])).map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol>
		`;
		modal.style.display = 'flex';
	}

	function closeModalFn(){ modal.style.display = 'none'; }

	function debounce(fn, wait){ let t; return function(...a){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,a), wait); }; }

	function applyFilters(){
		const q = (searchInput.value||'').toLowerCase().trim();
		const cuisine = cuisineFilter.value;
		filtered = allRecipes.filter(r=>{
			if (cuisine && r.cuisine !== cuisine) return false;
			if (!q) return true;
			const inName = (r.name||'').toLowerCase().includes(q);
			const inCuisine = (r.cuisine||'').toLowerCase().includes(q);
			const inIngredients = (r.ingredients||[]).join(' ').toLowerCase().includes(q);
			const inTags = (r.tags||[]).join(' ').toLowerCase().includes(q);
			return inName || inCuisine || inIngredients || inTags;
		});
		renderMore(true);
	}

	function updateResultsInfo(){
		if (!resultsInfo) return;
		resultsInfo.textContent = `Showing ${Math.min(offset || filtered.length, filtered.length)} of ${filtered.length} recipes`;
	}

	function setup(){
		const name = requireLogin(); if (!name) return;
		logoutBtn.addEventListener('click', ()=>{ localStorage.removeItem('firstName'); localStorage.removeItem('userId'); window.location.href='index.html'; });
		showMoreBtn.addEventListener('click', ()=>renderMore(false));
		if (closeModal) closeModal.addEventListener('click', closeModalFn);
		if (modal) modal.addEventListener('click', (e)=>{ if (e.target===modal) closeModalFn(); });
		if (searchInput) searchInput.addEventListener('input', debounce(()=>{ applyFilters(); updateResultsInfo(); }, 300));
		if (cuisineFilter) cuisineFilter.addEventListener('change', ()=>{ applyFilters(); updateResultsInfo(); });
		fetchRecipes();
	}

	if (!userNameEl || !logoutBtn || !searchInput || !cuisineFilter || !recipesContainer) {
		console.warn('recipes: missing DOM elements, aborting');
	} else {
		setup();
	}

})();

