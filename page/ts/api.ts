// API service for the Recipe Collection app

interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    image: string;
}

interface UsersResponse {
    users: User[];
    total: number;
    skip: number;
    limit: number;
}

interface Recipe {
    id: number;
    name: string;
    ingredients: string[];
    instructions: string[];
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    servings: number;
    difficulty: string;
    cuisine: string;
    caloriesPerServing: number;
    tags: string[];
    userId: number;
    image: string;
    rating: number;
    reviewCount: number;
    mealType: string[];
}

interface RecipesResponse {
    recipes: Recipe[];
    total: number;
    skip: number;
    limit: number;
}

class ApiService {
    private static readonly BASE_URL = 'https://dummyjson.com';
    private static readonly USERS_ENDPOINT = '/users';
    private static readonly RECIPES_ENDPOINT = '/recipes';

    /**
     * Generic fetch wrapper with error handling
     */
    private static async fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<T> {
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
            return data as T;
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            }
            throw error;
        }
    }

    /**
     * Get all users from the API
     */
    static async getUsers(): Promise<UsersResponse> {
        const url = `${this.BASE_URL}${this.USERS_ENDPOINT}`;
        return this.fetchWithErrorHandling<UsersResponse>(url);
    }

    /**
     * Authenticate user by username
     */
    static async authenticateUser(username: string, password: string): Promise<User> {
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
    static async getRecipes(limit?: number, skip?: number): Promise<RecipesResponse> {
        let url = `${this.BASE_URL}${this.RECIPES_ENDPOINT}`;
        
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (skip) params.append('skip', skip.toString());
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        return this.fetchWithErrorHandling<RecipesResponse>(url);
    }

    /**
     * Search recipes by query
     */
    static async searchRecipes(query: string): Promise<RecipesResponse> {
        const url = `${this.BASE_URL}${this.RECIPES_ENDPOINT}/search?q=${encodeURIComponent(query)}`;
        return this.fetchWithErrorHandling<RecipesResponse>(url);
    }

    /**
     * Get recipe by ID
     */
    static async getRecipeById(id: number): Promise<Recipe> {
        const url = `${this.BASE_URL}${this.RECIPES_ENDPOINT}/${id}`;
        return this.fetchWithErrorHandling<Recipe>(url);
    }

    /**
     * Get unique cuisines from recipes
     */
    static async getCuisines(): Promise<string[]> {
        try {
            const recipesResponse = await this.getRecipes(0); // Get all recipes to extract cuisines
            const cuisines = new Set<string>();
            
            // Since we can't get all recipes with limit 0, let's get a large number
            const allRecipesResponse = await this.getRecipes(1000);
            
            allRecipesResponse.recipes.forEach(recipe => {
                if (recipe.cuisine) {
                    cuisines.add(recipe.cuisine);
                }
            });

            return Array.from(cuisines).sort();
        } catch (error) {
            console.error('Error fetching cuisines:', error);
            return [];
        }
    }
}

export { ApiService, User, Recipe, UsersResponse, RecipesResponse };