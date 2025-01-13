const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
    category: [
        {
            coding: [
                {
                    code: { type: String, required: true },
                    display: { type: String, required: true },
                    system: { type: String, required: true }
                }
            ]
        }
    ],
    clinicalStatus: {
        coding: [
            {
                code: { type: String, required: true },
                display: { type: String, required: true },
                system: { type: String, required: true }
            }
        ]
    },
    code: {
        coding: [
            {
                code: { type: String, required: true },
                display: { type: String, required: true },
                system: { type: String, required: true }
            }
        ]
    },
    encounter: {
        display: { type: String, required: true },
        reference: { type: String, required: true }
    },
    id: { type: String, required: true, unique: true },
    meta: {
        lastUpdated: { type: Date, required: true },
        versionId: { type: String, required: true }
    },
    resourceType: { type: String, required: true, default: 'Condition' },
    subject: {
        display: { type: String, required: true },
        reference: { type: String, required: true }
    }
});

module.exports = mongoose.model('Condition', conditionSchema);
