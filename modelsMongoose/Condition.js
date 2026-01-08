const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    resourceType: { type: String, required: true, default: 'Condition' },
}, { strict: false });

module.exports = mongoose.model('Condition', conditionSchema);
