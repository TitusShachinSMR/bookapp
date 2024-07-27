document.addEventListener("DOMContentLoaded", () => {
  const email = JSON.parse(localStorage.getItem("user")).email;
  document.querySelector(".logout").addEventListener("click", () => {
    window.location.href = "/logout";
  });
  fetch(`/username/${email}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data[0].profilepath);
      document.querySelector(".sidebarprofile").src = data[0].profilepath;
      document
        .querySelector(".sidebarprofile")
        .setAttribute("username", data[0].username);
    })
    .catch((err) => {
      console.error("Error fetching profile path:", err);
    });
  document
    .getElementById("changePasswordForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const oldPassword = document.getElementById("oldpassword").value;
      const newPassword = document.getElementById("newpassword").value;
      const confirmPassword = document.getElementById("confirmpassword").value;

      if (newPassword !== confirmPassword) {
        alert("New passwords do not match");
        return;
      }

      try {
        // Step 1: Fetch the hashed password
        const response = await fetch(`/gethashedpassword/${email}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.error) {
          alert(data.message);
          return;
        }
        console.log(data);
        const hashedPassword = data.password;

        // Step 2: Compare the old password with the hashed password
        const passwordMatch = await fetch("/comparepasswords", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ oldPassword, hashedPassword }),
        });

        const matchResult = await passwordMatch.json();

        if (!matchResult.match) {
          alert("Old password is incorrect");
          return;
        }

        // Step 3: Update the password
        const updateResponse = await fetch("/updatepassword", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, newPassword }),
        });

        const updateData = await updateResponse.json();
        alert(updateData.message);
        location.reload();
      } catch (error) {
        console.error(error);
        alert("An error occurred while changing the password");
      }
    });
});
