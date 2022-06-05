const express = require('express');
const { checkUser, isAdmin, banCheck} = require('../services/authServices');
const router = express.Router();
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const axios = require('axios');
const { updatePage } = require('@notionhq/client/build/src/api-endpoints');
const Answer = require('../schema/answerSchema');
const { SendMessage } = require('../services/errorReporting');


router.get('/answers', checkUser, isAdmin, async (req, res)=> {  
    const answers = await Answer.find({})
    
      res.render('admin/answers', {answers,userLog: req.user})
  })

router.get('/finish', checkUser,banCheck, (req,res)=> { 
    res.render('finish',{userLog: req.user})
})

router.get("/admin", checkUser, isAdmin, async (req,res)=> { 
try {
    const usersN = await notion.databases.query({
        database_id: process.env.NOTION_DB_ID,
        filter: {
            and: [
                {
                    property: 'isAdmin',
                    checkbox: {
                        equals: false
                    }
                }
            ]
        }
    })
    const users = usersN.results.map(user => {
        return {
            name: user.properties.Name.rich_text[0].text.content,
            points: user.properties.points.rich_text[0].text.content,
            email: user.properties.email.title[0].plain_text,
            displayName: user.properties.displayName.rich_text[0].text.content,
            currentLevel: user.properties.currentLevel.rich_text[0].text.content,
            isBanned: user.properties.isBanned.checkbox,
        }
    })

    res.render('admin/dashboard' , {users,userLog: req.user})
} catch (err) {
    console.log(err)
    SendMessage(err.stack.toString())
            SendMessage('The server has crashed')
    res.render('error',{userLog:req.user})
}
})

router.post('/admin/ban', checkUser, isAdmin, async (req,res)=> {
try {
    const email = req.body.email;

    const userN = await notion.databases.query({
        database_id: process.env.NOTION_DB_ID,
        filter: {
            and: [
                {
                    property: 'email',
                    title: {
                        equals: email
                    }
                }
            ]
        }
    })
    const user = userN.results[0]
    const isBanned = user.properties.isBanned.checkbox;
    const updateN  = await notion.pages.update({
        page_id: user.id,
        properties: {
                isBanned: {
                    checkbox: true
                }
            }
    })
    res.redirect('/admin')
} catch (err) {
    console.log(err)
    SendMessage(err.stack.toString())
    SendMessage('The server has crashed')
    res.render('error',{userLog: req.user})
}
 })

router.post('/admin/unban', checkUser, isAdmin, async (req,res)=> {
    const email = req.body.email
    const userLog = req.user
    const userN = await notion.databases.query({
        database_id: process.env.NOTION_DB_ID,
        filter: {
            and: [
                {
                    property: 'email',
                    title: {
                        equals: email
                    }
                }
            ]
        }
    })
    const user = userN.results[0]
    
    const updateN  = await notion.pages.update({
        page_id: user.id,
        properties: {
                isBanned: {
                    checkbox: false
                }
            }
    })
    res.redirect('/admin',)
})

router.get('/answers/level/:level', checkUser, isAdmin, async (req,res)=> {
    const answers = await Answer.find({
        level: req.params.level
    })
    
    res.render('admin/answers', {answers,userLog: req.user})
})

router.get('/answers/user/:userEmail', checkUser, isAdmin, async (req,res)=> {
    const answers = await Answer.find({
        userEmail: req.params.userEmail
    })

    res.render('admin/answers', {answers,userLog: req.user})
})

module.exports = router;