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
      from: `Portfolio Contact Form <${process.env.EMAIL}>`,
      replyTo: email,
      to: process.env.RECIPIENT_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>This Message from Portfolio</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .email-header {
              background-color: #4caf50;
              color: #ffffff;
              text-align: center;
              padding: 20px;
            }
            .email-header h1 {
              margin: 0;
              font-size: 24px;
              letter-spacing: 1px;
            }
            .email-body {
              padding: 20px;
            }
            .email-body h2 {
              color: #4caf50;
              font-size: 20px;
              margin-bottom: 15px;
            }
            .email-body p {
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 10px;
            }
            .email-footer {
              background-color: #f4f4f4;
              text-align: center;
              padding: 10px;
              font-size: 14px;
              color: #666;
            }
            .email-footer a {
              color: #4caf50;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="email-body">
              <h2>Message Details:</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4caf50; margin: 10px 0;">
                ${message}
              </p>
            </div>
            <div class="email-footer">
              <p>Thank you for reaching out. We will get back to you soon!</p>
              <p><a href="https://yourwebsite.com">Visit our website</a></p>
            </div>
          </div>
        </body>
        </html>
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
