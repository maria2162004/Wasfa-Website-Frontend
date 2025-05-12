const API_URL = "http://127.0.0.1:8000/api/recipes/";

async function fetchRecipesFromAPI() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch recipes from API");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API error:", error);
    return [];
  }
}

function filterRecipes(recipes, term) {
  if (!term) return [];

  const lowerTerm = term.toLowerCase();

  return recipes.filter(recipe => {
    const nameMatch = recipe.name.toLowerCase().includes(lowerTerm);
    const ingMatch = recipe.ingredients.some(ingredient =>
      ingredient.name.toLowerCase().includes(lowerTerm)
    );
    return nameMatch || ingMatch;
  });
}

// Render search results
function renderResults(recipes, searchTerm) {
  const container = document.querySelector(".recipe-cards-container");
  const resultsCount = document.getElementById("resultsCount");

  container.innerHTML = "";

  if (recipes.length === 0) {
    resultsCount.textContent = `No results found for "${searchTerm}"`;
    return;
  }

  resultsCount.textContent = `${recipes.length} result(s) for "${searchTerm}"`;

  recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const img = document.createElement("img");
    img.src = recipe.image;
    img.alt = recipe.name;

    const title = document.createElement("h3");
    title.textContent = recipe.name;

    const desc = document.createElement("p");
    desc.textContent = recipe.description;

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(desc);

    card.addEventListener("click", () => {
      window.location.href = `RecipeDetails.html?id=${recipe.id}`;
    });

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get("query") || "";

  const allRecipes = await fetchRecipesFromAPI();
  const results = filterRecipes(allRecipes, searchTerm);
  renderResults(results, searchTerm);
});
