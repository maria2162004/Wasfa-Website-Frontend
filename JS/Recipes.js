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
      document
        .querySelector(".category-button.active")
        ?.classList.remove("active");
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
    const isAdminUser = isAdmin(); // Use centralized function

    if (isAdminUser) {
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Delete";
      removeBtn.classList.add("remove-btn");

      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent click on card
        showCustomConfirm(
          "Are you sure you want to delete this recipe?",
          async () => {
            const success = await deleteRecipe(recipe.id);
            if (success) {
              showCustomAlert("Recipe deleted successfully.", "success");
              recipes = recipes.filter((r) => r.id !== recipe.id);
              renderRecipes();
            } else {
              showCustomAlert("Failed to delete recipe.", "error");
            }
          }
        );
      });

      card.appendChild(removeBtn);
    }
  });
}

// Delete recipe from API
async function deleteRecipe(id) {
  try {
    const accessToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      .split("=")[1];

    const res = await fetch(`${API_URL}${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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

// Utility function to get JWT token from cookies
function getAuthToken() {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='));
  return cookie ? cookie.split('=')[1] : null;
}

// Modified isAdmin function with multiple verification options
function isAdmin() {
  try {
    const token = getAuthToken();
    if (!token) {
      console.warn("No authentication token found");
      return false;
    }

    // Decode the JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log("Decoded JWT payload:", payload);

    // OPTION 1: Check for admin user IDs (quick solution)
    const ADMIN_USER_IDS = [19]; // Add all admin user IDs here
    if (ADMIN_USER_IDS.includes(payload.user_id)) {
      console.log(`User ${payload.user_id} is admin (via ID check)`);
      return true;
    }

    // OPTION 2: Make API call to verify admin status (more secure)
    // Uncomment this if you implement an admin-check endpoint
    /*
    const adminCheck = await verifyAdminStatus(payload.user_id);
    if (adminCheck) {
      return true;
    }
    */

    // OPTION 3: Check for admin role in payload (best practice)
    // If your backend adds this later
    if (payload.role === 'admin' || payload.is_admin) {
      return true;
    }

    console.log("User is not admin");
    return false;
  } catch (error) {
    console.error("Admin check failed:", error);
    return false;
  }
}

// API verification function (for Option 2)
async function verifyAdminStatus(userId) {
  try {
    const response = await fetch(`/api/users/${userId}/admin-status`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return response.ok && (await response.json()).is_admin;
  } catch (error) {
    console.error("Admin verification failed:", error);
    return false;
  }
}

// Modified renderRecipes function with debug checks
function renderRecipes() {
  const container = document.querySelector(".recipe-cards-container");
  if (!container) {
    console.error("Recipe container not found!");
    return;
  }
  container.innerHTML = "";

  // Debug: Check admin status before rendering
  console.group("Admin Status Check");
  const adminStatus = isAdmin();
  console.log("Current user is admin:", adminStatus);
  console.groupEnd();

  recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";
    
    // Recipe content
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}" 
           onerror="this.src='../Images/default-recipe.jpg'">
      <h3>${recipe.name}</h3>
      <p>${recipe.description}</p>
    `;

    // Admin delete button
    if (adminStatus) {
      console.log(`Adding delete button for recipe ${recipe.id}`);
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "admin-delete-btn visible";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = async (e) => {
        e.stopPropagation();
        if (confirm("Delete this recipe permanently?")) {
          await deleteRecipe(recipe.id);
          recipes = recipes.filter(r => r.id !== recipe.id);
          renderRecipes();
        }
      };
      card.appendChild(deleteBtn);
    }

    container.appendChild(card);
  });
}
