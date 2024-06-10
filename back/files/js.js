async function getCsrfToken() {
  const response = await fetch("https://test.learnary.ir/api/get-csrf-token"); // Adjust URL accordingly
  const data = await response.json();
  console.log(data);
  document.getElementById("csrfToken").value = data.csrfToken;
}

document.addEventListener("DOMContentLoaded", (event) => {
  console.log('start.......')
  getCsrfToken();

  const form = document.getElementById("myForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(form);

    try {
      const response = await fetch("https://test.learnary.ir/api/submit-form", {
        // Adjust URL accordingly
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      const responseData = await response.json();
      console.log(responseData);
      // Handle success response
    } catch (error) {
      console.error("Error:", error);
      // Handle error
    }
  });
});
