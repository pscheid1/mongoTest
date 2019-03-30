const Meeting = require('../models/meeting.model');

module.exports = {

    create: function (req, res, next) {

        let meeting = new Meeting(
            {
                "_id": req.query._id,
                "facility": req.query.facility,
                "meetingDate": new Date(req.query.meetingDate),
                "startTime": new Date(req.query.meetingDate + "T" + req.query.startTime),
                "endTime": new Date(req.query.meetingDate + "T" + req.query.endTime)
            }
        );

        Meeting.create(meeting)
            .then(newFacility => res.json(newFacility))
            .catch(err => res.status(422).json(err));
    },

    update: function (req, res, next) {

        /*
        No point in doing this until we develop the frontend.  
        The frontend will have the current record so it can
        create the startTime and endTime date + time components.
        */

        Meeting.findOne({ '_id': req.query._id }, function (errMsg, meeting) {
            if (meeting === null) {
                // userId does not exist
                return next("Error: _id: " + req.query._id + " does not exist." + errMsg);
            } else {
                return next("Not implemented yet.");
            }
        });


/*         
        let changes = "{ ";
        var inUse = false;
        if (req.query.facility) {
            changes += ` "facility" : "${req.query.facility}" `;
            inUse = true;
        }

        if (req.query.meetingDate) {
            if (inUse) { changes += ", " };
            changes += ` "meetingDate" : "${req.query.meetingDate}" `;
            inUse = true;

            // either update startTime date and time or just date
            if (req.query.startTime) {
                if (inUse) { changes += ", " };
                changes += ` "startTime" : "${req.query.startTime}" `;
                inUse = true;
            }

        } else {
            // process startTime and endTime
        }

        if (req.query.startTime) {
            if (inUse) { changes += ", " };
            changes += ` "startTime" : "${req.query.startTime}" `;
            inUse = true;
        }
        if (req.query.endTime) {
            if (inUse) { changes += ", " };
            changes += ` "endTime" : "${req.query.endTime}" `;
            inUse = true;
        }

        if (inUse) {
            changes += " }";
        } else {
            return next(`Error: Meeting.update request for _id = "${req.query._id}" contains no valid field names.`);
        }

        Meeting.findByIdAndUpdate(
            { "_id": req.query._id },
            { $set: JSON.parse(changes) },
            { new: true, runValidators: true },
            function (err, meeting) { })
            .then(meeting => res.json(meeting + " : Updated."))
            .catch(err => res.status(422).json(err.message));
 */  
    },

    // return a list of all meeting entries
    findAll: function (req, res) {
        Meeting.find({}, function (err, meeting) { })
            .then(facilities => res.json(facilities))
            .catch(err => res.status(422).json(err.message));
    },

    // return a specific meeting entry (currently by _id)
    findOne: function (req, res) {
        Meeting.findById(req.query._id, function (err, meeting) { })
            .then(meeting => res.json(meeting))
            .catch(err => res.status(422).json("Error: "));
    },

    // delete a specific entry by _id
    delete: function (req, res, next) {
        Meeting.findByIdAndDelete(req.query._id)
            .then(meeting => res.json(meeting + ": deleted"))
            .catch(err => res.status(422).json(err));
    },

    //Simple version, without validation or sanitation
    test: function (req, res) {
        res.send('globalRoot: ' + global.Root + ' - folders: ' + global.Folders + ' - packageName: ' + global.PackageName + ' - __dirname: ' + __dirname);
    }
};
