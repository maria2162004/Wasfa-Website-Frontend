const API_URL = "http://127.0.0.1:8000/api/recipes/";
let recipes = [];
let currentCategory = "all";
let currentSearchTerm = "";
let isAdminUser = false;

// Cookie-based favorites functions
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

function setUserFavorites(recipeIds) {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    const cookieName = `user_${userId}_favorites`;
    const cookieValue = JSON.stringify(recipeIds);
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    document.cookie = `${cookieName}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/`;
}

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
        currentSearchTerm = document.getElementById("searchInput").value.trim();
        renderRecipes();
    });
});

async function loadRecipes() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Network response was not ok");
        return await res.json();
    } catch (err) {
        console.error("Error fetching recipes:", err);
        return [];
    }
}

function renderRecipes() {
    const container = document.querySelector(".recipe-cards-container");
    container.innerHTML = "";

    let filteredRecipes = recipes.filter(recipe => {
        if (currentCategory !== "all" && recipe.category.toLowerCase() !== currentCategory.toLowerCase()) {
            return false;
        }
        if (currentSearchTerm !== "" && !recipe.name.toLowerCase().includes(currentSearchTerm.toLowerCase())) {
            return false;
        }
        return true;
    });

    filteredRecipes.forEach(recipe => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");

        const image = document.createElement("img");
        image.src = recipe.image;
        image.alt = recipe.name;
        image.onerror = function() {
            this.src = './images/placeholder.png';
        };

        const title = document.createElement("h3");
        title.textContent = recipe.name;

        const description = document.createElement("p");
        description.textContent = recipe.description;

        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(description);
        container.appendChild(card);

        card.addEventListener("click", () => {
            window.location.href = `RecipeDetails.html?id=${recipe.id}`;
        });

        if (isAdminUser) {
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Delete";
            removeBtn.classList.add("remove-btn");

            removeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                showCustomConfirm("Are you sure you want to delete this recipe?", async () => {
                    const success = await deleteRecipe(recipe.id);
                    if (success) {
                        showCustomAlert("Recipe deleted successfully.", "success");
                        recipes = recipes.filter(r => r.id !== recipe.id);
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

async function deleteRecipe(id) {
    try {
        const accessToken = document.cookie
            .split("; ")
            .find(row => row.startsWith("access_token="))
            ?.split("=")[1];

        if (!accessToken) {
            showCustomAlert("Unauthorized. Please log in.", "error");
            return false;
        }

        const res = await fetch(`${API_URL}${id}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!res.ok) {
            const error = await res.json();
            console.error("Delete failed:", error);
            showCustomAlert("Failed to delete recipe.", "error");
            return false;
        }

        if (res.status === 204) {
            return true;
        }

        console.error("Unexpected error during deletion", res);
        return false;
    } catch (err) {
        console.error("Error deleting recipe:", err);
        showCustomAlert("An unexpected error occurred while deleting the recipe.", "error");
        return false;
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

async function checkIfAdmin() {
    const accessToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("access_token="))
        ?.split("=")[1];

    if (!accessToken) return false;

    try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/is-admin/", {
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