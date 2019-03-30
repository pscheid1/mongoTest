const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var names = ["Acton Memorial Library", "Chelmsford Public Library", "Sargent Memorial Library", "Hopkinton Public Library"];
var locations = ["Acton", "Boxborough", "Chelmsford", "Hopkinton"];

let MeetingSchema = new Schema({

    _id: { type: String, required: true },
    facility: {                                     // _id of Facility item
        type: String,
        required: true,
        enum: locations
    },
    meetingDate: { type: Date, required: true },    // Date of the meeting. Time component is always 0.
    startTime: { type: Date, required: true },      // Meeting start date and time
    endTime: { type: Date, required: true }         // Meeting end date and time

}, { autoIndex: true });

// if autoIndex is true, mongoose will call sequentially each defined index 
// to create the indexes manually invoke createIndexes which will call this function.  (see createIndex call in schedule.controller)
MeetingSchema.index({ facility: 1, meetingDate: 1, startTime: 1, endTime: 1 }, { unique: true, name: "dupMeeting" });

MeetingSchema.on('index', function (error) {
    console.log("MeetingSchema createIndex error: " + error.message);
});

// Export the model

module.exports = mongoose.model('Meeting', MeetingSchema);