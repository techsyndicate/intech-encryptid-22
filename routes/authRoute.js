const express = require('express')
const router = express.Router()
const {Client} = require('@notionhq/client')
const notion = new Client({auth: process.env.NOTION_TOKEN})
const bcrypt = require('bcryptjs')

const dbId = process.env.NOTION_DB_ID

router.get("/register", (req, res) => {
 res.render('register')   
})

router.post('/auth/reg', async (req,res)=> { 
    const userId = req.body.userId;
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    if (!user || !password || !cpassword) {
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
                                    content: "hello"
                                }
                            }
                        ]
                    },
                    lastName: {
                        rich_text: [
                            {
                                text: {
                                    content: "hello"
                                }
                            }
                        ]
                    }, 
                    email: {
                        rich_text: [
                            {
                                text: {
                                    content: "hello"
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

module.exports = router