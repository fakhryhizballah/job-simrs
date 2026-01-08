const mongoose = require('mongoose');
const PractitionerSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true
    },
    resourceType: {
        type: String
    }
}, { strict: false, timestamps: true });
module.exports = mongoose.model('Practitioner', PractitionerSchema);