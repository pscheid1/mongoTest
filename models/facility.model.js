const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var names = ["Acton Memorial Library", "Chelmsford Public Library", "Sargent Memorial Library", "Hopkinton Public Library"];
var locations = ["Acton", "Boxborough", "Chelmsford", "Hopkinton"];

let FacilitySchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    facility: {
        name: {
            type: String,
            required: true,
            enum: names
        },
        street: {
            type: String,
            required: true
        },
        // town is a duplicate of _id
        // we could eliminate this item but
        // by keeping it we allow for multiple
        // locations in the same town.
        town: {
            type: String,
            required: true,
            enum: locations
        },
        link: {
            type: String,
            required: true
        }
    }
    
}, { autoIndex: false });

// if autoIndex is true, mongoose will call sequentially each defined index 
// to create the indexes manually invoke createIndexes which will call this function.  (see createIndex call in schedule.controller)
FacilitySchema.index({ name1: 1, name2: 1, name3: 1 }, { unique: true, name: "index name" });

FacilitySchema.on('index', function (error) {
    console.log("ScheduleSchema createIndex error: " + error.message);
});

// Export the model

module.exports = mongoose.model('Facility', FacilitySchema);