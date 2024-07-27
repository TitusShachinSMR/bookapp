document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const email = user.email;
  const userid = localStorage.getItem("id");
  document.querySelector(".logout").addEventListener("click", () => {
    window.location.href = "/logout";
  });
  document.querySelector(".profile-email").textContent = email;
  const userfrombackend = fetch(`/username/${email}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const username = data[0].username;
      console.log(data);
      document.querySelector(".profile-name").textContent = username;
      document.querySelector(".sidebarprofile").src = data[0].profilepath;
      document.querySelector(".mainprofile").src = data[0].profilepath;
      document.querySelector(".scorecount").textContent = data[0].score;
      const bio = data[0].bio;
      document.querySelector(".bio").innerHTML = bio;
      document.querySelector(".followerscount").textContent =
        data[0].followerscount;
      document.querySelector(".followingcount").textContent =
        data[0].followingcount;
      document.querySelector(".uploadcount").textContent = data[0].upload;
      fetch(`/showbatch/${localStorage.getItem("id")}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(function (response) {
          return response.json();
        })
        .then((data) => {
          data.forEach((badge) => {
            const img = document.createElement("img");
            img.src = `../badges/${badge.batchname}.png`;
            img.classList.add("badge");
            document.querySelector(".badgeblock").appendChild(img);
          });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  //for editing
  document.querySelector(".editprofile").addEventListener("click", (e) => {
    window.location.href = "/updateprofile";
  });

  // for seeing all the books uploaded by the users;
  window.addEventListener("load", () => {
    document.querySelector(".postheading").click();
  });
  document
    .querySelector(".postheading")
    .addEventListener("click", async (e) => {
      const userid = localStorage.getItem("id");
      const postsContainer = document.querySelector(".posts");
      document.querySelector(".savedheading").style.backgroundColor =
        "transparent";
      document.querySelector(".savedheading").style.color = "white";
      document.querySelector(".postheading").style.backgroundColor =
        "rgb(78, 76, 76)";
      document.querySelector(".postheading").style.color = "black";
      postsContainer.innerHTML = ""; // Clear the posts container
      document.querySelector(".saved").style.display = "none";
      document.querySelector(".posts").style.display = "flex";
      try {
        const response = await fetch(`/createdbooks/${userid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        if (data.length == 0) {
          const noresult = document.createElement("div");
          noresult.classList.add("noresult");
          noresult.textContent = "No post yet!";
          postsContainer.appendChild(noresult);
          return;
        }
        postsContainer.innerHTML = "";
        data.forEach(async (book) => {
          const div = document.createElement("div");
          div.classList.add("createdbooks");

          const title = document.createElement("h4");
          title.textContent = book.bookname;
          title.classList.add("createdbookstitle");

          const author = document.createElement("p");
          author.textContent = book.author;
          author.classList.add("createdbooksauthor");

          const genre = document.createElement("p");
          genre.textContent = book.genre;
          genre.classList.add("createdbooksgenre");

          const coverpage = document.createElement("img");
          coverpage.classList.add("createdbookscoverpage");
          coverpage.src = `${book.coverpath}`;

          const bookcontainer = document.createElement("div");
          bookcontainer.classList.add("createdbooksbookcontainer");
          bookcontainer.setAttribute("isbn", book.isbn); // Set bookid attribute

          const bookdetails = document.createElement("div");
          bookdetails.classList.add("createdbooksbookdetails");
          bookdetails.appendChild(coverpage);
          bookdetails.appendChild(title);
          bookdetails.appendChild(author);
          bookdetails.appendChild(genre);
          bookcontainer.appendChild(bookdetails);
          postsContainer.appendChild(bookcontainer);
        });

        // Add event listeners for the posts container using event delegation
        postsContainer.addEventListener("click", (e) => {
          const bookContainer = e.target.closest(".createdbooksbookcontainer");
          if (bookContainer) {
            const bookname =
              bookContainer.querySelector(".createdbookstitle").textContent;
            console.log(bookname);
            const isbn = bookContainer.getAttribute("isbn");
            console.log(isbn);
            window.location.href = `/books/${isbn}?upload=true`;
          }
        });
      } catch (error) {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
      }
    });
  // to show all the bookmarked books

  document
    .querySelector(".savedheading")
    .addEventListener("click", async (e) => {
      const userid = localStorage.getItem("id");
      document.querySelector(".savedheading").style.backgroundColor =
        "rgb(78, 76, 76)";
      document.querySelector(".savedheading").style.color = "black";
      document.querySelector(".postheading").style.backgroundColor =
        "transparent";
      document.querySelector(".postheading").style.color = "white";
      console.log(userid);
      const savedContainer = document.querySelector(".saved");
      savedContainer.innerHTML = ""; // Clear the posts container
      document.querySelector(".saved").style.display = "flex";
      document.querySelector(".posts").style.display = "none";
      try {
        const response = await fetch(`/getbookmarkedbooks/${userid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        if (data.length == 0) {
          const noresult = document.createElement("div");
          noresult.classList.add("noresult");
          noresult.textContent = "No bookmarks yet!";
          savedContainer.appendChild(noresult);
          return;
        }
        savedContainer.innerHTML = "";

        data.forEach(async (book) => {
          console.log(book);
          const div = document.createElement("div");
          div.classList.add("createdbooks");

          const title = document.createElement("h4");
          title.textContent = book.bookname;
          title.classList.add("createdbookstitle");

          const author = document.createElement("p");
          author.textContent = book.author;
          author.classList.add("createdbooksauthor");

          const genre = document.createElement("p");
          genre.textContent = book.genre;
          genre.classList.add("createdbooksgenre");

          const coverpage = document.createElement("img");
          coverpage.classList.add("createdbookscoverpage");
          coverpage.src = `${book.coverpath}`;

          const bookcontainer = document.createElement("div");
          bookcontainer.classList.add("createdbooksbookcontainer");
          bookcontainer.setAttribute("isbn", book.isbn); // Set bookid attribute

          const bookdetails = document.createElement("div");
          bookdetails.classList.add("createdbooksbookdetails");
          bookdetails.appendChild(coverpage);
          bookdetails.appendChild(title);
          bookdetails.appendChild(author);
          bookdetails.appendChild(genre);

          bookcontainer.appendChild(bookdetails);

          savedContainer.appendChild(bookcontainer);
        });

        // Add event listeners for the posts container using event delegation
        savedContainer.addEventListener("click", (e) => {
          const bookContainer = e.target.closest(".createdbooksbookcontainer");
          if (bookContainer) {
            const bookname =
              bookContainer.querySelector(".createdbookstitle").textContent;
            console.log(bookname);
            const isbn = bookContainer.getAttribute("isbn");
            console.log(isbn);
            window.location.href = `/books/${isbn}`;
          }
        });
      } catch (error) {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
      }
    });
  document.querySelector(".score").addEventListener("click", (e) => {
    document.querySelector(".score").style.fontSize =
      document.querySelector(".score").style.fontSize == "13px"
        ? "0px"
        : "13px";
  });
});
