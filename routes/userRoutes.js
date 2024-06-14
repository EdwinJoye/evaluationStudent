import express from "express";
import User from "../models/User.js";
import crypto from "crypto";

const router = express.Router();

// Hook pour valider le form du User
const validateUserForm = (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Les mots de passe ne correspondent pas" });
  }
  next();
};

// Hook pour vérifier que le User existe bien
const checkExistingUser = async (req, res, next) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "L'utilisateur existe déjà" });
    }
    next();
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'utilisateur existant :",
      error
    );
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

// Route pour afficher le formulaire d'enregistrement
router.get("/register", (req, res) => {
  res.render("register");
});

// Route pour enregistrer un nouveau User
router.post(
  "/register",
  validateUserForm,
  checkExistingUser,
  async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
      const secret = process.env.HMAC_SECRET || "default_secret";
      const hashedPassword = crypto
        .createHmac("sha256", secret)
        .update(password)
        .digest("hex");

      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      res.redirect("/dashboard");
    } catch (error) {
      console.error("Erreur lors de l'ajout d'utilisateur :", error);
      res.status(500).json({ message: "Erreur du serveur" });
    }
  }
);

export default router;
