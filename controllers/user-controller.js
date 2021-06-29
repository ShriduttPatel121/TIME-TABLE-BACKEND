const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Slot = require("../models/Slot");
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
        type: existingUser.role
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

    let type;
    if (req.userData) {
        type = req.userData.type;
    } else {
        return next(new HttpError('You are not allowed to create users', 403));
    }

    // check the user type of admin from the token
    if (type.toUpperCase() !== "ADMIN") {
        return next(new HttpError('You are not allowed to create users', 403));
    }

    const name = req.body.name;
    const userType = req.body.type;
    const password = req.body.password; // password can be hashed with bycrypt
    const userName = req.body.userName;
    const classRoom = req.body.classRoom;

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
        classRoom
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

// to fetch the available slot(in terms of the order number) for the particular day, class room and professor.( this will be triggered when admin user will check for the slot avaibility for prof, class and day, in order to assign the lecture to prof)
const getAvailableSoltOfDay = async (req, res, next) => { 
  const professor = req.params.professorId; 
  const classRoom = req.params.classRoomId;
  const day = req.params.day;

  if (!professor || !classRoom || !day) {
    return next( new HttpError('professor id, class room id or day was not found in request parameters', 406));
  }
  let availableSlots = [];
  let occupiedSlots = [];
  let message = "slots are available";
  try {
    occupiedSlots = await Slot.find({classRoom: classRoom, professor: professor, day: day}).select('slotNumber -_id').exec();
    console.log(occupiedSlots);
    // to not push slot numbers which are already occupied
    for(let i = 0; i <=5; i++) {
      if (!(occupiedSlots.findIndex(oc => oc.slotNumber === i) > -1)) {
        availableSlots.push(i);
      }
    }

    if(availableSlots.length === 0) {
      message = "slots are not available";
    }

    res.status(201).json({message, availableSlots});
  } catch (e) {
    return next(new HttpError("somthing went wrong", 500));
  }
}


exports.login = login;
exports.addUser = addUser;
exports.getAvailableSoltOfDay = getAvailableSoltOfDay;