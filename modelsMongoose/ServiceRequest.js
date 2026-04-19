const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    resourceType: { type: String, required: true, default: 'ServiceRequest' },
}, { strict: false });

module.exports = mongoose.model('Servicerequest', ServiceRequestSchema);
