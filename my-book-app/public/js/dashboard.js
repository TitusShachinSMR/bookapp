import { formatDistanceToNow } from "https://cdn.jsdelivr.net/npm/date-fns@2.23.0/esm/index.js";
document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("user")) {
    alert("You must be logged in to view this page.");
    window.location.href = "/auth/login";
    return;
  }
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user.username;
  const email = user.email;
  //for making request with authentication
  document.querySelector(".logout").addEventListener("click", () => {
    window.location.href = "/logout";
  });
  listings();
  // for getting list of carted and checkedout books and storing in the local storage
  function listings() {
    const userid = localStorage.getItem("id");
    fetch(`/cartedbooklist/${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const bookarray = data.map((element) => parseInt(element));
        localStorage.setItem("cartlist", JSON.stringify(bookarray));
      })
      .catch((err) => {
        console.log(err);
      });
    fetch(`/checkedbook/${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const bookarray = data.map((element) => parseInt(element));
        localStorage.setItem("purchased", JSON.stringify(bookarray));
      })
      .catch((err) => {
        console.log(err);
      });
    fetch(`/savedbooklist/${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const bookarray = data.map((element) => parseInt(element));
        localStorage.setItem("savedlist", JSON.stringify(bookarray));
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //function for loading profile on clicking the image
  function loadprofile(userid) {
    fetch(`/userprofile/${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        document.querySelector(".finalprofile-container").style.display =
          "flex";
        console.log(data);
        const username = data[0].username;
        document.querySelector(".profile-name").textContent = username;
        document.querySelector(".mainprofile").src = data[0].profilepath;
        document.querySelector(".profile-email").textContent = data[0].email;
        data[0].email;
        const bio = data[0].bio;
        document.querySelector(".bio").innerHTML = bio;
        document
          .querySelector(".follow")
          .setAttribute("userbeingviewed", data[0].id);
        document.querySelector(".followerscount").textContent =
          data[0].followerscount;
        document.querySelector(".followingcount").textContent =
          data[0].followingcount;
        document.querySelector(".uploadcount").textContent = data[0].upload;
        fetch(`/showbatch/${userid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(function (response) {
            return response.json();
          })
          .then((data) => {
            document.querySelector(".badgeblock").innerHTML = "";
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
        fetch(`/iffollowing`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            followerid: localStorage.getItem("id"),
            followingid: document
              .querySelector(".follow")
              .getAttribute("userbeingviewed"),
          }),
        })
          .then((response) => {
            return response.json();
          })
          .then((info) => {
            console.log(info);
            if (info.condition == "follow") {
              document
                .querySelector(".follow")
                .setAttribute("status", "follow");
              document.querySelector(".follow").textContent = "follow";
              document.querySelector(".follow").style.backgroundColor =
                "rgb(0, 139, 253)";
              ("follow");
            } else if (info.condition == "unfollow") {
              document
                .querySelector(".follow")
                .setAttribute("status", "unfollow");
              document.querySelector(".follow").textContent = "unfollow";
              document.querySelector(".follow").style.backgroundColor = "grey";
            }
          });
      });
  }
  //function for loading profile ends here;

  //for showing date of the comment in feeds
  function timeAgo(date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }
  // for showing the feeds from the followes
  function showFeeds() {
    const userid = localStorage.getItem("id");
    console.log("userid:", userid);
    fetch(`/userfeed/${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        data.forEach((feed) => {
          fetch(`/userprofile/${feed.UserID}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((response) => response.json())
            .then((data) => {
              const profilepath = data[0].profilepath;
              console.log(profilepath);
              const feedContainer = document.querySelector(".feedbox");
              const bookCard = document.createElement("div");
              bookCard.classList.add("bookcard");
              bookCard.setAttribute("isbn", feed.isbn);

              const imageAndUsername = document.createElement("div");
              imageAndUsername.classList.add("imageandusername");

              // Create user image div and image
              const userImageDiv = document.createElement("div");
              const userImage = document.createElement("img");
              userImage.src = profilepath;
              userImage.alt = "user";
              userImage.classList.add("userimage");
              userImageDiv.appendChild(userImage);

              const usernameDiv = document.createElement("div");
              usernameDiv.classList.add("feedusername");
              usernameDiv.textContent = feed.username;
              imageAndUsername.setAttribute("userid", `${feed.UserID}`);
              imageAndUsername.addEventListener("click", (e) => {
                document.querySelector(
                  ".finalprofile-container"
                ).style.display = "block";

                loadprofile(feed.UserID);
                document
                  .querySelector(".follow")
                  .addEventListener("click", (e) => {
                    if (e.currentTarget.getAttribute("status") == "follow") {
                      fetch(`/follow`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          followerid: localStorage.getItem("id"),
                          followingid: document
                            .querySelector(".follow")
                            .getAttribute("userbeingviewed"),
                        }),
                      })
                        .then((response) => {
                          if (!response.ok) {
                            throw new Error(
                              "Network response was not ok " +
                                response.statusText
                            );
                          }
                          return response.json();
                        })
                        .then((data) => {
                          console.log(data);
                          alert(data.message);
                          // Update the button status based on the action performance
                          loadprofile(
                            document
                              .querySelector(".follow")
                              .getAttribute("userbeingviewed")
                          );
                        })
                        .catch((error) => {
                          alert(
                            "There was an error in processing your request: " +
                              error.message
                          );
                        });
                    }
                    if (e.currentTarget.getAttribute("status") == "unfollow") {
                      fetch(`/unfollow`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          followerid: localStorage.getItem("id"),
                          followingid: document
                            .querySelector(".follow")
                            .getAttribute("userbeingviewed"),
                        }),
                      })
                        .then((response) => {
                          if (!response.ok) {
                            throw new Error(
                              "Network response was not ok " +
                                response.statusText
                            );
                          }
                          return response.json();
                        })
                        .then((data) => {
                          console.log(data);
                          alert(data.message);
                          // Update the button status based on the action performance
                          loadprofile(
                            document
                              .querySelector(".follow")
                              .getAttribute("userbeingviewed")
                          );
                        })
                        .catch((error) => {
                          alert(
                            "There was an error in processing your request: " +
                              error.message
                          );
                        });
                    }
                  });
              });
              imageAndUsername.appendChild(userImageDiv);
              imageAndUsername.appendChild(usernameDiv);

              const bookImageAndComment = document.createElement("div");
              bookImageAndComment.classList.add("bookimageandcomment");

              const bookImage = document.createElement("img");
              bookImage.classList.add("bookimage");
              bookImage.src = `${feed.coverpath}`;
              bookImage.alt = "";

              bookImage.addEventListener("click", (e) => {
                window.location.href = `/books/${feed.isbn}`;
              });
              const commentDiv = document.createElement("div");
              commentDiv.textContent = feed.Comments;

              bookImageAndComment.appendChild(bookImage);
              bookImageAndComment.appendChild(commentDiv);

              const likeDislikes = document.createElement("div");
              likeDislikes.classList.add("likedislikes");

              const likesDiv = document.createElement("div");
              likesDiv.classList.add("likes");
              likesDiv.innerHTML = `
  ${feed.Likes}
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
    <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"/>
  </svg>
`;
              const dislikesDiv = document.createElement("div");
              dislikesDiv.classList.add("dislikes");
              dislikesDiv.innerHTML = `
  ${feed.Dislikes}
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
    <path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"/>
  </svg>
`;

              // Create time element
              const timeDiv = document.createElement("div");
              timeDiv.classList.add("time");
              timeDiv.textContent = timeAgo(feed.updated_at);

              // Append likes, dislikes, and time to likes and dislikes container
              likeDislikes.appendChild(likesDiv);
              likeDislikes.appendChild(dislikesDiv);
              likeDislikes.appendChild(timeDiv);

              // Append all sections to book card
              bookCard.appendChild(imageAndUsername);
              bookCard.appendChild(bookImageAndComment);
              bookCard.appendChild(likeDislikes);

              // Append book card to feed container
              feedContainer.appendChild(bookCard);
            })
            .catch((err) => {
              console.log(err);
            });
        });
      });
  }
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

      fetch("/checkbatchlikes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "likes",
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
      document
        .querySelector(".sidebarprofile")
        .setAttribute("username", data[0].username);
      showFeeds();
    })
    .catch((err) => {
      console.error("Error fetching profile path:", err);
    });

  //for showing the leaderboard
  fetch(`/leaderboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const leaderboardContainer = document.querySelector(
        ".leaderboard-container"
      );
      leaderboardContainer.innerHTML = "";
      let a = 0;
      data.forEach((user) => {
        a = a + 1;
        const userDiv = document.createElement("div");
        userDiv.classList.add("leaderuser");
        userDiv.setAttribute("userid", user.id);
        userDiv.innerHTML = `
              <span>${a}</span>
              <span> <img src="../profilepicture/${user.email}.profile.jpg" height="25px" width="25px" border="1px solid white" alt="" class="leaderuser-profile-img">${user.username}</span>
              <span>${user.score}<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M444-200h70v-50q50-9 86-39t36-89q0-42-24-77t-96-61q-60-20-83-35t-23-41q0-26 18.5-41t53.5-15q32 0 50 15.5t26 38.5l64-26q-11-35-40.5-61T516-710v-50h-70v50q-50 11-78 44t-28 74q0 47 27.5 76t86.5 50q63 23 87.5 41t24.5 47q0 33-23.5 48.5T486-314q-33 0-58.5-20.5T390-396l-66 26q14 48 43.5 77.5T444-252v52Zm36 120q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg></span>
            `;
        leaderboardContainer.appendChild(userDiv);
        if (user.id != localStorage.getItem("id")) {
          userDiv.addEventListener("click", (e) => {
            loadprofile(user.id);
            document.querySelector(".follow").addEventListener("click", (e) => {
              if (e.currentTarget.getAttribute("status") == "follow") {
                fetch(`/follow`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    followerid: localStorage.getItem("id"),
                    followingid: document
                      .querySelector(".follow")
                      .getAttribute("userbeingviewed"),
                  }),
                })
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error(
                        "Network response was not ok " + response.statusText
                      );
                    }
                    return response.json();
                  })
                  .then((data) => {
                    console.log(data);
                    alert(data.message);
                    // Update the button status based on the action performance
                    loadprofile(
                      document
                        .querySelector(".follow")
                        .getAttribute("userbeingviewed")
                    );
                  })
                  .catch((error) => {
                    alert(
                      "There was an error in processing your request: " +
                        error.message
                    );
                  });
              }
              if (e.currentTarget.getAttribute("status") == "unfollow") {
                fetch(`/unfollow`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    followerid: localStorage.getItem("id"),
                    followingid: document
                      .querySelector(".follow")
                      .getAttribute("userbeingviewed"),
                  }),
                })
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error(
                        "Network response was not ok " + response.statusText
                      );
                    }
                    return response.json();
                  })
                  .then((data) => {
                    console.log(data);
                    alert(data.message);
                    // Update the button status based on the action performance
                    loadprofile(
                      document
                        .querySelector(".follow")
                        .getAttribute("userbeingviewed")
                    );
                  })
                  .catch((error) => {
                    alert(
                      "There was an error in processing your request: " +
                        error.message
                    );
                  });
              }
            });
          });
        }
      });
    });
  //for searching the user
  document
    .querySelector(".searchuserinput")
    .addEventListener("input", async (e) => {
      const search = document.querySelector(".searchuserinput").value.trim(); // Trim to remove leading/trailing spaces

      // Clear previous search results
      const searchResultsContainer = document.querySelector(
        ".user-search-results"
      );
      searchResultsContainer.innerHTML = "";

      // If search string is less than 2 characters, return early to avoid unnecessary calls
      if (search.length < 2) {
        return; // Exit function if less than 2 characters
      }

      try {
        const response = await fetch(`/searchuser?q=${search}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        // Loop through the data and create elements
        data.forEach((user) => {
          const usersearchDiv = document.createElement("div");
          usersearchDiv.classList.add("userresults");
          usersearchDiv.innerHTML = `
            <img src="../profilepicture/${user.email}.profile.jpg" height="30px" width="30px" border="1px solid white" alt="" class="user-profile-img">
            <span>${user.username}</span>
          `;
          if (user.id != localStorage.getItem("id")) {
            usersearchDiv.addEventListener("click", (e) => {
              loadprofile(user.id);
            });
          }
          // Append each author div to search results container
          searchResultsContainer.appendChild(usersearchDiv);
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    });
  document.querySelector("#authorname").addEventListener("input", async (e) => {
    const search = document.querySelector("#authorname").value.trim(); // Trim to remove leading/trailing spaces

    // Clear previous search results
    const searchResultsContainer = document.querySelector(
      ".search-results-author"
    );
    searchResultsContainer.innerHTML = "";

    // If search string is less than 2 characters, return early to avoid unnecessary API calls
    if (search.length < 2) {
      return; // Exit function if less than 2 characters
    }

    try {
      const response = await fetch(`/searchauthor?q=${search}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Loop through the data and create elements
      data.forEach((author) => {
        const authorDiv = document.createElement("div");
        authorDiv.classList.add("authorname");
        authorDiv.textContent = author.author;

        // Add click event listener to set filter and attribute
        authorDiv.addEventListener("click", (e) => {
          const selectedAuthor = e.target.textContent;
          document.querySelector(
            ".filter-author"
          ).innerText = `Author: ${selectedAuthor}`;
          document.querySelector(".filter-author").style.color = "black";
          document
            .querySelector(".filter-author")
            .setAttribute("author", selectedAuthor);
          document.querySelector("#authorname").value = `${selectedAuthor}`;
        });

        // Append each author div to search results container
        searchResultsContainer.appendChild(authorDiv);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });

  //now for search the genre
  document.querySelector("#genrename").addEventListener("input", async (e) => {
    const search = document.querySelector("#genrename").value.trim(); // Trim to remove leading/trailing spaces
    const searchResultsContainer = document.querySelector(
      ".search-results-genre"
    );
    console.log(search);
    if (search.lenght <= 2) {
      return;
    }
    searchResultsContainer.innerHTML = "";
    try {
      const response = await fetch(`/searchgenre?q=${search}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      data.forEach((genre) => {
        const genreDiv = document.createElement("div");
        genreDiv.classList.add("genre");
        genreDiv.textContent = genre.genre;
        genreDiv.addEventListener("click", (e) => {
          const selectedGenre = e.target.textContent;
          document.querySelector(
            ".filter-genre"
          ).innerText = `Genre: ${selectedGenre}`;
          document.querySelector(".filter-genre").style.color = `black`;
          document
            .querySelector(".filter-genre")
            .setAttribute("genre", selectedGenre);
          document.querySelector("#genrename").value = `${selectedGenre}`;
        });
        searchResultsContainer.appendChild(genreDiv);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });

  document
    .querySelector(".search-results-final")
    .addEventListener("click", async (e) => {
      const minprice = document.querySelector("#minprice").value.trim();
      const maxprice = document.querySelector("#maxprice").value.trim();

      // Validate minprice and maxprice
      if (
        (minprice == "" && maxprice != "") ||
        (minprice != "" && maxprice == "")
      ) {
        alert("Please enter both minimum and maximum prices.");
        return;
      }

      if (isNaN(minprice) || isNaN(maxprice)) {
        alert("Please enter valid numeric values for prices.");
        return;
      }

      const minPriceNum = parseInt(minprice);
      const maxPriceNum = parseInt(maxprice);

      if (minPriceNum < 0 || maxPriceNum < 0) {
        alert("Prices must be greater than or equal to 0.");
        return;
      }

      if (minPriceNum >= maxPriceNum) {
        alert("Maximum price should be greater than minimum price.");
        return;
      }

      try {
        const response = await fetch("/filterbooks", {
          method: "POST", // Use POST method for sending data
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            minprice: minPriceNum,
            maxprice: maxPriceNum,
            author: document
              .querySelector(".filter-author")
              .getAttribute("author"),
            genre: document
              .querySelector(".filter-genre")
              .getAttribute("genre"),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        document.querySelector(".filterresultbooks").innerHTML = "";
        console.log("Filtered books:", data); // Log filtered books data
        if (data.length == 0) {
          alert("No books found");
        }
        data.forEach((book) => {
          const bookDiv = document.createElement("div");
          bookDiv.classList.add("filteredbooks");
          bookDiv.style.backgroundImage = `url('')`;
          const image = document.createElement("img");
          image.src = `${book.coverpath}`;
          const bookcontainer = document.createElement("div");
          bookcontainer.classList.add("bookcontainer");
          bookcontainer.setAttribute("isbn", book.isbn);
          bookcontainer.appendChild(image);
          bookcontainer.appendChild(bookDiv);
          const title = document.createElement("div");
          title.classList.add("filterbooktitle");
          title.textContent = book.bookname;
          bookDiv.appendChild(title);
          const author = document.createElement("div");
          author.classList.add("filterbookauthor");
          author.textContent = `Author: ${book.author}`;
          bookDiv.appendChild(author);
          const genre = document.createElement("div");
          genre.classList.add("filterbookgenre");
          genre.textContent = `Genre: ${book.genre}`;
          bookDiv.appendChild(genre);
          const price = document.createElement("div");
          price.classList.add("filterbookprice");
          price.textContent = `Price: ${book.price}`;
          bookDiv.appendChild(price);
          document
            .querySelector(".filterresultbooks")
            .appendChild(bookcontainer);
          // Add click event listener to view book details
          bookcontainer.addEventListener("click", (e) => {
            const isbn = e.target
              .closest(".bookcontainer")
              .getAttribute("isbn");
            console.log(isbn);
            document.querySelector(".bookdetails").innerHTML = "";
            document.querySelector(".popoutbook").style.display = "block";
            fetch(`/bookdetails/${isbn}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(
                    "Network response was not ok " + response.statusText
                  );
                }
                return response.json();
              })
              .then((book) => {
                console.log(book);
                document
                  .querySelector(".bookcontainerforview")
                  .setAttribute("bookid", book.bookid);
                console.log(
                  document
                    .querySelector(".bookcontainerforview")
                    .getAttribute("bookid")
                );
                const title = document.createElement("h1");
                title.textContent = book.bookname;
                title.classList.add("booktitle");

                const author = document.createElement("div");
                author.innerHTML = `<h2>author: ${book.author}</h2> `;
                author.classList.add("bookauthor");

                const genre = document.createElement("div");
                genre.innerHTML = `<h2>genre: ${book.genre}</h2> `;
                genre.classList.add("bookgenre");

                const coverpage = document.createElement("img");
                coverpage.classList.add("bookcoverpage");
                coverpage.src = `${book.coverpath}`;
                const bookcontainer = document.createElement("div");
                bookcontainer.classList.add("bookscontainer");
                const description = document.createElement("div");
                description.classList.add("bookdescription");
                description.textContent = book.description;
                const bookdetails = document.createElement("div");
                bookdetails.classList.add("booksdetails");
                bookdetails.appendChild(coverpage);
                bookdetails.appendChild(title);
                bookdetails.appendChild(author);
                bookdetails.appendChild(genre);
                bookdetails.appendChild(description);
                bookcontainer.appendChild(bookdetails);
                document
                  .querySelector(".bookdetails")
                  .appendChild(bookcontainer);
                showComments();
                window.scrollTo(0, 0);
                const saveButton = document.querySelector(".savebook");
                const savedList =
                  JSON.parse(localStorage.getItem("savedlist")) || [];

                if (savedList.includes(book.bookid)) {
                  saveButton.setAttribute("savedalready", "true");
                  saveButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0,0,256,256">
            <g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal">
              <g transform="scale(5.12,5.12)">
                <path d="M37,48c-0.17578,0 -0.34766,-0.04687 -0.50391,-0.13672l-11.49609,-6.70703l-11.49609,6.70703c-0.30859,0.17969 -0.69141,0.18359 -1,0.00391c-0.3125,-0.17969 -0.50391,-0.50781 -0.50391,-0.86719v-44c0,-0.55078 0.44922,-1 1,-1h24c0.55469,0 1,0.44922 1,1v44c0,0.35938 -0.19141,0.6875 -0.50391,0.86719c-0.15234,0.08984 -0.32422,0.13281 -0.49609,0.13281z"></path>
              </g>
            </g>
          </svg>`;
                } else {
                  saveButton.setAttribute("savedalready", "false");
                  saveButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#FFFFFF">
            <path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Zm0-80h480v-640h-80v280l-100-60-100 60v-280H240v640Zm0 0v-640 640Zm200-360 100-60 100 60-100-60-100 60Z"/>
          </svg>`;
                }
                const cartbook = JSON.parse(localStorage.getItem("cartlist"));
                const purchase = JSON.parse(localStorage.getItem("purchased"));
                const addtocart = document.querySelector(".addtocart");
                addtocart.setAttribute("carted", "false");
                if (
                  cartbook.includes(book.bookid) ||
                  purchase.includes(book.bookid)
                ) {
                  addtocart.innerHTML = "";
                  if (cartbook.includes(book.bookid)) {
                    addtocart.setAttribute("carted", "true");
                    document.querySelector(
                      ".addtocart"
                    ).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-cart-fill" viewBox="0 0 16 16">
  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
</svg>`;
                  } else {
                    document
                      .querySelector(".addtocart")
                      .classList.add("disabled");
                    document.querySelector(
                      ".addtocart"
                    ).innerHTML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Creator: CorelDRAW 2021 (64-Bit) -->
<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="35" height="35" version="1.1" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd"
viewBox="0 0 512 434.91"
 xmlns:xlink="http://www.w3.org/1999/xlink"
 xmlns:xodm="http://www.corel.com/coreldraw/odm/2003">
 <g id="Layer_x0020_1">
  <metadata id="CorelCorpID_0Corel-Layer"/>
  <path fill="white" fill-rule="nonzero" d="M15.31 43.96c-8.25,0 -15.31,-7.06 -15.31,-15.7 0,-8.24 7.06,-15.3 15.31,-15.3l21.19 0c0.39,0 1.18,0 1.57,0 14.13,0.39 26.69,3.14 37.29,9.8 20.54,13.02 24.19,31.61 29.44,52.6l170.15 0c-2.03,9.26 -3.1,18.87 -3.1,28.74l0.01 1.88 -158.43 0 34.94 131.49 247.67 0 0.06 -0.22c3.04,0.21 6.11,0.32 9.21,0.32 7.72,0 15.29,-0.66 22.65,-1.92l-5.23 21.06c-1.57,7.06 -7.85,11.77 -14.91,11.77l-251.21 0c5.49,20.41 10.99,31.4 18.45,36.51 9.02,5.88 24.73,6.27 51.02,5.88l0.4 0 177.41 0c8.64,0 15.31,7.07 15.31,15.31 0,8.64 -7.07,15.31 -15.31,15.31l-177.41 0c-32.58,0.39 -52.6,-0.4 -68.7,-10.99 -16.48,-10.99 -25.11,-29.83 -33.75,-63.98l-52.6 -199.01c0,-0.39 0,-0.39 -0.39,-0.78 -2.35,-8.64 -6.28,-14.52 -11.77,-17.66 -5.5,-3.54 -12.96,-5.11 -21.59,-5.11 -0.4,0 -0.79,0 -1.18,0l-21.19 0zm228.96 96.91c0,-4.84 4.78,-8.76 10.67,-8.76 5.9,0 10.68,3.92 10.68,8.76l0 59.2c0,4.84 -4.78,8.76 -10.68,8.76 -5.89,0 -10.67,-3.92 -10.67,-8.76l0 -59.2zm-63.94 0c0,-4.84 4.78,-8.76 10.67,-8.76 5.9,0 10.68,3.92 10.68,8.76l0 59.2c0,4.84 -4.78,8.76 -10.68,8.76 -5.89,0 -10.67,-3.92 -10.67,-8.76l0 -59.2zm177.64 218.67c20.8,0 37.68,16.88 37.68,37.69 0,20.8 -16.88,37.68 -37.68,37.68 -20.8,0 -37.68,-16.88 -37.68,-37.68 0,-20.81 16.88,-37.69 37.68,-37.69zm-165.25 0c20.8,0 37.68,16.88 37.68,37.69 0,20.8 -16.88,37.68 -37.68,37.68 -20.8,0 -37.68,-16.88 -37.68,-37.68 0,-20.81 16.88,-37.69 37.68,-37.69z"/>
  <path fill="#00A912" fill-rule="nonzero" d="M405.31 0c29.46,0 56.13,11.95 75.44,31.25 19.31,19.31 31.25,45.98 31.25,75.44 0,29.45 -11.94,56.13 -31.25,75.43 -19.31,19.31 -45.98,31.26 -75.44,31.26 -29.45,0 -56.13,-11.95 -75.44,-31.26 -19.3,-19.3 -31.25,-45.98 -31.25,-75.43 0,-29.46 11.95,-56.13 31.25,-75.44 19.31,-19.3 45.99,-31.25 75.44,-31.25z"/>
  <path fill="white" d="M372.38 86.95l19.89 18.79 43.22 -43.86c3.9,-3.95 6.34,-7.13 11.14,-2.18l15.59 15.97c5.12,5.06 4.86,8.03 0.03,12.74l-61.08 60.03c-10.18,9.98 -8.41,10.59 -18.73,0.35l-36.3 -36.1c-2.15,-2.32 -1.92,-4.68 0.44,-7l18.09 -18.77c2.74,-2.88 4.92,-2.63 7.71,0.03z"/>
 </g>
</svg>
`;
                  }
                } else {
                  document
                    .querySelector(".addtocart")
                    .classList.remove("disabled");
                  document.querySelector(
                    ".addtocart"
                  ).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="35px"
                  viewBox="0 -960 960 960"
                  width="35px"
                  fill="white">
                  <path d="M456.67-608.67v-122H334v-66.66h122.67v-122h66.66v122h122v66.66h-122v122h-66.66ZM286.53-80q-30.86 0-52.7-21.97Q212-123.95 212-154.81q0-30.86 21.98-52.69 21.97-21.83 52.83-21.83t52.69 21.97q21.83 21.98 21.83 52.84 0 30.85-21.97 52.69Q317.38-80 286.53-80Zm402.66 0q-30.86 0-52.69-21.97-21.83-21.98-21.83-52.84 0-30.86 21.97-52.69 21.98-21.83 52.84-21.83 30.85 0 52.69 21.97Q764-185.38 764-154.52q0 30.85-21.97 52.69Q720.05-80 689.19-80ZM54.67-813.33V-880h121l170 362.67H630.8l158.87-280h75L698-489.33q-11 19.33-28.87 30.66-17.88 11.34-39.13 11.34H328.67l-52 96H764v66.66H282.67q-40.11 0-61.06-33-20.94-33-2.28-67L280-496 133.33-813.33H54.67Z"/>
              </svg>`;
                }
              })
              .catch((err) => {
                console.error("Fetch error:", err);
              });
          });
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    });

  //for making the rating stars active
  const stars = document.querySelectorAll(".star");
  stars.forEach((star) => {
    star.addEventListener("click", (e) => {
      let rating = star.getAttribute("data-value");
      console.log(rating);
      for (let i = 0; i < stars.length; i++) {
        if (i + 1 <= star.getAttribute("data-value")) {
          stars[i].classList.add("active");
        } else {
          stars[i].classList.remove("active");
        }
      }
    });
  });

  // for submitting the reviews and ratings
  document.querySelector(".submit").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(".deletecomment").style.display = "block";
    const formdata = new FormData();
    const comment = document.querySelector(".commentarea").value;
    let rating;

    // Assuming 'stars' is an array or NodeList containing rating stars
    stars.forEach((star) => {
      if (star.classList.contains("active")) {
        rating = star.getAttribute("data-value");
      }
    });
    formdata.append(
      "username",
      document.querySelector(".sidebarprofile").getAttribute("username")
    );
    // Add data to FormData
    formdata.append(
      "bookid",
      document.querySelector(".bookcontainerforview").getAttribute("bookid")
    );
    formdata.append("rating", rating);
    formdata.append("comment", comment);
    formdata.append("userid", localStorage.getItem("id"));
    console.log(rating, comment, localStorage.getItem("id"));
    // Logging FormData entries to verify content
    for (const entry of formdata.entries()) {
      console.log(entry);
    }

    fetch("/postcommentsandrating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookid: formdata.get("bookid"),
        rating: formdata.get("rating"),
        comment: formdata.get("comment"),
        userid: formdata.get("userid"),
        username: formdata.get("username"),
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        showComments();
        alert(data.message);
        fetch("/checkbatchlikes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "review",
            postedid: localStorage.getItem("id"),
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
      .catch((err) => alert(err.message));
  });

  // for deleting the books
  document.querySelector(".deletecomment").addEventListener("click", (e) => {
    const permissions = confirm("Are you sure you want to delete");
    if (permissions) {
      console.log("fine");
      e.target.style.display = "none";
      const commentId = document
        .querySelector(".commentarea")
        .getAttribute("commentid");
      fetch("/deletecomments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentid: commentId,
          userid: localStorage.getItem("id"),
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Comment deleted successfully:", data);
          showComments();
          document.querySelector(".commentarea").value = "";
          document.querySelectorAll(".star").forEach((star) => {
            star.classList.remove("active");
          });
          e.target.style.display = "none";
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    }
  });
  // now creating a function to show the comments in the comments show and show the comments that the user already put
  function showComments() {
    const bookid = document
      .querySelector(".bookcontainerforview")
      .getAttribute("bookid");
    console.log(bookid);

    fetch(`/getcommentsandrating/${bookid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        document.querySelector(".comments-show").innerHTML = "";
        data.forEach((comment) => {
          const commentdiv = document.createElement("div");
          commentdiv.classList.add("commentsdiv");
          commentdiv.setAttribute("commentid", comment.CommentID);
          const usernameandcomment = document.createElement("div");
          usernameandcomment.classList.add("usernameandcomment");
          const username = document.createElement("div");
          username.classList.add("username");
          username.setAttribute("userid", comment.UserID);
          username.innerHTML = `<img src="${comment.profilepath}" class='commentprofile' ' /><span class='commentusername'>${comment.username}</span>`;
          usernameandcomment.appendChild(username);
          const commenttext = document.createElement("p");
          commenttext.textContent = comment.Comments;
          commenttext.classList.add("comment");
          usernameandcomment.appendChild(commenttext);
          const rating = document.createElement("div");
          const ratinglikes = document.createElement("div");
          ratinglikes.classList.add("ratinglikes");
          rating.innerHTML = `<span>${comment.Ratings} &#9733</span>`;
          rating.classList.add("rating");
          ratinglikes.appendChild(rating);
          const likes = document.createElement("span");
          likes.classList.add("likes");
          likes.setAttribute("likecount", comment.Likes);
          likes.setAttribute("dislikecount", comment.Dislikes);
          likes.setAttribute("commentid", comment.CommentID);
          ratinglikes.appendChild(likes);
          likes.innerHTML = `<div>${comment.Likes} <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"/></svg></div>`;
          const dislikes = document.createElement("span");
          dislikes.classList.add("dislikes");
          dislikes.setAttribute("dislikecount", comment.Dislikes);
          dislikes.setAttribute("likecount", comment.Likes);
          dislikes.setAttribute("commentid", comment.CommentID);
          ratinglikes.appendChild(dislikes);
          dislikes.innerHTML = `<div>${comment.Dislikes} <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#FFFFFF"><path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"/></svg></div>`;
          const timeDiv = document.createElement("div");
          timeDiv.classList.add("time");
          ratinglikes.appendChild(timeDiv);
          timeDiv.textContent = timeAgo(comment.updated_at);
          commentdiv.appendChild(usernameandcomment);
          commentdiv.appendChild(ratinglikes);
          document.querySelector(".comments-show").appendChild(commentdiv);
          if (comment.UserID == localStorage.getItem("id")) {
            const stars = document.querySelectorAll(".star");
            const ratingcount = comment.Ratings;
            console.log(ratingcount);
            for (let i = 0; i < stars.length; i++) {
              if (i + 1 <= ratingcount) {
                stars[i].classList.add("active");
              } else {
                stars[i].classList.remove("active");
              }
            }
            if (comment.Comments) {
              document.querySelector(".deletecomment").style.display = "block";
              document.querySelector(".svg").style.display = "block";
              document.querySelector(".deletecomment").style.color = "white";
            } else if (!comment.Comments) {
              document.querySelector(".deletecomment").style.display = "none";
            }
            document.querySelector(".commentarea").value = comment.Comments;
            document
              .querySelector(".commentarea")
              .setAttribute("commentid", comment.CommentID);
          }
        });
        const like = document.querySelectorAll(".likes");
        like.forEach((element) => {
          element.addEventListener("click", (e) => {
            const commentid = e.currentTarget.getAttribute("commentid");
            const likecount = parseInt(
              e.currentTarget.getAttribute("likecount")
            );
            const dislikecount = parseInt(
              e.currentTarget.getAttribute("dislikecount")
            );
            console.log(commentid, likecount, dislikecount);
            fetch(`/likeanddislikecomment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                commentid: commentid,
                userid: localStorage.getItem("id"),
                likecount: likecount,
                dislikecount: dislikecount,
                boolean: true,
              }),
            })
              .then((response) => {
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error("Network response was not ok");
                }
              })
              .then((data) => {
                alert(data.message);
                showComments();
              })
              .catch((error) => {
                alert(error.message);
              });
          });
        });

        const dislike = document.querySelectorAll(".dislikes");
        dislike.forEach((element) => {
          element.addEventListener("click", (e) => {
            const commentid = e.currentTarget.getAttribute("commentid");
            const likecount = parseInt(
              e.currentTarget.getAttribute("likecount")
            );
            const dislikecount = parseInt(
              e.currentTarget.getAttribute("dislikecount")
            );
            fetch(`/likeanddislikecomment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                commentid: commentid,
                userid: localStorage.getItem("id"),
                likecount: likecount,
                dislikecount: dislikecount,
                boolean: false,
              }),
            })
              .then((response) => {
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error("Network response was not ok");
                }
              })
              .then((data) => {
                alert(data.message);
                showComments();
              })
              .catch((error) => {
                alert(error.message);
              });
          });
        });
      })
      .catch((err) => {
        console.error("Error fetching comments:", err);
      });
  }

  // to make the book showing page to close if cross is clicked
  document.querySelector(".close").addEventListener("click", (e) => {
    document.querySelector(".popoutbook").style.display = "none";
  });
  //GIVING CLOSE FUNCTION FOR PROFILE
  document.querySelector(".closeprofile").addEventListener("click", () => {
    document.querySelector(".finalprofile-container").style.display = "none";
  });
  //giving the leaderboard icon functionality
  document.querySelector(".leadersvg").addEventListener("click", (e) => {
    document.querySelector(".leaderboard").style.width =
      document.querySelector(".leaderboard").style.width == "0px"
        ? "70%"
        : "0px";
  });
  //for adding the book to cart
  document.querySelector(".addtocart").addEventListener("click", (e) => {
    const addtocart = document.querySelector(".addtocart");
    const iscarted = addtocart.getAttribute("carted") === "true";
    const bookid = document
      .querySelector(".bookcontainerforview")
      .getAttribute("bookid");
    if (!iscarted) {
      fetch(`/addtocart/${bookid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: localStorage.getItem("id"),
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Network response was not ok " + response.statusText
            );
          }
          return response.json();
        })
        .then((data) => {
          listings();
          addtocart.innerHTML = "";
          addtocart.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-cart-fill" viewBox="0 0 16 16">
  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
</svg>`;
          addtocart.setAttribute("carted", "true");
        })
        .catch((error) => {
          alert(
            "There was a problem with your fetch operation: " + error.message
          );
        });
    } else {
      fetch(`/removefromcart/${bookid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: localStorage.getItem("id"),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          listings();
          addtocart.innerHTML = "";
          addtocart.innerHTML = `<svg
          xmlns="http://www.w3.org/2000/svg"
          height="25px"
          viewBox="0 -960 960 960"
          width="25px"
          fill="#e8eaed"
        >
          <path
            d="M456.67-608.67v-122H334v-66.66h122.67v-122h66.66v122h122v66.66h-122v122h-66.66ZM286.53-80q-30.86 0-52.7-21.97Q212-123.95 212-154.81q0-30.86 21.98-52.69 21.97-21.83 52.83-21.83t52.69 21.97q21.83 21.98 21.83 52.84 0 30.85-21.97 52.69Q317.38-80 286.53-80Zm402.66 0q-30.86 0-52.69-21.97-21.83-21.98-21.83-52.84 0-30.86 21.97-52.69 21.98-21.83 52.84-21.83 30.85 0 52.69 21.97Q764-185.38 764-154.52q0 30.85-21.97 52.69Q720.05-80 689.19-80ZM54.67-813.33V-880h121l170 362.67H630.8l158.87-280h75L698-489.33q-11 19.33-28.87 30.66-17.88 11.34-39.13 11.34H328.67l-52 96H764v66.66H282.67q-40.11 0-61.06-33-20.94-33-2.28-67L280-496 133.33-813.33H54.67Z"
          />
        </svg>`;
          addtocart.setAttribute("carted", "false");
        })
        .catch((err) => {
          console.error("Error removing from cart:", err);
        });
    }
  });
  document.querySelector(".savebook").addEventListener("click", (e) => {
    const bookid = document
      .querySelector(".bookcontainerforview")
      .getAttribute("bookid");
    const isSavedAlready =
      document.querySelector(".savebook").getAttribute("savedalready") ===
      "true"; // Convert attribute to boolean

    e.target.innerHTML = ""; // Clear inner HTML

    const url = isSavedAlready
      ? `/deletebookmarkedbook/${bookid}`
      : `/bookmarkedbook/${bookid}`;
    const method = isSavedAlready ? "DELETE" : "POST"; // Using DELETE method for deletion

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userid: localStorage.getItem("id"),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        listings();
        const newState = !isSavedAlready;
        document
          .querySelector(".savebook")
          .setAttribute("savedalready", newState);
        document.querySelector(".savebook").innerHTML = newState
          ? `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0,0,256,256">
             <g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal">
               <g transform="scale(5.12,5.12)">
                 <path d="M37,48c-0.17578,0 -0.34766,-0.04687 -0.50391,-0.13672l-11.49609,-6.70703l-11.49609,6.70703c-0.30859,0.17969 -0.69141,0.18359 -1,0.00391c-0.3125,-0.17969 -0.50391,-0.50781 -0.50391,-0.86719v-44c0,-0.55078 0.44922,-1 1,-1h24c0.55469,0 1,0.44922 1,1v44c0,0.35938 -0.19141,0.6875 -0.50391,0.86719c-0.15234,0.08984 -0.32422,0.13281 -0.49609,0.13281z"></path>
               </g>
             </g>
             </svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#FFFFFF">
             <path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Zm0-80h480v-640h-80v280l-100-60-100 60v-280H240v640Zm0 0v-640 640Zm200-360 100-60 100 60-100-60-100 60Z"/>
             </svg>`;
      })
      .catch((error) => {
        alert(
          "There was a problem with your fetch operation: " + error.message
        );
      });
  });
});
