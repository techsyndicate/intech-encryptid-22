const express = require("express");
const router = express.Router();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { checkUser } = require("../services/authServices");
const { SendMessage } = require("../services/errorReporting");
const axios = require("axios");

const dbId = process.env.NOTION_DB_ID;
const jwt_token = process.env.JWT_TOKEN;

router.get("/register", (req, res) => {
  res.render("register", { userLog: req.user });
});

router.post("/auth/reg", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    if (!email || !password || !cpassword) {
      return res.send({
        status: "error",
        message: "Please fill all the fields",
      });
    }
    if (password !== cpassword) {
      return res.send({
        status: "error",
        message: "Passwords do not match",
      });
    } else if (email.includes("@") === false) {
      return res.send({
        status: "error",
        message: "Please enter a valid email",
      });
    } else {
      // bcyrpt password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // check if user exists
      const userCheck = await notion.databases.query({
        database_id: dbId,
        filter: {
          and: [
            {
              property: "email",
              title: {
                equals: email,
              },
            },
          ],
        },
      });
      if (userCheck.results.length > 0) {
        return res.send({
          status: "error",
          message: "User already exists",
        });
      }
      // get details from main db
      const db_2_id = process.env.DB_2_ID;
      const Nuser = await notion.databases.query({
        database_id: db_2_id,
        filter: {
          and: [
            {
              property: "Email",
              rich_text: {
                equals: email,
              },
            },
          ],
        },
      });
      const user = Nuser.results[0];
      if (Nuser.results.length == 0) {
        return res.send({
          status: "error",
          message: "Please register at intech.techsyndicate.us first",
        });
      }
      const dbPass = user.properties.Password.rich_text[0].text.content;
      const name = user.properties.Name.title[0].plain_text;
      const displayName = user.properties.DisplayName.rich_text[0].text.content;
      bcrypt.compare(password, dbPass, (err, result) => {
        if (err) {
          return res.send({
            status: "error",
            message: "Something went wrong",
          });
        }
        if (result === true) {
        } else {
          return res.send({
            status: "error",
            message:
              "Password is incorrect. Please ensure it is same as the one provided during inTech registration",
          });
        }
      });

      try {
        const user = await notion.pages.create({
          parent: { database_id: dbId },
          properties: {
            title: {
              title: [
                {
                  text: {
                    content: email,
                  },
                },
              ],
            },
            Name: {
              rich_text: [
                {
                  text: {
                    content: name,
                  },
                },
              ],
            },
            password: {
              rich_text: [
                {
                  text: {
                    content: hashedPassword,
                  },
                },
              ],
            },
            displayName: {
              rich_text: [
                {
                  text: {
                    content: displayName,
                  },
                },
              ],
            },
            currentLevel: {
              rich_text: [
                {
                  text: {
                    content: "1",
                  },
                },
              ],
            },
            points: {
              rich_text: [
                {
                  text: {
                    content: "0",
                  },
                },
              ],
            },
            isAdmin: {
              checkbox: false,
            },
            isBanned: {
              checkbox: false,
            },
            isNC: {
              checkbox: false,
            },
          },
        });
        // jwt auth
        const token = jwt.sign(
          {
            email: email,
          },
          jwt_token
        );
        res.cookie("token", token);
        req.user = {
          email,
          name,
          displayName,
        };
        return res.send({
          status: "success",
          message: "User created successfully",
        });
      } catch (err) {
        console.log(err);
        return res.send({
          status: "error",
          message: "Some error occurred",
        });
      }
    }
  } catch (err) {
    console.log(err);
    SendMessage(err.stack.toString());
    return res.send({
      status: "error",
      message: "Some error occurred",
    });
  }
});

router.get("/login", (req, res) => {
  res.render("login", { userLog: req.user });
});

router.post("/auth/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      return res.send({
        status: "error",
        message: "Please fill all the fields",
      });
    }
    if (email.includes("@") === false) {
      return res.send({
        status: "error",
        message: "Please enter a valid email",
      });
    }
    // check if user exists
    const userCheck = await notion.databases.query({
      database_id: dbId,
      filter: {
        and: [
          {
            property: "email",
            title: {
              equals: email,
            },
          },
        ],
      },
    });
    if (userCheck.results.length === 0) {
      return res.send({
        status: "error",
        message: "User does not exist",
      });
    }
    // check if password is correct
    const user = userCheck.results[0];
    const hashedPassword = user.properties.password.rich_text[0].text.content;
    const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordCorrect) {
      return res.send({
        status: "error",
        message: "Password is incorrect",
      });
    }
    // jwt auth
    // const email = user.properties.email.title[0].text.content
    const token = jwt.sign(
      {
        email,
      },
      jwt_token
    );
    res.cookie("token", token);
    req.user = {
      name: user.properties.Name.rich_text[0].text.content,
      email: user.properties.email.title[0].text.content,
      displayName: user.properties.displayName.rich_text[0].text.content,
    };
    return res.send({
      status: "success",
      message: "User logged in successfully",
    });
  } catch (err) {
    console.log(err);
    SendMessage(err.stack.toString());
    return res.send({
      status: "error",
      message: "Some error occurred",
    });
  }
});

// logout route
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  req.user = null;
  res.redirect("/");
});

router.get("/nc", (req, res) => {
  res.render("nc", { userLog: req.user });
});

router.post("/auth/nc", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    const name = req.body.name;
    const displayName = req.body.displayName;
    if (!email || !password || !cpassword) {
      return res.send({
        status: "error",
        message: "Please fill all the fields",
      });
    }
    if (password !== cpassword) {
      return res.send({
        status: "error",
        message: "Passwords do not match",
      });
    } else if (email.includes("@") === false) {
      return res.send({
        status: "error",
        message: "Please enter a valid email",
      });
    } else {
      // bcyrpt password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // check if user exists
      const userCheck = await notion.databases.query({
        database_id: dbId,
        filter: {
          and: [
            {
              property: "email",
              title: {
                equals: email,
              },
            },
          ],
        },
      });
      if (userCheck.results.length > 0) {
        return res.send({
          status: "error",
          message: "User already exists",
        });
      }
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // create user
    try {
      const user = await notion.pages.create({
        parent: { database_id: dbId },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: email,
                },
              },
            ],
          },
          Name: {
            rich_text: [
              {
                text: {
                  content: name,
                },
              },
            ],
          },
          password: {
            rich_text: [
              {
                text: {
                  content: hashedPassword,
                },
              },
            ],
          },
          displayName: {
            rich_text: [
              {
                text: {
                  content: displayName,
                },
              },
            ],
          },
          currentLevel: {
            rich_text: [
              {
                text: {
                  content: "1",
                },
              },
            ],
          },
          points: {
            rich_text: [
              {
                text: {
                  content: "0",
                },
              },
            ],
          },
          isAdmin: {
            checkbox: false,
          },
          isBanned: {
            checkbox: false,
          },
          isNC: {
            checkbox: true,
          },
        },
      });
      // jwt auth
      const token = jwt.sign(
        {
          email: email,
        },
        jwt_token
      );
      res.cookie("token", token);
      req.user = {
        email,
        name,
        displayName,
      };
      return res.send({
        status: "success",
        message: "User created successfully",
      });
    } catch (err) {
      console.log(err);
      SendMessage(err.stack.toString());
      return res.send({
        status: "error",
        message: "Some error occurred",
      });
    }
  } catch (err) {
    console.log(err);
    SendMessage(err.stack.toString());
    return res.send({
      status: "error",
      message: "Some error occurred",
    });
  }
});

router.get("/forgot", async (req, res) => {
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
    if (user.length < 1) {
      req.user = {
        email: user.results[0].properties.email.title[0].plain_text,
        name: user.results[0].properties.Name.rich_text[0].text.content,
        displayName:
          user.results[0].properties.displayName.rich_text[0].text.content,
      };
    } else {
      return res.send({
        status: "error",
        message: "User does not exist",
      });
    }
  }
  const userLog = req.user;
  res.render("forgot", { userLog });
});

router.post("/auth/forgot", async (req, res) => {
  try {
    const email = req.body.email;
    var aresponse = await axios(
      `https://intech.techsyndicate.us/forgot/${email}`,
      {
        method: "GET",
      }
    );

    const data = aresponse.data;
    switch (data.success) {
      case true:
        return res.send({
          status: "success",
          message: "Email sent successfully",
        });
        break;
      case false:
        if (data.msg == "there was a problem sending the email!") {
          return res.send({
            status: "error",
            message: "Some Error Occurred while sending the email",
          });
        } else {
          return res.send({
            status: "error",
            message: "Email is invalid. Please check again",
          });
        }
      default:
        break;
    }
  } catch (e) {
    console.log(e);
    SendMessage(e.stack.toString());
    res.send({
      status: "error",
      message: "Some error occurred",
    });
  }
});

module.exports = router;
