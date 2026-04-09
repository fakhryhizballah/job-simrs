const mongoose = require('mongoose');

const procedureSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    resourceType: { type: String, required: true, default: 'Procedure' },
}, { strict: false });

module.exports = mongoose.model('Procedure', procedureSchema);
