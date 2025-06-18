// Reuse cookie functions from Recipes.js
function getCurrentUserId() {
    const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];
    
    if (!accessToken) return null;
    
    try {
        const payload = accessToken.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.user_id;
    } catch (e) {
        console.error("Error decoding token:", e);
        return null;
    }
}

function getUserFavorites() {
    const userId = getCurrentUserId();
    if (!userId) return [];
    
    const cookieName = `user_${userId}_favorites`;
    const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${cookieName}=`));
    
    if (!cookie) return [];
    
    try {
        return JSON.parse(cookie.split('=')[1]);
    } catch (e) {
        console.error("Error parsing favorites cookie:", e);
        return [];
    }
}

async function fetchRecipesFromBackend() {
    try {
        const response = await fetch("http://localhost:8000/api/recipes/");
        if (!response.ok) throw new Error("Failed to fetch recipes");
        return await response.json();
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return [];
    }
}

function renderNoFavorites(recipesPage) {
    const message = document.createElement("div");
    message.className = "no-favorites";
    message.innerHTML = `
        <i class="far fa-heart"></i>
        <h3>No favorite recipes yet</h3>
        <p>Add favorites from the recipe details page</p>
    `;
    recipesPage.appendChild(message);
}

function createRecipeCard(recipe) {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
        <img src="${recipe.image || './images/placeholder.png'}" alt="${recipe.name}" 
             onerror="this.src='./images/placeholder.png'">
        <div class="recipe-info">
            <h3>${recipe.name}</h3>
            <p>${recipe.description}</p>
            <button class="view-recipe" data-id="${recipe.id}">
                View Recipe <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    return card;
}

async function displayFavoriteRecipes() {
    const recipesPage = document.querySelector(".recipes-page");
    recipesPage.innerHTML = "";
    
    const allRecipes = await fetchRecipesFromBackend();
    const userFavorites = getUserFavorites();
    
    // Filter recipes based on cookie-stored favorites
    const favoriteRecipes = allRecipes.filter(recipe => 
        userFavorites.includes(recipe.id)
    );
    
    if (favoriteRecipes.length === 0) {
        renderNoFavorites(recipesPage);
        return;
    }
    
    const cardsContainer = document.createElement("div");
    cardsContainer.className = "recipe-cards-container";
    
    favoriteRecipes.forEach(recipe => {
        const card = createRecipeCard(recipe);
        cardsContainer.appendChild(card);
    });
    
    recipesPage.appendChild(cardsContainer);
    
    document.querySelectorAll(".view-recipe").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const recipeId = e.currentTarget.getAttribute("data-id");
            window.location.href = `RecipeDetails.html?id=${recipeId}`;
        });
    });
}

document.addEventListener("DOMContentLoaded", displayFavoriteRecipes);