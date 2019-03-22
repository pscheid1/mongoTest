const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var locations =  ["Acton", "Boxborough", "Chelmsford", "Hopkinton"];
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

// Export the model
module.exports = mongoose.model('Schedule', ScheduleSchema);