const email = JSON.parse(localStorage.getItem("user")).email;
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
    document.querySelector(".oldprofile").src = data[0].profilepath;
    document.querySelector(".biochange").textContent = data[0].bio;
    document.querySelector(".usernamechange").value = data[0].username;
  })
  .catch((err) => {
    console.error("Error fetching profile path:", err);
  });
document.querySelector(".logout").addEventListener("click", () => {
  window.location.href = "/logout";
});
// for making icon profile active
document.querySelector(".sidebarprofile").addEventListener("click", (e) => {
  window.location.href = "/profile";
});
// Click event listener for .changephoto class element
document.querySelector(".changephoto").addEventListener("click", () => {
  document.querySelector("#imageupload").click(); // Trigger click on #imageupload input
});

// Change event listener for #imageupload input
document.querySelector("#imageupload").addEventListener("change", (e) => {
  const file = e.target.files[0]; // Access the first selected file from the input
  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      document.querySelector(".oldprofile").src = reader.result; // Update image preview with selected file
      document.querySelector(".sidebarprofile").src = reader.result;
    };
    const email = JSON.parse(localStorage.getItem("user")).email;
    const formData = new FormData();
    formData.append("profileimage", file);
    formData.append("email", email);

    fetch(`/updateimage/${email}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json()) // Parse response as JSON
      .then((data) => {
        console.log(data); // Log the response data
      })
      .catch((error) => {
        console.error("Error:", error); // Log any errors
      });
  }
});
document.querySelector(".submit").addEventListener("click", (e) => {
  e.preventDefault();
  const email = JSON.parse(localStorage.getItem("user")).email;
  const bio = document.querySelector(".biochange").value;
  const username = document.querySelector(".usernamechange").value;

  if (bio && username) {
    fetch(`/updateprofile/${email}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bio: bio, username: username }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          alert("Profile updated successfully!");
        } else {
          alert("Error updating bio: " + data.message);
        }
      })
      .catch((err) => {
        console.error("Error updating bio:", err);
      });
  } else {
    alert("Please username and bio can't be empty");
  }
});
