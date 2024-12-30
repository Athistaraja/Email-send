require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Visitor Schema
const visitorSchema = new mongoose.Schema({
  date: { type: Date, default: new Date() }
});

const Visitor = mongoose.model("Visitor", visitorSchema);

// Email Sending Route
app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: `Portfolio Contact Form <${process.env.EMAIL}>`,
      replyTo: email,
      to: process.env.RECIPIENT_EMAIL,
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

// Log visitor route
app.post("/log-visitor", async (req, res) => {
  try {
    await Visitor.create({}); // Log a new visitor
    res.status(201).json({ message: "Visitor logged successfully!" });
  } catch (err) {
    console.error("Error logging visitor:", err.message);
    res.status(500).json({ message: "Failed to log visitor." });
  }
});

// Get daily visitor count
app.get("/daily-visitor-count", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const count = await Visitor.countDocuments({ date: { $gte: today } });
    res.json({ dailyCount: count });
  } catch (err) {
    console.error("Error fetching daily visitor count:", err.message);
    res.status(500).json({ message: "Failed to fetch daily visitor count." });
  }
});

// Get monthly visitor count
app.get("/monthly-visitor-count", async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1); // Set to the first day of the month
    startOfMonth.setHours(0, 0, 0, 0); // Start of the month

    const count = await Visitor.countDocuments({ date: { $gte: startOfMonth } });
    res.json({ monthlyCount: count });
  } catch (err) {
    console.error("Error fetching monthly visitor count:", err.message);
    res.status(500).json({ message: "Failed to fetch monthly visitor count." });
  }
});

// Get overall visitor count
app.get("/overall-visitor-count", async (req, res) => {
  try {
    const overallCount = await Visitor.countDocuments();
    res.json({ overallCount });
  } catch (err) {
    console.error("Error fetching overall visitor count:", err.message);
    res.status(500).json({ message: "Failed to fetch overall visitor count." });
  }
});

// Home Route
app.get("/", (req, res) => {
  res.send("Welcome to the Email and Visitor API");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
