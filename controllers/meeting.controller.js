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

    let changes = "{ ";
    var inUse = false;
    if (req.query.name) {
        changes +=  ` "meeting.name" : "${req.query.name}" `;
        inUse = true;
    }

    if (req.query.street) {
        if (inUse) {changes += ", "};
        changes +=  ` "meeting.street" : "${req.query.street}" `;
        inUse = true;
    }

    if (req.query.town) {
        if (inUse) {changes += ", "};
        changes +=  ` "meeting.town" : "${req.query.town}" `;
        inUse = true;
    }
    if (req.query.link) {
        if (inUse) {changes += ", "};
        changes +=  ` "meeting.link" : "${req.query.link}" `;
        inUse = true;
    }
    
    if (inUse){
        changes += " }";
    } else {
        return next(`Error: Meeting.update request for _id = "${req.query._id}" contains no valid field names.`);
    }

    Meeting.findByIdAndUpdate(
        { "_id": req.query._id }, 
        {$set: JSON.parse(changes)},
        { new: true, runValidators: true }, 
        function(err, meeting) {})
        .then(meeting => res.json(meeting + " : Updated."))
        .catch(err => res.status(422).json(err.message));
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
