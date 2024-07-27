document
  .getElementById("registerform")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      alert("registered successfully");
      // redirecting to the login page
      window.location.href = "/auth/login";
    } else {
      alert(result.msg || "Login failed");
    }
  });
document.querySelector(".login").addEventListener("click", (e) => {
  window.location.href = "/auth/login";
});
