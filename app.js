const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const csrf = require("csurf");
const axios = require("axios");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware setup
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiter to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Enable CSRF protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Route for serving the form (assuming you have an HTML form to serve)
app.get("/form", (req, res) => {
  res.send(`
    <form action="/submit" method="POST">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <input type="text" name="name" required>
      <input type="email" name="email" required>
      <textarea name="message" required></textarea>
      <div class="g-recaptcha" data-sitekey="6LcbjPUpAAAAAG-_vDI5QSE9O0M0aBpnrG4KYqAC"></div>
      <button type="submit">Submit</button>
    </form>
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
  `);
});

// Route for form submission
app.post(
  "/submit",
  [
    body("name").trim().isLength({ min: 1 }).escape(),
    body("email").isEmail().normalizeEmail(),
    body("message").trim().isLength({ min: 1 }).escape(),
    body("g-recaptcha-response").custom(async (value, { req }) => {
      const secretKey = "6LcbjPUpAAAAAK1DWZpiutdnc32emQpdyjS0U4F8";
      const response = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${value}`
      );
      if (!response.data.success) {
        throw new Error("reCAPTCHA validation failed");
      }
      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    // Handle form submission (e.g., save to database, send email, etc.)
    // For demonstration purposes, we'll just send a success response
    res
      .status(200)
      .json({
        message: "Form submitted successfully!",
        data: { name, email, message },
      });
  }
);

app.use("/", express.static(path.join(__dirname, "public")));
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  res.status(403).json({ message: "Form tampered with" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
