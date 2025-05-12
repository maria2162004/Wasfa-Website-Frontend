function Recipe(
  id,
  title,
  description,
  imageUrl,
  category,
  ingredients,
  method
) {
  this.id = id;
  this.title = title;
  this.description = description;
  this.imageUrl = imageUrl;
  this.category = category;
  this.ingredients = ingredients;

  this.method = method;
}

// Ingredient ID map
const ingredientIds = {
  "olive oil": 1,
  bacon: 2,
  "garlic cloves": 3,
  eggs: 4,
  Parmesan: 5,
  spaghetti: 6,
  salt: 7,
  "black pepper": 8,
  sugar: 9,
  flour: 10,
  "cocoa powder": 11,
  "baking powder": 12,
  "baking soda": 13,
  milk: 14,
  oil: 15,
  "vanilla extract": 16,
  water: 17,
  "chicken breasts": 18,
  paprika: 19,
};

// Hardcoded recipes
const hardcodedRecipes = [
  new Recipe(
    1,
    "Spaghetti Carbonara",
    "Classic Italian pasta dish with eggs, cheese, pancetta, and pepper",
    "https://asset.jamieoliver.com/images/cq7w2e71/production/08ae0b8293235129bbe7d55a3f89c2fc4f1a36d7-973x1300.jpg",
    "Main Course",
    [
      { id: 1, name: "olive oil", quantity: "1", units: "tablespoon" },
      { id: 2, name: "bacon", quantity: "0.5", units: "pieces" },
      { id: 3, name: "garlic cloves", quantity: "2", units: "pieces" },
      { id: 4, name: "eggs", quantity: "3", units: "pieces" },
      { id: 5, name: "Parmesan", quantity: "1", units: "cup" },
      { id: 6, name: "spaghetti", quantity: "1", units: "pieces" },
      { id: 7, name: "salt", quantity: "0.5", units: "teaspoon" },
      { id: 8, name: "black pepper", quantity: "0.5", units: "teaspoon" },
    ],
    [
      "Boil pasta in salted water.",
      "Cook bacon in a pan, add garlic.",
      "Whisk eggs and cheese in a bowl.",
      "Mix hot pasta with bacon and garlic.",
      "Stir in egg mixture and season.",
      "Add pasta water to keep it creamy if needed.",
    ]
  ),
  new Recipe(
    2,
    "Chocolate Cake",
    "Moist and melt-in-your-mouth chocolate cake!",
    "https://scientificallysweet.com/wp-content/uploads/2020/09/IMG_4117-feature.jpg",
    "Dessert",
    [
      { id: 9, name: "sugar", quantity: "2", units: "cups" },
      { id: 10, name: "flour", quantity: "1.75", units: "cups" },
      { id: 11, name: "cocoa powder", quantity: "0.75", units: "cups" },
      { id: 12, name: "baking powder", quantity: "1.5", units: "teaspoon" },
      { id: 13, name: "baking soda", quantity: "1.5", units: "teaspoon" },
      { id: 7, name: "salt", quantity: "1", units: "teaspoon" },
      { id: 4, name: "eggs", quantity: "2", units: "pieces" },
      { id: 14, name: "milk", quantity: "1", units: "cups" },
      { id: 15, name: "oil", quantity: "0.5", units: "cups" },
      { id: 16, name: "vanilla extract", quantity: "2", units: "teaspoon" },
      { id: 17, name: "water", quantity: "1", units: "cups" },
    ],
    [
      "Preheat oven to 350°F and prepare baking pans.",
      "Mix dry ingredients together.",
      "Add wet ingredients and mix well.",
      "Pour into pans and bake 30-35 minutes.",
      "Cool and serve.",
    ]
  ),
  new Recipe(
    3,
    "Grilled Chicken",
    "Juicy and flavorful grilled chicken with herbs.",
    "https://www.budgetbytes.com/wp-content/uploads/2024/06/Grilled-Chicken-Overhead-500x500.jpg",
    "Main Course",
    [
      { id: 18, name: "chicken breasts", quantity: "4", units: "pieces" },
      { id: 7, name: "salt", quantity: "0.25", units: "cups" },
      { id: 17, name: "water", quantity: "4", units: "cups" },
      { id: 1, name: "olive oil", quantity: "2", units: "tablespoon" },
      { id: 19, name: "paprika", quantity: "1", units: "teaspoon" },
    ],
    [
      "Brine the chicken in salt water for 30 mins.",
      "Heat grill and oil the grates.",
      "Rub chicken with oil and paprika.",
      "Grill until browned and cooked through.",
      "Rest before slicing.",
    ]
  ),
];

document.addEventListener("DOMContentLoaded", () => {
  //gets selected recipe ID from local storage
  const idParam = localStorage.getItem("selectedRecipeId");
  const id = isNaN(idParam) ? idParam : parseInt(idParam);

   // gets all recipes from both local and hardcoded
  const storedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
  const allRecipes = [...hardcodedRecipes, ...storedRecipes];

  // search for recipe by ID (handling both string and number types)
  const recipe = allRecipes.find(
    (r) => r.id === id || r.recipeId === id || r.recipeId === id.toString()
  );

  const favoriteBtn = document.getElementById("favorite-btn");
  const editBtn = document.getElementById("edit-btn");
  const backBtn = document.getElementById("back-btn");

  // check if admin
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser && currentUser.isAdmin;

  // if admin Show buttons (edit/delete)
  if (isAdmin) {
    editBtn.style.display = "flex";
    favoriteBtn.style.display = "none";

    editBtn.addEventListener("click", () => {
      localStorage.setItem("selectedRecipeId", id);
      window.location.href = `../HTML/EditRecipe.html?id=${id}`;
    });
  } else {
    editBtn.style.display = "none";
    favoriteBtn.style.display = "flex";
  }
  // checks if the recipe was not found (invalid ID or missing recipe).
  if (!recipe) {
    alert("Recipe not found. Redirecting...");
    window.location.href = "../HTML/Recipes.html";
    return;
  }

   // get favourites from local storage
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const stringFavorites = favorites.map((favId) => favId.toString());

// check if current recipe is favorited
// (localStorage saves IDs as strings, so we convert them to string for accurate comparison(array of strings in local storage))
  const isFavorited = stringFavorites.includes(id.toString());


  if (isFavorited) {
    favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
    favoriteBtn.classList.add("favorited");
  } else {
    favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
    favoriteBtn.classList.remove("favorited");
  }

  // set recipe info 
  const imageUrl = recipe.imageUrl || recipe.photo;
  const title = recipe.title || recipe.recipeName;
  const description = recipe.description || recipe.recipeDescription;
  const category = recipe.category || recipe.courseType;

   // handles ingredients format differences
  const ingredients = recipe.ingredients || [];
  const method =
    recipe.method ||
    (recipe.methodSteps
      ? recipe.methodSteps.map((step) => step.description)
      : []);


  document.getElementById("recipe-img").src = imageUrl;
  document.getElementById("recipe-img").alt = title;
  document.getElementById("recipe-title").textContent = title;
  document.getElementById(
    "recipe-description"
  ).textContent = `Description: ${description}`;
  document.getElementById(
    "recipe-category"
  ).textContent = `Category: ${category}`;

  // set ingredients 
  const ingredientList = document.getElementById("recipe-ingredients");
  ingredientList.innerHTML = "";
  ingredients.forEach((ing) => {
    const li = document.createElement("li");
    if (ing.units) {
      // hardcoded 
      li.textContent = `${ing.quantity} ${ing.units} ${ing.name}`.trim();
    } else {
      // stored in local storage
      li.textContent =
        `${ing.ingredientQuantity} ${ing.ingredientUnit} ${ing.ingredientName}`.trim();
    }
    ingredientList.appendChild(li);
  });

  // set method steps
  const methodList = document.getElementById("recipe-method");
  methodList.innerHTML = "";
  method.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    methodList.appendChild(li);
  });

  // favorite button
  favoriteBtn.addEventListener("click", () => {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const idStr = id.toString();

    // sonverts all favorite IDs to strings for better comparison
    favorites = favorites.map((favId) => favId.toString());
    const isFavorited = favorites.includes(idStr);

    if (!isFavorited) {
  
      favorites.push(idStr);
      favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
      favoriteBtn.classList.add("favorited");
      showCustomAlert("Recipe added to favorites!");
    } else {
  
      showCustomConfirm("Remove from favorites?", () => {
        favorites = favorites.filter((favId) => favId !== idStr);
        favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
        favoriteBtn.classList.remove("favorited");
        showCustomAlert("Recipe removed from favorites!");
        localStorage.setItem("favorites", JSON.stringify(favorites));
      });
      return;
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
  });

  // Back button
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.history.back();
    });
  }

  // customizied alert and confirmation functions
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
    }, 2000);
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
});
