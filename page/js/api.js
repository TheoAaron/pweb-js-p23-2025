// API service for the Recipe Collection app
class ApiService {
    /**
     * Generic fetch wrapper with error handling
     */
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
    /**
     * Get all users from the API
     */
    static async getUsers() {
        const url = `${this.BASE_URL}${this.USERS_ENDPOINT}`;
        return this.fetchWithErrorHandling(url);
    }
    /**
     * Authenticate user by username
     */
    static async authenticateUser(username, password) {
        if (!password.trim()) {
            throw new Error('Password cannot be empty');
        }
        const usersResponse = await this.getUsers();
        const user = usersResponse.users.find(u => u.username === username);
        if (!user) {
            throw new Error('Invalid username or password');
        }
        return user;
    }
    /**
     * Get all recipes from the API
     */
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
    /**
     * Search recipes by query
     */
    static async searchRecipes(query) {
        const url = `${this.BASE_URL}${this.RECIPES_ENDPOINT}/search?q=${encodeURIComponent(query)}`;
        return this.fetchWithErrorHandling(url);
    }
    /**
     * Get recipe by ID
     */
    static async getRecipeById(id) {
        const url = `${this.BASE_URL}${this.RECIPES_ENDPOINT}/${id}`;
        return this.fetchWithErrorHandling(url);
    }
    /**
     * Get unique cuisines from recipes
     */
    static async getCuisines() {
        try {
            const recipesResponse = await this.getRecipes(0); // Get all recipes to extract cuisines
            const cuisines = new Set();
            // Since we can't get all recipes with limit 0, let's get a large number
            const allRecipesResponse = await this.getRecipes(1000);
            allRecipesResponse.recipes.forEach(recipe => {
                if (recipe.cuisine) {
                    cuisines.add(recipe.cuisine);
                }
            });
            return Array.from(cuisines).sort();
        }
        catch (error) {
            console.error('Error fetching cuisines:', error);
            return [];
        }
    }
}
ApiService.BASE_URL = 'https://dummyjson.com';
ApiService.USERS_ENDPOINT = '/users';
ApiService.RECIPES_ENDPOINT = '/recipes';
export { ApiService };
//# sourceMappingURL=api.js.map