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

    //http://localhost:7010/schedules/create?_id=xx&name=Box%20Lib&startTime=13:00&endTime=17:30&location=Boxborough&meetingDate=2019-03-27

    // This code assumes that startTime and endTime are during the same day

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

        console.log(schedule);

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

    update: function (req, res, next) {
        /*
            Until we build the frontend code we need to get 
            the existing entry.  Once the frontend code is 
            developed, these operations can be performed there.
        */

        /*
            First we need to get the current meetingDate because any startTime and endTime changes
            will not contain a date component.  This will also server as a check for the existance
            of the account to be updated.  If we move this code to the frontend these changes will
            alread contain the date component.
        */
       let currentSchedule = new Schedule();
       console.log("currentSchedule: " + currentSchedule);
        Schedule.findOne({ '_id': req.query._id }, function (errMsg, currentSchedule) {
            if (currentSchedule === null) {
                // userId does not exist
                return next("Error: _id: " + req.query._id + " does not exist." + errMsg);
            }
            console.log("currentSchedule: " + currentSchedule);
            let changes = new Schedule();

            // check/update the current meeting name
            if (req.query.name) { changes.name = req.query.name; }

            /*  
                First we check to see if startTime and/or endTime are being
                updated. For each, if being updated we replace the schedule entry
                with with one containing the original date and the new time.
            */
            if (req.query.startTime) {
                // update the current meeting start time object
                try {
                    changes.startTime = replaceTime(currentSchedule.meetingDate, req.query.startTime);
                } catch (errMsg) {
                    return next("Error: " + errMsg);
                }
            }

            if (req.query.endTime) {
                // update the current meeting end time object
                try {
                    changes.endTime = replaceTime(currentSchedule.meetingDate, req.query.endTime);
                } catch (errMsg) {
                    return next("Error: " + errMsg);
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
                changes.meetingDate = new Date(req.query.meetingDate);

                // replace startTime date with new meetingDate
                if (changes.startTime) {
                    // if there is a new startTime, give it the new meetingDate
                    changes.startTime.setFullYear(changes.meetingDate.getFullYear(),
                        changes.meetingDate.getMonth(),
                        changes.meetingDate.getDate() + 1);
                } else {
                    // else give the old startTime the new meetingDate
                    changes.startTime =
                        currentSchedule.startTime.setFullYear(changes.meetingDate.getFullYear(),
                            changes.meetingDate.getMonth(),
                            changes.meetingDate.getDate() + 1);
                }

                // replace endTime date with new meetingDate
                if (changes.endTime) {
                    // if there is a new endTime, give it the new meetingDate
                    changes.endTime.setFullYear(changes.meetingDate.getFullYear(),
                        changes.meetingDate.getMonth(),
                        changes.meetingDate.getDate() + 1);
                } else {
                    // else give the old endTime the new meetingDate
                    changes.startTime =
                        currentSchedule.endTime.setFullYear(changes.meetingDate.getFullYear(),
                            changes.meetingDate.getMonth(),
                            changes.meetingDate.getDate() + 1);
                }
            }

            console.log("changes: " + changes);
            console.log("changes.startTime: " + changes.startTime);
            console.log("currentSchedule.endTime: " + currentSchedule.endTime);
            console.log("changes.meetingDate: " + changes.meetingDate);
            console.log("currentSchedule.meetingDate: " + currentSchedule.meetingDate);
            // ensure meeting is at least 15 minutes or greater
            if (changes.startTime && changes.endTime) {
                if ((changes.startTime.getTime() + (1000 * 60 * 15)) > changes.endTime.getTime()) {
                    return next("Error: endTime must be greater than or equal to startTime + 15 minutes.");
                }
            } else {
                if (changes.startTime) {
                    if ((changes.startTime.getTime() + (1000 * 60 * 15)) > currentSchedule.endTime.getTime()) {
                        return next("Error: endTime must be greater than or equal to startTime + 15 minutes.");
                    } else {
                        if (changes.endTime) {
                            if ((currentSchedle.startTime.getTime() + (1000 * 60 * 15)) > changes.endTime.getTime()) {
                                return next("Error: endTime must be greater than or equal to startTime + 15 minutes.");
                            }
                        }
                    }
                }
            }

            // ensure meeting start time is greater than current time
            if (changes.startTime) {
                if ((changes.startTime.getTime()) <= (new Date().getTime())) {
                    return next(schedule.startTime + " - " + new Date() + " - Error:  Meeting date and time cannot be in the past.");
                }
            }

            // check and update meeting location
            if (req.query.location) { changes.location = req.query.location; }

            Schedule.findOneAndUpdate({ "_id": req.query._id }, changes, { new: true }, function(err, schedule) {})
                .then(schedule => res.json(schedule + " : Updated."))
                .catch(err => res.status(422).json(err));
        })
    },

    findAll: function (req, res) {
        // console.log("url: " + req.url);
        // console.log("query: " + req.query.id + " - " + req.query.location);
        // Schedule.find({'location':req.query.location})
        Schedule.find({})
            .then(schedules => res.json(schedules))
            .catch(err => res.status(422).json(err.message));
    },

    findOne: function (req, res) {
        Schedule.findById(req.query._id)
            .then(schedule => res.json(schedule))
            .catch(err => res.status(422).json(err));
    },

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

/*
    This helper function does the heavy lifting for the 
    schedule.update request. It returns a result string to 
    be used as the response to the request.
 
    Any errors result in a "throw" and will be caught
    in the calling function.
    Parameters:
        schedule    = a Schedule instantiation of the current document.
        req         = the request object submitted for the update.
*/
let updateSchedule = function (schedule, req) {

    if (false) {
        throw "Test error message from updateSchedule";
    }

    console.log("0: " + schedule);

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
            throw "Error: " + errMsg;
        }
    }

    if (req.query.endTime) {
        // update the current meeting end time object
        try {
            schedule.endTime = replaceTime(schedule.meetingDate, req.query.endTime);
        } catch (errMsg) {
            throw "Error: " + errMsg;
        }
    }

    /*
        Next we check to see if the meeting date is being updated. If true,
        we then update the schedule values for startTime and endTime with the 
        new meetingDate keeping their current time entry.  
    */
    // meetingDate should always have a 0 time component
    if (req.query.date) {
        // update the current meeting date object
        schedule.meetingDate = new Date(req.query.date);

        // replace startTime date with new meetingDate
        schedule.startTime.setFullYear(schedule.meetingDate.getFullYear(), schedule.meetingDate.getMonth(), schedule.meetingDate.getDate() + 1);

        // replace endTime date with new meetingDate
        schedule.endTime.setFullYear(schedule.meetingDate.getFullYear(), schedule.meetingDate.getMonth(), schedule.meetingDate.getDate() + 1);
    }

    // ensure meeting is at least 15 minutes or greater
    if ((schedule.startTime.getTime() + (1000 * 60 * 15)) > schedule.endTime.getTime()) {
        throw "Error: endTime must be greater than or equal to startTime + 15 minutes.";
    }

    // ensure meeting start time is greater than current time
    if ((schedule.startTime.getTime()) <= (new Date().getTime())) {
        throw (schedule.startTime + " - " + new Date() + " - Error:  Meeting date and time cannot be in the past.");
        // throw "Error:  Meeting date and time cannot be in the past.";
    }

    // check and update meeting location
    if (req.query.location) { schedule.location = req.query.location; }
    console.log("1: " + schedule);
    // save updated meeting scheduleument
    console.log("query.meetingDate: " + req.query.meetingDate);
    // schedule.meetingDate = new Date(rec.query.meetingDate + "T00:00:00Z");
    console.log("schedule.meetingDate: " + schedule.meetingDate);
    var query = { _id: req.query._id }
    var options = { new: true };
    var update = { location: "FoxBorough" };
    console.log("2: " + schedule);
    var newValues = { $set: { "location": req.query.location, "meetingDate": req.query.meetingDate } };
    Schedule.findOneAndUpdate(
        {
            "_id": req.query._id
        },
        newValues,
        { new: true }, function (err, rslt) {
            if (err) {
                console.log(err);
                throw err;
            } else {
                console.log("3: " + rslt);
                return rslt;
            }
        }
    );
};

// {{ `${variable.getDate()}/${variable.getMonth()}/${variable.getFullYear()}` }}

exports.xxxupdate = function (req, res, next) {

    var index = req.url.indexOf('?');
    if (index < 0) {
        return next("Error: No query string found. Request: " + req.url);
    }

    // parse the update query string
    var params = parseQueryString(req.url.substr(index + 1));

    Schedule.findOne({ '_id': params.id }, function (errMsg, doc) {
        if (doc === null) {
            // userId does not exist
            return next("Error: _id: " + params.id + " does not exist." + errMsg);
        }

        // check and update the current meeting name
        if (params.name) { doc.name = params.name; }

        /*  
            First we check to see if startTime and/or endTime are being
            updated. For each, if being updated we replace the doc entry
            with with one containing the original date and the new time.
        */
        if (params.startTime) {
            // update the current meeting start time object
            try {
                doc.startTime = replaceTime(doc.meetingDate, params.startTime);
            } catch (errMsg) {
                res.send("Error: " + errMsg);
                return;
            }
        }

        if (params.endTime) {
            // update the current meeting end time object
            try {
                doc.endTime = replaceTime(doc.meetingDate, params.endTime);
            } catch (errMsg) {
                res.send("Error: " + errMsg);
                return;
            }
        }

        /*
            Next we check to see if the meeting date is being updated. If true,
            we then update the doc values for startTime and endTime with the 
            new meetingDate keeping their current time entry.  
        */
        // meetingDate should always have a 0 time component
        if (params.date) {
            // update the current meeting date object
            doc.meetingDate = params.date;

            // replace startTime date with new meetingDate
            doc.startTime.setFullYear(doc.meetingDate.getFullYear(), doc.meetingDate.getMonth(), doc.meetingDate.getDate() + 1);

            // replace endTime date with new meetingDate
            doc.endTime.setFullYear(doc.meetingDate.getFullYear(), doc.meetingDate.getMonth(), doc.meetingDate.getDate() + 1);
        }

        // ensure meeting is at least 15 minutes or greater
        if ((doc.startTime.getTime() + (1000 * 60 * 15)) > doc.endTime.getTime()) {
            return next("Error: endTime must be greater than or equal to startTime + 15 minutes.");
        }

        // ensure meeting start time is greater than current time
        if ((doc.startTime.getTime()) <= (new Date().getTime())) {
            return next(doc.startTime + " - " + new Date() + " - Error:  Meeting date and time cannot be in the past.");
            // return next("Error:  Meeting date and time cannot be in the past.");
        }

        // check and update meeting location
        if (params.location) { doc.location = params.location; }

        // save updated meeting document

        doc.save(function (errMsg) {
            if (errMsg) {
                return next("Error: " + errMsg);
            } else {
                if (doc.meetingDate.getDay() != 4) {   // month is 0 - 11
                    res.send(doc + ": updated." + "<h4 style='color:red;'> Warning: Meeting date is not a Wednesday.</h4>");
                } else {
                    res.send(doc + ": updated.");
                }
            }
        });
    });
};

exports.index = function (req, res) {
    res.send('Error: We should never get to this function. - "schedule.controller.index"');
    return;
};


