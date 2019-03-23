const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var locations = ["Acton", "Boxborough", "Chelmsford", "Hopkinton"];
let ScheduleSchema = new Schema({

    _id: { type: String, required: true },
    name: { type: String, required: true },             // Name of facility
    meetingDate: { type: Date, required: true },        // May delete this later
    startTime: { type: Date, required: true },          // Meeting start date and time
    endTime: { type: Date, required: true },            // Meeting end date and time
    location: {                                         // location of facility
        type: String,
        required: true,
        enum: locations
    }
});


// db.schedules.createIndex( { name : 1, meetingDate: 1, startTime: 1, endTime: 1, location: 1 }, { unique: true } );
ScheduleSchema.index({ name: 1, meetingDate: 1, startTime: 1, endTime: 1, location: 1 }, { unique: true, name: "dupEntry"},
    function (error) {
            console.log(error);
    }
);


ScheduleSchema.on('index', function (error, next) {
    return next(error.message);
});

// Export the model
module.exports = mongoose.model('Schedule', ScheduleSchema);