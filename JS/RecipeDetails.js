document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (!id) {
    alert("No recipe ID provided. Redirecting...");
    window.location.href = "../HTML/Recipes.html";
    return;
  }

  const API_URL = `http://127.0.0.1:8000/api/recipes/${id}/`;

  // Check if current user is admin
  const isAdminUser = await checkIfAdmin();

  fetch(API_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Recipe not found");
      }
      return response.json();
    })
    .then((recipe) => {
      // Populate the page with recipe details
      document.getElementById("recipe-img").src = recipe.image || "";
      document.getElementById("recipe-img").alt = recipe.name;
      document.getElementById("recipe-title").textContent = recipe.name;
      document.getElementById(
        "recipe-description"
      ).textContent = `Description: ${recipe.description}`;

      // Ingredients
      const ingredientList = document.getElementById("recipe-ingredients");
      ingredientList.innerHTML = "";
      recipe.ingredients.forEach((ing) => {
        const li = document.createElement("li");
        li.textContent = `${ing.quantity} ${ing.units} ${ing.name}`.trim();
        ingredientList.appendChild(li);
      });

      // Methods
      const methodList = document.getElementById("recipe-method");
      methodList.innerHTML = "";
      const steps = recipe.methods
        .split(/[\n.]+/)
        .filter((step) => step.trim());
      steps.forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step.trim();
        methodList.appendChild(li);
      });

      // Buttons
      const favoriteBtn = document.getElementById("favorite-btn");
      const editBtn = document.getElementById("edit-btn");

      if (isAdminUser) {
        // Admin: Show edit, hide favorite
        editBtn.style.display = "flex";
        favoriteBtn.style.display = "none";

        editBtn.addEventListener("click", () => {
          window.location.href = `../HTML/EditRecipe.html?id=${id}`;
        });
      } else {
        // User: Show favorite, hide edit
        editBtn.style.display = "none";
        favoriteBtn.style.display = "flex";

        if (recipe.isFav) {
          favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
          favoriteBtn.classList.add("favorited");
        } else {
          favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
          favoriteBtn.classList.remove("favorited");
        }

        favoriteBtn.addEventListener("click", () => {
          const newFavStatus = !recipe.isFav;

          fetch(API_URL, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ isFav: newFavStatus }),
          })
            .then((res) => res.json())
            .then((updatedRecipe) => {
              recipe.isFav = updatedRecipe.isFav;
              if (recipe.isFav) {
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
                favoriteBtn.classList.add("favorited");
              } else {
                favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
                favoriteBtn.classList.remove("favorited");
              }
            })
            .catch((error) => {
              console.error("Error updating favourite status:", error);
              alert("There was an error updating your favourite status.");
            });
        });
      }

      // Back button
     const backBtn = document.getElementById("back-btn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "../HTML/Recipes.html";
  });
}
    })
    .catch((error) => {
      alert("Recipe not found. Redirecting...");
      window.location.href = "../HTML/Recipes.html";
    });
});

// Securely check admin status from backend
async function checkIfAdmin() {
  const accessToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("access_token="))
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
