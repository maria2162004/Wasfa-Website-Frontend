const API_URL = "http://127.0.0.1:8000/api/recipes/";

let recipes = [];
let currentCategory = "all";
let currentSearchTerm = "";

// Recipe sections for the homepage
const recipeSections = {
  mostViewed: [],
  popular: [],
  middleEast: [],
  asia: [],
  europe: [],
};

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
    return []; // Return empty array if there's an error
  }
}

function createCard(recipe) {
  const card = document.createElement("div");
  card.classList.add("recipe-card");
  
  // Use recipe.image from API, fallback to default if not available
  const imageUrl = recipe.image;
  
  card.innerHTML = `
    <img src="${imageUrl}" alt="${recipe.name}"/>
    <h3>${recipe.name}</h3>
    <p>${recipe.description}</p>
  `;
  
  // Add click event
  card.addEventListener("click", () => {
    localStorage.setItem("selectedRecipeId", recipe.recipeId);
    window.location.href = "RecipeDetails.html";
  });
  
  return card;
}

function populateSection(id, recipes) {
  const container = document.getElementById(id);
  if (!container) return; // Skip if section doesn't exist
  
  container.innerHTML = ""; // Clear old content
  recipes.slice(0, 4).forEach((recipe) => { // Show only first 4 recipes per section
    const card = createCard(recipe);
    container.appendChild(card);
  });
}

function categorizeRecipes(recipes) {
  // Clear all sections
  for (let section in recipeSections) {
    recipeSections[section] = [];
  }
  
  // Simple categorization logic - you should adjust this based on your actual data
  recipes.forEach((recipe) => {
    // Add to popular if it has many ingredients (just an example)
    if (recipe.ingredients && recipe.ingredients.length > 5) {
      recipeSections.popular.push(recipe);
    }
    
    // Add to regional sections based on category or other criteria
    if (recipe.category.toLowerCase().includes("middle east") || 
        recipe.name.toLowerCase().includes("falafel") || 
        recipe.name.toLowerCase().includes("hummus")) {
      recipeSections.middleEast.push(recipe);
    } else if (recipe.category.toLowerCase().includes("asia") || 
               recipe.name.toLowerCase().includes("sushi") || 
               recipe.name.toLowerCase().includes("curry")) {
      recipeSections.asia.push(recipe);
    } else if (recipe.category.toLowerCase().includes("europe") || 
               recipe.name.toLowerCase().includes("pasta") || 
               recipe.name.toLowerCase().includes("ratatouille")) {
      recipeSections.europe.push(recipe);
    }
    
    // For most viewed, you might need actual view count data
    // Here we're just adding some random recipes
    if (Math.random() > 0.7) {
      recipeSections.mostViewed.push(recipe);
    }
  });
}

function renderRecipes() {
  const container = document.querySelector(".recipe-cards-container");
  if (!container) return; // Skip if not on the recipes page

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
  renderRecipes();
  
  // Also remove from sections
  for (let section in recipeSections) {
    recipeSections[section] = recipeSections[section].filter(recipe => recipe.recipeId !== id);
  }
  populateSections();
}

function populateSections() {
  for (let section in recipeSections) {
    populateSection(section, recipeSections[section]);
  }
}

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

// Initialize the page
document.addEventListener("DOMContentLoaded", async () => {
  recipes = await loadRecipes();
  
  // Categorize recipes for homepage sections
  categorizeRecipes(recipes);
  
  // Render recipes on the recipes page
  renderRecipes();
  
  // Populate sections on the homepage
  populateSections();

  // Set up category buttons if they exist
  const buttons = document.querySelectorAll(".category-button");
  if (buttons.length > 0) {
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
  }

  // Handle form submission if it exists
  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const searchTerm = document.getElementById("searchInput").value.trim();
      handleSearchInput(searchTerm);
    });
  }
});

function handleSearchInput(searchTerm) {
  currentSearchTerm = searchTerm.toLowerCase();
  renderRecipes();
}