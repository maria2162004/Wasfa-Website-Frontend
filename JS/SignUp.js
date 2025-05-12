const form = document.querySelector("#signupForm");
const inputname = document.getElementById("name");
const inputemail = document.getElementById("email");
const inputpassword = document.getElementById("password");
const inputconfirmpassword = document.getElementById("confirmpassword");
const inputphone = document.getElementById("phonenumber");
const alertBox = document.getElementById("customAlert");
const alertMessage = document.getElementById("alertMessage");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name_value = inputname.value.trim();
  const email_value = inputemail.value.trim().toLowerCase();
  const password_value = inputpassword.value;
  const confirmpassword_value = inputconfirmpassword.value;
  const phone_value = inputphone.value.trim();
  const role_value = document.querySelector('input[name="role"]:checked')
    ? document.querySelector('input[name="role"]:checked').value.toLowerCase()
    : null;

  let valid = true;
  clearErrorMessages();

  if (name_value === "") {
    showError(inputname, "Please Enter Your Name.");
    valid = false;
  }

  if (!ValidateEmail(email_value)) {
    showError(inputemail, "Please Enter a Valid Email Address.");
    valid = false;
  }

  if (password_value.length < 6) {
    showError(inputpassword, "Passwords should be at least 6 characters long.");
    valid = false;
  }

  if (password_value !== confirmpassword_value) {
    showError(inputconfirmpassword, "Passwords do not Match.");
    valid = false;
  }

  if (!ValidatePhone(phone_value)) {
    showError(inputphone, "Please Enter a valid Phone number.");
    valid = false;
  }

  if (!role_value) {
    const roleInputGroup =
      document.querySelector(".radio-container") || inputphone.parentNode;
    showError(roleInputGroup, "Please select a Role.");
    valid = false;
  }

  if (valid) {
    const userData = {
      name: name_value,
      email: email_value,
      password: password_value,
      confirm_password: confirmpassword_value, // ✅ Fix here
      phone: phone_value,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Save tokens to localStorage
        localStorage.setItem("access", data.tokens.access);
        localStorage.setItem("refresh", data.tokens.refresh);

        showAlert("Sign Up Successfully!");
        form.reset();

        setTimeout(() => {
          window.location.href = "../HTML/HomePage.html";
        }, 2000);
      } else {
        console.log("Error details from server:", JSON.stringify(data, null, 2));

        if (data.email) showError(inputemail, data.email[0]);
        if (data.name) showError(inputname, data.name[0]);
        if (data.password) showError(inputpassword, data.password[0]);
        if (data.confirm_password) showError(inputconfirmpassword, data.confirm_password[0]);
        if (data.phone) showError(inputphone, data.phone[0]);

        if (!data.email && !data.name && !data.password && !data.phone && !data.confirm_password) {
          showAlert("Signup failed. Check your info.");
        }
      }
    } catch (error) {
      console.error("Signup Error:", error);
      showAlert("An error occurred during signup.");
    }
  }
});

function ValidateEmail(email_value) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email_value);
}

function ValidatePhone(phone_value) {
  const regex = /^01[0125][0-9]{8}$/;
  return regex.test(phone_value);
}

function showError(inputElement, message) {
  const errorElement = document.createElement("div");
  errorElement.classList.add("error-message");
  errorElement.style.color = "#bf3131";
  errorElement.textContent = message;
  inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
}

function clearErrorMessages() {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((message) => message.remove());
}

function showAlert(message) {
  alertMessage.textContent = message;
  alertBox.classList.add("show");
  document.body.style.overflow = "hidden";
}

document.getElementById("closeAlert").addEventListener("click", function () {
  alertBox.classList.remove("show");
  document.body.style.overflow = "auto";
});
