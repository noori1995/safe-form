async function getCsrfToken() {
  const response = await fetch("/api/get-csrf-token", {
    credentials: "same-origin",
  });
  const data = await response.json();
  return data.csrfToken;
}

async function handleSubmit(event) {
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
    body: JSON.stringify({ ...formData, recaptchaToken }),
  });

  const result = await response.json();

  if (response.ok) {
    alert(result.message);
  } else {
    alert(`Error: ${result.message}`);
  }
}
  grecaptcha.ready(function () {
    grecaptcha
      .execute("reCAPTCHA_site_key", { action: "submit" })
      .then(function (token) {
        // Add your logic to submit to your backend server here.
      });
  });

document.getElementById("myForm").addEventListener("submit", handleSubmit);
