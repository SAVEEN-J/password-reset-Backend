const usersRouter = require("express").Router();
const User = require("../Model/usersModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { Email_ID, Email_PW } = require("../utlis/config");

// getting full data

usersRouter.get("/users", (req, res) => {
  User.find({}, {}).then((users) => {
    res.status(200).json(users);
  });
});

// sign up new user

usersRouter.post("/users/signup", async (req, res) => {
  //preparing object to store in collection
  try {
    const { username, email, password } = new User(req.body);
    if (!username || !email || !password) {
      res.status(400).json({ Err: "all fields are mandotary" });
      return;
    }
    const USER = await User.findOne({ email });
    if (USER) {
      res.status(400).json({ Err: "user already exists" });
      return;
    }
    // hashed password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({ message: `${user.username} Data saved` });
    } else {
      res.status(404).json({ Err: "user data already exist" });
    }
  } catch (error) {
    console.error(error);
  }
});

// Creating link for reseting password

usersRouter.put("/users/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ Err: "please enter valid email" });
      return;
    }
    const USER = await User.findOne({ email });
    if (!USER) {
      res.status(400).json({ Err: "user not found exists" });
      return;
    }

    const randomString =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const link = `http://localhost:3000/users/reset/?randomString=${randomString}`;

    USER.resetToken = randomString;
    await User.findByIdAndUpdate(USER.id, USER);
    await USER.save();
    //sending email for resetting 

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: Email_ID,
        pass: Email_PW,
      },
    });

    const sendMail = async () => {
      const info = await transporter.sendMail({
        from: `"SAVEEN_J" <${Email_ID}>`,
        to: USER.email,
        subject: "Reset Password",
        text: link,
      });
    };

    sendMail()
      .then(() => {
        return res
          .status(201)
          .json({ message: `Mail has been send to ${USER.email}` });
      })
      .catch((err) => res.status(500).json(err));
  } catch (error) {
    return res.status(500).json(error);
  }
});

// Reseting password

usersRouter.patch("/users/reset/:id", async (req, res) => {
  try {
    const resetToken = req.params.id;
    const { password } = req.body;
    const USER = await User.findOne({ resetToken });

    console.log(USER.password);
    if (!USER) {
      res.status(400).json({ Err: "user not found exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    USER.password = hashedPassword;

    await User.findByIdAndUpdate(USER.id, USER);
    console.log(USER.password);
    res.status(201).json({
      message: `${USER.username} password has beed changed sucessfully`,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = usersRouter;
