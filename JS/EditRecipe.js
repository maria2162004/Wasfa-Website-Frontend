document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const form = document.getElementById("recipeForm");
  const addIngredientBtn = document.getElementById("add_ingredient_button");
  const addMethodBtn = document.getElementById("addMethodBtn");
  const ingredientSection = document.getElementById("ingredientSection");
  const methodSection = document.getElementById("methodSection");
  const toast = document.getElementById("toast");
  const cancelBtn = document.getElementById("cancelBtn");
  // --------------------------------------------

  // Photo upload elements
  const photoInput = document.getElementById("recipePhoto");
  const photoPreview = document.getElementById("photoPreview");
  const photoPreviewContainer = document.getElementById(
    "photoPreviewContainer"
  );
  const photoPlaceholder =
    photoPreviewContainer.querySelector(".photo-placeholder");
  const removePhotoBtn = document.getElementById("removePhotoBtn");
  // --------------------------------------------

  // Get recipe ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const recipeIdToEdit = urlParams.get("id");
  // --------------------------------------------

  // Initialize recipes array from backend API
  let recipes = [];
  // --------------------------------------------

  // Fetch the recipe to edit from backend API
  let recipeToEdit = null;
  fetch(`http://127.0.0.1:8000/api/recipes/${recipeIdToEdit}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("access_token="))
          .split("=")[1]
      }`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch recipe");
      }
      return response.json();
    })
    .then((data) => {
      recipeToEdit = data;
      populateForm();
    })
    .catch((error) => {
      console.error("Error fetching recipe:", error);
      showToast("Recipe not found", "error");
      setTimeout(() => {
        window.location.href = "../HTML/Recipes.html";
      }, 2000);
    });
  // --------------------------------------------

  // Populate form with recipe data
  function populateForm() {
    document.getElementById("recipeId").value = recipeToEdit.id;
    document.getElementById("recipeName").value = recipeToEdit.name;
    document.getElementById("courseType").value = recipeToEdit.course_type;
    document.getElementById("recipeDescription").value =
      recipeToEdit.description;

    // Populate photo if exists
    if (recipeToEdit.image) {
      photoPreview.src = recipeToEdit.image;
      photoPreview.style.display = "block";
      photoPlaceholder.style.display = "none";
      removePhotoBtn.style.display = "flex";
    }

    // Populate ingredients
    ingredientSection.innerHTML = "";
    recipeToEdit.ingredients.forEach((ingredient, index) => {
      const newRow = document.createElement("div");
      newRow.className = "ingredient-row";

      newRow.innerHTML = `
      <div class="input">
      <input type="text" name="ingredientId[]" placeholder="Ingredient ID" required value="${
        index + 1
      }">
      </div>
      <div class="input">
      <input type="text" name="ingredientName[]" placeholder="Ingredient Name" required value="${
        ingredient.name
      }">
      </div>
      <div class="input">
          <input type="text" name="ingredientQuantity[]" placeholder="Quantity" required value="${
            ingredient.quantity
          }">
          </div>
          <div class="input">
          <select name="ingredientUnit[]" required>
          <option value="grams" ${
            ingredient.units === "grams" ? "selected" : ""
          }>grams</option>
          <option value="cups" ${
            ingredient.units === "cups" ? "selected" : ""
          }>cups</option>
          <option value="ml" ${
            ingredient.units === "ml" ? "selected" : ""
          }>ml</option>
          <option value="teaspoon" ${
            ingredient.units === "teaspoon" ? "selected" : ""
          }>teaspoon</option>
          <option value="tablespoon" ${
            ingredient.units === "tablespoon" ? "selected" : ""
          }>tablespoon</option>
          <option value="pieces" ${
            ingredient.units === "pieces" ? "selected" : ""
          }>pieces</option>
          </select>
          </div>
          <button type="button" class="remove-ingredient-btn">
          <i class="fas fa-times"></i>
          </button>
          `;

      // Add remove functionality
      const removeBtn = newRow.querySelector(".remove-ingredient-btn");
      removeBtn.addEventListener("click", function () {
        newRow.remove();
        updateRemoveIngredientButtonVisivility();
      });

      ingredientSection.appendChild(newRow);
    });
    // --------------------------------------------

    // Populate method steps
    methodSection.innerHTML = "";
    recipeToEdit.methods.split("\n").forEach((step, index) => {
      const newStep = document.createElement("div");
      newStep.className = "method-step";

      newStep.innerHTML = `
      <div class="method-step-number">${index + 1}</div>
      <div class="method-step-content">
      <textarea name="methodStep[]" placeholder="Enter step description" required>${step}</textarea>
      </div>
      <button type="button" class="remove-method-btn">
      <i class="fas fa-times"></i>
      </button>
      `;

      // Add remove functionality
      const removeBtn = newStep.querySelector(".remove-method-btn");
      removeBtn.addEventListener("click", function () {
        newStep.remove();
        updateMethodStepNumbers();
      });

      methodSection.appendChild(newStep);
    });

    updateRemoveIngredientButtonVisivility();
    updateRemoveMethodButtonVisivility();
  }
  // --------------------------------------------

  // Add Ingredient Functionality
  addIngredientBtn.addEventListener("click", function () {
    const newRow = document.createElement("div");
    newRow.className = "ingredient-row";

    newRow.innerHTML = `
    <div class="input">
    <input type="text" name="ingredientId[]" placeholder="Ingredient ID" required>
    </div>
    <div class="input">
    <input type="text" name="ingredientName[]" placeholder="Ingredient Name" required>
    </div>
    <div class="input">
    <input type="text" name="ingredientQuantity[]" placeholder="Quantity" required>
    </div>
    <div class="input">
    <select name="ingredientUnit[]" required>
    <option value="grams">grams</option>
    <option value="cups">cups</option>
    <option value="ml">ml</option>
    <option value="teaspoon">teaspoon</option>
    <option value="tablespoon">tablespoon</option>
    <option value="pieces">pieces</option>
    </select>
    </div>
    <button type="button" class="remove-ingredient-btn">
        <i class="fas fa-times"></i>
      </button>
      `;

    // Add remove functionality
    const removeBtn = newRow.querySelector(".remove-ingredient-btn");
    removeBtn.addEventListener("click", function () {
      newRow.remove();
      updateRemoveIngredientButtonVisivility();
    });

    ingredientSection.appendChild(newRow);
    updateRemoveIngredientButtonVisivility();
  });
  // --------------------------------------------

  // Add Method Step Functionality
  addMethodBtn.addEventListener("click", function () {
    const stepCount = methodSection.querySelectorAll(".method-step").length + 1;
    const newStep = document.createElement("div");
    newStep.className = "method-step";

    newStep.innerHTML = `
    <div class="method-step-number">${stepCount}</div>
    <div class="method-step-content">
    <textarea name="methodStep[]" placeholder="Enter step description" required></textarea>
    </div>
    <button type="button" class="remove-method-btn">
    <i class="fas fa-times"></i>
    </button>
    `;

    // Add remove functionality
    const removeBtn = newStep.querySelector(".remove-method-btn");
    removeBtn.addEventListener("click", function () {
      newStep.remove();
      updateMethodStepNumbers();
    });

    methodSection.appendChild(newStep);
    updateRemoveMethodButtonVisivility();
  });
  // --------------------------------------------

  // Update method step numbers when steps are removed
  function updateMethodStepNumbers() {
    const steps = methodSection.querySelectorAll(".method-step");
    steps.forEach((step, index) => {
      step.querySelector(".method-step-number").textContent = index + 1;
    });
  }
  // --------------------------------------------

  // Helper functions to update remove buttons visibility
  function updateRemoveIngredientButtonVisivility() {
    const ingredientRows =
      ingredientSection.querySelectorAll(".ingredient-row");

    ingredientRows.forEach((row, index) => {
      const removeBtn = row.querySelector(".remove-ingredient-btn");
      if (ingredientRows.length === 1) {
        removeBtn.style.display = "none";
      } else {
        removeBtn.style.display = "flex";
      }
    });
  }
  // --------------------------------------------

  function updateRemoveMethodButtonVisivility() {
    const methodSteps = methodSection.querySelectorAll(".method-step");

    methodSteps.forEach((step, index) => {
      const removeBtn = step.querySelector(".remove-method-btn");
      if (methodSteps.length === 1) {
        removeBtn.style.display = "none";
      } else {
        removeBtn.style.display = "flex";
      }
    });
  }
  // --------------------------------------------

  // Show toast notification
  function showToast(message, type = "success") {
    toast.innerHTML = `
    <i class="fas fa-${type === "success" ? "check" : "exclamation"}"></i>
    <span>${message}</span>
    `;
    toast.className = "toast show";
    setTimeout(() => {
      toast.className = "toast";
    }, 3000);
  }
  // --------------------------------------------

  // Photo Upload Functionality
  photoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      if (!file.type.match("image.*")) {
        showToast("Please select a valid image file", "error");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        photoPreview.src = e.target.result;
        photoPreview.style.display = "block";
        photoPlaceholder.style.display = "none";
        removePhotoBtn.style.display = "flex";

        const img = new Image();
        img.onload = function () {
          photoPreviewContainer.style.maxHeight = "400px";
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
  // --------------------------------------------

  // Remove Photo
  removePhotoBtn.addEventListener("click", function () {
    resetPhotoPreview();
    photoInput.value = "";
  });
  // --------------------------------------------

  function resetPhotoPreview() {
    photoPreview.src = "";
    photoPreview.style.display = "none";
    photoPlaceholder.style.display = "flex";
    removePhotoBtn.style.display = "none";
  }

  // Cancel button
  cancelBtn.addEventListener("click", function () {
    window.location.href = "../HTML/Recipes.html";
  });
  // --------------------------------------------

  // Form Submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Gather form data
    const recipeId = document.getElementById("recipeId").value;
    const recipeName = document.getElementById("recipeName").value;
    const courseType = document.getElementById("courseType").value;
    const recipeDescription =
      document.getElementById("recipeDescription").value;

    // Gather all ingredients
    const ingredients = [];
    const ingredientRows =
      ingredientSection.querySelectorAll(".ingredient-row");

    ingredientRows.forEach((row) => {
      const inputs = row.querySelectorAll("input, select");
      ingredients.push({
        ingredientId: inputs[0].value,
        ingredientName: inputs[1].value,
        ingredientQuantity: inputs[2].value,
        ingredientUnit: inputs[3].value,
      });
    });

    // Gather all method steps
    const methodSteps = [];
    const methodStepElements = methodSection.querySelectorAll(
      ".method-step textarea"
    );
    methodStepElements.forEach((step, index) => {
      methodSteps.push({
        stepNumber: index + 1,
        description: step.value,
      });
    });
    // --------------------------------------------

    // Handle photo - use existing photo if no new one is selected
    let photoBase64 = recipeToEdit.image || "";
    if (photoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        photoBase64 = e.target.result;
        updateRecipe(photoBase64);
      };
      reader.readAsDataURL(photoInput.files[0]);
    } else {
      updateRecipe(photoBase64);
    }
    // --------------------------------------------

    function updateRecipe(photo) {
      // Create updated recipe object
      const updatedRecipe = {
        name: recipeName,
        course_type: courseType,
        description: recipeDescription,
        methods: methodSteps.map((step) => step.description).join("\n"),
        ingredients: ingredients.map((ing) => ({
          name: ing.ingredientName,
          quantity: ing.ingredientQuantity,
          units: ing.ingredientUnit,
        })),
        image: photo,
      };

      // Send updated recipe to backend API
      fetch(`http://127.0.0.1:8000/api/recipes/${recipeIdToEdit}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("access_token="))
              .split("=")[1]
          }`,
        },
        body: JSON.stringify(updatedRecipe),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to update recipe");
          }
          return response.json();
        })
        .then((data) => {
          // Show success message
          showToast("Recipe updated successfully!");

          // Redirect after delay
          setTimeout(() => {
            window.location.href = "../HTML/Recipes.html";
          }, 1500);
        })
        .catch((error) => {
          console.error("Error updating recipe:", error);
          showToast("Failed to update recipe. Please try again.", "error");
        });
    }
  });
  // --------------------------------------------

  // Initialize first remove buttons as hidden if only one exists
  updateRemoveIngredientButtonVisivility();
  updateRemoveMethodButtonVisivility();
});
// --------------------------------------------
