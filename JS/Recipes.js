const API_URL = "http://127.0.0.1:8000/api/recipes/";
let recipes = [];
let currentCategory = "all";
let currentSearchTerm = "";
let isAdminUser = false;

document.addEventListener("DOMContentLoaded", async () => {
  isAdminUser = await checkIfAdmin();

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
      (recipe) =>
        recipe.category.toLowerCase() === currentCategory.toLowerCase()
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
       // Avoid infinite loop by ensuring the image fails only once and uses a fallback
      if (this.src !== "../Images/default-recipe.jpg") {
        this.src = "../Images/default-recipe.jpg";  // Use correct fallback image path
      } else {
        this.src = "../Images/placeholder.jpg";  // Optionally provide a placeholder image if default-recipe.jpg is missing
      }
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
    if (isAdminUser) {
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Delete";
      removeBtn.classList.add("remove-btn");

      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent click on card
        showCustomConfirm("Are you sure you want to delete this recipe?", async () => {
          const success = await deleteRecipe(recipe.id);
          if (success) {
            showCustomAlert("Recipe deleted successfully.", "success");
            recipes = recipes.filter((r) => r.id !== recipe.id);
            renderRecipes();
          } else {
            showCustomAlert("Failed to delete recipe.", "error");
          }
        });
      });

      card.appendChild(removeBtn);
    }
  });
}

// Delete recipe from API
async function deleteRecipe(id) {
  // try {
  //   const accessToken = document.cookie
  //     .split("; ")
  //     .find((row) => row.startsWith("access_token="))
  //     ?.split("=")[1];

  //   if (!accessToken) {
  //     showCustomAlert("Unauthorized. Please log in.", "error");
  //     return false;
  //   }

  //   const res = await fetch(`${API_URL}delete/${id}/`, {
  //     method: "DELETE",
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //   });

  //   if (!res.ok) {
  //     const error = await res.json();
  //     console.error("Delete failed:", error);
  //     return false;
  //   }

  //   return true;
  // } catch (err) {
  //   console.error("Error deleting recipe:", err);
  //   return false;
  // }

  try {
    const accessToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];

    if (!accessToken) {
      showCustomAlert("Unauthorized. Please log in.", "error");
      return false;
    }

    const res = await fetch(`${API_URL}delete/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Handle non-OK responses (unauthorized, etc.)
    if (!res.ok) {
      const error = await res.json();
      console.error("Delete failed:", error);
      showCustomAlert("Failed to delete recipe.", "error");
      return false;
    }

    // If the response was successful, return true
    if (res.status === 204) {
      // Recipe was successfully deleted
      return true;
    }

    // Catch any unexpected errors
    console.error("Unexpected error during deletion", res);
    return false;
  } catch (err) {
    console.error("Error deleting recipe:", err);
    showCustomAlert("An unexpected error occurred while deleting the recipe.", "error");
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

// Check admin status from backend securely
async function checkIfAdmin() {
  const accessToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="))
    ?.split("=")[1];

  if (!accessToken) return false;

  try {
    const res = await fetch("http://127.0.0.1:8000/api/auth/is-admin/", {  // Updated URL here
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) return false;

    const data = await res.json();
    return data.is_admin || false;
  } catch (error) {
    console.error("Failed to verify admin status:", error);
    return false;
  }
}
