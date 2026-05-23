const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    resourceType: { type: String, required: true, default: 'Observation' },
}, { strict: false });

module.exports = mongoose.model('Observation', observationSchema);
