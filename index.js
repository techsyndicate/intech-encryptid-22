const express = require("express");
const path = require("path");
const ejs = require("ejs");
const env = require("dotenv").config();
const cookieParser = require("cookie-parser");
const momngoose = require("mongoose");
const { SendMessage } = require("./services/errorReporting");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Routes
const indexRouter = require("./routes/indexRoute");
const authRouter = require("./routes/authRoute");
const dashboardRouter = require("./routes/dashboardRoute");
const adminRouter = require("./routes/adminRoute");

app.use(indexRouter);
app.use(authRouter);
app.use(dashboardRouter);
app.use(adminRouter);

app.use((err, req, res, next) => {
  console.log("hi");
  SendMessage(err.stack.toString());
  SendMessage("The server has crashed");
  next(err);
});

const link = `mongodb+srv://techsyndicate:${process.env.MONGO_PASS}@cluster0.8yhrd.mongodb.net/?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 3000;
momngoose
  .connect(link, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected to mongoDB");
    SendMessage("MongoDB connected");
    app.listen(PORT, () => {
      SendMessage("Server started on port  " + PORT);
      console.log("Server started at port " + PORT);
    });
  })
  .catch((err) => {
    SendMessage(err);
    SendMessage("Error connecting to mongoDB");
  });
