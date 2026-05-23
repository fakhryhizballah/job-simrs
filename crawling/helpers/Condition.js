/**
 * FHIR Condition / Diagnosis Constructor
 * @param {Object} config - Konfigurasi data kondisi/diagnosis pasien
 * @param {string} config.snomedCode - Kode SNOMED CT (misal: '16932000')
 * @param {string} config.snomedDisplay - Teks display SNOMED CT (misal: 'Batuk darah')
 * @param {string} config.patientId - ID Pasien dari SatuSehat
 * @param {string} config.patientName - Nama Pasien
 * @param {string} config.encounterId - UUID Encounter
 * @param {string} config.practitionerId - ID Praktisi / Dokter (Recorder)
 * @param {string} config.practitionerName - Nama Praktisi / Dokter
 * @param {string} [config.onsetDateTime] - Waktu mulai gejala (Format ISO, default: waktu recorded)
 * @param {string} [config.recordedDate] - Waktu rekam medis dibuat (Format ISO, default: sekarang)
 * @param {string} [config.noteText] - Catatan klinis tambahan (misal: 'Batuk Berdarah sejak 3bl yll')
 */
function ClinicalCondition(config = {}) {
    const nowIsoStr = new Date().toISOString();
    const recorded = config.recordedDate || nowIsoStr;

    this.resourceType = "Condition";

    this.clinicalStatus = {
        coding: [
            {
                system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                code: "active",
                display: "Active"
            }
        ]
    };

    this.category = [
        {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/condition-category",
                    code: "problem-list-item",
                    display: "Problem List Item"
                }
            ]
        }
    ];

    this.code = {
        coding: [
            {
                system: "http://snomed.info/sct",
                code: config.snomedCode || "",
                display: config.snomedDisplay || ""
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

    this.onsetDateTime = config.onsetDateTime || recorded;
    this.recordedDate = recorded;

    this.recorder = {
        reference: `Practitioner/${config.practitionerId || ''}`,
        display: config.practitionerName || ''
    };

    // Hanya buat array note jika ada teks catatan yang dikirim
    if (config.noteText) {
        this.note = [
            {
                text: config.noteText
            }
        ];
    }
}

module.exports = ClinicalCondition;