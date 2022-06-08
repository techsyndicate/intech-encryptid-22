const express = require("express");
const router = express.Router();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const jwt = require("jsonwebtoken");
const { SendMessage } = require("../services/errorReporting");
const jwt_token = process.env.JWT_TOKEN;

router.get("/", async (req, res) => {
  if (req.cookies.token) {
    const token = req.cookies.token;

    const decoded = jwt.verify(token, jwt_token);
    const user = await notion.databases.query({
      database_id: process.env.NOTION_DB_ID,
      filter: {
        and: [
          {
            property: "email",
            title: {
              equals: decoded.email,
            },
          },
        ],
      },
    });

    if (user.results.length < 2) {
      req.user = {
        email: user.results[0].properties.email.title[0].plain_text,
        name: user.results[0].properties.Name.rich_text[0].text.content,
        displayName:
          user.results[0].properties.displayName.rich_text[0].text.content,
      };
    }
  }
  return res.render("index", { userLog: req.user });
});

router.get("/leaderboard", async (req, res) => {
  try {
    if (req.cookies.token) {
      const token = req.cookies.token;
      const decoded = jwt.verify(token, jwt_token);
      const user = await notion.databases.query({
        database_id: process.env.NOTION_DB_ID,
        filter: {
          and: [
            {
              property: "email",
              title: {
                equals: decoded.email,
              },
            },
          ],
        },
      });
      if (user.results.length < 2) {
        req.user = {
          email: user.results[0].properties.email.title[0].plain_text,
          name: user.results[0].properties.Name.rich_text[0].text.content,
          displayName:
            user.results[0].properties.displayName.rich_text[0].text.content,
        };
      }
    }
    const userLog = req.user;
    const dbId = process.env.NOTION_DB_ID;
    const usersN = await notion.databases.query({
      database_id: dbId,
      filter: {
        and: [
          {
            property: "isAdmin",
            checkbox: {
              equals: false,
            },
          },
          {
            property: "isBanned",
            checkbox: {
              equals: false,
            },
          },
          {
            property: "isNC",
            checkbox: {
              equals: false,
            },
          },
        ],
      },
      sorts: [
        {
          property: "points",
          direction: "descending",
        },
      ],
    });
    const users = usersN.results.map((user) => {
      return {
        name: user.properties.Name.rich_text[0].text.content,
        points: user.properties.points.rich_text[0].text.content,
        email: user.properties.email.title[0].plain_text,
        displayName: user.properties.displayName.rich_text[0].text.content,
        currentLevel: user.properties.currentLevel.rich_text[0].text.content,
      };
    });
    users.sort((a, b) => {
      return b.points - a.points;
    });
    console.log(userLog);
    res.render("leaderboard", { users, userLog: req.user });
  } catch (err) {
    console.log(err);
    SendMessage(err.stack.toString());

    res.redirect("/");
  }
});

router.get("/nc/leaderboard", async (req, res) => {
  try {
    if (req.cookies.token) {
      const token = req.cookies.token;
      const decoded = jwt.verify(token, jwt_token);
      const user = await notion.databases.query({
        database_id: process.env.NOTION_DB_ID,
        filter: {
          and: [
            {
              property: "email",
              title: {
                equals: decoded.email,
              },
            },
          ],
        },
      });
      if (user.results.length < 2) {
        req.user = {
          email: user.results[0].properties.email.title[0].plain_text,
          name: user.results[0].properties.Name.rich_text[0].text.content,
          displayName:
            user.results[0].properties.displayName.rich_text[0].text.content,
        };
      }
    }
    const userLog = req.user;
    const dbId = process.env.NOTION_DB_ID;
    const usersN = await notion.databases.query({
      database_id: dbId,
      filter: {
        and: [
          {
            property: "isAdmin",
            checkbox: {
              equals: false,
            },
          },
          {
            property: "isBanned",
            checkbox: {
              equals: false,
            },
          },
          {
            property: "isNC",
            checkbox: {
              equals: true,
            },
          },
        ],
      },
      sorts: [
        {
          property: "points",
          direction: "descending",
        },
      ],
    });
    const users = usersN.results.map((user) => {
      return {
        name: user.properties.Name.rich_text[0].text.content,
        points: user.properties.points.rich_text[0].text.content,
        email: user.properties.email.title[0].plain_text,
        displayName: user.properties.displayName.rich_text[0].text.content,
        currentLevel: user.properties.currentLevel.rich_text[0].text.content,
      };
    });
    users.sort((a, b) => {
      return b.points - a.points;
    });
    console.log(users);
    console.log(userLog);
    res.render("ncleaderboard", { users, userLog: req.user });
  } catch (err) {
    console.log(err);
    SendMessage(err.stack.toString());

    res.redirect("/");
  }
});

router.get("/banned", async (req, res) => {
  if (req.cookies.token) {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, jwt_token);
    const user = await notion.databases.query({
      database_id: process.env.NOTION_DB_ID,
      filter: {
        and: [
          {
            property: "email",
            title: {
              equals: decoded.email,
            },
          },
        ],
      },
    });
    if (user.results.length < 2) {
      req.user = {
        email: user.results[0].properties.email.title[0].plain_text,
        name: user.results[0].properties.Name.rich_text[0].text.content,
        displayName:
          user.results[0].properties.displayName.rich_text[0].text.content,
      };
    }
  }
  const userLog = req.user;
  res.render("banned", { userLog });
});

router.get("/apollo13", (req, res) => {
  res.redirect("https://imgur.com/gallery/pK4QV9s");
});

router.get("/shamballa", (req, res) => {
  res.redirect("https://pastebin.com/pucrhmX4");
});

module.exports = router;
