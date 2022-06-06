const jwt = require("jsonwebtoken");
const jwt_token = process.env.JWT_TOKEN;
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const { SendMessage } = require("../services/errorReporting");

module.exports = {
  checkUser: async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      // check if req is coming from register then redirect to register otherwise login
      return res.redirect("/login");
    }
    try {
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
      if (!user) {
        return res.redirect("/login");
      }

      req.user = {
        email: user.results[0].properties.email.title[0].plain_text,
        name: user.results[0].properties.Name.rich_text[0].text.content,
        displayName:
          user.results[0].properties.displayName.rich_text[0].text.content,
      };
      return next();
    } catch (err) {
      console.log(err);
      SendMessage(err.stack.toString());

      return res.redirect("/login");
    }
  },
  isAdmin: async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      // check if req is coming from register then redirect to register otherwise login
      return res.redirect("/login");
    }
    try {
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
      if (!user) {
        return res.redirect("/login");
      }

      if (user.results[0].properties.isAdmin.checkbox) {
        return next();
      }
      return res.redirect("/dashboard");
    } catch (err) {
      console.log(err);
      SendMessage(err.stack.toString());

      return res.redirect("/login");
    }
  },
  banCheck: async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      // check if req is coming from register then redirect to register otherwise login
      return res.redirect("/login");
    }
    try {
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
      if (!user) {
        return res.redirect("/login");
      }
      if (!user.results[0].properties.isBanned.checkbox) {
        return next();
      }

      return res.redirect("/banned");
    } catch (err) {
      console.log(err);
      SendMessage(err.stack.toString());

      return res.redirect("/login");
    }
  },
};
