const jwt = require('jsonwebtoken');    
const jwt_token = process.env.JWT_TOKEN;
const { Client} = require('@notionhq/client');
const notion = new Client({auth: process.env.NOTION_TOKEN});

module.exports = {
    checkUser: async (req, res) => {
        const token = req.cookies.jwt;

        if (!token) {
            // check if req is coming from register then redirect to register otherwise login
            if (req.originalUrl === '/register') {
                return res.render('register')
            } else if (req.originalUrl === '/login') {
                return res.render('login')
            }
            else {
                return res.redirect('/login')
            }

        }
        try {
            const decoded = jwt.verify(token, jwt_token);
            const user = await notion.databases.query({
                database_id: process.env.NOTION_DB_ID,
                filter: {
                    and: [
                        {
                            property: 'email',
                            title: {
                                equals: decoded.email
                            }
                        }
                    ]
                }
            })
            if (!user) {
                if (req.originalUrl === '/register') {
                    return res.render('register')
                } else if (req.originalUrl === '/login') {
                    return res.render('login')
                }
                else {
                    return res.redirect('/login')
                }
            }
            req.user =  {
                email: user.results[0].properties.emai.title[0].text.content, 
                name: user.results[0].properties.name.rich_text[0].text.content,
                displayName: user.results[0].properties.display_name.rich_text[0].text.content
            }
            
            if (req.originalUrl === '/register'|| req.originalUrl === '/login') {
                return res.redirect('/dashboard')
            } else {
                return next();
            }
        }catch (err) {
            console.log(err)
            if (req.originalUrl === '/register') {
                return res.render('register')
            } else if (req.originalUrl === '/login') {
                return res.render('login')
            }
            else {
                return res.redirect('/login')
            }
        } 
    } 
}