const path = require("path")
const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const expressRecaptcha = require("express-recaptcha").RecaptchaV3;
const { body, validationResult } = require("express-validator");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 3000;

// Replace these with your actual reCAPTCHA keys
const RECAPTCHA_SITE_KEY = "6LcbjPUpAAAAAG-_vDI5QSE9O0M0aBpnrG4KYqAC";
const RECAPTCHA_SECRET_KEY = "6LcbjPUpAAAAAK1DWZpiutdnc32emQpdyjS0U4F8";

const recaptcha = new expressRecaptcha(
  RECAPTCHA_SITE_KEY,
  RECAPTCHA_SECRET_KEY
);

app.use(bodyParser.json());
app.use(helmet());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

const csrfProtection = csrf({
  cookie: true,
  secure: true,
  maxAge: 100,
  httpOnly: true
});

function verifyRecaptcha(req, res, next) {
  recaptcha.verify(req, (error, data) => {
    if (error) {
      return res
        .status(400)
        .json({ message: "reCAPTCHA verification failed", error });
    }
    next();
  });
}

app.get("/api/get-csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.post(
  "/api/submit-form",
  csrfProtection,
  verifyRecaptcha,
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("name")
      .not()
      .isEmpty()
      .trim()
      .escape()
      .withMessage("Name is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name } = req.body;
    console.log('success')
    res.json({ message: "Form submitted successfully", data: { email, name } });
  }
);

app.use(
  "/",
  express.static(path.join(__dirname, "files"))
);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
