const ClassRoom = require('../models/ClassRoom');
const User = require('../models/User');
const Slot = require('../models/Slot');
const HttpError = require("../models/http-error");


// to add a class in db
const addClass = async (req, res, next) => {
    const name = req.body.name;

    const newClass = new ClassRoom({
        name
    });

    try {
        await newClass.save();
    } catch (e) {
        return next(new HttpError('somthing went wrong, while creating a new class', 500));
    }

    res.status(201).json({message: "New class was created successfully."});
}

// to assign a lecture to a presciber
const assignLecture = async (req, res, next) => {
    let type;
    if (req.userData) {
        type = req.userData.type;
    } else {
        return next(new HttpError('You are not allowed to create users', 403));
    }
    
    if (type.toUpperCase() !== "ADMIN") {
        return next(new HttpError('You are not allowed to create users', 403));
    }
    
    const professor = req.body.professor;
    const day = req.body.day;
    const classRoom = req.body.classRoom;
    const slotNumber = req.body.slotNumber;

    // validation for existing professor on the same period(slot)
    let slot;
    try {
        slot = await Slot.findOne({day: day, classRoom: classRoom, slotNumber: slotNumber});
    } catch(e) {
        return next(new HttpError('somthing went wrong while assigning the lecture', 500));
    }
    
    if(slot) {
        return next(new HttpError('this slot has already been occupied by other professor for this class room and day', 422));
    }

    //update the total weekly working hours for professor
    try {
        await User.findByIdAndUpdate(professor, { $inc: { totalWeekHours: 1 }}).exec();
    } catch (e) {
        return next(new HttpError('somthing went wrong while assigning the lecture', 500));
    }
    //update the total weekly working hours for class room
    try {
        await ClassRoom.findByIdAndUpdate(classRoom, { $inc: { totalWeekHours: 1 }}).exec();
    } catch (e) {
        return next(new HttpError('somthing went wrong while assigning the lecture', 500));
    }

    //updating the total weekly hours 

    const newSlot = new Slot({
        professor,
        day,
        classRoom,
        slotNumber,
    });
    try {
        await newSlot.save();
    } catch (e) {
        return next(new HttpError('somthing went wrong while assigning the lecture', 500));
    }

    res.status(201).json({message: "Lecture assigned successfully."});
}

exports.addClass = addClass;
exports.assignLecture = assignLecture;

