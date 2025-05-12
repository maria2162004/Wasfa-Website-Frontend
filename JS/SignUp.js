const form = document.querySelector("#signupForm");
const inputname = document.getElementById("name");
const inputemail = document.getElementById("email");
const inputpassword = document.getElementById("password");
const inputconfirmpassword = document.getElementById("confirmpassword");
const inputphone = document.getElementById("phonenumber");
const alertBox = document.getElementById("customAlert");
const alertMessage = document.getElementById("alertMessage");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name_value = inputname.value.trim();
  const email_value = inputemail.value.trim();
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
    const user = {
      name: name_value,
      email: email_value.toLowerCase(),
      password: password_value,
      phone: phone_value,
      role: role_value,
      isAdmin: role_value.toLowerCase() === "admin",
    };

    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Check for existing email
    const emailExists = users.some((u) => u.email === user.email);
    if (emailExists) {
      showError(inputemail, "Email is already registered.");
      return;
    }

    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));

    // Log the user in automatically
    const loggedInUser = {
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      isLoggedIn: true,
    };
    localStorage.setItem("user", JSON.stringify(loggedInUser));

    showAlert("Sign Up Successfully!");
    form.reset();

    setTimeout(() => {
      window.location.href = "../HTML/HomePage.html";
    }, 2000);
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
