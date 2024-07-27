// routes/authRoutes.js
const express = require("express");
const { check } = require("express-validator");
const {
  registerUser,
  loginUser,
  dashboard,
} = require("../controllers/authController");
const passport = require("passport");
const router = express.Router();
const { ensureAuthenticated } = require("../config/passport");
router.get("/login", (req, res) => {
  res.render("login"); // Render the login view
});

router.get("/register", (req, res) => {
  res.render("register"); // Render the register view
});

router.post(
  "/register",
  [
    check("username", "Username is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be 6 or more characters").isLength({
      min: 6,
    }),
  ],
  registerUser
);

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ msg: info.message });

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({
          user: { email: user.email, username: user.username },
        });
      });
    })(req, res, next);
  }
);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    failureFlash: true,
    session: false, // Disable session handling
  }),
  (req, res) => {
    // if authentication is successful, constructing the user object
    const { username, email } = req.user;
    // Redirect to a route that sets up local storage with user info
    res.redirect(`/setupLocalStorage?username=${username}&email=${email}`);
  }
);

// Route to set up local storage with user info
router.get("/setupLocalStorage", (req, res) => {
  const { username, email } = req.query;
  // Render a script that sets up local storage with user info
  res.render("setupLocalStorage", { username, email });
});

module.exports = router;
