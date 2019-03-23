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

// replace date component of oldDate object keeping its time component
let replaceDate = function (oldDate, newDate) {

    var newDateOldTime = new Date(
        newDate.getFullYear(),
        newDate.getMonth() - 1, // change month to 0 through 11
        newDate.getDay(),
        oldDate.getHours(),
        oldDate.getMinutes());

    return newDateOldTime;


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
        throw "Error: Function replaceTime, Invalid date format.";
    }

    // jDate = jDate.substr(0, indx +1) + newTime + ":00.000Z";

    return new Date(jDate.substr(0, indx + 1) + newTime + ":00.000Z");
};

//http://localhost:7010/schedule/create?name=Box%20Lib&startTime=13:00&endTime=17:30&location=Boxborough&date=2019-03-27

// This code assumes that startTime and endTime are during the same day
exports.create = function (req, res, next) {

    var index = req.url.indexOf('?');
    if (index < 0) {
        return next("No query string found.");
    }

    var params = parseQueryString(req.url.substr(index + 1));

    let schedule = new Schedule(
        {
            "_id": params.id,
            "name": params.name,
            "meetingDate": new Date(params.date),
            "startTime": new Date(params.date + "T" + params.startTime),
            "endTime": new Date(params.date + "T" + params.endTime),
            "location": params.location
        }
    );

    if ((schedule.startTime.getTime() + (1000 * 60 * 15)) > schedule.endTime.getTime()) {
        return next("Error: endTime must be greater than or equal to startTime + 15 minutes.");
    }

    // console.log(schedule);

    schedule.save(function (errMsg) {
        if (errMsg) {
            // var indx = errMsg.toString().indexOf('id');
            // res.send(errMsg.toString().substring(0, indx + 1));
            // console.log("indx: " + indx + " - errMsg: " + errMsg);
            return next (errMsg);
        } else {
            res.send(schedule + ": created.");
        }
    });
};

exports.find = function (req, res, next) {
    var index = req.url.indexOf('?');
    if (index < 0) {
        return next("No query string found.");
    }
    var params = parseQueryString(req.url.substr(index + 1));

    Schedule.findOne({ '_id': params.id }, function (err, doc) {
        if (doc !== null) {
            res.send(doc);
        }
        else // userId does not exists
        {
            return next("Error: UserId: " + params.id + " does not exist.");
        }
    });
};

exports.update = function (req, res, next) {

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

        // meetingDate should always have a 0 time component
        if (params.date) {
            // update the current meeting date object
            doc.meetingDate = params.date;

            // because meetingDate has been changed, date component of startTime and endTime must be changed

            // get new date for startTime
            try {
                // replace date portion of startTime object with new meeting date
                doc.startTime = replaceDate(doc.startTime, doc.meetingDate);
            } catch (errMsg) {
                res.send("Error: " + errMsg);
                return;
            }

            // get new date for endTime
            try {
                // replace date potion of endTime object with new meeting date
                doc.endTime = replaceDate(doc.endTime, doc.meetingDate);
            } catch (errMsg) {
                res.send("Error: " + errMsg);
                return;
            }
        }

        if ((doc.startTime.getTime() + (1000 * 60 * 15)) > doc.endTime.getTime()) {
            return next("Error: endTime must be greater than or equal to startTime + 15 minutes.");
        }    

        // check and update meeting location
        if (params.location) { doc.location = params.location; }

        // save updated meeting document
        doc.save(function (errMsg) {
            if (errMsg) {
                return next("Error: " + errMsg);
            }
            else {
                res.send(doc + ": updated.");
            }
        });
    });
};

exports.delete = function (req, res, next) {
    var index = req.url.indexOf('?');
    if (index < 0) {
        return next("No query string found.");
    }
    var params = parseQueryString(req.url.substr(index + 1));

    Schedule.findOne({ '_id': params.id }, function (errMsg, doc) {
        if (doc !== null) {
            doc.remove();
            res.send(doc + ": removed.");
        }
        else // userId does not exists
        {
            return next("Error: _id: " + params.id + " does not exist.");
        }
    });
};

exports.list = function (req, res, next) {
    Schedule.find({}, function (errMsg, docs) {
        if (errMsg || docs == null) {
            return next(errMsg);
        } else {
            res.send(docs);
        }
    });
};

exports.index = function (req, res) {
    res.send('Error: We should never get to this function. - "schedule.controller.index"');
    return;
};

//Simple version, without validation or sanitation
exports.test = function (req, res) {

    // res.send('Greetings from the member controller!');
    // res.sendFile(__dirname + '/index.html');
    res.send('globalRoot: ' + global.Root + ' - folders: ' + global.Folders + ' - packageName: ' + global.PackageName + ' - __dirname: ' + __dirname);
};


