const path = require("path")
const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const expressRecaptcha = require("express-recaptcha").RecaptchaV2;
const { body, validationResult } = require("express-validator");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 3000;

// Replace these with your actual reCAPTCHA keys
const RECAPTCHA_SITE_KEY = "6LeuE_kpAAAAAIlv6byBxRDNvO06_UNBu3soMmZr";
const RECAPTCHA_SECRET_KEY = "6LeuE_kpAAAAAHqpuxlW2e0K8lzmYvokNUK1wqCc";

const recaptcha = new expressRecaptcha(
  RECAPTCHA_SITE_KEY,
  RECAPTCHA_SECRET_KEY
);
const ipBlockList = new Set(); // Set to store blocked IP addresses


app.use(bodyParser.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "*.google.com", "*.gstatic.com"],
        "frame-src": ["'self'", "*.google.com"],
      },
    },
  })
);
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  validate: { xForwardedForHeader: false },
  handler: (req, res) => {
    ipBlockList.add(req.ip); // Add IP to block list if rate limit is exceeded
    res
      .status(429)
      .json({ message: "Too many requests, you have been blocked." });
  },
});

// Middleware to block requests from blocked IPs
const ipBlocker = (req, res, next) => {
  if (ipBlockList.has(req.ip)) {
    return res.status(403).json({ message: "Your IP has been blocked due to suspicious activity." });
  }
  next();
};


app.use("/api/",ipBlocker);
app.use("/api/submit-form", limiter);

const csrfProtection = csrf({
  cookie: true,
  secure: true,
  maxAge: 15 * 60 * 1000,
  httpOnly: true,
});

function verifyRecaptcha(req, res, next) {
  recaptcha.middleware.verify(req, (error, data) => {
    if (req.recaptcha.error) {
      return res
        .status(400)
        .json({ message: "reCAPTCHA verification failed", error });
    }
  });
  next();
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
    body("address") //This is the honeypot field
      .custom((value) => value === "")
      .withMessage("Address must be exactly an empty string"),
    body("latitude")
      .notEmpty()
      .withMessage("Latitude is required")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be a valid coordinate"),
    body("longitude")
      .notEmpty()
      .withMessage("Longitude is required")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be a valid coordinate"),
    body("startTime").notEmpty().withMessage("Start time is required"),
  ],
  (req, res) => {
    console.log("submit");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, address, latitude, longitude, startTime } = req.body;
    
    // Calculate form submission time
    const parsedStartTime = parseInt(req.body.startTime, 10);
    const endTime = Date.now();
    const duration = endTime - parsedStartTime;

    console.log("success");
    res.json({
      message: "Form submitted successfully",
      data: { email, name, address, latitude, longitude, duration },
    });
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
