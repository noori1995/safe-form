async function getCsrfToken() {
  const response = await fetch("/api/get-csrf-token", {
    credentials: "same-origin",
  });
  const data = await response.json();
  return data.csrfToken;
}
console.log('start...')
let grecaptchaCode = null;
var captchaSuccess = function(token) {
  console.log( "grecaptcha success!", token);
  grecaptchaCode = token;
}
var onload = function(e) {
  console.log("grecaptcha is ready!", e);
};
async function handleSubmit(event) {
  console.log('submit...')
  event.preventDefault();

  const csrfToken = await getCsrfToken();

  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
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

// Add your logic to submit to your backend server here.
