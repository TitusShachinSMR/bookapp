document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user.username;
  const email = user.email;
  const openbtn = document.querySelector(".openbtn");
  const closebtn = document.querySelector(".closebtn");
  const opennav = document.querySelector(".sidenav");
  //for making request with authentication

  // for making logout functionality, for clearing local storage
  document.querySelector(".logout").addEventListener("click", () => {
    window.location.href = "/logout";
  });

  // making the profile page to appear on the screen
  const profile = document.querySelector(".sidebarprofile");
  profile.addEventListener("click", (e) => {
    window.location.href = "/profile";
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
      localStorage.setItem("id", data[0].id);
      document
        .querySelector(".sidebarprofile")
        .setAttribute("username", data[0].username);
    })
    .catch((err) => {
      console.error("Error fetching profile path:", err);
    });

  //showing the coverimage
  function showCoverImage(file) {
    const img = document.createElement("img");
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        img.src = reader.result; // Update image preview with selected file
        document.querySelector(".thumbnailupload").innerHTML = ""; // Clear previous image
        document.querySelector(".thumbnailupload").appendChild(img);
        img.style.height = "100%";
        img.style.width = "100%";
      };
    }
  }
  document
    .querySelector(".thumbnailupload")
    .addEventListener("click", () =>
      document.querySelector(".thumbnailimage").click()
    );
  document
    .querySelector(".thumbnailimage")
    .addEventListener("change", (event) => {
      const file = event.target.files[0];
      showCoverImage(file);
    });

  // Fetch details of the book and store them in the database
  document.querySelector(".submit").addEventListener("click", (e) => {
    const fileInput = document.querySelector(".thumbnailimage");
    const file = fileInput.files[0];
    if (!file) {
      alert("please upload cover image");
      return;
    }
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file format. Only JPEG, PNG are allowed.");
      return;
    }
    const formData = new FormData();
    formData.append("title", document.querySelector(".bookname").value.trim());
    formData.append(
      "author",
      document.querySelector(".authorname").value.trim()
    );
    formData.append(
      "description",
      document.querySelector(".descriptionspace").value.trim()
    );
    formData.append("genre", document.querySelector(".genrename").value.trim());
    formData.append("image", file);
    formData.append("userid", localStorage.getItem("id"));
    fetch(`/bookupload/${localStorage.getItem("id")}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert(data.message);
        location.reload();
        fetch("/checkbatchlikes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "uploads",
            postedid: data[0].id,
          }),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data);
            if (data.successMessage) {
              alert(data.successMessage);
            } else {
              console.log("No success message received");
            }
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((err) => alert(data.message));
  });
});
