// 1. Load default recipes
const defaultRecipes = [
  {
    recipeId: 1,
    name: "Spaghetti Carbonara",
    description: "A classic Italian pasta dish with a creamy sauce.",
    category: "main course",
    ingredients: ["spaghetti", "eggs", "parmesan", "bacon", "black pepper", "olive oil", "garlic cloves", "salt"],
    image: "https://asset.jamieoliver.com/images/cq7w2e71/production/08ae0b8293235129bbe7d55a3f89c2fc4f1a36d7-973x1300.jpg",
    link: "/HTML/RecipeDetails.html/1"
  },
  {
    recipeId: 3,
    name: "Grilled Chicken",
    description: "Juicy and flavorful grilled chicken with herbs.",
    category: "main course",
    ingredients: ["chicken breasts", "salt", "water", "olive oil", "paprika"],
    image: "https://www.budgetbytes.com/wp-content/uploads/2024/06/Grilled-Chicken-Overhead-500x500.jpg",
    link: "/HTML/RecipeDetails.html/3"
  },
  {
    recipeId: 2,
    name: "Chocolate Cake",
    description: "Rich and moist chocolate cake for dessert lovers.",
    category: "dessert",
    ingredients: ["sugar", "flour", "cocoa powder", "baking powder", "baking soda", "salt", "eggs", "milk", "oil", "vanilla extract", "water"],
    image: "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
    link: "/HTML/RecipeDetails.html/2"
  }
];

// 2. Load and convert admin-added recipes from localStorage
function loadAdminRecipes() {
  try {
    const savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
    return savedRecipes.map(recipe => ({
      recipeId: recipe.recipeId,
      name: recipe.recipeName,
      description: recipe.recipeDescription,
      category: recipe.courseType,
      ingredients: recipe.ingredients.map(ing => 
        typeof ing === 'string' ? ing : ing.ingredientName
      ),
      image: recipe.photo || "../Images/default-recipe.jpg",
      link: `../HTML/RecipeDetails.html/${recipe.recipeId}`
    }));
  } catch (error) {
    console.error("Error loading admin recipes:", error);
    return [];
  }
}

// 3. Combine all recipes
function getAllRecipes() {
  return [...defaultRecipes, ...loadAdminRecipes()];
}

// 4. Search function that works with both types
function searchRecipes(term) {
  if (!term) return [];
  
  const lowerTerm = term.toLowerCase();
  const allRecipes = getAllRecipes();
  
  return allRecipes.filter(recipe => {
    // Check name match
    const nameMatch = recipe.name.toLowerCase().includes(lowerTerm);
    
    // Check ingredient match (handles both string in hardcoded and object format in admin added )
    const ingMatch = recipe.ingredients.some(ingredient => {
      const ingName = typeof ingredient === 'string' ? ingredient : ingredient.ingredientName;
      return ingName.toLowerCase().includes(lowerTerm);
    });
    
    return nameMatch || ingMatch;
  });
}


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
    img.onerror = () => img.src = "../Images/default-recipe.jpg";
    
    const title = document.createElement("h3");
    title.textContent = recipe.name;
    
    const desc = document.createElement("p");
    desc.textContent = recipe.description;
    
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(desc);
    
    card.addEventListener("click", () => {
      localStorage.setItem("selectedRecipeId", recipe.recipeId);
      window.location.href = "RecipeDetails.html";
    });
    
    container.appendChild(card);
  });
}

// 6. Initialize search when page loads
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get("query") || "";
  
  const results = searchRecipes(searchTerm);
  renderResults(results, searchTerm);
});