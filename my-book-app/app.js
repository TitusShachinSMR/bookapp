
const express = require("express");
const dotenv = require("dotenv");
const flash = require("connect-flash");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const { sequelize } = require("./models");
const jwt = require("jsonwebtoken");
const path = require("path");
//for converting usd to current INR
const exchangeRateAPI = "https://api.exchangerate-api.com/v4/latest/INR";
const passport = require("passport");
const mysql = require("mysql2");
const app = express();
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const API_KEY = "AIzaSyAtgiA6UDe1EVYxIZlT_6Vv_D9n3no84qQ";
const stripe = require("stripe")(
  "sk_test_51PagBdK9Fxp0fj5rM1apcFO2W6C6WIJ3iohM7SzVB7GrxyCNNXb5tpN0lAogivmnoJsyLgklvVneGHh9G43FXNXD00fhJ3CllZ"
);

dotenv.config();
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
require("./config/passport");
app.use("/auth", authRoutes);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});
// rendering different pages
app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});
app.get("/setupLocalStorage", (req, res) => {
  res.render("setupLocalStorage");
});
app.get("/profile", (req, res) => {
  res.render("profile");
});
app.get("/success", (req, res) => {
  res.render("success");
});
app.get("/updatepassword", (req, res) => {
  res.render("updatepassword");
});
app.get("/uploadbook", (req, res) => {
  res.render("uploadbook");
});
app.get("/logout", (req, res) => {
  res.render("logout");
});
app.get("/cart", (req, res) => {
  res.render("cart");
});
app.get("/books/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  res.render("books", { isbnnumber: `${isbn}` });
});

app.get("/updateprofile", (req, res) => {
  res.render("updateprofile");
});
//rendering pages ends
//for obtaining the userid of the  user using the email so that we can store it in the localstorage
app.get("/username/:email", (req, res) => {
  const email = req.params.email;
  const query = `SELECT * FROM users WHERE email = ?;
`;

  db.query(query, [email], (error, result) => {
    if (error) {
      console.log(error);
      res.send("Internal Server Error");
    } else {
      console.log("result " + result);
      res.send(result);
    }
  });
});
//-----
//for getting the profile information of the user
app.get("/userprofile/:id", (req, res) => {
  const id = req.params.id;
  const query = `SELECT * FROM users WHERE id = ?;
`;

  db.query(query, [id], (error, result) => {
    if (error) {
      console.log(error);
      res.send("Internal Server Error");
    } else {
      console.log("result " + result);
      res.send(result);
    }
  });
});
//----------------------------------------------------------------
//this is for searching and filtering
//for searching the author name:
app.get(`/searchauthor`, (req, res) => {
  const searchTerm = req.query.q;
  const query = `SELECT DISTINCT author FROM books WHERE author LIKE ? LIMIT 5`;
  db.query(query, [`%${searchTerm}%`], (error, results) => {
    if (error) {
      return res.json({ error });
    }
    res.json(results);
  });
});
//for searching user
app.get("/searchuser", function (req, res) {
  const user = req.query.q;

  if (!user) {
    return res.send("Bad Request: Missing query parameter 'q'");
  }

  console.log("user query:", user);

  const query = `SELECT * FROM users WHERE username LIKE ? LIMIT 5`;

  db.query(query, [`%${user}%`], (error, result) => {
    if (error) {
      console.error("Database query error:", error);
      res.send("Internal Server Error");
    } else {
      console.log("Result:", result);
      res.json(result);
    }
  });
});

//for searching the genre
app.get("/searchgenre", function (req, res) {
  const genre = req.query.q;
  console.log("genre query:", genre);

  // Use parameterized query to prevent SQL injection
  const query = `SELECT   Distinct genre FROM books WHERE genre LIKE ? LIMIT 5`;

  db.query(query, [`%${genre}%`], (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    } else {
      console.log("Result:", result);
      res.json(result);
    }
  });
});
//----------------------------------------------------------------

// Configure multer for profileimage upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/profilepicture");
  },
  filename: (req, file, cb) => {
    const email = req.params.email;
    console.log(email);
    const filename = `${email}.profile.jpg`;
    console.log(filename);
    // Delete the old profile picture if it exists, but only after successful upload
    const oldProfileImagePath = path.join(
      __dirname,
      "public",
      "profilepicture",
      `${email}.profile.jpg`
    );
    if (fs.existsSync(oldProfileImagePath)) {
      fs.unlinkSync(oldProfileImagePath); // Delete the old profile picture
    }
    cb(null, filename);
  },
});
const upload = multer({ storage: storage });
//for updating the profile picture
app.post("/updateimage/:email", upload.single("profileimage"), (req, res) => {
  const email = req.params.email;

  if (!email) {
    return res.status(400).json({
      status: "fail",
      message: "Email is required",
    });
  }
  const profilePath = `../profilepicture/${email}.profile.jpg`;

  const query = "UPDATE users SET profilepath = ? WHERE email = ?";

  db.execute(query, [profilePath, email], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return;
    }
    console.log("Query executed successfully:", results);

    // Assuming the file was successfully uploaded with the correct filename
    const newProfileImagePath = path.join(
      __dirname,
      "public",
      "profilepicture",
      `${email}.profile.jpg`
    );

    // Check if the file was uploaded successfully
    if (req.file) {
      // File uploaded successfully, proceed to delete old image

      res.json({
        status: "success",
        message: "Profile picture updated successfully",
        imagePath: newProfileImagePath, // Optionally return the new image path
      });
    } else {
      // Handle case where file upload failed
      res.status(500).json({
        status: "error",
        message: "File upload failed",
      });
    }
  });
});
//----------------------------------------------------------------
//updating the profile bio
app.post("/updateprofile/:email", (req, res) => {
  const email = req.params.email;
  const { bio, username } = req.body;

  if (!bio || !username) {
    return res.status(400).json({
      status: "error",
      message: "bio and username required",
    });
  }

  const query = "UPDATE users SET bio = ? ,username = ? WHERE email = ?";
  db.execute(query, [bio, username, email], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while updating the bio",
      });
    }
    console.log("Query executed successfully:", results);
    res.json({
      status: "success",
      message: "Bio updated successfully",
    });
  });
});
//these are endpoints for changint the passwords and
// Endpoint to get the hashed password
app.get("/gethashedpassword/:email", async (req, res) => {
  const email = req.params.email;
  const query = "SELECT password FROM users WHERE email = ?";

  db.query(query, [email], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: true, message: "Password could not be found" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    res.json({ password: result[0].password });
  });
});

// for comparing the current password
app.post("/comparepasswords", async (req, res) => {
  const { oldPassword, hashedPassword } = req.body;
  const match = await bcrypt.compare(oldPassword, hashedPassword);
  res.json({ match });
});

// Endpoint to update the password
app.post("/updatepassword", async (req, res) => {
  const { email, newPassword } = req.body;
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  await db.execute("UPDATE users SET password = ? WHERE email = ?", [
    hashedNewPassword,
    email,
  ]);
  res.json({ message: "Password updated successfully" });
});
//----------------------------------------------------------------

//for storing the cover page of the book

const storagebook = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/coverimages");
  },
  filename: (req, file, cb) => {
    console.log(req);
    const bookname = req.body.title;
    const id = req.params.userid;
    if (!bookname || !id) {
      return cb(new Error("error uploading cover image"), false);
    }
    const filename = `${bookname}.${id}.jpg`;
    console.log(filename);
    cb(null, filename);
  },
});

const uploadbook = multer({ storage: storagebook });

app.post(
  "/bookupload/:userid",
  uploadbook.single("image"),
  async (req, res) => {
    const genre = req.body.genre;
    const author = req.body.author;
    const bookname = req.body.title;
    const description = req.body.description;
    const id = req.body.userid;
    console.log("say ", id);
    const coverpath = `../coverimages/${bookname}.${id}.jpg`;
    const tempCoverPath = path.join(
      __dirname,
      "public",
      "coverimages",
      `${bookname}.${id}.jpg`
    );
    console.log(genre, author, bookname, description, id, coverpath);
    if (!genre || !author || !bookname || !description || !id) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
      });
    }

    // Fetch isbn from open library api
    const isbnResponse = await axios.get(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(
        bookname
      )}&author=${encodeURIComponent(author)}&subject=${encodeURIComponent(
        genre
      )}`
    );

    const books = isbnResponse.data.docs;
    let isbn = null;
    if (books.length > 0) {
      isbn = books[0].isbn ? books[0].isbn[0] : null;
      console.log(isbn);
    }

    if (!isbn) {
      // Remove the temporarily uploaded file if ISBN is not found
      if (fs.existsSync(tempCoverPath)) {
        fs.unlinkSync(tempCoverPath, (err) => {
          if (err) {
            console.error("Error removing temporary file:", err);
          }
        });
      }
      return res.status(400).json({
        status: "error",
        message: "ISBN not found for the provided book details",
      });
    }
    //for finding the average price of the book
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
        bookname
      )}+inauthor:${encodeURIComponent(
        author
      )}&fields=items(volumeInfo(averageRating,industryIdentifiers),saleInfo(listPrice))&key=${API_KEY}`
    );
    let medianprice = null;
    const bookprice = response.data.items;
    const pricesInINR = [];

    bookprice.forEach((book) => {
      if (
        book.saleInfo &&
        book.saleInfo.listPrice &&
        book.saleInfo.listPrice.amount &&
        book.saleInfo.listPrice.currencyCode === "INR"
      ) {
        pricesInINR.push(book.saleInfo.listPrice.amount);
      }
    });
    if (pricesInINR.length > 0) {
      pricesInINR.sort((a, b) => a - b);
      let medianPrice;
      const mid = Math.floor(pricesInINR.length / 2);

      if (pricesInINR.length % 2 === 0) {
        medianPrice = (pricesInINR[mid - 1] + pricesInINR[mid]) / 2;
      } else {
        medianPrice = pricesInINR[mid];
      }
      medianprice = medianPrice;
      console.log(`Median Price in INR: ${medianprice}`);
    }
    if (medianprice == null) {
      medianprice = math.random() * 1000 + 200;
    }

    const query =
      "INSERT INTO books (genre, author, bookname, description, coverpath, userid,isbn,price) VALUES (?, ?, ?, ?, ?, ?,?,?)";
    db.execute(
      query,
      [genre, author, bookname, description, coverpath, id, isbn, medianprice],
      async (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return res.status(500).json({
            status: "error",
            message: "this book is already uploaded",
          });
        }
        res.json({
          status: "success",
          message: "Book uploaded successfully",
        });
      }
    );
    const userId = id;
    console.log(id);

    const updateUploadNumberandscoreQuery =
      "UPDATE users SET upload = upload + 1,score = score + 10 WHERE id = ?";
    db.query(updateUploadNumberandscoreQuery, [userId], (error, results) => {
      if (error) {
        console.error("Error executing query:", error);
      } else {
        console.log("Upload number updated successfully for user ID:", userId);
      }
    });
  }
);
//for searching the extra information of the book from api
app.get("/search", async (req, res) => {
  const { q } = req.query;
  const API_URL = `https://www.googleapis.com/books/v1/volumes?q=${q}&key=${API_KEY}`;
  let sum = 0;
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    const books = data.items[0];
    console.log(books);
    const volumeInfo = books.volumeInfo;
    console.log(volumeInfo.imageLinks);

    res.json({
      title: volumeInfo.title,
      authors: volumeInfo.authors
        ? volumeInfo.authors.join(", ")
        : "Unknown Author",
      publishedDate: volumeInfo.publishedDate,
      averageRating: volumeInfo.averageRating,
      description: volumeInfo.description,
      image: volumeInfo.imageLinks.thumbnail,
      pagecounters: volumeInfo.pageCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching data from Google Books API" });
  }
});
//----------------------------------------------------------------
//for getting the books which we create
app.get("/createdbooks/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM books WHERE userid = ?";

  db.query(query, [id], (error, results) => {
    if (error) {
      console.error("Database query error:", error); // Log the error for debugging purposes
      return res
        .status(500)
        .json({ status: "error", message: "error in loading book profile" });
    }
    res.json(results);
  });
});
//----------------------------------------------------------------

//for getting the details of the book which we open
app.get("/bookdetails/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  console.log(isbn);
  const query = "SELECT * FROM books WHERE isbn = ?";

  db.query(query, [isbn], (error, results) => {
    if (error) {
      console.error("Database query error:", error); // Log the error for debugging purposes
      return res
        .status(500)
        .json({ status: "error", message: "Error in loading book profile" });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Book not found" });
    }
    res.send(results[0]);
  });
});
//----------------------------------------------------------------
// FOR POSTING THE COMMENTS
app.use(bodyParser.json());
app.post("/postcommentsandrating", async (req, res) => {
  const { bookid, userid, comment, rating, username } = req.body;
  // Logging received data for debugging
  console.log("Received data:", req.body);
  console.log(username);
  // Logging received data for debugging
  console.log("Received data:", bookid, userid, comment, rating, username);

  // Basic validation
  if (!bookid || !userid || !comment || !rating || !username) {
    return res.status(500).json({ error: "All fields are required" });
  }

  const query = `
        INSERT INTO CommentsAndRatings (BookId, UserId, Comments, Ratings, username,updated_at) 
        VALUES (?, ?, ?, ?, ? ,CURRENT_TIMESTAMP ) 
        ON DUPLICATE KEY UPDATE 
            Comments = VALUES(Comments), 
            Ratings = VALUES(Ratings),
            username= VALUES(username),
            updated_at = CURRENT_TIMESTAMP;
    `;

  db.execute(
    query,
    [bookid, userid, comment, rating, username],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        return res
          .status(200)
          .json({ message: "review uploaded successfully" });
      }
    }
  );
  const initialreviewcount = "select reviewcount from users where id=?";
  db.query(initialreviewcount, [userid], (err, result) => {
    if (err) {
      console.error("Error executing review count query:", err);
    }
    console.log(result);
    const intialreview = result[0].reviewcount;
    console.log("Initial review count:", intialreview);
    const reviewcountQuery =
      "SELECT COUNT(*) AS reviewcount FROM commentsandratings WHERE userid = ?";
    db.query(reviewcountQuery, [userid], (err, result) => {
      if (err) {
        console.error("Error executing review count query:", err);
      }

      const reviewCount = result[0].reviewcount;
      console.log("Number of reviews:", reviewCount);

      if (parseInt(intialreview) != parseInt(reviewCount)) {
        const updateQuery =
          "UPDATE users SET reviewcount = ? ,score=score+5 WHERE id = ?";
        db.query(updateQuery, [reviewCount, userid], (err, result) => {
          if (err) {
            console.error("Error updating review count:", err);
          }
          console.log("Review count updated successfully for user ID:", userid);
        });
      }
    });
  });
});
// now showing the comments and reviews
app.get("/getcommentsandrating/:bookid", (req, res) => {
  const bookid = req.params.bookid;
  console.log(bookid);
  const query =
    "SELECT c.*, u.profilepath FROM commentsandratings c INNER JOIN users u ON u.username = c.username WHERE c.BookId = ? order by c.updated_at DESC ";
  db.query(query, [bookid], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    console.log(results);
    res.json(results);
  });
});
//for deleting the comments by the user
app.post("/deletecomments", (req, res) => {
  const { commentid, userid } = req.body;

  const disableFKChecks = "SET FOREIGN_KEY_CHECKS = 0;";
  const enableFKChecks = "SET FOREIGN_KEY_CHECKS = 1;";
  const deleteLikes =
    "DELETE FROM likesverify WHERE commentid = ? AND userid = ?;";
  const deleteComments = "DELETE FROM commentsandratings WHERE CommentID = ?;";
  const updateReviewCountandscore =
    "UPDATE users SET reviewcount = reviewcount - 1 , score = score-5 WHERE id = ?;";

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }

    db.query(disableFKChecks, (err) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: "Internal server error" });
        });
      }

      db.query(deleteLikes, [commentid, userid], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: "Internal server error" });
          });
        }

        db.query(deleteComments, [commentid], (err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: "Internal server error" });
            });
          }

          db.query(updateReviewCountandscore, [userid], (err) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: "Internal server error" });
              });
            }

            db.query(enableFKChecks, (err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ error: "Internal server error" });
                });
              }

              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ error: "Internal server error" });
                  });
                }

                res.json({
                  message: "Comment and related data deleted successfully",
                });
              });
            });
          });
        });
      });
    });
  });
});

//for saving the book
app.post("/bookmarkedbook/:bookid", (req, res) => {
  const { userid } = req.body;
  const bookid = req.params.bookid;
  console.log(userid, bookid);
  const query =
    "INSERT INTO bookmarkedbooks (userid, bookid) VALUES (?,?) ON DUPLICATE KEY UPDATE userid=VALUES(userid)";
  db.query(query, [userid, bookid], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        message: "bookmark failed",
      });
    }
    console.log(results);
    res.json({
      message: "Bookmarked successfully",
    });
  });
});
app.get(`/getbookmarkedbooks/:userid`, (req, res) => {
  const id = req.params.userid;
  console.log(id);
  const query =
    "SELECT bookmarkedbooks.UserId, books.genre, books.author,books.coverpath, books.bookname,books.isbn,bookmarkedbooks.bookid FROM bookmarkedbooks INNER JOIN books ON bookmarkedbooks.bookid = books.bookid where bookmarkedbooks.userid =?";

  db.query(query, [id], (error, results) => {
    if (error) {
      console.error("Database query error:", error); // Log the error for debugging purposes
      return res
        .status(500)
        .json({ status: "error", message: "error in loading book profile" });
    }
    res.json(results);
    console.log(results);
  });
});

// FOR FILTERING THE BOOKS
app.post("/filterbooks", function (req, res) {
  const { genre, author, minprice, maxprice } = req.body;
  console.log(genre, author, minprice, maxprice);

  let query = `SELECT * FROM books WHERE 1=1`;
  let querydynamic = [];
  if (genre) {
    query += ` AND genre LIKE ?`;
    querydynamic.push(`%${genre}%`);
  }
  if (author) {
    query += ` AND author LIKE ?`;
    querydynamic.push(`%${author}%`);
  }
  if (maxprice) {
    query += ` AND price >= ? AND price <= ?`;
    querydynamic.push(minprice);
    querydynamic.push(maxprice);
  }
  console.log(querydynamic);

  function queryfunc(query, querydynamic) {
    db.query(query, querydynamic, (error, results) => {
      if (error) {
        console.error("Database query error:", error); // Log the error for debugging purposes
        return res
          .status(500)
          .json({ status: "error", message: "Error in fetching books" });
      }
      res.json(results);
    });
  }
  queryfunc(query, querydynamic);
});

// for adding to cart
app.post("/addtocart/:bookid", (req, res) => {
  const { userid } = req.body;
  const bookid = req.params.bookid;
  console.log(userid, bookid);
  const query =
    "INSERT INTO addedtocart (userid, bookid) VALUES (?,?) ON DUPLICATE KEY UPDATE userid=VALUES(userid)";
  db.query(query, [userid, bookid], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({
        message: "Failed to add to cart",
      });
    }
    console.log(results);
    res.json({
      message: "Added to cart successfully",
    });
  });
});
//for getting the carted items
app.get(`/cartedbooks/:userid`, (req, res) => {
  const id = req.params.userid;
  console.log(id);
  const query =
    "SELECT addedtocart.userid,books.price,books.coverpath, books.genre, books.author, books.bookname, books.isbn, addedtocart.bookid FROM addedtocart INNER JOIN books ON addedtocart.bookid = books.bookid where addedtocart.userid =?";

  db.query(query, [id], (error, results) => {
    if (error) {
      console.error("Database query error:", error); // Log the error for debugging purposes
      return res
        .status(500)
        .json({ status: "error", message: "error in loading book profile" });
    }
    res.json(results);
    console.log(results);
  });
});
//for getting the bought books
app.get(`/boughtbooks/:userid`, (req, res) => {
  const id = req.params.userid;
  console.log(id);
  const query =
    "SELECT boughtbooks.userid,books.price,books.coverpath, books.genre, books.author, books.bookname, books.isbn, boughtbooks.bookid FROM boughtbooks INNER JOIN books ON boughtbooks.bookid = books.bookid where boughtbooks.userid =?";

  db.query(query, [id], (error, results) => {
    if (error) {
      console.error("Database query error:", error); // Log the error for debugging purposes
      return res
        .status(500)
        .json({ status: "error", message: "error in loading book profile" });
    }
    res.json(results);
    console.log(results);
  });
});

// Fetch exchange rate from INR to USD
// Fetch exchange rate from INR to USD
async function getExchangeRate() {
  try {
    const response = await axios.get(exchangeRateAPI);
    return response.data.rates.USD;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    throw new Error("Failed to fetch exchange rate");
  }
}

// Create a checkout session
app.post("/create-checkout-session", async (req, res) => {
  const { amountInINR, user, cartbooks } = req.body; // Amount in INR
  const successUrl = `http://localhost:5000/success?user=${encodeURIComponent(
    user
  )}&cartbooks=${encodeURIComponent(JSON.stringify(cartbooks))}`;

  try {
    // Get the current exchange rate
    const exchangeRate = await getExchangeRate();

    // Convert INR to USD
    const amountInUSD = (amountInINR * exchangeRate).toFixed(2) * 100; // Stripe expects amount in cents

    // Create a new Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "books",
            },
            unit_amount: amountInUSD,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: "http://localhost:5000/cart",
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/addanddelete", function (req, res) {
  const { user, cartbooks } = req.body;
  cartbooks.forEach((element) => {
    const query1 = "insert into  boughtbooks (userid, bookid) values (?,?)";
    db.query(query1, [user, element], (err, result) => {
      if (err) {
        console.log(err);
      }
    });
    const query2 = "delete from  addedtocart where bookid =? and userid =? ";
    db.query(query2, [element, user], (err, result) => {
      if (err) {
        console.log(err);
      }
    });
    res.json({ success: true });
  });
});
//liking or disliking the review
app.post("/likeanddislikecomment", (req, res) => {
  const { commentid, userid, boolean, likecount, dislikecount } = req.body;
  console.log(commentid, userid, boolean);
  let posteduser;
  const query4 = "select UserID from   commentsandratings where CommentID = ? ";
  db.query(query4, [commentid], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log("User id fetched successfully");
      console.log(result);
      posteduser = result[0].UserID;
    }
  });
  console.log("this is comment of user", posteduser);
  const query1 = "SELECT * FROM likesverify WHERE userid = ? AND commentid = ?";

  db.query(query1, [userid, commentid], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length > 0) {
      if (boolean === true) {
        console.log(results);
        if (results[0].likes == 1) {
          console.log("Already liked");
          return res.json({ message: "Already liked" });
        } else {
          const query2 =
            "UPDATE commentsandratings SET Likes = ?, Dislikes = ? WHERE CommentID = ?";
          db.query(
            query2,
            [likecount + 1, dislikecount - 1, commentid],
            (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
              } else {
                console.log(result);
              }
            }
          );

          const query3 =
            "UPDATE likesverify SET likes = true WHERE userid = ? AND commentid = ?";
          db.query(query3, [userid, commentid], (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: "Internal server error" });
            } else {
              console.log(result);
              return res.json({
                message: "Liked successfully",
                updated: true,
                likes: likecount + 1,
                dislikes: dislikecount - 1,
                postedid: posteduser,
              });
            }
          });
          const query5 =
            "update users set score = score + 2 ,totallikes=totallikes +1 where id = ?";
          db.query(query5, [posteduser], (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log("score updated successfully");
            }
          });
        }
      } else if (boolean === false) {
        if (results[0].likes == 0) {
          console.log("Already disliked");
          return res.json({ message: "Already disliked" });
        } else {
          const query2 =
            "UPDATE commentsandratings SET Likes = ?, Dislikes = ? WHERE CommentID = ?";
          db.query(
            query2,
            [likecount - 1, dislikecount + 1, commentid],
            (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal server error" });
              } else {
                console.log(result);
              }
            }
          );

          const query3 =
            "UPDATE likesverify SET likes = false WHERE userid = ? AND commentid = ?";
          db.query(query3, [userid, commentid], (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: "Internal server error" });
            } else {
              console.log(result);
              return res.json({
                message: "Disliked successfully",
                updated: true,
                likes: likecount - 1,
                dislikes: dislikecount + 1,
                postedid: posteduser,
              });
            }
          });
          const query4 =
            "update users set score = score - 2 , totallikes=totallikes -1 where id = ?";
          db.query(query4, [posteduser], (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log("score updated successfully");
            }
          });
        }
      }
    } else {
      const query2 =
        "INSERT INTO likesverify (userid, commentid, likes) VALUES (?, ?, ?)";
      db.query(query2, [userid, commentid, boolean], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        } else {
          const query3 =
            "UPDATE commentsandratings SET Likes = ?, Dislikes = ? WHERE CommentID = ?";
          if (boolean === true) {
            db.query(
              query3,
              [likecount + 1, dislikecount, commentid],
              (err, result) => {
                if (err) {
                  console.log(err);
                  return res
                    .status(500)
                    .json({ error: "Internal server error" });
                } else {
                  console.log(result);
                  return res.json({
                    message: "Liked successfully",
                    updated: true,
                    likes: likecount + 1,
                    dislikes: dislikecount,
                    postedid: posteduser,
                  });
                }
              }
            );
            const query4 =
              "update users set score = score + 2 , totallikes=totallikes +1  where id = ?";
            db.query(query4, [posteduser], (err, result) => {
              if (err) {
                console.log(err);
              } else {
                console.log("score updated successfully");
              }
            });
          } else {
            db.query(
              query3,
              [likecount, dislikecount + 1, commentid],
              (err, result) => {
                if (err) {
                  console.log(err);
                  return res
                    .status(500)
                    .json({ error: "Internal server error" });
                } else {
                  console.log(result);
                  return res.json({
                    message: "Disliked successfully",
                    updated: true,
                    likes: likecount,
                    dislikes: dislikecount + 1,
                    postedid: posteduser,
                  });
                }
              }
            );
            const query4 =
              "update users set score = score - 2 , totallikes=totallikes +1 where id = ?";
            db.query(query4, [posteduser], (err, result) => {
              if (err) {
                console.log(err);
              } else {
                console.log("score updated successfully");
              }
            });
          }
        }
      });
    }
  });
});
//for following the users
app.post("/follow", function (req, res) {
  const { followerid, followingid } = req.body;
  const query = `
    INSERT INTO followers (followerid, followingid)
    VALUES (?, ?)
  `;

  db.query(query, [followerid, followingid], (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }

    const updateFollowersCount = `
        UPDATE users SET followerscount = followerscount + 1 WHERE id = ?
      `;
    const updateFollowingCount = `
        UPDATE users SET followingcount = followingcount + 1 WHERE id = ?
      `;

    db.query(updateFollowersCount, [followingid], (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
      }

      db.query(updateFollowingCount, [followerid], (error, result) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ error: "Internal server error" });
        }

        res.json({ message: "Followed successfully" });
      });
    });
  });
});

//for checking if the user is already follows the other user
app.post("/iffollowing", (req, res) => {
  const { followerid, followingid } = req.body;
  console.log("following id", followingid);
  const query = `
    SELECT * FROM followers WHERE followerid = ? AND followingid = ?
  `;
  db.query(query, [followerid, followingid], (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (result.length > 0) {
      res.json({ condition: "unfollow" });
    } else {
      res.json({ condition: "follow" });
    }
  });
});

//for unfollowing the user
app.post("/unfollow", function (req, res) {
  const { followerid, followingid } = req.body;

  const deleteQuery = `
    DELETE FROM followers WHERE followerid = ? AND followingid = ?
  `;

  db.query(deleteQuery, [followerid, followingid], (error, result) => {
    if (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }
    if (result.affectedRows > 0) {
      const updateFollowersCount = `
      UPDATE users SET followerscount = followerscount - 1 WHERE id = ?
    `;
      const updateFollowingCount = `
      UPDATE users SET followingcount = followingcount - 1 WHERE id = ?
    `;

      db.query(updateFollowersCount, [followingid], (error, result) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            status: "error",
            message: "Internal server error while updating followers count",
          });
        }

        db.query(updateFollowingCount, [followerid], (error, result) => {
          if (error) {
            console.log(error);
            return res.status(500).json({
              status: "error",
              message: "Internal server error while updating following count",
            });
          }

          return res.json({
            status: "success",
            message: "Unfollowed successfully",
          });
        });
      });
    }
  });
});
//for leaderboard
app.get("/leaderboard", (req, res) => {
  const query =
    "SELECT id, username, score,email FROM users ORDER BY score DESC LIMIT 10";
  db.query(query, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(result);
  });
});
//for showing user feed
app.get("/userfeed/:userid", (req, res) => {
  const id = req.params.userid;
  console.log("id", id);
  const followerid = [];
  const query1 = `select followerid from  followers where followingid=?`;
  db.query(query1, [id], (error, result) => {
    if (error) {
      console.log(error);
    }
    console.log(result);
    if (result.length === 0) {
      return res.json([]);
    }
    result.forEach((row) => followerid.push(row.followerid));
    let c = "(";
    followerid.forEach((a) => {
      c = c + `${a},`;
    });
    c = c.slice(0, -1);
    c = c + ")";
    console.log(c);
    const query2 = `SELECT c.* ,b.* FROM commentsandratings c INNER JOIN books b ON c.BookID = b.bookid  where c.UserID in ${c} ORDER BY c.updated_at DESC `;
    db.query(query2, [id], (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.json(result);
    });
  });
});
//for checking the badge systems
app.post("/checkbatchlikes", (req, res) => {
  const { postedid, type } = req.body;
  console.log("checking");
  console.log(postedid);
  console.log(type);
  let query0;

  if (type == "likes") {
    query0 = "SELECT totallikes FROM users WHERE id = ?";
  }
  if (type == "uploads") {
    query0 = "SELECT upload FROM users WHERE id = ?";
  }
  if (type == "review") {
    query0 = "SELECT reviewcount FROM users WHERE id = ?";
  }
  db.query(query0, [postedid], (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
    let requirement = result[0].totallikes;
    if (type == "likes") {
      requirement = result[0].totallikes;
    }
    if (type == "review") {
      requirement = result[0].reviewcount;
    }

    const query = `SELECT batchid FROM badgesinfo WHERE category = ? AND requirement <= ?`;

    db.query(query, [type, requirement], async (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
      }

      try {
        if (results.length > 0) {
          for (let i = 0; i < results.length; i++) {
            const batchid = results[i].batchid;
            const existingBadgeQuery = `SELECT * FROM badgesforusers WHERE userid = ? AND batchid = ?`;

            // Check if user already has this badge
            const existingBadge = await new Promise((resolve, reject) => {
              db.query(existingBadgeQuery, [postedid, batchid], (err, res) => {
                if (err) reject(err);
                else resolve(res);
              });
            });

            if (existingBadge.length === 0) {
              // User does not have this badge, insert it
              const insertBadgeQuery = `INSERT INTO badgesforusers (userid, batchid) VALUES (?, ?)`;
              await new Promise((resolve, reject) => {
                db.query(insertBadgeQuery, [postedid, batchid], (err, res) => {
                  if (err) reject(err);
                  else resolve(res);
                });
              });

              // Retrieve badge criteria for response message
              const badgeCriteriaQuery = `SELECT batchcriteria,batchname FROM badgesinfo info WHERE batchid = ?`;
              const badgeCriteriaResult = await new Promise(
                (resolve, reject) => {
                  db.query(badgeCriteriaQuery, [batchid], (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                  });
                }
              );

              if (badgeCriteriaResult.length > 0) {
                const batchcriteria = badgeCriteriaResult[0].batchcriteria;
                const batchname = badgeCriteriaResult[0].batchname;
                const message = `${batchcriteria} , you won ${batchname}!`;
                console.log("message", message);
                return res.json({ successMessage: message });
              }
            }
          }
        }

        // If no new badges were earned
        return;
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error processing badge check" });
      }
    });
  });
});
//for getting the batges that users got in their profile
app.get("/showbatch/:userid", (req, res) => {
  const id = req.params.userid;
  const query = `SELECT b.batchname, b.batchcriteria, bf.batchid FROM badgesforusers bf INNER JOIN badgesinfo b ON bf.batchid = b.batchid WHERE bf.userid = ?`;
  db.query(query, [id], (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(result);
  });
});
//for deleting the uploaded book
app.post("/deletebook", function (req, res) {
  const { bookid, userid, bookname } = req.body;

  db.query("SET FOREIGN_KEY_CHECKS = 0", (error, results, fields) => {
    if (error) {
      return res.status(404).send({ status: "error", message: error });
    }

    db.query(
      "DELETE FROM books WHERE bookid = ? AND userid = ?",
      [bookid, userid],
      (error, results, fields) => {
        if (error) {
          return res.status(404).send({ status: "error", message: error });
        }

        db.query(
          "DELETE l.* FROM commentsandratings b INNER JOIN likesverify l ON b.CommentID = l.commentid WHERE b.BookId = ? ",
          [bookid],
          (error, results, fields) => {
            if (error) {
              return res.status(404).send({ status: "error", message: error });
            }

            db.query(
              "DELETE FROM commentsandratings WHERE bookid = ?",
              [bookid],
              (error, results, fields) => {
                if (error) {
                  return res
                    .status(404)
                    .send({ status: "error", message: error });
                }

                db.query(
                  "SET FOREIGN_KEY_CHECKS = 1",
                  (error, results, fields) => {
                    if (error) {
                      return res
                        .status(404)
                        .send({ status: "error", message: error });
                    }

                    const coverimage = path.join(
                      __dirname,
                      "public",
                      "coverimages",
                      `${bookname}.${userid}.jpg`
                    );
                    if (fs.existsSync(coverimage)) {
                      fs.unlinkSync(coverimage); // Delete the old profile picture
                    }
                    db.query(
                      "UPDATE users SET upload = upload - 1 , score=score-10 WHERE id = ?",
                      [userid],
                      (err, result) => {
                        if (err) {
                          console.log(err);
                          res.send({
                            status: "error",
                            message:
                              "An error occurred while updating the user",
                          });
                        } else {
                          console.log("Update completed");
                          res.send({
                            status: "success",
                            message: "book deleted successfully",
                          });
                        }
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});
//for deleting the cart items
app.post("/removefromcart/:bookid", function (req, res) {
  const bookid = req.params.bookid;
  const userid = req.body.userid;
  const query = "delete from  addedtocart where bookid =? and userid =?";
  db.query(query, [bookid, userid], (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(result);
  });
});
//for getting cartedbook list
app.get("/cartedbooklist/:userid", function (req, res) {
  const userid = req.params.userid;
  const query = "SELECT bookid FROM addedtocart WHERE userid = ?";

  db.query(query, [userid], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }

    const bookIds = results.map((row) => row.bookid);
    res.json(bookIds);
  });
});
app.get("/checkedbook/:userid", function (req, res) {
  const userid = req.params.userid;
  const query = "SELECT bookid FROM boughtbooks WHERE userid = ?";

  db.query(query, [userid], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }

    const bookIds = results.map((row) => row.bookid);
    res.json(bookIds);
  });
});
app.get("/savedbooklist/:userid", function (req, res) {
  const userid = req.params.userid;
  const query = "SELECT bookid FROM bookmarkedbooks WHERE userid = ?";

  db.query(query, [userid], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }

    const bookIds = results.map((row) => row.bookid);
    res.json(bookIds);
  });
});
//delete bookmarkedbooks
app.delete("/deletebookmarkedbook/:bookid", async (req, res) => {
  const bookid = req.params.bookid;
  const { userid } = req.body;

  if (!userid) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const query = `DELETE FROM bookmarkedbooks WHERE bookid=? AND userid=?`;

  try {
    db.query(query, [bookid, userid], (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Error deleting bookmarked book" });
      }
      res.json({ message: "Bookmarked book deleted successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
});
