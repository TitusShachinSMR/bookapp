document.addEventListener("DOMContentLoaded", () => {
  const profile = document.querySelector(".sidebarprofile");
  profile.addEventListener("click", (e) => {
    window.location.href = "/profile";
  });
  // Initialize Stripe with your publishable key
  const stripe = Stripe(
    "pk_test_51PagBdK9Fxp0fj5rPg8HJ8R5uJ6R7Gj87Qm0Jv2e8WY8AumEnsB99tkBYJlVkFOETdDpRmEy9Uu5V6Dauqvt8AkK00Huo1AQNu"
  );
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
  // FOR GETTING THE ADDED CART ITEMS
  const id = localStorage.getItem("id");
  fetch(`/cartedbooks/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      document.querySelector(".total").setAttribute("totalprice", 0);
      console.log(data);
      if (data.length === 0) {
        document.querySelector(".total").style.display = "none";
        document.querySelector(".pay-now-btn").style.display = "none";
        const noresult = document.createElement("div");
        noresult.classList.add("noresult");
        noresult.textContent = "No books added to cart yet!";
        document.querySelector(".carted-items").appendChild(noresult);
        return;
      }

      data.forEach((element) => {
        const cartItemDiv = document.createElement("div");
        cartItemDiv.classList.add("cartitem");
        const bookcover = document.createElement("img");
        bookcover.src = `${element.coverpath}`;
        bookcover.classList.add("bookcover");
        const booktitle = document.createElement("div");
        booktitle.textContent = element.bookname;
        booktitle.classList.add("booktitle");
        const author = document.createElement("div");
        author.textContent = element.author;
        author.classList.add("author");
        const price = document.createElement("div");
        price.textContent = `${element.price} INR`;
        price.classList.add("price");
        price.setAttribute("price", element.price);
        cartItemDiv.appendChild(bookcover);
        cartItemDiv.appendChild(booktitle);
        cartItemDiv.appendChild(author);
        cartItemDiv.appendChild(price);
        let total =
          parseFloat(
            document.querySelector(".total").getAttribute("totalprice")
          ) + parseFloat(element.price);
        console.log(total);
        document.querySelector(".total").setAttribute("totalprice", total);
        document.querySelector(".total").textContent = `Sub-Total:₹${total}`;
        const cartblock = document.createElement("div");
        cartblock.classList.add("cartblock");
        cartblock.appendChild(cartItemDiv);
        const addtocartbutton = document.createElement("div");
        cartblock.appendChild(addtocartbutton);
        document.querySelector(".carted-items").appendChild(cartblock);
        const removecart = document.createElement("div");
        removecart.textContent = "❌Remove";
        removecart.classList.add("remove");
        cartblock.appendChild(removecart);
        removecart.setAttribute("bookid", element.bookid);
        removecart.addEventListener("click", async (e) => {
          function permission() {
            if (confirm("Are you sure you want to remove book from cart?")) {
              const bookid = e.target.getAttribute("bookid");
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
                  location.reload();
                })
                .catch((err) => {
                  console.error("Error removing from cart:", err);
                });
            }
          }
          permission();
        });
        cartItemDiv.addEventListener("click", (event) => {
          window.location.href = `/books/${element.isbn}`;
        });
      });
    })
    .catch((err) => {
      console.log(`Error: ${err.message}`);
    });

  document.querySelector(".pay-now-btn").addEventListener("click", async () => {
    console.log(document.querySelector(".total").getAttribute("totalprice"));
    const cartbooks = [];
    document.querySelectorAll(".remove").forEach((element) => {
      const bookid = element.getAttribute("bookid");
      cartbooks.push(bookid);
    });
    // Fetch checkout session ID from the server
    const response = await fetch("/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amountInINR: document
          .querySelector(".total")
          .getAttribute("totalprice"),
        cartbooks: cartbooks,
        user: localStorage.getItem("id"),
      }), // Send amount in INR
    });
    const { id: sessionId } = await response.json();

    // Redirect to Stripe Checkout page
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      console.error("Error:", error);
    }
  });

  fetch(`/boughtbooks/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      document.querySelector(".total").setAttribute("totalprice", 0);
      console.log(data);
      if (data.length === 0) {
        const noresult = document.createElement("div");
        noresult.classList.add("noresult");
        noresult.textContent = "No books purchased yet!";
        document.querySelector(".boughtbooks").appendChild(noresult);
        return;
      }

      data.forEach((element) => {
        const cartItemDiv = document.createElement("div");
        cartItemDiv.classList.add("boughtcartitem");
        const bookcover = document.createElement("img");
        bookcover.src = `${element.coverpath}`;
        bookcover.classList.add("bookcover");
        const booktitle = document.createElement("div");
        booktitle.textContent = element.bookname;
        booktitle.classList.add("booktitle");
        const author = document.createElement("div");
        author.textContent = element.author;
        author.classList.add("author");
        const price = document.createElement("div");
        price.textContent = `${element.price} INR`;
        price.classList.add("price");
        price.setAttribute("price", element.price);
        cartItemDiv.appendChild(bookcover);
        cartItemDiv.appendChild(booktitle);
        cartItemDiv.appendChild(author);
        cartItemDiv.appendChild(price);
        const cartblock = document.createElement("div");
        cartblock.classList.add("boughtcartblock");
        cartblock.appendChild(cartItemDiv);
        document.querySelector(".boughtbooks").appendChild(cartblock);
        cartItemDiv.addEventListener("click", (event) => {
          window.location.href = `/books/${element.isbn}`;
        });
      });
    })
    .catch((err) => {
      console.log(`Error: ${err.message}`);
    });
});
