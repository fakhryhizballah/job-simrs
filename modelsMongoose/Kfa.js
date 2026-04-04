const mongoose = require('mongoose');

const kfaSchema = new mongoose.Schema({
    kode_brng: {
        type: String,
        unique: true
    }
}, { strict: false, versionKey: false });

module.exports = mongoose.model('Kfa', kfaSchema);
