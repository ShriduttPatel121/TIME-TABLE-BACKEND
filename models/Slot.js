const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const slotSchema = new Schema({
    // this will be the numberof the day. for instance, Monday => 1, Tuesday => 2....
    day: {
        type: Number,
        required : true
    },
    // this will signifies  that which  N(th) period(lecture) is assigned for the class
    slotNumber: {
        type: Number,
        required : true
    },
    // which professor has this slot for a particular class
    professor: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },

    classRoom: {
        type: mongoose.Types.ObjectId,
        ref: 'ClassRoom',
        required: true
    }
});

module.exports = mongoose.model('Slot', slotSchema);
