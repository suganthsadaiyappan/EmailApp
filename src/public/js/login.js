const registerUsername = document.getElementById("registerUsername");
const registerPassword = document.getElementById("registerPassword");
const registerRepeatPassword = document.getElementById(
  "registerRepeatPassword"
);
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const registerButton = document.querySelector(".registerButton");
const loginButton = document.querySelector(".loginButton");

//Function to create alert element in login page for form validation
function createAlertElement(content) {
  const alert = document.querySelector(".alert");
  if (alert) {
    alert.remove();
  }
  const alertDiv = document.createElement("div");
  alertDiv.classList.add(
    "alert",
    "alert-warning",
    "alert-dismissible",
    "fade",
    "show"
  );
  alertDiv.innerHTML = content;
  const closeButton = document.createElement("button");
  closeButton.setAttribute("type", "button");
  closeButton.setAttribute("class", "close");
  closeButton.setAttribute("data-dismiss", "alert");
  closeButton.setAttribute("aria-label", "Close");
  const closeIcon = document.createElement("span");
  closeIcon.setAttribute("aria-hidden", "true");
  closeIcon.innerHTML = "&times;";
  closeButton.appendChild(closeIcon);
  alertDiv.appendChild(closeButton);
  const tabContent = document.querySelector(".tab-content");
  tabContent.appendChild(alertDiv);
}

//Function to handle register feature
function registerUser() {
  registerButton.addEventListener("click", async function () {
    const url = "http://localhost:3000/register";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registerUsername: `${registerUsername.value}`,
        registerPassword: `${registerPassword.value}`,
        registerRepeatPassword: `${registerRepeatPassword.value}`,
      }),
    });
    const data = await response.json();
    if (data === "register") {
      window.location.replace("http://localhost:3000/email");
    } else {
      createAlertElement(data);
    }
  });
}

//Function to handle login feature
function loginUser() {
  loginButton.addEventListener("click", async function () {
    const url = "http://localhost:3000/login";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        loginUsername: `${loginUsername.value}`,
        loginPassword: `${loginPassword.value}`,
      }),
    });
    const data = await response.json();
    if (data === "login") {
      window.location.replace("http://localhost:3000/email");
    } else {
      createAlertElement(data);
    }
  });
}

//Add Event handlers
registerUser();
loginUser();
