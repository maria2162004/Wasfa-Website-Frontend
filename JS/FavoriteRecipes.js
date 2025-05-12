function getAllRecipes() {
  // Hardcoded recipes
  const hardcodedRecipes = [
    {
      id: 1,
      title: "Spaghetti Carbonara",
      description:
        "Classic Italian pasta dish with eggs, cheese, pancetta, and pepper",
      imageUrl:
        "https://asset.jamieoliver.com/images/cq7w2e71/production/08ae0b8293235129bbe7d55a3f89c2fc4f1a36d7-973x1300.jpg",
      category: "main course",
    },
    {
      id: 2,
      title: "Chocolate Cake",
      description: "Moist and melt-in-your-mouth chocolate cake!",
      imageUrl:
        "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
      category: "desserts",
    },
    {
      id: 3,
      title: "Grilled Chicken",
      description: "Juicy and flavorful grilled chicken with herbs.",
      imageUrl:
        "https://www.budgetbytes.com/wp-content/uploads/2024/06/Grilled-Chicken-Overhead-500x500.jpg",
      category: "main course",
    },

  ];

  // Get user-added recipes from localStorage
  const storedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];

  // Normalize stored recipes to match hardcoded format
  const normalizedStoredRecipes = storedRecipes.map((recipe) => ({
    id: recipe.recipeId || recipe.id,
    title: recipe.recipeName || recipe.title,
    description: recipe.recipeDescription || recipe.description,
    imageUrl: recipe.photo || recipe.imageUrl || "./images/placeholder.png",
    category: recipe.courseType || recipe.category || "uncategorized",
  }));

  return [...hardcodedRecipes, ...normalizedStoredRecipes];
}

document.addEventListener("DOMContentLoaded", () => {
  const recipesPage = document.querySelector(".recipes-page");

  // get favorites with IDs that are strings
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.map((id) => id.toString());
  const allRecipes = getAllRecipes();
    // filter to only include favorites
  const favoriteRecipes = allRecipes.filter((recipe) =>
    favorites.includes((recipe.id || recipe.recipeId).toString())
  );

  // display message if no favorites are added
  if (favoriteRecipes.length === 0) {
    recipesPage.innerHTML = `
      <div class="no-favorites">
        <i class="far fa-heart"></i>
        <h3>No favorite recipes yet</h3>
        <p>Click the heart icon on recipes to add them here</p>
      </div>
    `;
    return;
  }

   // cards container creation for favourite recipie
  const cardsContainer = document.createElement("div");
  cardsContainer.className = "recipe-cards-container";

  favoriteRecipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    card.innerHTML = `
      <img src="${recipe.imageUrl}" alt="${recipe.title}" 
           onerror="this.src='./images/placeholder.png'">
      <div class="recipe-info">
        <h3>${recipe.title}</h3>
        <p>${recipe.description}</p>
        <button class="view-recipe" data-id="${recipe.id}">
          View Recipe <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `;
    cardsContainer.appendChild(card);
  });

  // clear and update the page
  recipesPage.innerHTML = "";
  recipesPage.appendChild(cardsContainer);

  // button to view recipies from favourites
  document.querySelectorAll(".view-recipe").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const recipeId = e.currentTarget.getAttribute("data-id");
      localStorage.setItem("selectedRecipeId", recipeId);
      window.location.href = "RecipeDetails.html";
    });
  });
});
