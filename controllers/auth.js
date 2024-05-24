const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorHandler = require("../utils/error");
module.exports.register = async function (req, res) {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    // if (username.length < 4) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Username must be at least 4 characters long",
    //   });
    // }
    // if (username.length > 20) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Username must be at most 20 characters long",
    //   });
    // }
    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters long",
      });
    }
    if (password.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Password must be at most 20 characters long",
      });
    }

    // Exist
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPass = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPass,
    });

    // Save user
    const savedUser = await user.save();
    // const token = await jwt.sign({ user: savedUser }, process.env.jwt_secret, {
    //   expiresIn: 60 * 60,
    // });
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: savedUser,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};
module.exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Exist
    const existUser = await User.findOne({ email });

    if (existUser) {
      // check password and create jwt
      const passResult = bcrypt.compareSync(password, existUser.password);
      if (passResult) {
        // jwt
        const token = jwt.sign(
          {
            user: existUser,
          },
          process.env.jwt_secret,
          { expiresIn: 7 * 24 * 60 * 60 }
        );

        res.status(200).json({
          success: true,
          message: "User logged in successfully",
          user: existUser,
          token: `Bearer ${token}`,
        });
      } else {
        res.status(401).json({ message: "password is incorrect" });
      }
    } else {
      res.status(404).json({
        message: "Email  is incorrect",
      });
    }
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports.getUser = async function (req, res) {
  const headers = req?.headers.authorization;
  const tokenArray = headers.split(" ");
  const token = tokenArray[1];
  if (token) {
    try {
      const claims = jwt.verify(token, process.env.jwt_secret);
      const user = await User.findOne({ _id: claims.user._id });
      if (user) {
        res.status(200).json({
          user,
        });
      } else {
        res.status(400).send({
          nf: true,
        });
      }

      // console.log(claims.user._id);
    } catch (error) {
      errorHandler(res, error);
    }
  } else {
    return res.status(401).send({
      msg: "Unauthenticated",
    });
  }
};


