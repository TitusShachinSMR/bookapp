import { formatDistanceToNow } from "https://cdn.jsdelivr.net/npm/date-fns@2.23.0/esm/index.js";

document.addEventListener("DOMContentLoaded", () => {
  const upload = window.location.href.split("?")[1];
  document.querySelector(".deletecomment").style.display = "none";
  const isbn = document.querySelector(".isbn").textContent;
  let rating;
  // making the profile page to appear on the screen
  const profile = document.querySelector(".sidebarprofile");
  profile.addEventListener("click", (e) => {
    window.location.href = "/profile";
  });
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
      document
        .querySelector(".sidebarprofile")
        .setAttribute("username", data[0].username);
    })
    .catch((err) => {
      console.error("Error fetching profile path:", err);
    });
  document.querySelector(".logout").addEventListener("click", () => {
    window.location.href = "/logout";
  });
  //for metadata
  function displayResults(book, metaDiv, tooltip) {
    const title = document.createElement("div");
    title.textContent = `Title:${book.title}`;
    const authors = document.createElement("div");
    authors.textContent = `Author:${book.authors}`;
    const publishedDate = document.createElement("div");
    publishedDate.textContent = `PublishedDate:${book.publishedDate}`;
    metaDiv.appendChild(title);
    metaDiv.appendChild(authors);
    metaDiv.appendChild(publishedDate);
    const img = document.createElement("img");
    img.src = `${book.image}`;
    metaDiv.appendChild(img);
    const pagecount = document.createElement("div");
    if (book.pageCount) {
      pagecount.textContent = `pagecount:${book.pageCount}`;
      metaDiv.appendChild(pagecount);
    }
    const description = document.createElement("div");
    description.textContent = `Description:${book.description}`;
    metaDiv.appendChild(description);
    tooltip.appendChild(metaDiv);
    document.querySelector(".explore").addEventListener("click", (e) => {
      const explore = document.querySelector(".explore");
      document.querySelector(".tooltip").style.width =
        document.querySelector(".tooltip").style.width == "0px" ? "50%" : "0px";
      document.querySelector(".tooltip").style.height =
        document.querySelector(".tooltip").style.height == "0px"
          ? "fit-content"
          : "0px";
      document.querySelector(".tooltip").style.zIndex =
        document.querySelector(".tooltip").style.zIndex == "-2" ? "4" : "-2";
      document.querySelector(".explore").style.backgroundColor =
        explore.style.backgroundColor == "green" ? "red" : "green";
    });
  }
  //for fetchin the bookdetails
  fetch(`/bookdetails/${isbn}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((book) => {
      console.log(book);
      document
        .querySelector(".bookcontainer")
        .setAttribute("bookid", book.bookid);
      console.log(
        document.querySelector(".bookcontainer").getAttribute("bookid")
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
      const meta = document.createElement("div");
      meta.classList.add("meta");
      const tooltip = document.createElement("div");
      tooltip.classList.add("tooltip");
      //for searching book info
      async function searchBooks(query) {
        const response = await fetch(`/search?q=${query}`);
        const data = await response.json();
        return data;
      }
      async function metadiv() {
        const metadata = await searchBooks(book.bookname);
        console.log(metadata);
        displayResults(metadata, meta, tooltip);
      }
      metadiv();
      document.querySelector("body").appendChild(tooltip);
      document.querySelector(".bookdetails").appendChild(bookcontainer);
      let deleteicon;
      if (upload == "upload=true") {
        deleteicon = document.createElement("span");
        deleteicon.classList.add("deletebook");
        deleteicon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#F3F3F3"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>`;
        document
          .querySelector(".bookdetails")
          .setAttribute("fordelete", "true");
        document.querySelector(".bookdetails").appendChild(deleteicon);
        deleteicon.addEventListener("click", () => {
          fetch(`/deletebook`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bookid: document
                .querySelector(".bookcontainer")
                .getAttribute("bookid"),
              userid: localStorage.getItem("id"),
              bookname: book.bookname,
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
              alert(data.message);
              window.location.href = "/dashboard";
            })
            .catch((err) => {
              console.error("Error during book deletion:", err);
              alert(err.message);
            });
        });
      }
      const saveButton = document.querySelector(".savebook");
      const savedList = JSON.parse(localStorage.getItem("savedlist")) || [];

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
          <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#FFFFFF">
            <path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Zm0-80h480v-640h-80v280l-100-60-100 60v-280H240v640Zm0 0v-640 640Zm200-360 100-60 100 60-100-60-100 60Z"/>
          </svg>`;
      }
      const cartbook = JSON.parse(localStorage.getItem("cartlist"));
      const purchase = JSON.parse(localStorage.getItem("purchased"));
      const addtocart = document.querySelector(".addtocart");
      addtocart.setAttribute("carted", "false");
      if (cartbook.includes(book.bookid) || purchase.includes(book.bookid)) {
        document.querySelector(".addtocart").innerHTML = "";
        if (cartbook.includes(book.bookid)) {
          addtocart.setAttribute("carted", "true");
          addtocart.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" class="bi bi-cart-fill" viewBox="0 0 16 16">
<path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
</svg>`;
        } else {
          document.querySelector(".addtocart").classList.add("disabled");
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
        document.querySelector(".addtocart").classList.remove("disabled");
        document.querySelector(
          ".addtocart"
        ).innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="25px"
        viewBox="0 -960 960 960"
        width="25px"
        fill="#e8eaed">
        <path d="M456.67-608.67v-122H334v-66.66h122.67v-122h66.66v122h122v66.66h-122v122h-66.66ZM286.53-80q-30.86 0-52.7-21.97Q212-123.95 212-154.81q0-30.86 21.98-52.69 21.97-21.83 52.83-21.83t52.69 21.97q21.83 21.98 21.83 52.84 0 30.85-21.97 52.69Q317.38-80 286.53-80Zm402.66 0q-30.86 0-52.69-21.97-21.83-21.98-21.83-52.84 0-30.86 21.97-52.69 21.98-21.83 52.84-21.83 30.85 0 52.69 21.97Q764-185.38 764-154.52q0 30.85-21.97 52.69Q720.05-80 689.19-80ZM54.67-813.33V-880h121l170 362.67H630.8l158.87-280h75L698-489.33q-11 19.33-28.87 30.66-17.88 11.34-39.13 11.34H328.67l-52 96H764v66.66H282.67q-40.11 0-61.06-33-20.94-33-2.28-67L280-496 133.33-813.33H54.67Z"/>
    </svg>`;
      }
      showComments();
    })
    .catch((err) => {
      console.error("Fetch error:", err);
    });

  //for making the rating stars active
  const stars = document.querySelectorAll(".star");
  stars.forEach((star) => {
    star.addEventListener("click", (e) => {
      rating = star.getAttribute("data-value");
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
  document.querySelector(".submit").addEventListener("click", (e) => {
    e.preventDefault();

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
      document.querySelector(".bookcontainer").getAttribute("bookid")
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
        document.querySelector(".deletecomment").style.display = "block";
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
      .catch((err) => alert(data.error));
  });
  //for showing date of the comment
  function timeAgo(date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }
  // now creating a function to show the comments in the comments show and show the comments that the user already put
  function showComments() {
    const bookid = document
      .querySelector(".bookcontainer")
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
          const commenttext = document.createElement("div");
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
          ratinglikes.appendChild(likes);
          likes.setAttribute("likecount", comment.Likes);
          likes.setAttribute("dislikecount", comment.Dislikes);
          likes.setAttribute("commentid", comment.CommentID);
          likes.innerHTML = `<div>${comment.Likes} <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960" width="15px" fill="#FFFFFF"><path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"/></svg></div>`;
          const dislikes = document.createElement("span");
          dislikes.classList.add("dislikes");
          dislikes.setAttribute("dislikecount", comment.Dislikes);
          dislikes.setAttribute("likecount", comment.Likes);
          dislikes.setAttribute("commentid", comment.CommentID);
          ratinglikes.appendChild(dislikes);
          dislikes.innerHTML = `<div>${comment.Dislikes} <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960" width="15px" fill="#FFFFFF"><path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-282q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"/></svg></div>`;
          commentdiv.appendChild(usernameandcomment);
          commentdiv.appendChild(ratinglikes);
          const timeDiv = document.createElement("div");
          timeDiv.classList.add("time");
          timeDiv.textContent = timeAgo(comment.updated_at);
          ratinglikes.appendChild(timeDiv);
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
            } else {
              document.querySelector(".deletecomment").style.display = "none";
            }
            document.querySelector(".commentarea").value = comment.Comments;
            document
              .querySelector(".commentarea")
              .setAttribute("commentid", comment.CommentID);
          }
        });
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
              document.querySelector(".finalprofile-container").style.height =
                "100%";
              console.log(data);
              const username = data[0].username;
              document.querySelector(".profile-name").textContent = username;
              document.querySelector(".mainprofile").src = data[0].profilepath;
              document.querySelector(".profile-email").textContent =
                data[0].email;
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
              document.querySelector(".uploadcount").textContent =
                data[0].upload;
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
                    document.querySelector(".follow").style.backgroundColor =
                      "grey";
                  }
                });
            });
        }
        //for able to see the profile of the users who commented on books
        document.querySelectorAll(".username").forEach((user) => {
          if (user.getAttribute("userid") != localStorage.getItem("id")) {
            user.addEventListener("click", (e) => {
              const userid = e.currentTarget.getAttribute("userid");
              console.log(userid);
              loadprofile(userid);
            });
          }
        });
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
                console.log(data.updated);
                showComments();
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
                console.log(data.likes, data.dislikes, data.updated);
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
  //for closing the profile if the close button is hit
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".finalprofile-container").style.height = "0";
    document.querySelector(".finalprofile-container").style.display = "none";
  });
  // for deleting the comments
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
          e.target.style.display = "none";
          document.querySelector(".commentarea").value = "";
          document.querySelectorAll(".star").forEach((star) => {
            star.classList.remove("active");
          });
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    }
  });
  listings();
  //for listing the added books and saved books
  function listings() {
    console.log("titus");
    const userid = localStorage.getItem("id");
    console.log(userid);
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

  document.querySelector(".savebook").addEventListener("click", (e) => {
    const bookid = document
      .querySelector(".bookcontainer")
      .getAttribute("bookid");
    const isSavedAlready =
      document.querySelector(".savebook").getAttribute("savedalready") ===
      "true"; // Convert attribute to boolean

    e.target.innerHTML = ""; // Clear inner HTML

    const url = isSavedAlready
      ? `/deletebookmarkedbook/${bookid}`
      : `/bookmarkedbook/${bookid}`;
    const method = isSavedAlready ? "DELETE" : "POST"; // Use DELETE method for deletion

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

  //for adding the book to cart
  document.querySelector(".addtocart").addEventListener("click", (e) => {
    const addtocart = document.querySelector(".addtocart");
    const iscarted = addtocart.getAttribute("carted") === "true";
    const bookid = document
      .querySelector(".bookcontainer")
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
          addtocart.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"  class="bi bi-cart-fill"  fill="#e8eaed" viewBox="0 0 16 16">
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
          listings();
          console.log(data);
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
});
