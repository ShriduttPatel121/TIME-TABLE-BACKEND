const jwt = require("jsonwebtoken");

const User = require("../models/User");
const HttpError = require("../models/http-error");

const login = async (req, res, next) => {

    const userName = req.body.userName;
    const password = req.body.password;
  let existingUser;
  try {
    existingUser = await User.findOne({ userName: userName });
    if (!existingUser) {
      throw new Error();
    }
  } catch (e) {
    return next(
      new HttpError("Somthing went wrong, please check your credentials", 401)
    );
  }

  let isValid = false;

  // we could use bycrypt module to compare the hashed password, if the password was hash by the bycrypt while creating the user
  if (existingUser.password === req.body.password) {
    isValid = true;
  }

  if (!existingUser || !isValid) {
    return next(new HttpError("Invalid Credentials, please try again", 401));
  }

  let token;
  // generate token for the valid user.
  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        name: existingUser.name,
        type: existingUser.type
      },
      "TOKEN SECRET KEY DO NOT SHARE",
      { expiresIn: "1h" }
    );
  } catch (e) {
    return next(
      new HttpError("Somthing went wrong while checikng the existing user", 500)
    );
  }

  res.json({
    message: 'Logged in!',
    userId: existingUser.id,
    email: existingUser.email,
    token: token
  });
};

// to add professor
const addUser = async (req, res, next) => {

    const type = req.userData.type;

    // check the user type of admin from the token
    if (type && type.toUpperCase() !== "ADMIN") {
        return next(new HttpError('You are not allowed to create users', 403));
    }

    const name = req.body.name;
    const userType = req.body.type;
    const password = req.body.password; // password can be hashed with bycrypt
    const userName = req.body.userName;

    let existingUser;
    try {
        existingUser = await User.findOne({userName : userName})
    } catch (e) {
        return next( new HttpError('Somthing went wrong while checikng the existing user', 500));
    }

    if (existingUser) {
        return next( new HttpError('User exists already, please login instead', 422))
    }

    const newUser = new User({
        name,
        userName,
        role: userType,
        password,
    });

    try {
        await newUser.save();
    } catch(e) {
        const error = new HttpError(
          'Creating User Failed',
          500
        );
        return next(error)
    }

    res.status(201).json({message: "User was created successfully."});
};


exports.login = login;
exports.addUser = addUser;