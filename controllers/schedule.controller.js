const Schedule = require('../models/schedule.model');


// parse query string
var parseQueryString = function (queryString) {
    var params = {}, queries, temp, i, l;
    // Split into key/value pairs
    queries = queryString.split("&");
    // Convert the array of strings into an object
    for (i = 0, l = queries.length; i < l; i++) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
};

// currently this function is not being used
/*
let saveCodeForNow = function (ISOdate, year, month, day) {

    var currDate = new Date();

    if (year < currDate.getFullYear()) {
        throw "Error: Function replaceDate, year cannot be in the past.";
    }

    if (month < 1 || month > 12) {
        throw "Error: Function replaceDate, month must be 1 through 12.";
    }

    // adjust month to 0 through 11
    --month;

    switch (month) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
            if (day > 31) {
                throw "Error: Function replaceDate, Invalid day for given month ( > 31).";
            };
            break;
        case 2:
            if (((year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0)) && day > 29) {
                throw "Error: Function replaceDate, Invalid day for given month ( > 29.";
            } else if (day > 28) {
                throw "Error: Function replaceDate, Invalid day for given month ( > 28).";
            };
            break;
        default:
            if (day > 30) {
                throw "Error: Function replaceDate, Invalid day for given month ( > 30).";
            };
            break;
    }

    return (new Date(year, month, day, ISOdate.getHours(), ISOdate.getMinutes));

}
*/

// replace time component of ISOdate object
let replaceTime = function (ISOdate, newTime) {

    // newTime should be a string hh:mm
    if (newTime.length < 5) {
        throw "Error: Function replaceTime, Invalid newTime format.";
    }

    if (newTime.indexOf(":") !== 2) {
        throw "Error: Function replaceTime, Invalid newTime format.";
    }
    // example JSON date - 2019-03-20T18:07:19.724Z
    var jDate = ISOdate.toJSON();
    var indx = jDate.indexOf("T");
    if (indx < 0) {
        throw "Error: Function replaceTime, Invalid ISOdate format.";
    }

    return new Date(jDate.substr(0, indx + 1) + newTime + ":00.000Z");
};

module.exports = {

    // for development we have autoIndex set to true.
    // if we want to switch to manual indexing this function can be called.
    createIndexes: function (req, res) {

        // Schedule.createIndexes();
        Schedule.ensureIndexes()
            .then(res.json("Indexes created"))
            .catch(err => res.status(422).json(err));
    },

    //http://localhost:7010/schedules/create?_id=xx&name=Boxborough Library&startTime=13:00&endTime=17:30&location=Boxborough&meetingDate=2019-03-27

    // This code assumes that startTime and endTime are during the same day

    // create a new schedule entry by _id
    // meetings cannot be created earlier than the current date and time.
    // meetings cannot be created with an elapsed time less than 15 minutes.
    // if a meeting date is created that is not a Wednesday, a warning is issued.
    create: function (req, res, next) {

        /*
            We could let express create the schedule and store the document but
            then we couldn't perform the below tests.  We could put these in
            the front-end code or possibly create indexes to test for these 
            conditions but for now we'll perform the test here.
        */

        let schedule = new Schedule(
            {
                "_id": req.query._id,
                "name": req.query.name,
                "meetingDate": new Date(req.query.meetingDate),
                "startTime": new Date(req.query.meetingDate + "T" + req.query.startTime),
                "endTime": new Date(req.query.meetingDate + "T" + req.query.endTime),
                "location": req.query.location
            }
        );

        // ensure meeting start time is greater than current time
        if ((schedule.startTime.getTime()) <= (new Date().getTime())) {
            return next("Error:  Meeting date and time cannot be in the past.");
        }

        // ensure meeting is at least 15 minutes or greater
        if ((schedule.startTime.getTime() + (1000 * 60 * 15)) > schedule.endTime.getTime()) {
            return next("Error: endTime must be greater than or equal to startTime + 15 minutes.");
        }

        var result;
        if (schedule.meetingDate.getDay() !== 3) {
            result = " : created.      Warning: Meeting date is not a Wednesday.";
        } else {
            result = ": created.";
        }

        Schedule.create(schedule)
            .then(newSchedule => res.json(newSchedule + result))
            .catch(err => res.status(422).json(err));
    },

    // update any or all items in schedule entry by _id
    // meetings cannot be created earlier than the current date and time.
    // meetings cannot be created with an elapsed time less than 15 minutes.
    // if a meeting date is created that is not a Wednesday, a warning is issued.
    update: function (req, res, next) {
        /*
            Until we build the frontend code we need to get 
            the existing entry.  Once the frontend code is 
            developed, these operations can be performed there.
        */
        var index = req.url.indexOf('?');
        if (index < 0) {
            return next("Error: No query string found. Request: " + req.url);
        }

        Schedule.findOne({ '_id': req.query._id }, function (errMsg, schedule) {
            if (schedule === null) {
                // userId does not exist
                return next("Error: _id: " + req.query._id + " does not exist." + errMsg);
            }

            // check and update the current meeting name
            if (req.query.name) { schedule.name = req.query.name; }

            /*  
                First we check to see if startTime and/or endTime are being
                updated. For each, if being updated we replace the schedule entry
                with with one containing the original date and the new time.
            */
            if (req.query.startTime) {
                // update the current meeting start time object
                try {
                    schedule.startTime = replaceTime(schedule.meetingDate, req.query.startTime);
                } catch (errMsg) {
                    res.send("Error: " + errMsg);
                    return;
                }
            }

            if (req.query.endTime) {
                // update the current meeting end time object
                try {
                    schedule.endTime = replaceTime(schedule.meetingDate, req.query.endTime);
                } catch (errMsg) {
                    res.send("Error: " + errMsg);
                    return;
                }
            }

            /*
                Next we check to see if the meeting date is being updated. If true,
                we then update the schedule values for startTime and endTime with the 
                new meetingDate keeping their current time entry.  
            */
            // meetingDate should always have a 0 time component
            if (req.query.meetingDate) {
                // update the current meeting date object
                schedule.meetingDate = new Date(req.query.meetingDate);

                // replace startTime date with new meetingDate
                schedule.startTime.setFullYear(schedule.meetingDate.getFullYear(), schedule.meetingDate.getMonth(), schedule.meetingDate.getDate() + 1);

                // replace endTime date with new meetingDate
                schedule.endTime.setFullYear(schedule.meetingDate.getFullYear(), schedule.meetingDate.getMonth(), schedule.meetingDate.getDate() + 1);
            }
            console.log("new schedule: " + schedule);
            // ensure meeting is at least 15 minutes or greater
            if ((schedule.startTime.getTime() + (1000 * 60 * 15)) > schedule.endTime.getTime()) {
                return next("Error: endTime must be greater than or equal to startTime + 15 minutes.");
            }

            // ensure meeting start time is greater than current time
            if ((schedule.startTime.getTime()) <= (new Date().getTime())) {
                return next(schedule.startTime + " - " + new Date() + " - Error:  Meeting date and time cannot be in the past.");
                // return next("Error:  Meeting date and time cannot be in the past.");
            }

            // check and update meeting location
            if (req.query.location) { schedule.location = req.query.location; }

            // save updated meeting document
            var result;
            if (schedule.meetingDate.getDay() !== 3) {
                result = " : created.   <h4 style='color:red;'> Warning: Meeting date is not a Wednesday.</h4>";
            } else {
                result = ": created.";
            }

            schedule.save(function (errMsg) {
                if (errMsg) {
                    return next("Error: " + errMsg);
                } else {
                    res.send(schedule + result);
                }
            });
        });
    },

    // return a list of all schedule entries
    findAll: function (req, res) {
        Schedule.find({})
            .then(schedules => res.json(schedules))
            .catch(err => res.status(422).json(err.message));
    },

    // return a specific schedule entry (currently by _id)
    findOne: function (req, res) {
        Schedule.findById(req.query._id)
            .then(schedule => res.json(schedule))
            .catch(err => res.status(422).json(err.messageS));
    },

    // delete a specific entry by _id
    delete: function (req, res) {
        Schedule.findByIdAndDelete(req.query._id)
            .then(schedule => res.json(schedule + ": deleted"))
            .catch(err => res.status(422).json(err));
    },

    //Simple version, without validation or sanitation
    test: function (req, res) {

        res.send('globalRoot: ' + global.Root + ' - folders: ' + global.Folders + ' - packageName: ' + global.PackageName + ' - __dirname: ' + __dirname);
    }

};

exports.index = function (req, res) {
    res.send('Error: We should never get to this function. - "schedule.controller.index"');
    return;
};


