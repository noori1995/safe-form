async function getCsrfToken() {
  const response = await fetch("/api/get-csrf-token", {
    credentials: "same-origin",
  });
  const data = await response.json();
  return data.csrfToken;
}
console.log("start...");
let grecaptchaCode = null;
var captchaSuccess = function (token) {
  console.log("grecaptcha success!", token);
  grecaptchaCode = token;
};
var onload = function (e) {
  console.log("grecaptcha is ready!", e);
};
async function handleSubmit(event) {
  console.log("submit...");
  event.preventDefault();

  const csrfToken = await getCsrfToken();

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
    latitude: document.getElementById("latitude").value,
    longitude: document.getElementById("longitude").value,
    _csrf: csrfToken,
  };

  const response = await fetch("/api/submit-form", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
    body: JSON.stringify({ ...formData, grecaptchaCode }),
  });

  const result = await response.json();

  if (response.ok) {
    alert(result.message);
  } else {
    alert(`Error: ${result.message}`);
  }
}

document.getElementById("myForm").addEventListener("submit", handleSubmit);

document.addEventListener("DOMContentLoaded", (event) => {
  document.getElementById("startTime").value = Date.now();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      document.getElementById("latitude").value = position.coords.latitude;
      document.getElementById("longitude").value = position.coords.longitude;
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});
