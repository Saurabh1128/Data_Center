const express = require("express");
const path = require("path");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.render("index", { 
    title: "YCIS Data Center"
  });
});

app.get("/security", (req, res) => {
  res.render("security", { 
    title: "Security Features - YCIS Data Center"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", { 
    title: "Error",
    message: "Something went wrong!" 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("error", { 
    title: "404 Not Found",
    message: "Page not found" 
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});