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

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email_value = form.elements["email"].value.trim();
    const password_value = form.elements["password"].value;

    console.log("Login attempt with:", {
      email_value,
      password_value,
    });

    // Validate the inputs
    if (!email_value || !password_value) {
      showCustomAlert("Please enter both email and password", "error");
      return;
    }

    try {
      // Send login request to Django backend
      const response = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email_value,
          password: password_value,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Set tokens in cookies (not localStorage)
        setCookie('access_token', data.access, 1);  // 1 day expiration
        setCookie('refresh_token', data.refresh, 7); // 7 days expiration

        showCustomAlert(`Login successful!`);

        setTimeout(() => {
          window.location.href = "../HTML/HomePage.html"; // Redirect after successful login
        }, 1000);
      } else {
        console.log("Login failed:", data);
        showCustomAlert("Invalid email or password. Please try again.", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showCustomAlert("An error occurred while logging in. Please try again.", "error");
    }

    form.reset();
  });
});

// Function to set a cookie with a specific expiration
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Days to milliseconds
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}
