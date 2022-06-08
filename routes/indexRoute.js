const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  return res.render("index");
});

router.get("/leaderboard", async (req, res) => {
  res.render("leaderboard");
});

router.get("/nc/leaderboard", async (req, res) => {
  res.render("ncleaderboard");
});

module.exports = router;
