const express = require("express");
const path = require("path");
const { inject } = require('@vercel/analytics');
const connectDB = require('./config/database');
const Contact = require('./models/Contact');
const session = require('express-session');

// Connect to MongoDB
connectDB();

const app = express();

// Initialize Vercel Analytics
inject();

// Add session middleware BEFORE routes
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Other middleware
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

app.get("/web-hosting", (req, res) => {
  res.render("web-hosting", { 
    title: "Web Hosting - YCIS Data Center"
  });
});

app.get("/vps-hosting", (req, res) => {
  res.render("vps-hosting", { 
    title: "VPS Hosting - YCIS Data Center"
  });
});

app.get("/services", (req, res) => {
  res.render("services", { 
    title: "Our Services - YCIS Data Center"
  });
});

app.get("/security", (req, res) => {
  res.render("security", { 
    title: "Security Features - YCIS Data Center"
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", { 
    title: "Contact Us - YCIS Data Center",
    success: req.query.success === 'true'
  });
});

app.post("/submit-contact", async (req, res) => {
  try {
    console.log('Received form data:', req.body); // Log incoming data

    // Validate required fields
    if (!req.body.name || !req.body.email || !req.body.subject || !req.body.message) {
      console.log('Missing required fields');
      return res.redirect('/contact?error=missing_fields');
    }

    const newContact = new Contact({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message
    });

    console.log('Attempting to save contact:', newContact); // Log contact object

    const savedContact = await newContact.save();
    console.log('Contact saved successfully:', savedContact); // Log saved contact

    res.redirect('/contact?success=true');
  } catch (error) {
    console.error('Error saving contact:', error);
    res.redirect('/contact?error=save_failed');
  }
});

// Dashboard route
// Add these routes before the dashboard route
app.get("/login", (req, res) => {
  res.render("login", { 
    title: "Dashboard Login - YCIS Data Center",
    error: null
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  
  if (username === "Saurabh" && password === "Saurabh@2000") {
    req.session.isAuthenticated = true; // Correct way to set session
    res.redirect("/dashboard");
  } else {
    res.render("login", { 
      title: "Dashboard Login - YCIS Data Center",
      error: "Invalid username or password"
    });
  }
});

// Update the dashboard route to check for authentication
app.get("/dashboard", async (req, res) => {
  // Check if user is authenticated
  if (!req.session?.isAuthenticated) {
    return res.redirect("/login");
  }

  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.render("dashboard", { 
      title: "Admin Dashboard - YCIS Data Center",
      messages: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).render("error", { 
      title: "Error",
      message: "Failed to load dashboard" 
    });
  }
});

// Delete message route (add this after the dashboard route)
// Delete message route
app.post("/delete-message/:id", async (req, res) => {
  if (!req.session?.isAuthenticated) {
    return res.redirect("/login");
  }

  try {
    const messageId = req.params.id;
    const result = await Contact.findByIdAndDelete(messageId);
    
    if (!result) {
      console.log('Message not found:', messageId);
      return res.redirect("/dashboard");
    }

    console.log('Message deleted successfully:', messageId);
    return res.redirect("/dashboard");
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.redirect("/dashboard");
  }
});

// Checkout route
app.get("/checkout/:plan", (req, res) => {
  const plans = {
    basic: {
      name: "Basic Web Hosting",
      originalPrice: 2600,
      price: 1300,
      storage: "10 GB",
      features: ["1 Website", "Free SSL Certificate", "Unmetered Bandwidth"]
    },
    professional: {
      name: "Professional Web Hosting",
      originalPrice: 3200,
      price: 1600,
      storage: "25 GB",
      features: ["5 Websites", "Free SSL Certificate", "Unmetered Bandwidth", "Weekly Backups"]
    },
    enterprise: {
      name: "Enterprise Web Hosting",
      originalPrice: 4200,
      price: 2100,
      storage: "40 GB",
      features: ["10 Websites", "Free SSL Certificate", "Unmetered Bandwidth", "Daily Backups"]
    },
    // VPS Hosting Plans
    vps_basic: {
      name: "Basic VPS",
      originalPrice: 1998,
      price: 999,
      storage: "50 GB SSD",
      features: ["2 vCPU Cores", "2GB RAM", "2TB Bandwidth"]
    },
    vps_professional: {
      name: "Professional VPS",
      originalPrice: 3998,
      price: 1999,
      storage: "100 GB SSD",
      features: ["4 vCPU Cores", "8GB RAM", "5TB Bandwidth", "DDoS Protection"]
    },
    vps_enterprise: {
      name: "Enterprise VPS",
      originalPrice: 7998,
      price: 3999,
      storage: "200 GB SSD",
      features: ["8 vCPU Cores", "16GB RAM", "10TB Bandwidth", "DDoS Protection", "24/7 Priority Support"]
    }
  };
  
  const selectedPlan = plans[req.params.plan];
  if (!selectedPlan) {
    return res.redirect('/');
  }
  
  res.render("checkout", {
    title: "Checkout - YCIS Data Center",
    plan: selectedPlan
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