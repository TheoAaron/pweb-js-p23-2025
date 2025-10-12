"use strict";
// Recipes page TypeScript
// Utility functions
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => func(...args), wait);
    };
}
function getElementByIdRecipe(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element with id "${id}" not found`);
    }
    return element;
}
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star">★</span>';
    }
    if (hasHalfStar) {
        stars += '<span class="star">☆</span>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<span class="star empty">☆</span>';
    }
    return stars;
}
function formatCookTime(prepTime, cookTime) {
    const total = prepTime + cookTime;
    if (total < 60) {
        return `${total} min`;
    }
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}
function capitalize(str) {
    return str.replace(/\b\w/g, l => l.toUpperCase());
}
function truncateText(text, length) {
    if (text.length <= length)
        return text;
    return text.substring(0, length).trim() + '...';
}
function sanitizeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
// API Service for Recipes
class RecipeApiService {
    static async fetchWithErrorHandling(url, options) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }
    static async getRecipes(limit, skip) {
        let url = `${this.BASE_URL}${this.RECIPES_ENDPOINT}`;
        const params = new URLSearchParams();
        if (limit)
            params.append('limit', limit.toString());
        if (skip)
            params.append('skip', skip.toString());
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        return this.fetchWithErrorHandling(url);
    }
    static async searchRecipes(query) {
        const url = `${this.BASE_URL}${this.RECIPES_ENDPOINT}/search?q=${encodeURIComponent(query)}`;
        return this.fetchWithErrorHandling(url);
    }
    static async getRecipeById(id) {
        const url = `${this.BASE_URL}${this.RECIPES_ENDPOINT}/${id}`;
        return this.fetchWithErrorHandling(url);
    }
}
RecipeApiService.BASE_URL = 'https://dummyjson.com';
RecipeApiService.RECIPES_ENDPOINT = '/recipes';
// Recipe Manager Class
class RecipeManager {
    constructor() {
        this.allRecipes = [];
        this.filteredRecipes = [];
        this.displayedRecipes = [];
        this.currentDisplayCount = 0;
        this.recipesPerPage = 12;
        this.availableCuisines = new Set();
        this.debouncedSearch = debounce(this.performSearch.bind(this), 500);
        this.checkAuthentication();
        this.initializeElements();
        this.bindEvents();
        this.loadInitialData();
    }
    checkAuthentication() {
        const firstName = localStorage.getItem('firstName');
        if (!firstName) {
            window.location.href = 'index.html';
            return;
        }
    }
    initializeElements() {
        try {
            this.searchInput = getElementByIdRecipe('searchInput');
            this.cuisineFilter = getElementByIdRecipe('cuisineFilter');
            this.recipesGrid = getElementByIdRecipe('recipesGrid');
            this.loadingState = getElementByIdRecipe('loadingState');
            this.errorState = getElementByIdRecipe('errorState');
            this.recipesContainer = getElementByIdRecipe('recipesContainer');
            this.showMoreContainer = getElementByIdRecipe('showMoreContainer');
            this.showMoreBtn = getElementByIdRecipe('showMoreBtn');
            this.noResults = getElementByIdRecipe('noResults');
            this.userName = getElementByIdRecipe('userName');
            this.logoutBtn = getElementByIdRecipe('logoutBtn');
            this.retryBtn = getElementByIdRecipe('retryBtn');
            this.recipeModal = getElementByIdRecipe('recipeModal');
            this.recipeDetail = getElementByIdRecipe('recipeDetail');
            this.searchSpinner = getElementByIdRecipe('searchSpinner');
            // Set user name
            const firstName = localStorage.getItem('firstName');
            this.userName.textContent = firstName || 'User';
        }
        catch (error) {
            console.error('Error initializing elements:', error);
        }
    }
    bindEvents() {
        // Search functionality
        this.searchInput.addEventListener('input', () => {
            this.searchSpinner.classList.remove('hidden');
            this.debouncedSearch();
        });
        // Filter functionality
        this.cuisineFilter.addEventListener('change', () => {
            this.applyFilters();
        });
        // Show more button
        this.showMoreBtn.addEventListener('click', () => {
            this.showMoreRecipes();
        });
        // Logout button
        this.logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('firstName');
            window.location.href = 'index.html';
        });
        // Retry button
        this.retryBtn.addEventListener('click', () => {
            this.loadInitialData();
        });
        // Modal close functionality
        const closeBtn = this.recipeModal.querySelector('.close');
        closeBtn?.addEventListener('click', () => {
            this.closeModal();
        });
        // Close modal when clicking outside
        this.recipeModal.addEventListener('click', (e) => {
            if (e.target === this.recipeModal) {
                this.closeModal();
            }
        });
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.recipeModal.classList.contains('hidden')) {
                this.closeModal();
            }
        });
    }
    async loadInitialData() {
        try {
            this.showLoadingState();
            const recipesResponse = await RecipeApiService.getRecipes(100); // Load first 100 recipes
            this.allRecipes = recipesResponse.recipes;
            this.filteredRecipes = [...this.allRecipes];
            this.extractCuisines();
            this.populateCuisineFilter();
            this.displayRecipes();
            this.showRecipesContainer();
        }
        catch (error) {
            console.error('Error loading recipes:', error);
            this.showErrorState();
        }
    }
    extractCuisines() {
        this.availableCuisines.clear();
        this.allRecipes.forEach(recipe => {
            if (recipe.cuisine) {
                this.availableCuisines.add(recipe.cuisine);
            }
        });
    }
    populateCuisineFilter() {
        // Clear existing options except the first one
        while (this.cuisineFilter.children.length > 1) {
            this.cuisineFilter.removeChild(this.cuisineFilter.lastChild);
        }
        // Add cuisine options
        Array.from(this.availableCuisines)
            .sort()
            .forEach(cuisine => {
            const option = document.createElement('option');
            option.value = cuisine;
            option.textContent = capitalize(cuisine);
            this.cuisineFilter.appendChild(option);
        });
    }
    async performSearch() {
        const query = this.searchInput.value.trim();
        try {
            if (query) {
                // Search in API
                const searchResponse = await RecipeApiService.searchRecipes(query);
                this.filteredRecipes = searchResponse.recipes;
            }
            else {
                // Show all recipes
                this.filteredRecipes = [...this.allRecipes];
            }
            this.applyFilters();
        }
        catch (error) {
            console.error('Search error:', error);
            this.filteredRecipes = [];
            this.displayRecipes();
        }
        finally {
            this.searchSpinner.classList.add('hidden');
        }
    }
    applyFilters() {
        const selectedCuisine = this.cuisineFilter.value;
        const searchQuery = this.searchInput.value.trim().toLowerCase();
        let filtered = [...this.filteredRecipes];
        // Apply cuisine filter
        if (selectedCuisine) {
            filtered = filtered.filter(recipe => recipe.cuisine === selectedCuisine);
        }
        // Apply additional client-side search for ingredients and tags
        if (searchQuery && this.searchInput.value.trim()) {
            filtered = filtered.filter(recipe => {
                const name = recipe.name.toLowerCase();
                const cuisine = recipe.cuisine.toLowerCase();
                const ingredients = recipe.ingredients.join(' ').toLowerCase();
                const tags = recipe.tags.join(' ').toLowerCase();
                return name.includes(searchQuery) ||
                    cuisine.includes(searchQuery) ||
                    ingredients.includes(searchQuery) ||
                    tags.includes(searchQuery);
            });
        }
        this.filteredRecipes = filtered;
        this.currentDisplayCount = 0;
        this.displayRecipes();
    }
    displayRecipes() {
        const startIndex = this.currentDisplayCount;
        const endIndex = Math.min(startIndex + this.recipesPerPage, this.filteredRecipes.length);
        const recipesToShow = this.filteredRecipes.slice(startIndex, endIndex);
        if (startIndex === 0) {
            this.recipesGrid.innerHTML = '';
        }
        if (this.filteredRecipes.length === 0) {
            this.showNoResults();
            return;
        }
        this.hideNoResults();
        recipesToShow.forEach(recipe => {
            const recipeCard = this.createRecipeCard(recipe);
            this.recipesGrid.appendChild(recipeCard);
        });
        this.currentDisplayCount = endIndex;
        this.updateShowMoreButton();
    }
    createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        const totalTime = formatCookTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes);
        const stars = generateStarRating(recipe.rating);
        const truncatedIngredients = recipe.ingredients.slice(0, 6);
        card.innerHTML = `
            <img src="${sanitizeHtml(recipe.image)}" alt="${sanitizeHtml(recipe.name)}" class="recipe-image" loading="lazy">
            <div class="recipe-content">
                <h3 class="recipe-title">${sanitizeHtml(recipe.name)}</h3>
                
                <div class="recipe-meta">
                    <div class="meta-item">
                        <span>⏱️</span>
                        <span>${totalTime}</span>
                    </div>
                    <div class="meta-item">
                        <span>👥</span>
                        <span>${recipe.servings} servings</span>
                    </div>
                    <div class="meta-item">
                        <span>📊</span>
                        <span>${capitalize(recipe.difficulty)}</span>
                    </div>
                </div>

                <div class="recipe-rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-value">${recipe.rating} (${recipe.reviewCount} reviews)</span>
                </div>

                <div class="recipe-cuisine">${sanitizeHtml(capitalize(recipe.cuisine))}</div>

                <div class="recipe-ingredients">
                    <h4>Ingredients:</h4>
                    <div class="ingredients-list">
                        ${truncatedIngredients.map(ingredient => `<span class="ingredient-tag">${sanitizeHtml(truncateText(ingredient, 20))}</span>`).join('')}
                        ${recipe.ingredients.length > 6 ? '<span class="ingredient-tag">+more...</span>' : ''}
                    </div>
                </div>

                <button class="view-recipe-btn" onclick="recipeManager.showRecipeDetail(${recipe.id})">
                    View Full Recipe
                </button>
            </div>
        `;
        return card;
    }
    showMoreRecipes() {
        this.displayRecipes();
    }
    updateShowMoreButton() {
        if (this.currentDisplayCount < this.filteredRecipes.length) {
            this.showMoreContainer.classList.remove('hidden');
        }
        else {
            this.showMoreContainer.classList.add('hidden');
        }
    }
    async showRecipeDetail(recipeId) {
        try {
            const recipe = await RecipeApiService.getRecipeById(recipeId);
            this.renderRecipeDetail(recipe);
            this.openModal();
        }
        catch (error) {
            console.error('Error loading recipe detail:', error);
            alert('Failed to load recipe details. Please try again.');
        }
    }
    renderRecipeDetail(recipe) {
        const totalTime = formatCookTime(recipe.prepTimeMinutes, recipe.cookTimeMinutes);
        const stars = generateStarRating(recipe.rating);
        this.recipeDetail.innerHTML = `
            <img src="${sanitizeHtml(recipe.image)}" alt="${sanitizeHtml(recipe.name)}" class="detail-image">
            
            <h2 class="detail-title">${sanitizeHtml(recipe.name)}</h2>
            
            <div class="detail-meta">
                <div class="meta-item">
                    <strong>Cook Time:</strong> ${totalTime}
                </div>
                <div class="meta-item">
                    <strong>Servings:</strong> ${recipe.servings}
                </div>
                <div class="meta-item">
                    <strong>Difficulty:</strong> ${capitalize(recipe.difficulty)}
                </div>
                <div class="meta-item">
                    <strong>Cuisine:</strong> ${sanitizeHtml(capitalize(recipe.cuisine))}
                </div>
                <div class="meta-item">
                    <strong>Calories:</strong> ${recipe.caloriesPerServing} per serving
                </div>
                <div class="meta-item">
                    <div class="recipe-rating">
                        <div class="stars">${stars}</div>
                        <span>${recipe.rating} (${recipe.reviewCount} reviews)</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Ingredients</h3>
                <div class="detail-ingredients">
                    ${recipe.ingredients.map(ingredient => `<div class="detail-ingredient">${sanitizeHtml(ingredient)}</div>`).join('')}
                </div>
            </div>

            <div class="detail-section">
                <h3>Instructions</h3>
                <ol class="detail-instructions">
                    ${recipe.instructions.map(instruction => `<li>${sanitizeHtml(instruction)}</li>`).join('')}
                </ol>
            </div>

            <div class="detail-section">
                <h3>Tags</h3>
                <div class="detail-tags">
                    ${recipe.tags.map(tag => `<span class="detail-tag">${sanitizeHtml(capitalize(tag))}</span>`).join('')}
                </div>
            </div>
        `;
    }
    openModal() {
        this.recipeModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    closeModal() {
        this.recipeModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
    showLoadingState() {
        this.loadingState.classList.remove('hidden');
        this.errorState.classList.add('hidden');
        this.recipesContainer.classList.add('hidden');
        this.noResults.classList.add('hidden');
    }
    showErrorState() {
        this.loadingState.classList.add('hidden');
        this.errorState.classList.remove('hidden');
        this.recipesContainer.classList.add('hidden');
        this.noResults.classList.add('hidden');
    }
    showRecipesContainer() {
        this.loadingState.classList.add('hidden');
        this.errorState.classList.add('hidden');
        this.recipesContainer.classList.remove('hidden');
    }
    showNoResults() {
        this.noResults.classList.remove('hidden');
        this.showMoreContainer.classList.add('hidden');
    }
    hideNoResults() {
        this.noResults.classList.add('hidden');
    }
}
// Global variable for accessing from HTML onclick
let recipeManager;
// Initialize the recipe manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    recipeManager = new RecipeManager();
});
//# sourceMappingURL=recipes.js.map