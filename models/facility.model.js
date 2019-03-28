const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
    Currently, a schedule entry contains the following items:
        _id         This is the standard mongoose item key except we override it.
                    We override it in order to have a small useful key in place of 
                    the standard mongoDB generated key.
        name        A string to contain the name of the scheduled facility.
        meetingDate A javascript Date object containing the meeting date. The 
                    time component is zero.
        startTime   A javascript Date object containing the meeting start time.
                    startTime contains the meetingDate and the meeting start time.
        endTime     A javascript Date object containing the meeting end time.
                    endTime contains the meetingDate and the meeting end time.
        location    The location (town) of the meeting facility.

    There is duplication in mataining the date in the above three object.  There is 
    no way to create a Date object that is just a date or just a time. Actually, a
    Date object is just seconds since Jan 1, 1970 (epic).  I just decided it was
    less confusing if the dates in all three object were the same.  We could 
    eliminate meetDate and just use the date in startTime for the meeting date.
    It would slightly simplify the code.

    By default, mongoDB creates an index for _id forcing it to always be unique. 
    The schedule.controller code will allow you to attempt to set _id to any
    value you want but the schema will reject it if it is not unique.

    After playing with this for a while I have decided to make a major change
    to the schema (version 2).  I have created a Facility schema to maintain
    facility information (name, locaiton, map link etc.). Each meeting entry
    will now contain a link (false join) to a facility.  

    The schedule.controller code enables an index for name, meetingDate, startTime,
    endTime, and location forcing the the combinations of these five items to be 
    unique.  In other words, regardless of the _id value a meeting must be unique.

*/
var names = ["Acton Memorial Library", "Chelmsford Public Library", "Sargent Memorial Library", "Hopkinton Public Lirary"];
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

let MeetingSchema = new Schema({

    _id: { type: String, required: true },
    facility: {                                     // _id of Facility item
        type: String,
        required: true
    },
    meetingDate: { type: Date, required: true },    // Date of the meeting. Time component is always 0.
    startTime: { type: Date, required: true },      // Meeting start date and time
    endTime: { type: Date, required: true }         // Meeting end date and time

}, { autoIndex: true });

let FacilitySchema = new Schema({
    _id: {
        type: String,
        required: true,
        enum: locations
    },
    facility: {
        name: {
            type: String,
            required: true,
            enum: names
        },
        street: {
            type: String,
            required: false
        },
        town: {
            type: String,
            required: false,
            enum: locations
        },
        link: {
            type: String,
            required: false
        }
    }
    
}, { autoIndex: false });


// create an index to define a duplicate entry
// if autoIndex is true, mongoose will call sequentially each defined index 
// to create the indexes manually invoke createIndexes which will call this function.  (see createIndex call in schedule.controller)
ScheduleSchema.index({ name: 1, meetingDate: 1, startTime: 1, endTime: 1, location: 1 }, { unique: true, name: "dupEntry" });

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

module.exports = mongoose.model('Facility', FacilitySchema);