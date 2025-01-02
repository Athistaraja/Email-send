require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON requests

// Email Sending Route
app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use Gmail as the email provider
      auth: {
        user: process.env.EMAIL, // Your email from .env
        pass: process.env.PASSWORD, // App password from .env
      },
    });

    // Email content
    const mailOptions = {
      from: `Portfolio Contact Form <${process.env.EMAIL}>`, // Use your verified email
      replyTo: email, // Client's email address (dynamic)
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
    res.status(500).json({ message: "Failed to sending message." });
  }
});

app.get("/", (req,res) => {
  res.send('Welcome to the Email API');
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
