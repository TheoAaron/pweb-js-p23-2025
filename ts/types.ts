export interface User {
  id: number;
  firstName: string;
  lastName?: string;
  username: string;
  email?: string;
  [key: string]: any;
}

export interface UsersResponse {
  users: User[];
  total?: number;
  skip?: number;
  limit?: number;
}

export interface Recipe {
  id: number;
  name: string;
  thumbnail?: string;
  image?: string;
  totalTime?: number;
  time?: number;
  difficulty?: string;
  cuisine?: string;
  rating?: number;
  spoonacularScore?: number;
  aggregateLikes?: number;
  ingredients?: string[];
  tags?: string[];
  instructions?: string[] | string;
  [key: string]: any;
}

export interface RecipesResponse {
  recipes: Recipe[];
  total?: number;
  skip?: number;
  limit?: number;
}
