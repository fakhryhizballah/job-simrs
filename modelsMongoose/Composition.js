const mongoose = require('mongoose');

const compositionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    resourceType: { type: String, required: true, default: 'Composition' },
}, { strict: false });

module.exports = mongoose.model('Composition', compositionSchema);
