const API_URL = "http://127.0.0.1:8000/api/recipes/";
let recipes = [];
let currentCategory = "all";
let currentSearchTerm = "";

document.addEventListener("DOMContentLoaded", async () => {
  recipes = await loadRecipes();
  renderRecipes();

  // Category filter buttons
  const buttons = document.querySelectorAll(".category-button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".category-button.active")?.classList.remove("active");
      button.classList.add("active");

      currentCategory = button.getAttribute("data-category");
      currentSearchTerm = "";
      document.getElementById("searchInput").value = "";
      renderRecipes();
    });
  });

  // Search form
  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const searchTerm = document.getElementById("searchInput").value.trim();
    currentSearchTerm = searchTerm;
    renderRecipes();
  });
});

// Fetch recipes from backend
async function loadRecipes() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching recipes:", err);
    return [];
  }
}

// Render recipe cards
function renderRecipes() {
  const container = document.querySelector(".recipe-cards-container");
  container.innerHTML = "";

  let filteredRecipes = recipes;

  if (currentCategory !== "all") {
    filteredRecipes = filteredRecipes.filter(
      (recipe) => recipe.category.toLowerCase() === currentCategory.toLowerCase()
    );
  }

  if (currentSearchTerm !== "") {
    filteredRecipes = filteredRecipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(currentSearchTerm.toLowerCase())
    );
  }

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

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(description);
    container.appendChild(card);

    // Click event to open recipe details
    card.addEventListener("click", () => {
      window.location.href = `RecipeDetails.html?id=${recipe.id}`;
    });

    // Show Delete button if user is admin
    const currentUser = JSON.parse(sessionStorage.getItem("user")); // Use sessionStorage if needed
    const isAdmin = currentUser && currentUser.isAdmin;
    if (isAdmin) {
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Delete";
      removeBtn.classList.add("remove-btn");

      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent click on card
        showCustomConfirm("Are you sure you want to delete this recipe?", async () => {
          const success = await deleteRecipe(recipe.id);
          if (success) {
            recipes = recipes.filter((r) => r.id !== recipe.id);
            renderRecipes();
            showCustomAlert("Recipe deleted successfully");
          } else {
            showCustomAlert("Failed to delete recipe", "error");
          }
        });
      });

      card.appendChild(removeBtn);
    }
  });
}

// Delete recipe from API
async function deleteRecipe(id) {
  try {
    const res = await fetch(`${API_URL}${id}/`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (err) {
    console.error("Error deleting recipe:", err);
    return false;
  }
}

// Show alert message
function showCustomAlert(message, type = "info") {
  const alertBox = document.createElement("div");
  alertBox.className = `custom-alert ${type}`;
  alertBox.innerHTML = `
    <span>${message}</span>
    <button class="close-alert">&times;</button>
  `;
  document.body.appendChild(alertBox);

  alertBox.querySelector(".close-alert").addEventListener("click", () => {
    alertBox.remove();
  });

  setTimeout(() => {
    alertBox.remove();
  }, 4000);
}

// Confirm dialog
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

  confirmBox.querySelector(".confirm-yes").addEventListener("click", () => {
    confirmCallback();
    overlay.remove();
  });

  confirmBox.querySelector(".confirm-no").addEventListener("click", () => {
    overlay.remove();
  });
}
