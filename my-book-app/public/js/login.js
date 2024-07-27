document
  .querySelector(".gsi-material-button")
  .addEventListener("click", (e) => {
    window.location.href = "/auth/google";
  });
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      localStorage.setItem("user", JSON.stringify(result.user)); // Store the user info in localStorage
      window.location.href = "/dashboard"; // Redirect to the dashboard
    } else {
      alert(result.msg || "Login failed");
    }
  });

document.querySelector(".Register").addEventListener("click", (e) => {
  window.location.href = "/auth/register";
});
