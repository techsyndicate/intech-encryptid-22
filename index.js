const express = require('express');
const path = require('path');
const ejs = require('ejs');
const env = require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));



// Routes
const indexRouter = require('./routes/indexRoute');
const authRouter = require('./routes/authRoute');
const dashboardRouter = require('./routes/dashboardRoute')

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', dashboardRouter);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server started at port ' + PORT);
})

