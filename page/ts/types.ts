// TypeScript interfaces and types for the Recipe Collection app

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

interface LoginFormData {
    username: string;
    password: string;
}

interface SearchFilters {
    query: string;
    cuisine: string;
}

// API Error types
interface ApiError {
    message: string;
    status?: number;
}

// DOM Element types for better type safety
interface LoginElements {
    form: HTMLFormElement;
    usernameInput: HTMLInputElement;
    passwordInput: HTMLInputElement;
    loginBtn: HTMLButtonElement;
    loginBtnText: HTMLSpanElement;
    loginSpinner: HTMLElement;
    errorMessage: HTMLElement;
    successMessage: HTMLElement;
    usernameError: HTMLElement;
    passwordError: HTMLElement;
}

interface RecipeElements {
    searchInput: HTMLInputElement;
    cuisineFilter: HTMLSelectElement;
    recipesGrid: HTMLElement;
    loadingState: HTMLElement;
    errorState: HTMLElement;
    recipesContainer: HTMLElement;
    showMoreContainer: HTMLElement;
    showMoreBtn: HTMLButtonElement;
    noResults: HTMLElement;
    userName: HTMLElement;
    logoutBtn: HTMLButtonElement;
    retryBtn: HTMLButtonElement;
    recipeModal: HTMLElement;
    recipeDetail: HTMLElement;
    searchSpinner: HTMLElement;
}

// Utility type for debouncing
type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

export {
    User,
    UsersResponse,
    Recipe,
    RecipesResponse,
    LoginFormData,
    SearchFilters,
    ApiError,
    LoginElements,
    RecipeElements,
    DebouncedFunction
};