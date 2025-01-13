const mongoose = require('mongoose');

const encounterSchema = new mongoose.Schema({
    class: {
        code: { type: String, required: true },
        display: { type: String, required: true },
        system: { type: String, required: true }
    },
    id: { type: String, required: true, unique: true },
    identifier: [
        {
            system: { type: String, required: true },
            value: { type: String, required: true }
        }
    ],
    location: [
        {
            location: {
                display: { type: String, required: true },
                reference: { type: String, required: true }
            }
        }
    ],
    meta: {
        lastUpdated: { type: Date, required: true },
        versionId: { type: String, required: true }
    },
    participant: [
        {
            individual: {
                display: { type: String, required: true },
                reference: { type: String, required: true }
            },
            type: [
                {
                    coding: [
                        {
                            code: { type: String, required: true },
                            display: { type: String, required: true },
                            system: { type: String, required: true }
                        }
                    ]
                }
            ]
        }
    ],
    period: {
        start: { type: Date, required: true }
    },
    resourceType: { type: String, required: true },
    serviceProvider: {
        reference: { type: String, required: true }
    },
    status: { type: String, required: true },
    statusHistory: [
        {
            period: {
                start: { type: Date, required: true }
            },
            status: { type: String, required: true }
        }
    ],
    subject: {
        display: { type: String, required: true },
        reference: { type: String, required: true }
    }
}, { timestamps: true });

module.exports = mongoose.model('Encounter', encounterSchema);
