document.addEventListener("DOMContentLoaded", (event) => {
  fetch("/form")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("token").value = data.sessionToken;
      document.getElementById("csrf").value = data.csrfToken;
    })
    .catch((error) => console.error("Error fetching tokens:", error));
});
