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
}, {autoIndex: true});

// create an index to define a duplicate entry
// if autoIndex is true, mongoose will call sequentially each defined index 
// to create the indexes manually invoke createIndexes which will call this function.  (see createIndex call in schedule.controller)
ScheduleSchema.index({ name: 1, meetingDate: 1, startTime: 1, endTime: 1, location: 1 }, { unique: true, name: "dupEntry"});

/* // Dummy index for testing
ScheduleSchema.index({name: 1, noName: -1}, {name: "testIndex1"});

ScheduleSchema.index(({name: 1, noName2: -1}, {name: "testIndex2"}), function() {
    console.log("xxxxxxxxxxxxx");
});
 */

ScheduleSchema.on('index', function (error) {
    console.log("ScheduleSchema createIndex error: " + error.message);
});

// Export the model
module.exports = mongoose.model('Schedule', ScheduleSchema);