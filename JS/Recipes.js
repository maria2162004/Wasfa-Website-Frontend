const API_URL = "http://127.0.0.1:8000/api/recipes/";
//recipies page
let recipes = [];
// load from localStorage or use default ones
// let savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
// let defaultRecipes = [
//   {
//     recipeId: 1,
//     name: "Spaghetti Carbonara",
//     description: "A classic Italian pasta dish with a creamy sauce.",
//     category: "main course",
//     ingredients: [
//       "spaghetti",
//       "eggs",
//       "parmesan",
//       "bacon",
//       "black pepper",
//       "olive oil",
//       "garlic cloves",
//       "salt",
//     ],
//     image:
//       "https://asset.jamieoliver.com/images/cq7w2e71/production/08ae0b8293235129bbe7d55a3f89c2fc4f1a36d7-973x1300.jpg",
//     link: "/HTML/RecipeDetails.html/1",
//   },
//   {
//     recipeId: 3,
//     name: "Grilled Chicken",
//     description: "Juicy and flavorful grilled chicken with herbs.",
//     category: "main course",
//     ingredients: ["chicken breasts", "salt", "water", "olive oil", "paprika"],
//     image:
//       "https://www.budgetbytes.com/wp-content/uploads/2024/06/Grilled-Chicken-Overhead-500x500.jpg",
//     link: "/HTML/RecipeDetails.html/3",
//   },
//   {
//     recipeId: 2,
//     name: "Chocolate Cake",
//     description: "Rich and moist chocolate cake for dessert lovers.",
//     category: "dessert",
//     ingredients: [
//       "sugar",
//       "flour",
//       "cocoa powder",
//       "baking powder",
//       "baking soda",
//       "salt",
//       "eggs",
//       "milk",
//       "oil",
//       "vanilla extract",
//       "water",
//     ],
//     image:
//       "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
//     link: "/HTML/RecipeDetails.html/2",
//   },
  
// ];

// convert saved recipes to match default format
// const convertedRecipes = savedRecipes.map((savedRecipe) => ({
//   recipeId: savedRecipe.recipeId,
//   name: savedRecipe.recipeName,
//   description: savedRecipe.recipeDescription,
//   category: savedRecipe.courseType,
//   image: savedRecipe.photo || "../Images/default-recipe.jpg",
//   link: `../HTML/RecipeDetails.html/${savedRecipe.recipeId}`,
// }));

// combines all recipies and removes duplicates
// let recipes = [...defaultRecipes];
// convertedRecipes.forEach((newRecipe) => {
//   if (
//     !recipes.some(
//       (existingRecipe) => existingRecipe.recipeId == newRecipe.recipeId
//     )
//   ) {
//     recipes.push(newRecipe);
//   }
// });

let currentCategory = "all";
let currentSearchTerm = "";

function renderRecipes() {
  const container = document.querySelector(".recipe-cards-container");

  container.innerHTML = "";

  // Filter by category first
  let filteredRecipes =
    currentCategory === "all"
      ? recipes
      : recipes.filter((recipe) => recipe.category === currentCategory);

  filteredRecipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    const image = document.createElement("img");
    image.src = recipe.image;
    image.alt = recipe.name;
    image.onerror = function () {
      this.src = "../Images/default-recipe.jpg";
    };

    const title = document.createElement("h3");
    title.textContent = recipe.name;

    const description = document.createElement("p");
    description.textContent = recipe.description;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const isAdmin = currentUser && currentUser.isAdmin;

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(description);
    container.appendChild(card);

    if (isAdmin) {
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Delete";
      removeBtn.classList.add("remove-btn");

      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent navigation
        showCustomConfirm(
          "Are you sure you want to delete this recipe?",
          () => {
            removeRecipe(recipe.recipeId);
            showCustomAlert("Recipe deleted successfully");
          }
        );
        function showCustomAlert(message, type = "info") {
          const alertBox = document.createElement("div");
          alertBox.className = `custom-alert ${type}`;
          alertBox.innerHTML = `
          <span>${message}</span>
          <button class="close-alert">&times;</button>
        `;
          document.body.appendChild(alertBox);

          alertBox
            .querySelector(".close-alert")
            .addEventListener("click", () => {
              alertBox.remove();
            });

          setTimeout(() => {
            alertBox.remove();
          }, 4000);
        }

        function showCustomConfirm(message, confirmCallback) {
          const overlay = document.createElement("div");
          overlay.className = "confirm-overlay";

          const confirmBox = document.createElement("div");
          confirmBox.className = "custom-confirm";
          confirmBox.innerHTML = `
          <p>${message}</p>
          <div class="confirm-buttons">
            <button class="confirm-yes">Yes</button>
            <button class="confirm-no">No</button>
          </div>
        `;

          overlay.appendChild(confirmBox);
          document.body.appendChild(overlay);

          confirmBox
            .querySelector(".confirm-yes")
            .addEventListener("click", () => {
              confirmCallback();
              overlay.remove();
            });

          confirmBox
            .querySelector(".confirm-no")
            .addEventListener("click", () => {
              overlay.remove();
            });
        }
      });

      card.appendChild(removeBtn);
    }
    card.addEventListener("click", () => {
      localStorage.setItem("selectedRecipeId", recipe.recipeId);
      window.location.href = "RecipeDetails.html";
    });
  });
}

function removeRecipe(id) {
  recipes = recipes.filter((recipe) => recipe.recipeId !== id);

  // Remove from localStorage if it's a saved recipe
  const updatedSaved = JSON.parse(localStorage.getItem("recipes")) || [];
  const newSaved = updatedSaved.filter((r) => r.recipeId !== id);
  localStorage.setItem("recipes", JSON.stringify(newSaved));

  renderRecipes();
}

// Filter Buttons
document.addEventListener("DOMContentLoaded", async () => {
  if (recipes.length === 0) {
      recipes = await loadRecipes();
  }
  renderRecipes();

  const buttons = document.querySelectorAll(".category-button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelector(".category-button.active")
        .classList.remove("active");
      button.classList.add("active");

      currentCategory = button.getAttribute("data-category");
      currentSearchTerm = ""; // Reset search when category changes
      document.getElementById("searchInput").value = ""; // Clear search input
      renderRecipes();
    });
  });

  // Handle form submission to prevent page reload
  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById("searchInput").value.trim();
    handleSearchInput(searchTerm);
  });
});


async function loadRecipes() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await res.json();
    console.log(data);
    return data;
  } catch (err) {
    console.error("Error fetching recipes:", err);
  }
}
