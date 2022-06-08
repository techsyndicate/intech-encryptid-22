const express = require("express");
const path = require("path");
const ejs = require("ejs");
const PORT = process.env.PORT || 3000;

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Routes
const indexRouter = require("./routes/indexRoute");

app.use(indexRouter);

app.listen(PORT, () => {
  console.log("Server started at port " + PORT);
});
