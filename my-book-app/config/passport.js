// passport.js
const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: LocalStrategy } = require("passport-local");
const { User } = require("../models");
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email", //  login form has an input field with name 'email'
      passwordField: "password", // the login form has an input field with name 'password'
    },
    async (email, password, done) => {
      try {
        // Find user by email
        const user = await User.findOne({ where: { email } });

        // If no user found
        if (!user) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        // If credentials are correct, return the user object
        return done(null, user);
      } catch (err) {
        console.error("Error authenticating user:", err);
        return done(err);
      }
    }
  )
);
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "703557172174-o50083lsapv4gn7sjaljdlashcmgd75j.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          where: { email: profile.emails[0].value },
        });
        if (user) {
          return done(null, user);
        }

        // If user doesn't exist, create a new user
        user = await User.create({
          username: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
        });

        return done(null, {
          user,
          username: profile.displayName,
          email: profile.emails[0].value,
        });
      } catch (err) {
        console.error("Error creating or finding user:", err); // Log the error for debugging
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});
