const API_URL = "http://127.0.0.1:8000/api/recipes/";
const DEFAULT_IMAGE = "../Images/default-recipe.jpg";

let recipes = [];

// Homepage sections configuration (matches your HTML structure)
const homepageSections = {
    mostViewed: { title: "Most Viewed Recipes" },
    middleEast: { title: "Most Popular Recipes in the Middle East" },
    asia: { title: "Most Popular Recipes in Asia" },
    europe: { title: "Most Popular Recipes in Europe" }
};

async function loadRecipes() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        const allRecipes = await response.json();
        
        // Filter recipes to only include our target categories
        recipes = allRecipes.filter(recipe => 
            ['mostViewed', 'middleEast', 'asia', 'europe'].includes(recipe.category)
        ).map(recipe => ({
            ...recipe,
            image: recipe.image || DEFAULT_IMAGE,
            views: recipe.views || 0
        }));
        
        return recipes;
    } catch (error) {
        console.error("Error loading recipes:", error);
        return [];
    }
}

function createRecipeCard(recipe) {
    const card = document.createElement("div");
    card.className = "recipe-card";
    
    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.name}" 
             onerror="this.src='${DEFAULT_IMAGE}'">
        <h3>${recipe.name}</h3>
        <p>${recipe.description}</p>
    `;
    
    card.addEventListener("click", () => {
        window.location.href = `RecipeDetails.html?id=${recipe.id}`;
    });
    
    return card;
}

function renderHomepageSections() {
    // Populate each section
    for (const [sectionId, config] of Object.entries(homepageSections)) {
        const container = document.getElementById(sectionId);
        if (!container) continue;
        
        // Clear previous content but keep the h2 title
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        // Get recipes for this section
        let sectionRecipes = recipes.filter(
            recipe => recipe.category === sectionId
        );
        
        // For most viewed, sort by views
        if (sectionId === "mostViewed") {
            sectionRecipes.sort((a, b) => b.views - a.views);
        }
        
        // Add recipes to section (limit to 4 as per your design)
        sectionRecipes.slice(0, 4).forEach(recipe => {
            container.appendChild(createRecipeCard(recipe));
        });
    }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
    await loadRecipes();
    renderHomepageSections();
});