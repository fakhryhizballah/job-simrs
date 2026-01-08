const mongoose = require('mongoose');
const PatientSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true
    },
    resourceType: {
        type: String
    }
}, { strict: false, timestamps: true });
module.exports = mongoose.model('Patient', PatientSchema);