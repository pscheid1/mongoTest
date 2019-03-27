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

    //http://localhost:7010/schedules/create?id=xx&name=Box%20Lib&startTime=13:00&endTime=17:30&location=Boxborough&date=2019-03-27

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
        console.log("result: " + result);
        Schedule.create(schedule)
            .then(newSchedule => res.json(newSchedule + result))
            .catch(err => res.status(422).json(err));
    },

    update: function (req, res) {
        console.log("22222222");
        Schedule.findByIdAndUpdate({ '_id': req.query._id }, req.body)
            .then(schedule => res.json(schedule))
            .catch(err => res.status(422).json(err));
    },

    findAll: function (req, res) {
        console.log("33333333333");
        // console.log("url: " + req.url);
        // console.log("query: " + req.query.id + " - " + req.query.location);
        // Schedule.find({'location':req.query.location})
        Schedule.find({})
            .then(schedules => res.json(schedules))
            .catch(err => res.status(422).json(err.message));
    },

    findOne: function (req, res) {
        console.log("44444444444");
        Schedule.findById(req.query._id)
            .then(schedule => res.json(schedule))
            .catch(err => res.status(422).json(err));
    },

    delete: function (req, res) {
        console.log("55555555555");
        Schedule.findByIdAndDelete(req.query._id)
            // .then(schedule => schedule.remove())
            .then(schedule => res.json(schedule + ": deleted"))
            .catch(err => res.status(422).json(err));
    },

    //Simple version, without validation or sanitation
    test: function (req, res) {

        res.send('globalRoot: ' + global.Root + ' - folders: ' + global.Folders + ' - packageName: ' + global.PackageName + ' - __dirname: ' + __dirname);
    }

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


