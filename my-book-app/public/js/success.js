// Function to parse URL query parameters
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const user = params.get("user");
  const cartbooks = params.get("cartbooks");
  return {
    user: user,
    cartbooks: cartbooks ? JSON.parse(cartbooks) : [],
  };
}

// displaly thanks
function displaythanks() {
  const thanksdiv = document.getElementById("thankyou");
  const user = JSON.parse(localStorage.getItem("user")).username;
  thanksdiv.innerHTML = `<p>Thank you, ${user} for your purchase!</p>`;
}

// On page load
document.addEventListener("DOMContentLoaded", () => {
  const { user, cartbooks } = getQueryParams();
  const arraybought = JSON.parse(localStorage.getItem("purchased"));
  const arraycart = JSON.parse(localStorage.getItem("cartlist"));

  cartbooks.forEach((book) => {
    if (!arraybought.includes(parseInt(book))) {
      arraybought.push(parseInt(book));
    }
    const bookIndex = arraycart.indexOf(book);
    arraycart.splice(bookIndex, 1);
  });
  console.log(arraybought);
  localStorage.setItem("purchased", JSON.stringify(arraybought));
  localStorage.setItem("cartlist", JSON.stringify(arraycart));
  console.log(arraycart);

  // Ensure user and cartbooks are valid
  if (user && cartbooks && cartbooks.length > 0) {
    displaythanks();
    fetch("/addanddelete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user, cartbooks }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        document.querySelector(".cartbutton").addEventListener("click", (e) => {
          window.location.href = "/cart";
        });
      })
      .catch((err) => {
        console.log("Fetch error: ", err);
      });
  } else {
    console.error("Invalid user or cartbooks data.");
  }
});
