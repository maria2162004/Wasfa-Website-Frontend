document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const form = document.getElementById("recipeForm");
  const addIngredientBtn = document.getElementById("add_ingredient_button");
  const addMethodBtn = document.getElementById("addMethodBtn");
  const ingredientSection = document.getElementById("ingredientSection");
  const methodSection = document.getElementById("methodSection");
  const toast = document.getElementById("toast");
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

  // Initialize recipes array from localStorage or create new array
  let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
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

    const removeBtn = row.querySelector(".remove-ingredient-btn");
    if (ingredientRows.length === 1) {
      removeBtn.style.display = "none";
    } else {
      removeBtn.style.display = "flex";
    }
  }

  function updateRemoveMethodButtonVisivility() {
    const methodSteps = methodSection.querySelectorAll(".method-step");

    const removeBtn = step.querySelector(".remove-method-btn");
    if (methodSteps.length === 1) {
      removeBtn.style.display = "none";
    } else {
      removeBtn.style.display = "flex";
    }
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

  // Form Reset Handler
  form.addEventListener("reset", function () {
    resetAll();
  });
  // --------------------------------------------

  function resetAll() {
    resetPhotoPreview();
    resetIngredientRows();
    resetMethodSteps();
    updateRemoveIngredientButtonVisivility();
    updateRemoveMethodButtonVisivility();
  }
  // --------------------------------------------

  // Reset ingredient rows to one
  function resetIngredientRows() {
    const rows = ingredientSection.querySelectorAll(".ingredient-row");
    if (rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        rows[i].remove();
      }
    }
  }
  // --------------------------------------------

  // Reset method steps to one
  function resetMethodSteps() {
    const steps = methodSection.querySelectorAll(".method-step");
    if (steps.length > 1) {
      for (let i = 1; i < steps.length; i++) {
        steps[i].remove();
      }
    }
  }
  // --------------------------------------------

  function resetPhotoPreview() {
    photoPreview.src = "";
    photoPreview.style.display = "none";
    photoPlaceholder.style.display = "flex";
    removePhotoBtn.style.display = "none";
  }
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
    // --------------------------------------------

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
    // --------------------------------------------

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

    // Handle photo
    let photoBase64 = "";
    if (photoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        photoBase64 = e.target.result;
        saveRecipe(photoBase64);
      };
      reader.readAsDataURL(photoInput.files[0]);
    } else {
      saveRecipe(photoBase64);
    }
    // --------------------------------------------

    function saveRecipe(photo) {
      // Create new recipe object
      const newRecipe = {
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

      // Send recipe to backend API
      fetch("http://127.0.0.1:8000/api/recipes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("access_token="))
              .split("=")[1]
          }`,
        },
        body: JSON.stringify(newRecipe),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to save recipe");
          }
          return response.json();
        })
        .then((data) => {
          // Show success message
          showToast("Recipe saved successfully!");

          // Redirect after delay
          setTimeout(() => {
            window.location.href = "../HTML/Recipes.html";
          }, 1000);

          // Reset form
          form.reset();
          resetAll();
        })
        .catch((error) => {
          console.error("Error saving recipe:", error);
          showToast("Failed to save recipe. Please try again.", "error");
        });
    }
  });
  // --------------------------------------------

  // Initialize first remove buttons as hidden
  updateRemoveIngredientButtonVisivility();
  updateRemoveMethodButtonVisivility();
});
// --------------------------------------------
