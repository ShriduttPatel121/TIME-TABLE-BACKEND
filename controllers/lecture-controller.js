const ClassRoom = require('../models/ClassRoom');
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

exports.addClass = addClass;

