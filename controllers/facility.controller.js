const Facility = require('../models/facility.model');

module.exports = {

    create: function (req, res, next) {

        let facility = new Facility(
            {
                "_id": req.query._id,
                "facility.name": req.query.name,
                "facility.street": req.query.street,
                "facility.town": req.query.town,
                "facility.link": req.query.link
            }
        );

        Facility.create(facility)
            .then(newFacility => res.json(newFacility))
            .catch(err => res.status(422).json(err));
    },

update: function (req, res, next) {

    let changes = "{ ";
    var inUse = false;
    if (req.query.name) {
        changes +=  ` "facility.name" : "${req.query.name}" `;
        inUse = true;
    }

    if (req.query.street) {
        if (inUse) {changes += ", "};
        changes +=  ` "facility.street" : "${req.query.street}" `;
        inUse = true;
    }

    if (req.query.town) {
        if (inUse) {changes += ", "};
        changes +=  ` "facility.town" : "${req.query.town}" `;
        inUse = true;
    }
    if (req.query.link) {
        if (inUse) {changes += ", "};
        changes +=  ` "facility.link" : "${req.query.link}" `;
        inUse = true;
    }
    
    if (inUse){
        changes += " }";
    } else {
        return next(`Error: Facility.update request for _id = "${req.query._id}" contains no valid field names.`);
    }

    Facility.findByIdAndUpdate(
        { "_id": req.query._id }, 
        {$set: JSON.parse(changes)},
        { new: true, runValidators: true }, 
        function(err, facility) {})
        .then(facility => res.json(facility + " : Updated."))
        .catch(err => res.status(422).json(err.message));
    },

    // return a list of all facility entries
    findAll: function (req, res) {
        Facility.find({}, function (err, facility) { })
            .then(facilities => res.json(facilities))
            .catch(err => res.status(422).json(err.message));
    },

    // return a specific facility entry (currently by _id)
    findOne: function (req, res) {
        Facility.findById(req.query._id, function (err, facility) { })
            .then(facility => res.json(facility))
            .catch(err => res.status(422).json("Error: "));
    },

    // delete a specific entry by _id
    delete: function (req, res, next) {
        Facility.findByIdAndDelete(req.query._id)
            .then(facility => res.json(facility + ": deleted"))
            .catch(err => res.status(422).json(err));
    },

    //Simple version, without validation or sanitation
    test: function (req, res) {
        res.send('globalRoot: ' + global.Root + ' - folders: ' + global.Folders + ' - packageName: ' + global.PackageName + ' - __dirname: ' + __dirname);
    }
};
