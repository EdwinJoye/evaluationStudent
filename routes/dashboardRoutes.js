import express from "express";
import requireAuth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard", { user: req.user });
});

export default router;
