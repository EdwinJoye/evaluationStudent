import express from "express";
import crypto from "crypto";
import User from "../models/User.js";

const router = express.Router();

// Route pour afficher le form de login
router.get("/", (req, res) => {
  // req.flash("success", "Connexion réussie !");
  res.render("login", { title: "Login" });
});

// Route pour soumettree le form de login
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const secret = process.env.HMAC_SECRET || "default_secret";
    const hashedPassword = crypto
      .createHmac("sha256", secret)
      .update(password)
      .digest("hex");

    if (hashedPassword !== user.password) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }
    // req.flash("success", "Connexion réussie !");
    res.json({ message: "Connexion réussie", user });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    // req.flash("error", "La connexion a échouée");
    res.status(500).json({ message: "Erreur du serveur" });
  }
});

export default router;
