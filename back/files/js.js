async function getCsrfToken() {
  const response = await fetch("localhost:3000/api/get-csrf-token");
  const data = await response.json();
  console.log(data);
  document.getElementById("csrfToken").value = data.csrfToken;
}

document.addEventListener("DOMContentLoaded", (event) => {
  getCsrfToken();
});
