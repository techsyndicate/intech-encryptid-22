const express = require('express');
const router = express.Router();
const {Client} = require('@notionhq/client');
const notion = new Client({auth: process.env.NOTION_TOKEN});

router.get("/", (req, res) => {
    res.render("index");
})

router.get('/leaderboard', async (req,res)=> { 
    const dbId = process.env.NOTION_DB_ID
    const usersN = await notion.databases.query({
        database_id: dbId,
        filter: {
            and: [
                {
                    property: 'isAdmin',
                    checkbox: {
                        equals: false
                    }
                },
                {
                    property: "isBanned", 
                    checkbox: {
                        equals: false
                    }
                }
            ]
        },
        sorts: [
            {
                property: 'points',
                direction: 'descending'
            }  
        ]
    })
    const users = usersN.results.map(user => {
        return {
            name: user.properties.Name.rich_text[0].text.content,
            points: user.properties.points.rich_text[0].text.content,
            email: user.properties.email.title[0].plain_text,
            displayName: user.properties.displayName.rich_text[0].text.content,
            currentLevel: user.properties.currentLevel.rich_text[0].text.content,
        }
    })
    res.render('leaderboard', {users})
})

router.get('/banned', (req,res) => { 
    res.render('banned')
})

module.exports= router;
