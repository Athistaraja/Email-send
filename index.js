require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON requests

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // Use Gmail as the email provider
  auth: {
    user: process.env.EMAIL, // Your email from .env
    pass: process.env.PASSWORD, // App password from .env
  },
});

// Test Email Transporter Configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter configuration error:", error.message);
  } else {
    console.log("Server is ready to send emails!");
  }
});

// Email Sending Route
app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  // Input Validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Email Content
    const mailOptions = {
      from: `Portfolio Contact Form <${process.env.EMAIL}>`, // Use your verified email
      replyTo: email, // Client's email address
      to: process.env.RECIPIENT_EMAIL, // Your email to receive messages
      subject: `New Contact Form Submission from ${name}`,
      text: `
        You received a new message from your portfolio website:

        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Email sending error:", error.message);
    res.status(500).json({ message: "Failed to send message." });
  }
});

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the Email API");
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
