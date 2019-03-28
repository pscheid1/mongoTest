const Facility = require('../models/facility.model');

module.exports = {

    create: function (req, res, next) {

        /*
            We could let express create the schedule and store the document but
            then we couldn't perform the below tests.  We could put these in
            the front-end code or possibly create indexes to test for these 
            conditions but for now we'll perform the test here.
        */

        let facility = new Facility(
            {
                "_id": req.query._id,
                "facility.name": req.query.name,
                "facility.town": req.query.town
            }
        );

        Facility.create(facility)
            .then(newFacility => res.json(newFacility))
            .catch(err => res.status(422).json(err));
    },


    // return a list of all schedule entries
    findAll: function (req, res) {
        Facility.find({})
            .then(facilities => res.json(facilities))
            .catch(err => res.status(422).json(err.message));
    },

    // return a specific schedule entry (currently by _id)
    findOne: function (req, res) {
        Facility.findById(req.query._id)
            .then(facility => res.json(facility))
            .catch(err => res.status(422).json(err));
    },

    // delete a specific entry by _id
    delete: function (req, res) {
        Facility.findByIdAndDelete(req.query._id)
            .then(facility => res.json(facility + ": deleted"))
            .catch(err => res.status(422).json(err));
    },

    //Simple version, without validation or sanitation
    test: function (req, res) {

        res.send('globalRoot: ' + global.Root + ' - folders: ' + global.Folders + ' - packageName: ' + global.PackageName + ' - __dirname: ' + __dirname);
    }

};
