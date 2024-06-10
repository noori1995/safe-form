const path = require('path')
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const axios = require("axios");

const app = express();

// Function to generate a secure token
function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

// Middleware setup
app.use(helmet()); // Security headers
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware
app.use(
  session({
    secret: "yourSecretKey", // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Secure cookie in production
      httpOnly: true,
      sameSite: "strict",
    },
  })
);

// CSRF protection middleware
const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 10 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use(limiter);

// Route to provide tokens for the form
app.get("/form", (req, res) => {
  const sessionToken = generateToken();
  req.session.token = sessionToken;

  res.json({
    sessionToken: sessionToken,
    csrfToken: req.csrfToken(),
  });
});

// Route to handle form submission
app.post("/submit", async (req, res) => {
  const { token, data, "g-recaptcha-response": recaptcha } = req.body;

  if (token !== req.session.token) {
    return res.status(403).send("Invalid session token!");
  }

  // Verify reCAPTCHA
  const secretKey = "your_secret_key";
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptcha}&remoteip=${req.connection.remoteAddress}`;

  try {
    const response = await axios.post(verificationUrl);
    const { success } = response.data;

    if (success) {
      // Process the form data
      res.send("Form submitted successfully!");
    } else {
      res.status(403).send("reCAPTCHA validation failed!");
    }
  } catch (error) {
    res.status(500).send("Error verifying reCAPTCHA!");
  }
});

app.use(
  "/",
  express.static(path.join(__dirname, "public"))
);
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
