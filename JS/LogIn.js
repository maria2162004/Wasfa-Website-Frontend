document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");

  if (!form) {
    console.error("Could not find login form");
    return;
  }

  function showCustomAlert(message, type = "info") {
    const alertBox = document.getElementById("custom-alert");
    const alertMessage = document.getElementById("alert-message");

    alertMessage.textContent = message;
    alertBox.style.backgroundColor = type === "error" ? "#1A1A19" : "#1f7d53";
    alertBox.classList.remove("hidden");

    setTimeout(() => {
      alertBox.classList.add("hidden");
    }, 4000);
  }

  document.getElementById("close-alert").addEventListener("click", () => {
    document.getElementById("custom-alert").classList.add("hidden");
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email_value = form.elements["email"].value.trim();
    const password_value = form.elements["password"].value;

    console.log("Login attempt with:", {
      email_value,
      password_value,
    });

    let users = JSON.parse(localStorage.getItem("users")) || [];
    console.log("Stored users:", users);

    const found_user = users.find(
      (user) =>
        user.email.toLowerCase() === email_value.toLowerCase() &&
        user.password === password_value
    );

    if (found_user) {
      console.log("User found:", found_user);
      const loggedInUser = {
        name: found_user.name,
        email: found_user.email,
        isAdmin: found_user.isAdmin,
        isLoggedIn: true,
      };

      localStorage.setItem("user", JSON.stringify(loggedInUser));

      showCustomAlert(`Login successful! Welcome ${found_user.name}`);

      setTimeout(() => {
        window.location.href = "../HTML/HomePage.html";
      }, 1000);
    } else {
      console.log("Login failed - no matching user found");
      showCustomAlert("Invalid email or password. Please try again.", "error");
    }

    form.reset();
  });
});
