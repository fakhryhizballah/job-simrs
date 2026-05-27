
function HeartRateObservation(config = {}) {
    // Definisikan default datetime jika tidak disediakan
    const todayStr = new Date().toISOString().split('T')[0];
    const nowIsoStr = new Date().toISOString();

    this.resourceType = "Observation";
    this.status = "final";

    this.category = [
        {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }
            ]
        }
    ];

    this.code = {
        coding: [
            {
                system: "http://loinc.org",
                code: "8867-4",
                display: "Heart rate"
            }
        ]
    };

    this.subject = {
        reference: `Patient/${config.patientId || ''}`,
        display: config.patientDisplay || ''
    };

    this.performer = [
        {
            reference: `Practitioner/${config.practitionerId || ''}`,
            display: config.practitionerDisplay || ''
        }
    ];

    this.encounter = {
        reference: `Encounter/${config.encounterId || ''}`,
        display: config.encounterDisplay || ''
    };

    this.effectiveDateTime = config.effectiveDate || nowIsoStr;
    this.issued = config.effectiveDate || nowIsoStr;

    this.valueQuantity = {
        value: Number(config.heartRate) || 0,
        unit: "beats/minute",
        system: "http://unitsofmeasure.org",
        code: "/min"
    };
}

function BloodPressureObservation(config = {}) {
    const nowIsoStr = new Date().toISOString();
    const type = (config.type || 'systolic').toLowerCase();

    this.resourceType = "Observation";
    this.status = "final";

    this.category = [
        {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }
            ]
        }
    ];

    // Penentuan LOINC code berdasarkan type
    if (type === 'diastolic') {
        this.code = {
            coding: [
                {
                    system: "http://loinc.org",
                    code: "8462-4",
                    display: "Diastolic blood pressure"
                }
            ]
        };
    } else {
        // Default ke Systolic jika tidak dispesifikasikan dengan benar
        this.code = {
            coding: [
                {
                    system: "http://loinc.org",
                    code: "8480-6",
                    display: "Systolic blood pressure"
                }
            ]
        };
    }

    this.subject = {
        reference: `Patient/${config.patientId || ''}`,
        display: config.patientDisplay || ''
    };

    this.encounter = {
        reference: `Encounter/${config.encounterId || ''}`,
        display: config.encounterDisplay || ''
    };

    this.effectiveDateTime = config.effectiveDate || nowIsoStr;
    this.issued = config.effectiveDate || nowIsoStr;

    this.performer = [
        {
            reference: `Practitioner/${config.practitionerId || ''}`,
            display: config.practitionerDisplay || ''
        }
    ];

    this.valueQuantity = {
        value: Number(config.value) || 0,
        unit: "mm[Hg]",
        system: "http://unitsofmeasure.org",
        code: "mm[Hg]"
    };
}

function BodyTemperatureObservation(config = {}) {
    const nowIsoStr = new Date().toISOString();

    this.resourceType = "Observation";
    this.status = "final";

    this.category = [
        {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }
            ]
        }
    ];

    this.code = {
        coding: [
            {
                system: "http://loinc.org",
                code: "8310-5",
                display: "Body temperature"
            }
        ]
    };

    this.subject = {
        reference: `Patient/${config.patientId || ''}`,
        display: config.patientDisplay || ''
    };

    this.encounter = {
        reference: `Encounter/${config.encounterId || ''}`
    };

    this.effectiveDateTime = config.effectiveDate || nowIsoStr;
    this.issued = config.effectiveDate || nowIsoStr;

    this.performer = [
        {
            reference: `Practitioner/${config.practitionerId || ''}`,
            display: config.practitionerDisplay || ''
        }
    ];

    this.valueQuantity = {
        value: Number(config.temperature) || 0,
        unit: "Cel",
        system: "http://unitsofmeasure.org",
        code: "Cel"
    };
}

function RespiratoryRateObservation(config = {}) {
    const nowIsoStr = new Date().toISOString();

    this.resourceType = "Observation";
    this.status = "final";

    this.category = [
        {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }
            ]
        }
    ];

    this.code = {
        coding: [
            {
                system: "http://loinc.org",
                code: "9279-1",
                display: "Respiratory rate"
            }
        ]
    };

    this.subject = {
        reference: `Patient/${config.patientId || ''}`,
        display: config.patientDisplay || ''
    };

    this.encounter = {
        reference: `Encounter/${config.encounterId || ''}`
    };

    this.effectiveDateTime = config.effectiveDate || nowIsoStr;
    this.issued = config.effectiveDate || nowIsoStr;

    this.performer = [
        {
            reference: `Practitioner/${config.practitionerId || ''}`,
            display: config.practitionerDisplay || ''
        }
    ];

    this.valueQuantity = {
        value: Number(config.respiratoryRate) || 0,
        unit: "breaths/min",
        system: "http://unitsofmeasure.org",
        code: "/min"
    };
}
function BodyWeightObservation(config = {}) {
    const nowIsoStr = new Date().toISOString();

    this.resourceType = "Observation";
    this.status = "final";

    this.category = [
        {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }
            ]
        }
    ];

    this.code = {
        coding: [
            {
                system: "http://loinc.org",
                code: "29463-7",
                display: "Body weight"
            }
        ]
    };

    this.subject = {
        reference: `Patient/${config.patientId || ''}`,
        display: config.patientDisplay || ''
    };

    this.encounter = {
        reference: `Encounter/${config.encounterId || ''}`
    };

    this.effectiveDateTime = config.effectiveDate || nowIsoStr;
    this.issued = config.effectiveDate || nowIsoStr;

    this.performer = [
        {
            reference: `Practitioner/${config.practitionerId || ''}`,
            display: config.practitionerDisplay || ''
        }
    ];

    this.valueQuantity = {
        value: Number(config.weight) || 0,
        unit: "kg",
        system: "http://unitsofmeasure.org",
        code: "kg"
    };
}
function OxygenSaturationObservation(config = {}) {
    const nowIsoStr = new Date().toISOString();

    this.resourceType = "Observation";
    this.status = "final";

    this.category = [
        {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs"
                }
            ]
        }
    ];

    this.code = {
        coding: [
            {
                system: "http://loinc.org",
                code: "2708-6",
                display: "Oxygen saturation in Arterial blood by Pulse oximetry"
            }
        ]
    };

    this.subject = {
        reference: `Patient/${config.patientId || ''}`,
        display: config.patientName || ''
    };

    this.encounter = {
        reference: `Encounter/${config.encounterId || ''}`
    };

    this.effectiveDateTime = config.effectiveDate || nowIsoStr;
    this.issued = config.effectiveDate || nowIsoStr;

    this.performer = [
        {
            reference: `Practitioner/${config.practitionerId || ''}`,
            display: config.practitionerName || ''
        }
    ];

    this.valueQuantity = {
        value: Number(config.spo2) || 0,
        unit: "%",
        system: "http://unitsofmeasure.org",
        code: "%"
    };
}
// Export menggunakan pola CommonJS
module.exports = { 
    HeartRateObservation, 
    BloodPressureObservation,
    BodyTemperatureObservation,
    RespiratoryRateObservation,
    BodyWeightObservation,
    OxygenSaturationObservation
};