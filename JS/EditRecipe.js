document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  if (!id) {
    alert("No recipe ID provided. Redirecting...");
    window.location.href = "../HTML/Recipes.html";
    return;
  }

  const API_URL = `http://127.0.0.1:8000/api/recipes/${id}/`;

  const imageUrlInput = document.getElementById("imageUrl");
  const photoPreview = document.getElementById("photoPreview");

  // Prefill form with recipe data
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch recipe");

    const recipe = await response.json();

    document.getElementById("recipeName").value = recipe.name;
    document.getElementById("courseType").value = recipe.category;
    document.getElementById("recipeDescription").value = recipe.description;
    imageUrlInput.value = recipe.image || "";
    photoPreview.src = recipe.image || "";
    photoPreview.style.display = recipe.image ? "block" : "none";

    // Ingredients
    const ingredientSection = document.getElementById("ingredientSection");
    ingredientSection.innerHTML = "";
    recipe.ingredients.forEach((ing) => {
      const newRow = document.createElement("div");
      newRow.className = "ingredient-row";
      newRow.innerHTML = `
        <div class="input">
          <input type="text" name="ingredientName[]" value="${ing.name}" required>
        </div>
        <div class="input">
          <input type="number" name="ingredientQuantity[]" value="${ing.quantity}" required>
        </div>
        <div class="input">
          <select name="ingredientUnit[]" required>
            ${["grams", "cups", "ml", "teaspoon", "tablespoon", "pieces"]
              .map(
                (unit) =>
                  `<option value="${unit}" ${
                    ing.units === unit ? "selected" : ""
                  }>${unit}</option>`
              )
              .join("")}
          </select>
        </div>
        <button type="button" class="remove-ingredient-btn"><i class="fas fa-times"></i></button>
      `;
      newRow.querySelector(".remove-ingredient-btn").addEventListener("click", () => newRow.remove());
      ingredientSection.appendChild(newRow);
    });

    // Method steps
    const methodSection = document.getElementById("methodSection");
    methodSection.innerHTML = "";
    const steps = recipe.methods.split(/[\n\r]+/).filter((s) => s.trim());
    steps.forEach((step, index) => {
      const newStep = document.createElement("div");
      newStep.className = "method-step";
      newStep.innerHTML = `
        <div class="method-step-number">${index + 1}</div>
        <div class="method-step-content">
          <textarea name="methodStep[]" required>${step}</textarea>
        </div>
        <button type="button" class="remove-method-btn"><i class="fas fa-times"></i></button>
      `;
      newStep.querySelector(".remove-method-btn").addEventListener("click", () => {
        newStep.remove();
        updateMethodStepNumbers();
      });
      methodSection.appendChild(newStep);
    });
  } catch (error) {
    console.error("Error loading recipe:", error);
    alert("Failed to load recipe. Redirecting...");
    window.location.href = "../HTML/Recipes.html";
  }

  function updateMethodStepNumbers() {
    const steps = document.querySelectorAll(".method-step-number");
    steps.forEach((step, index) => {
      step.textContent = index + 1;
    });
  }

  // Image live preview
  imageUrlInput.addEventListener("input", () => {
    const url = imageUrlInput.value.trim();
    photoPreview.src = url;
    photoPreview.style.display = url ? "block" : "none";
  });

  // Handle submit (PATCH)
  document.getElementById("recipeForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const accessToken =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1] || "";

    const recipeName = document.getElementById("recipeName").value.trim();
    const courseType = document.getElementById("courseType").value;
    const recipeDescription = document.getElementById("recipeDescription").value.trim();
    const imageUrl = imageUrlInput.value.trim();

    const ingredients = [];
    document.querySelectorAll(".ingredient-row").forEach((row) => {
      ingredients.push({
        name: row.querySelector('[name="ingredientName[]"]').value.trim(),
        quantity: parseFloat(row.querySelector('[name="ingredientQuantity[]"]').value),
        units: row.querySelector('[name="ingredientUnit[]"]').value,
      });
    });

    const methodSteps = Array.from(document.querySelectorAll(".method-step textarea")).map((step) =>
      step.value.trim()
    );

    const updatedRecipe = {
      name: recipeName,
      category: courseType,
      description: recipeDescription,
      methods: methodSteps.join("\n"),
      ingredients,
      image: imageUrl,
    };

    try {
      const res = await fetch(API_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedRecipe),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(JSON.stringify(err));
      }

      const updated = await res.json();
      alert("Recipe updated successfully!");
      window.location.replace(`../HTML/RecipeDetails.html?id=${updated.id}`);
    } catch (error) {
      console.error("Failed to update recipe:", error);
      alert("Failed to update recipe. Please check your input.");
    }
  });
});
