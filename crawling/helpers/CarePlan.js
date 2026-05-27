/**
 * FHIR CarePlan Constructor
 * @param {Object} config - Konfigurasi data rencana perawatan (CarePlan)
 * @param {string} [config.title] - Judul rencana perawatan (default: 'Instruksi Medik dan Keperawatan Pasien')
 * @param {string} [config.description] - Deskripsi detail penanganan (misal: 'Penanganan TB Pasien...')
 * @param {string} [config.snomedCode] - Kode kategori SNOMED CT (default: '736271009' - Outpatient care plan)
 * @param {string} [config.snomedDisplay] - Display kategori SNOMED CT (default: 'Outpatient care plan')
 * @param {string} config.patientId - ID Pasien dari SatuSehat
 * @param {string} config.patientName - Nama Pasien
 * @param {string} config.encounterId - UUID Encounter
 * @param {string} config.practitionerId - ID Praktisi / Dokter (Author)
 * @param {string} [config.createdDate] - Waktu pembuatan rencana (Format ISO, default: sekarang)
 */
function ClinicalCarePlan(config = {}) {
    const nowIsoStr = new Date().toISOString();

    this.resourceType = "CarePlan";
    this.title = config.title || "Instruksi Medik dan Keperawatan Pasien";
    this.status = "active";
    this.intent = "plan";

    this.category = [
        {
            coding: [
                {
                    system: "http://snomed.info/sct",
                    code: config.snomedCode || "736271009",
                    display: config.snomedDisplay || "Outpatient care plan"
                }
            ]
        }
    ];

    this.description = config.description || "";

    this.subject = {
        reference: `Patient/${config.patientId || ''}`,
        display: config.patientName || ''
    };

    this.encounter = {
        reference: `Encounter/${config.encounterId || ''}`,
        display: config.encounterDisplay || ''
    };

    this.created = config.createdDate || nowIsoStr;

    this.author = {
        reference: `Practitioner/${config.practitionerId || ''}`
    };
}

module.exports = { ClinicalCarePlan };