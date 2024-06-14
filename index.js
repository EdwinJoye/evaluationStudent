import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import flash from "connect-flash";
import helmet from "helmet";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Hook pour vérifier l'authentification
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/evaluation/login");
  }
};

// Hook pour mettre des  messages flash
app.use(flash());

// Route de Home
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

// Route de Login et User
app.use("/evaluation/users", userRoutes);
app.use("/evaluation/login", loginRoutes);

// Route sécurisée pour le dashboard
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { title: "Dashboard", user: req.user });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
