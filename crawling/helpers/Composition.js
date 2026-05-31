/**
 * FHIR Composition / Discharge Summary Constructor
 * @param {Object} config - Konfigurasi data Resume Medis
 * @param {string} config.orgId - ID Organisasi/Faskes dari SatuSehat
 * @param {string} config.compositionValue - Kode unik/nomor resume dari internal SIMRS (misal: 'P20240001')
 * @param {string} config.patientId - ID Pasien dari SatuSehat
 * @param {string} config.patientName - Nama Pasien
 * @param {string} config.encounterId - UUID Encounter
 * @param {string} config.encounterDisplay - Deskripsi teks kunjungan encounter
 * @param {string} config.practitionerId - ID Praktisi / Dokter (Author)
 * @param {string} config.practitionerName - Nama Praktisi / Dokter
 * @param {string} [config.date] - Tanggal resume (Format YYYY-MM-DD, default: hari ini)
 * @param {string} [config.dietText] - Narasi rekomendasi diet pada section discharge diet
 */
const Org_id = process.env.Organization_id_SATUSEHAT
function MedicalComposition(config = {}) {
    const todayStr = new Date().toISOString().split('T')[0];

    this.resourceType = "Composition";

    this.identifier = {
        system: `http://sys-ids.kemkes.go.id/composition/${Org_id}`,
        value: config.compositionValue || ''
    };

    this.status = "final";

    this.type = {
        coding: [
            {
                system: "http://loinc.org",
                code: "18842-5",
                display: "Discharge summary"
            }
        ]
    };

    this.category = [
        {
            coding: [
                {
                    system: "http://loinc.org",
                    code: "LP173421-1",
                    display: "Report"
                }
            ]
        }
    ];

    this.subject = {
        reference: `Patient/${config.patientId || ''}`,
        display: config.patientName || ''
    };

    this.encounter = {
        reference: `Encounter/${config.encounterId || ''}`,
        display: config.encounterDisplay || ''
    };

    this.date = config.date || todayStr;

    this.author = [
        {
            reference: `Practitioner/${config.practitionerId || ''}`,
            display: config.practitionerName || ''
        }
    ];

    this.title = "Resume Medis Gizi";

    this.custodian = {
        reference: `Organization/${Org_id || ''}`
    };

    this.section = [
        {
            code: {
                coding: [
                    {
                        system: "http://loinc.org",
                        code: "42344-2",
                        display: "Discharge diet (narrative)"
                    }
                ]
            },
            text: {
                status: "additional",
                div: config.dietText || ""
            }
        }
    ];
}

module.exports = {MedicalComposition};