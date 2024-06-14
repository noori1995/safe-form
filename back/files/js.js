async function getCsrfToken() {
  const response = await fetch("test.learnary.ir/api/get-csrf-token", {
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

  const recaptchaToken = await grecaptcha.execute("6LcbjPUpAAAAAG-_vDI5QSE9O0M0aBpnrG4KYqAC", {
    action: "submit",
  });

  const response = await fetch("test.learnary.ir/api/submit-form", {
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

document.getElementById("myForm").addEventListener("submit", handleSubmit);
