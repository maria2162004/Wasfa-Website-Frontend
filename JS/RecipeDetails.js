document.addEventListener("DOMContentLoaded", () => {
  // Extract the recipe ID from the URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (!id) {
    alert("No recipe ID provided. Redirecting...");
    window.location.href = "../HTML/Recipes.html";
    return;
  }

  const API_URL = `http://127.0.0.1:8000/api/recipes/${id}/`;

  // Fetch the recipe from the backend
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
      document.getElementById("recipe-description").textContent = `Description: ${recipe.description}`;

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
      const steps = recipe.methods.split(/[\n.]+/).filter((step) => step.trim());
      steps.forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step.trim();
        methodList.appendChild(li);
      });

      // Favorite button logic
      const favoriteBtn = document.getElementById("favorite-btn");
      if (!favoriteBtn) {
        console.error("Favorite button not found!");
        return; // Exit if the button isn't found
      }

      console.log("Favorite button exists, setting up click handler...");

      if (recipe.isFav) {
        favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
        favoriteBtn.classList.add("favorited");
      } else {
        favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
        favoriteBtn.classList.remove("favorited");
      }

      // Toggle favorite on click
      favoriteBtn.addEventListener("click", () => {
        console.log("Favorite button clicked");
        const newFavStatus = !recipe.isFav; // Toggle favorite status

        fetch(API_URL, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isFav: newFavStatus }), // Send the updated favorite status
        })
          .then((response) => response.json())
          .then((updatedRecipe) => {
            // Update the UI after successful toggle
            recipe.isFav = updatedRecipe.isFav; // Update the local recipe object
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

      // Admin logic (optional)
      const editBtn = document.getElementById("edit-btn");
      const isAdmin = false; // Implement your own logic (e.g., from a logged-in user system)
      if (isAdmin) {
        editBtn.style.display = "flex";
        favoriteBtn.style.display = "none";
        editBtn.addEventListener("click", () => {
          window.location.href = `../HTML/EditRecipe.html?id=${id}`;
        });
      } else {
        editBtn.style.display = "none";
        favoriteBtn.style.display = "flex";
      }

      // Back button
      const backBtn = document.getElementById("back-btn");
      if (backBtn) {
        backBtn.addEventListener("click", () => window.history.back());
      }
    })
    .catch((error) => {
      alert("Recipe not found. Redirecting...");
      window.location.href = "../HTML/Recipes.html";
    });
});
