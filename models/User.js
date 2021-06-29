const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({

    name: {
        type: String,
        required : true
    },
    // 3 types ==> student, professor, admin(who can only add professor and assign the professor to a lecture(slot))
    role: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true,
        minlength : 5
    },

    // this field is for student type user, and in which class room he/she belongs to.
    classRoom: {
        type: mongoose.Types.ObjectId,
        ref: 'ClassRoom'
    },

    // this field will validate for weekly working hours are not exceeded for a professor
    totalWeekHours: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('User', userSchema);