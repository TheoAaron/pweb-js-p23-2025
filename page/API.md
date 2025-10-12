# API Documentation

## DummyJSON APIs Used

### Users API
**Base URL:** `https://dummyjson.com/users`

#### Get All Users
```
GET /users
```

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "firstName": "Emily",
      "lastName": "Johnson", 
      "username": "emilys",
      "email": "emily.johnson@x.dummyjson.com",
      "gender": "female",
      "image": "https://dummyjson.com/icon/emilys/128"
    },
    // ... more users
  ],
  "total": 208,
  "skip": 0,
  "limit": 30
}
```

### Recipes API
**Base URL:** `https://dummyjson.com/recipes`

#### Get All Recipes
```
GET /recipes?limit={limit}&skip={skip}
```

#### Search Recipes
```
GET /recipes/search?q={query}
```

#### Get Recipe by ID
```
GET /recipes/{id}
```

**Response Example:**
```json
{
  "id": 1,
  "name": "Classic Margherita Pizza",
  "ingredients": [
    "Pizza dough",
    "Tomato sauce",
    "Fresh mozzarella cheese",
    "Fresh basil leaves",
    "Olive oil",
    "Salt and pepper to taste"
  ],
  "instructions": [
    "Preheat the oven to 475°F (245°C).",
    "Roll out the pizza dough and spread tomato sauce evenly.",
    "Add fresh mozzarella cheese and bake for 10-12 minutes.",
    "Remove from oven and top with fresh basil leaves.",
    "Drizzle with olive oil and season with salt and pepper."
  ],
  "prepTimeMinutes": 20,
  "cookTimeMinutes": 15,
  "servings": 4,
  "difficulty": "Easy",
  "cuisine": "Italian",
  "caloriesPerServing": 300,
  "tags": ["Pizza", "Italian"],
  "userId": 166,
  "image": "https://cdn.dummyjson.com/recipe-images/1.webp",
  "rating": 4.6,
  "reviewCount": 98,
  "mealType": ["Dinner"]
}
```

## Authentication Flow

1. **Login Request**: User submits username and password
2. **User Validation**: Fetch all users from `/users` endpoint
3. **Username Check**: Find user with matching username
4. **Password Check**: Verify password is not empty (dummy validation)
5. **Success**: Store `firstName` in localStorage and redirect
6. **Error**: Show appropriate error message

## Error Handling

### Network Errors
- Connection timeout
- No internet connection
- Server unavailable

### API Errors
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

### Application Errors
- Invalid username
- Empty password
- Missing authentication
- Element not found