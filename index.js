const express = require('express');
const path = require('path');
const ejs = require('ejs');
const env = require('dotenv').config();
const cookieParser = require('cookie-parser');
const momngoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const link = `mongodb+srv://techsyndicate:${process.env.MONGO_PASS}@cluster0.8yhrd.mongodb.net/?retryWrites=true&w=majority`
momngoose.connect(link, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('connected to mongoDB');
}).catch(err => {
    console.log(err);
});

// Routes
const indexRouter = require('./routes/indexRoute');
const authRouter = require('./routes/authRoute');
const dashboardRouter = require('./routes/dashboardRoute')
const adminRouter = require('./routes/adminRoute')

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', dashboardRouter);
app.use(adminRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server started at port ' + PORT);
})

