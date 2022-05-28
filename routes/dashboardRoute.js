const express = require('express');
const { checkUser } = require('../services/authServices');
const router = express.Router();

router.get('/dashboard',checkUser, (req,res)=> {
    console.log('dashboard route')
    res.render('dashboard');
})


module.exports = router;