const mongoose = require('mongoose');

const QuestionnaireResponseSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    resourceType: { type: String, required: true, default: 'QuestionnaireResponse' },
}, { strict: false });

module.exports = mongoose.model('Questionnaireresponse', QuestionnaireResponseSchema);
