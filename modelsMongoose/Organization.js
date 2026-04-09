const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true
    },
    resourceType: {
        type: String
    }
}, { strict: false, versionKey: false });

module.exports = mongoose.model('Organization', OrganizationSchema);
