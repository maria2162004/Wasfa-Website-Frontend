document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("recipeForm");
  const addIngredientBtn = document.getElementById("add_ingredient_button");
  const addMethodBtn = document.getElementById("addMethodBtn");
  const ingredientSection = document.getElementById("ingredientSection");
  const methodSection = document.getElementById("methodSection");
  const toast = document.getElementById("toast");

  const imageUrlInput = document.getElementById("imageUrl");
  const photoPreview = document.getElementById("photoPreview");

  // Add Ingredient
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
        <input type="number" name="ingredientQuantity[]" placeholder="Quantity" required>
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

    newRow.querySelector(".remove-ingredient-btn").addEventListener("click", () => {
      newRow.remove();
    });

    ingredientSection.appendChild(newRow);
  });

  // Add Method Step
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

    newStep.querySelector(".remove-method-btn").addEventListener("click", () => {
      newStep.remove();
      updateMethodStepNumbers();
    });

    methodSection.appendChild(newStep);
  });

  function updateMethodStepNumbers() {
    const steps = methodSection.querySelectorAll(".method-step");
    steps.forEach((step, index) => {
      step.querySelector(".method-step-number").textContent = index + 1;
    });
  }

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

  // Image URL live preview
  imageUrlInput.addEventListener("input", () => {
    const url = imageUrlInput.value.trim();
    photoPreview.src = url;
    photoPreview.style.display = url ? "block" : "none";
  });

  function getAccessToken() {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token="))
      ?.split("=")[1];
    return token;
  }

  function handleAddRecipe(newRecipe) {
    const accessToken = getAccessToken();

    if (!accessToken) {
      console.log("No access token found. Please log in.");
      showToast("Session expired. Please log in again.", "error");
      return;
    }

    // Make the POST request to add the recipe
    fetch("http://127.0.0.1:8000/api/recipes/add/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(newRecipe),
    })
      .then((response) => {
        if (!response.ok) {
          // Check if the response indicates token expiry
          if (response.status === 401) {
            showToast("Session expired. Please log in again.", "error");
            window.location.href = "../HTML/login.html";  // Redirect to login page if token is expired
            return;
          }
          return response.json().then((err) => {
            throw new Error(JSON.stringify(err));
          });
        }
        return response.json();
      })
      .then(() => {
        showToast("Recipe added successfully!");
        setTimeout(() => {
          window.location.href = "../HTML/Recipes.html"; // Redirect after successful addition
        }, 1000);
        form.reset();
        photoPreview.src = "";
        photoPreview.style.display = "none";
      })
      .catch((error) => {
        console.error("Failed to add recipe:", error);
        showToast("Failed to add recipe. Please check inputs.", "error");
      });
  }

  // Form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const recipeName = document.getElementById("recipeName").value.trim();
    const courseType = document.getElementById("courseType").value;
    const recipeDescription = document.getElementById("recipeDescription").value.trim();
    const imageUrl = imageUrlInput.value.trim();

    // Ingredients
    const ingredients = [];
    const ingredientRows = ingredientSection.querySelectorAll(".ingredient-row");
    ingredientRows.forEach((row) => {
      const id = row.querySelector('[name="ingredientId[]"]').value.trim();
      const name = row.querySelector('[name="ingredientName[]"]').value.trim();
      const quantity = parseFloat(row.querySelector('[name="ingredientQuantity[]"]').value);
      const unit = row.querySelector('[name="ingredientUnit[]"]').value;
      ingredients.push({ id, name, quantity, units: unit });
      console.log("Ingredients:", ingredients);
    });

    // Method steps
    const methodSteps = Array.from(
      methodSection.querySelectorAll(".method-step textarea")
    ).map((step) => step.value.trim());

    const newRecipe = {
      name: recipeName,
      category: courseType,
      description: recipeDescription,
      methods: methodSteps.join("\n"),
      ingredients,
      image: imageUrl,
    };

    handleAddRecipe(newRecipe);  // Call function to handle the API request
  });
});
