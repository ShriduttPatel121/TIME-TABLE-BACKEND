const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Slot = require("../models/Slot");
const ClassRoom = require("../models/ClassRoom");
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

  res.status(200).json({
    message: 'Logged in!',
    userId: existingUser.id,
    type: existingUser.role,
    name: existingUser.name,
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
  
  let message = "slots are available";

  let professorOccupiedLec = [];  // to find assigned lectures for a professor for a particular day
  try {
    professorOccupiedLec = await Slot.find({ professor: professor, day: day}).select('slotNumber -_id').exec();
    //if we receive more than 4 slots we can not give back the available slots for this professor due to test condition of 4hr a day for professor
    if (professorOccupiedLec.length >= 4) {
      return next(new HttpError('this professor already has 4 or more lectures for this day', 400));
    }

  } catch (e) {
    return next(new HttpError("somthing went wrong", 500));
  }

  let occupiedSlots = [];  // to find the assigned solts to the class for a particular day
  try {
    occupiedSlots = await Slot.find({classRoom: classRoom, day: day}).select('slotNumber -_id').exec();
    //A Class can have maximum 6 hours a day
    if (occupiedSlots.length >= 6) {
      return next(new HttpError('this class room is fully occupied for this day', 400));
    }

    // to not push slot numbers which are already occupied
    for(let i = 0; i <=5; i++) {
      if (!(occupiedSlots.findIndex(oc => oc.slotNumber === i) > -1)) {
        availableSlots.push(i);
      }
    }

    // remove those solts from availableSlots where professor is already occupied at some slot of a class room
    for(let x = 0; x < professorOccupiedLec.length; x++) {
      let occupiedSlotByProf = professorOccupiedLec[x].slotNumber;
      let index = availableSlots.findIndex(a => a === occupiedSlotByProf);
      if (index > -1) {
        availableSlots.splice(index, 1);
      }
    }

    if(availableSlots.length === 0) {
      message = "slots are not available";
    }

    res.status(200).json({message, availableSlots});
  } catch (e) {
    return next(new HttpError("somthing went wrong", 500));
  }
}

// returns all the professors which are not exceeding their working hours for a week
const availableProfessorForWeek = async (req, res, next) => {
  try {

    const professors = await User.find({totalWeekHours: {$lt: 18}, role: "professor"}).select('name').exec();
    res.status(200).json({professors});

  } catch (e) {
    return next(new HttpError("somthing went wrong", 500));
  }
}

// returns all the class rooms which are not exceeding their working hours for a week
const availableClassRoomForWeek = async (req, res, next) => {
  try {

    const classRooms = await ClassRoom.find({totalWeekHours: {$lt: 25}}).select('name').exec();
    res.status(200).json({classRooms});

  } catch (e) {
    return next(new HttpError("somthing went wrong", 500));
  }
}

// to fetch all the professors with their lectures
const fetchAllProWithLectures = async (req, res, next) => {

  const result = [];
  let professors = [];
  // to get all the professors
  try {
    professors = await User.find({role: "professor"}).select("name userName").exec();

    for (let prof of professors) {
      let lec = await Slot.find({professor: prof._id}).populate('classRoom').sort({'day': 1, slotNumber: 1}).exec();

      let placeHolder = {
        professor: prof,
        lectures: lec
      }
      result.push(placeHolder);
    }
    res.status(200).json({result: result});
  } catch (e) {
    console.log(e);
    return next(new HttpError("something went wrong while fetching professor or lectures", 500));
  }
}

exports.login = login;
exports.addUser = addUser;
exports.getAvailableSoltOfDay = getAvailableSoltOfDay;
exports.availableProfessorForWeek = availableProfessorForWeek;
exports.availableClassRoomForWeek = availableClassRoomForWeek;
exports.fetchAllProWithLectures = fetchAllProWithLectures;