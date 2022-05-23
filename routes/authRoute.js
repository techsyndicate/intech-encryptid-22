const express = require('express')
const router = express.Router()
const {Client} = require('@notionhq/client')
const notion = new Client({auth: process.env.NOTION_TOKEN})
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {checkUser } = require('../services/authServices')

const dbId = process.env.NOTION_DB_ID
const jwt_token = process.env.JWT_TOKEN

router.get("/register", checkUser, (req, res) => {
 res.render('register')   
})

router.post('/auth/reg',async (req,res)=> { 
    const userId = req.body.userId;
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    if (!userId || !password || !cpassword) {
        return res.send({
            status: 'error',
            message: 'Please fill all the fields'
        })
    }
    if(password !== cpassword) {
        return res.send({
            "status": "error",
            "message": "Passwords do not match"
        });
    } 
    else if (password.length < 6) {
        return res.send({
            "status": "error",
            "message": "Password must be at least 6 characters long"
        });
    } 
    else {
        // bcyrpt password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // check if user exists 
        const userCheck = await notion.databases.query({ 
            database_id: dbId,
            filter: {
                and: [ 
                    {
                        property: 'userId',
                        title: { 
                            equals: userId
                        }
                    }
                ]
            }
        })
        if(userCheck.results.length > 0) {
            return res.send({
                "status": "error",
                "message": "User already exists"
            });
        }
        // get details from main db 

        const firstName = "Hello"
        const lastName = "World"
        const email = "hello@gmail.com"
        try { 
            const user = await notion.pages.create({ 
                parent: { database_id: dbId },
                properties: {
                    title: {
                        title: [
                            {
                                text: {
                                    content: userId
                                }
                            }
                        ]    
                    },
                    firstName: {
                        rich_text: [
                            {
                                text: {
                                    content: firstName
                                }
                            }
                        ]
                    },
                    lastName: {
                        rich_text: [
                            {
                                text: {
                                    content: lastName
                                }
                            }
                        ]
                    }, 
                    email: {
                        rich_text: [
                            {
                                text: {
                                    content: email
                                }
                            }
                        ]
                    }, 
                    password: {
                        rich_text: [
                            {
                                text: {
                                    content: hashedPassword
                                }
                            }
                        ]
                    }
                }
            }); 
            // jwt auth
            const token = jwt.sign({ 
                userId: user.id,
            }, jwt_token)
            res.cookie('token', token)
            req.user= {
                userId, 
                firstName,
                lastName,
                email
            }
            return res.send({
                "status": "success",
                "message": "User created successfully"
            });
        } catch (err) {
            console.log(err)
            return res.send({
                "status": "error",
                "message": "Some error occurred"
            })
        }
    } 

})

router.get('/login', checkUser, (req,res)=> { 
    console.log('hello world')
    res.render('login')
})

router.post('/auth/login', async (req,res)=> {
    const email = req.body.email;
    const password = req.body.password;
    if (!email|| !password) {
        return res.send({
            status: 'error',
            message: 'Please fill all the fields'
        })
    }
    // check if user exists
    const userCheck = await notion.databases.query({
        database_id: dbId,
        filter: {
            and: [
                {
                    property: 'email',
                    rich_text: {
                        equals: email
                    }
                }
            ]
        }
    })
    if(userCheck.results.length === 0) {
        return res.send({
            "status": "error",
            "message": "User does not exist"
        });
    }
    // check if password is correct
    const user = userCheck.results[0]
    const hashedPassword = user.properties.password.rich_text[0].text.content
    const isPasswordCorrect = await bcrypt.compare(password, hashedPassword)
    if(!isPasswordCorrect) {
        return res.send({
            "status": "error",
            "message": "Password is incorrect"
        });
    }
    // jwt auth
    const userId = user.properties.userId.title[0].text.content
    const token = jwt.sign({
        userId
    }, jwt_token)
    res.cookie('token', token)
    req.user= {
        userId,
        firstName: user.properties.firstName.value,
        lastName: user.properties.lastName.value,
        email: user.properties.email.value
    }
    return res.send({
        "status": "success",
        "message": "User logged in successfully"
    });

})

module.exports = router