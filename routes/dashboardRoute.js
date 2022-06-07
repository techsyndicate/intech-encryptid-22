const express = require("express");
const { checkUser, isAdmin, banCheck } = require("../services/authServices");
const router = express.Router();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const axios = require("axios");
const { updatePage } = require("@notionhq/client/build/src/api-endpoints");
const Answer = require("../schema/answerSchema");
const { SendMessage } = require("../services/errorReporting");

router.get("/dashboard", checkUser, banCheck, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const levelId = process.env.DB_3_ID;
    const userDbId = process.env.NOTION_DB_ID;
    const levels = await notion.databases.query({
      database_id: levelId,
    });
    const maxLevels = levels.results.length;
    const userN = await notion.databases.query({
      database_id: userDbId,
      filter: {
        and: [
          {
            property: "email",
            title: {
              equals: userEmail,
            },
          },
        ],
      },
    });
    const user = userN.results[0];
    const currentLevel = user.properties.currentLevel.rich_text[0].text.content;
    if (currentLevel == maxLevels + 1) {
      return res.redirect("/finish");
    }
    console.log(currentLevel);
    const levelN = await notion.databases.query({
      database_id: levelId,
      filter: {
        and: [
          {
            property: "level",
            rich_text: {
              equals: currentLevel,
            },
          },
        ],
      },
    });
    console.log(levelN);
    const level = levelN.results[0].properties;
    console.log(level);
    res.render("dashboard", { level, userLog: req.user });
  } catch (e) {
    console.log(e);
    SendMessage(e.stack.toString());

    res.redirect("/");
  }
});

router.post("/submit", checkUser, banCheck, async (req, res) => {
  if (req.body.answer == "") {
    return res.send({
      status: "error",
      message: "Please enter an answer",
    });
  }
  try {
    const maxLevel = process.env.MAX_LEVEL;
    const levelId = process.env.DB_3_ID;
    const userDbId = process.env.NOTION_DB_ID;
    const answer = req.body.answer.replace(/\s/g, "").toLowerCase();
    console.log(answer);
    const levelN = await notion.databases.query({
      database_id: userDbId,
      filter: {
        and: [
          {
            property: "email",
            title: {
              equals: req.user.email,
            },
          },
        ],
      },
    });

    const level =
      levelN.results[0].properties.currentLevel.rich_text[0].text.content;
    const canswer = await notion.databases.query({
      database_id: levelId,
      filter: {
        and: [
          {
            property: "level",
            rich_text: {
              equals: level,
            },
          },
        ],
      },
    });

    const correctAnswer =
      canswer.results[0].properties.answer.rich_text[0].text.content;
    const isCorrect = answer === correctAnswer;
    if (!isCorrect) {
      const newAnswer = new Answer({
        answer: answer,
        userEmail: req.user.email,
        level: level,
        isCorrect: false,
      });
      await newAnswer.save();
      return res.send({
        status: "wrong",
        message: "Answer is incorrect",
      });
    }

    const userN = await notion.databases.query({
      database_id: userDbId,
      filter: {
        and: [
          {
            property: "email",
            title: {
              equals: req.user.email,
            },
          },
        ],
      },
    });
    const user1 = userN.results[0];

    const currentLevel =
      user1.properties.currentLevel.rich_text[0].text.content;
    const currentPoints = user1.properties.points.rich_text[0].text.content;

    const levels = await notion.databases.query({
      database_id: levelId,
    });
    const maxLevels = levels.results.length;

    const nextLevel = parseInt(currentLevel) + 1;
    const nextPoints = parseInt(currentPoints) + 100;

    const updateN = await notion.pages.update({
      page_id: user1.id,
      properties: {
        points: {
          rich_text: [
            {
              text: {
                content: nextPoints.toString(),
              },
            },
          ],
        },
        currentLevel: {
          rich_text: [
            {
              text: {
                content: nextLevel.toString(),
              },
            },
          ],
        },
      },
    });
    const newAnswer = new Answer({
      answer: answer,
      userEmail: req.user.email,
      level: level,
      isCorrect: true,
    });
    await newAnswer.save();
    if (currentLevel == maxLevels) {
      return res.send({
        status: "over",
      });
    }
    return res.send({
      status: "success",
      message: "Answer is correct",
    });
  } catch (err) {
    console.log(err);
    SendMessage(err.stack.toString());

    return res.send({
      status: "error",
      message: "Something went wrong",
    });
  }
});

router.get("/user", checkUser, banCheck, async (req, res) => {
  try {
    const userDbId = process.env.NOTION_DB_ID;
    const userN = await notion.databases.query({
      database_id: userDbId,
      filter: {
        and: [
          {
            property: "email",
            title: {
              equals: req.user.email,
            },
          },
        ],
      },
    });
    const user1 = userN.results[0];

    const currentLevel =
      user1.properties.currentLevel.rich_text[0].text.content;
    const currentPoints = user1.properties.points.rich_text[0].text.content;
    res.render("user", { userLog: req.user, currentLevel, currentPoints });
  } catch (e) {
    console.log(e);
    SendMessage(err.stack.toString());

    res.redirect("/");
  }
});
module.exports = router;
