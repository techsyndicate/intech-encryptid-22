const express = require('express');
const { checkUser, isAdmin, banCheck} = require('../services/authServices');
const router = express.Router();
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const axios = require('axios');
const { updatePage } = require('@notionhq/client/build/src/api-endpoints');
const Answer = require('../schema/answerSchema');


router.get('/dashboard',checkUser, banCheck, async (req,res)=> {
    // check if current date is before 7th june 
    const today = new Date();
    const startDate = new Date(2021, 6,7);
    const endDate = new Date(2021,6,8);
    // TODO: uncomment this before hunt starts
    // if (today < startDate) { 
    //     console.log('before')
    //     return res.render('pre/dashboard')
    // } else if (today > endDate) {
    //     console.log('after')
    //     return res.render('post/dashboard')
    // } 
    const userEmail = req.user.email;
    
    const levelId = process.env.DB_3_ID 
    const userDbId = process.env.NOTION_DB_ID
    const userN = await notion.databases.query({
        database_id: userDbId,
        filter: {
            and: [
                {
                    property: 'email',
                    title: {
                        equals: userEmail
                    }
                }
            ]
        }
    })
    const user = userN.results[0]
    const currentLevel = user.properties.currentLevel.rich_text[0].text.content 
    const levelN = await notion.databases.query({
        database_id: levelId,
        filter: {
            and: [
                {
                    property: 'level',
                    rich_text: { 
                        equals: currentLevel
                    }
                }
            ]
        }
    })  
    const level = levelN.results[0].properties
    
    res.render('dashboard', {level});
})

router.post('/submit', checkUser, banCheck, async (req,res)=> {
try {

    const maxLevel = process.env.MAX_LEVEL
    const levelId = process.env.DB_3_ID
    const userDbId= process.env.NOTION_DB_ID
    const answer = req.body.answer.replace(/\s/g, '');
    const level = req.body.level;
    const canswer = await notion.databases.query({ 
        database_id: levelId,
        filter: {
            and: [
                {
                    property: 'level',
                    rich_text: {
                        equals: level
                    }
                }
            ]
        }
    })
    
    const correctAnswer = canswer.results[0].properties.answer.rich_text[0].text.content;
    const isCorrect = answer === correctAnswer;
    if (!isCorrect) {
        const newAnswer = new Answer({ 
            answer: answer,
            userEmail: req.user.email,
            level: level, 
            isCorrect: false
        })
        await newAnswer.save();
        console.log("wrong")
        return res.send({
            status: 'wrong',
            message: 'Answer is incorrect'
        })
    }
    
    const userN = await notion.databases.query({
        database_id: userDbId,
        filter: {
            and: [
                {
                    property: 'email',
                    title: {
                        equals: req.user.email
                    }
                }
            ]
        }
    })
    const user1 = userN.results[0]
    
    const currentLevel = user1.properties.currentLevel.rich_text[0].text.content
    const currentPoints = user1.properties.points.rich_text[0].text.content
    if (currentLevel == maxLevel) {
        console.log('It is over')
        return res.send({  
            status: 'over'
        })
    }
    const nextLevel = parseInt(currentLevel) + 1
    const nextPoints = parseInt(currentPoints) + 100

    const updateN  = await notion.pages.update({
        page_id: user1.id,
        properties: {
                points: {
                    rich_text: [
                        {
                            text: {
                                content: nextPoints.toString()
                            }
                        }
                    ]
                },
                currentLevel: {
                    rich_text: [
                        {
                            text: {
                                content: nextLevel.toString()
                            }
                        }
                    ]
                }
            
            }
    })
    const newAnswer = new Answer({
        answer: answer,
        userEmail: req.user.email,
        level: level,
        isCorrect: true
    })
    await newAnswer.save();
    return res.send({
        status: 'success',
        message: 'Answer is correct'
    })

} catch (err) {
    console.log(err)
    return res.send({
        status: 'error',
        message: 'Something went wrong'
    })
}
})


module.exports = router;