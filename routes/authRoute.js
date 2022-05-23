const express = require('express')
const router = express.Router()

router.get("/register", (req, res) => {
 res.render('register')   
})

router.post('/auth/reg', (req,res)=> { 
    const userId = req.body.userId;
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    if(password !== cpassword) {
        res.send({
            "status": "error",
            "message": "Passwords do not match"
        });
    } 
    else if (password.length < 6) {
        res.send({
            "status": "error",
            "message": "Password must be at least 6 characters long"
        });
    }
    else {
        res.send({
            "status": "success",
            "message": "Registration successful"
        });
    }
})

module.exports = router