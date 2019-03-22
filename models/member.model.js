const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let MemberSchema = new Schema({
    userId: {type: String, required: true},
    firstName: {type: String, required: true},
    middleName: {type: String, required: false},
    lastName: {type: String, required: true},
    eMail: {type: String, required: true}
// }, { collection: 'members'});
});

// Export the model
module.exports = mongoose.model('Member', MemberSchema);