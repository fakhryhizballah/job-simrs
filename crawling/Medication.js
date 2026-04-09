require('dotenv').config()
const mongoose = require('mongoose');
const Practitioner = require("../modelsMongoose/Practitioner");
const Patient = require("../modelsMongoose/Patient");
const Encounter = require("../modelsMongoose/Encounter");
const KFA = require("../modelsMongoose/Kfa");
const Medication = require("../modelsMongoose/Medication");
const MedicationRequest = require("../modelsMongoose/MedicationRequest");
const Condition = require("../modelsMongoose/Condition");
const { resep_obat, resep_luar, resep_dokter, databarang, resep_dokter_racikan, satu_sehat_encounter, satu_sehat_mapping_lokasi_ralan, satu_sehat_mapping_lokasi_ranap, resume_pasien_ranap, bangsal, poliklinik, reg_periksa, kamar_inap, kamar, pasien, kelurahan, kecamatan, kabupaten, propinsi, pegawai, referensi_mobilejkn_bpjs_taskid, diagnosa_pasien, penyakit } = require("../models");
const { Op } = require("sequelize");
const { getPesertabyKatu } = require("../hooks/bpjs");
const { fetchSatusehat, fetchKFH } = require("../hooks/satusehat");
const { findBestMatchKFA } = require("../helpers/");
const Org_id = process.env.Organization_id_SATUSEHAT

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Terhubung ke MongoDB!'))
    .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

async function kodeObat(kode_brng) {
    let dataMedication = await Medication.findOne({ 'identifier.value': kode_brng });
    if (dataMedication) {
        return dataMedication
    }
    let cekKFA = await KFA.findOne({ 'kode_brng': kode_brng });
    if (cekKFA) {
        let dataObat = {
            resourceType: "Medication",
            meta: {
                profile: ["https://fhir.kemkes.go.id/r4/StructureDefinition/Medication"]
            },
            identifier: [
                {
                    system: "http://sys-ids.kemkes.go.id/medication/" + Org_id,
                    use: "official",
                    value: cekKFA.kode_brng
                }
            ],
            code: {
                coding: [
                    {
                        system: "http://sys-ids.kemkes.go.id/kfa",
                        code: cekKFA.dataKFA.code,
                        display: cekKFA.dataKFA.display
                    }
                ]
            },
            form: {
                coding: [
                    {
                        system: "http://terminology.kemkes.go.id/CodeSystem/medication-form",
                        code: cekKFA.form_system.code,
                        display: cekKFA.form_system.display
                    }
                ]
            },
            ingredient: cekKFA.active_ingredients.filter(y => y.active !== null).map(y => {
                return {
                    isActive: true,
                    itemCodeableConcept: {
                        coding: [
                            {
                                code: y.kfa_code,
                                display: y.zat_aktif,
                                system: "http://sys-ids.kemkes.go.id/kfa"
                            }
                        ]
                    }
                }
            }),
            extension: [
                {
                    url: "https://fhir.kemkes.go.id/r4/StructureDefinition/MedicationType",
                    valueCodeableConcept: {
                        coding: [
                            {
                                system: "http://terminology.kemkes.go.id/CodeSystem/medication-type",
                                code: "NC",
                                display: "Non-compound"
                            }
                        ]
                    }
                }
            ]
        }
        let kirimMedication = await fetchSatusehat("POST", 'Medication', dataObat);
        if (kirimMedication.id) {
            await Medication.create(kirimMedication);
            return kirimMedication;
        }
        return null;
    }
    let cariDataBarang = await databarang.findOne({ where: { kode_brng: kode_brng } });
    if (cariDataBarang) {
        let findKFA = await fetchKFH(cariDataBarang.nama_brng);
        let bestMatch = null;
        if (findKFA && findKFA.items && findKFA.items.data) {
            bestMatch = findBestMatchKFA(cariDataBarang.nama_brng, findKFA.items.data);
        }
        if (!bestMatch) return null;

        let dataKFA = {
            kode_brng: cariDataBarang.kode_brng,
            nama_brng: cariDataBarang.nama_brng,
            kode_sat: cariDataBarang.kode_sat,
            letak_barang: cariDataBarang.letak_barang,
            dataKFA: {
                code: bestMatch.kfa_code,
                system: "http://sys-ids.kemkes.go.id/kfa",
                display: bestMatch.name
            },
            form_system: {
                code: bestMatch.dosage_form.code,
                system: "http://terminology.kemkes.go.id/CodeSystem/medication-form",
                display: bestMatch.dosage_form.name
            },
            active_ingredients: bestMatch.active_ingredients
        }
        await KFA.create(dataKFA);
        return await kodeObat(kode_brng);
    }
    return null;
}

async function kirimMedicationRequest(date) {
    let dateFormatted = date.split("-").join("/").replace(/-/g, "/");
    console.log("Processing Date/No Rawat:", dateFormatted);
    const encounters = await Encounter.find({
        'identifier.value': { $regex: new RegExp(`^${dateFormatted}`) },
    });

    for (let x of encounters) {
        // Find no_rawat from encounter identifier
        let no_rawat_id = x.identifier.find(id => id.system.includes('encounter'));
        if (!no_rawat_id) continue;
        let no_rawat = no_rawat_id.value;

        // Note: Using resep_dokters as pluralized by default associate, 
        // fallback to resep_dokter if needed.
        let dataResepObat = await resep_obat.findAll({
            where: { no_rawat: no_rawat },
            include: [{
                model: resep_dokter,
                include: [{
                    model: databarang,
                    attributes: ['kode_brng', 'nama_brng', 'kode_sat']
                }]
            }]
        });

        if (dataResepObat.length === 0) {
            console.log("No prescription found for:", no_rawat);
            continue;
        }
        let isExist = await MedicationRequest.findOne({ 'identifier.value': dataResepObat[0].no_resep });
        if (isExist) {
            console.log("MedicationRequest already exists for:", no_rawat, dataResepObat[0].no_resep);
            continue;
        }
        let subject = await Patient.findOne({ id: x.subject.reference.split("/")[1] });
        if (!subject) {
            console.log("Patient not found for:", no_rawat);
            continue;
        }
        let practitioner = await Practitioner.findOne({ 'identifier.value': dataResepObat[0].kd_dokter });
        if (!practitioner) {
            console.log("Practitioner not found for:", no_rawat);
            continue;
        }




        for (let y of dataResepObat) {
            let itemSeq = 1;
            let medicalCategoryCode = y.status === 'ranap' ? 'inpatient' : 'outpatient';
            // Using || y.resep_dokter for safety
            let items = y.resep_dokters || y.resep_dokter || [];

            for (let z of items) {
                let medicationRes = await kodeObat(z.databarang.kode_brng);
                if (!medicationRes) {
                    console.log("Medication not found/created for:", z.databarang.nama_brng);
                    continue;
                }

                // Simple dosage parsing from aturan_pakai
                let frequency = 1, period = 1, doseValue = 1;
                let matches = (z.aturan_pakai || "").match(/(\d+)\s*x\s*(\d+)/i);
                if (matches) {
                    frequency = parseInt(matches[1]);
                    doseValue = parseInt(matches[2]);
                }

                let dataMedicationRequest = {
                    resourceType: "MedicationRequest",
                    meta: {
                        profile: ["https://fhir.kemkes.go.id/r4/StructureDefinition/MedicationRequest"]
                    },
                    identifier: [
                        {
                            system: "http://sys-ids.kemkes.go.id/prescription/" + Org_id,
                            use: "official",
                            value: y.no_resep
                        },
                        {
                            system: "http://sys-ids.kemkes.go.id/prescription-item/" + Org_id,
                            use: "official",
                            value: y.no_resep + "-" + itemSeq
                        }
                    ],
                    status: "completed",
                    intent: "order",
                    category: [{
                        coding: [{
                            system: "http://terminology.hl7.org/CodeSystem/medicationrequest-category",
                            code: medicalCategoryCode,
                            display: medicalCategoryCode.charAt(0).toUpperCase() + medicalCategoryCode.slice(1)
                        }]
                    }],
                    priority: "routine",
                    medicationReference: {
                        reference: "Medication/" + medicationRes.id,
                        display: medicationRes.code.coding[0].display
                    },
                    subject: {
                        reference: "Patient/" + subject.id,
                        display: subject.name[0].text
                    },
                    encounter: {
                        reference: "Encounter/" + x.id,
                        display: no_rawat
                    },
                    authoredOn: y.tgl_peresepan + "T" + y.jam_peresepan + "+07:00",
                    requester: {
                        reference: "Practitioner/" + practitioner.id,
                        display: practitioner.name[0].text
                    },
                    dosageInstruction: [{
                        sequence: 1,
                        patientInstruction: z.aturan_pakai,
                        timing: {
                            repeat: {
                                frequency: frequency,
                                period: period,
                                periodUnit: "d"
                            }
                        }

                    }]
                };
                console.log(JSON.stringify(dataMedicationRequest, null, 2));
                let kirimMedreq = await fetchSatusehat("POST", "MedicationRequest", dataMedicationRequest);
                if (kirimMedreq.id) {
                    await MedicationRequest.create(kirimMedreq);
                    console.log("SUCCESS:", kirimMedreq.id);
                } else {
                    console.error("FAILED for:", z.databarang.nama_brng, JSON.stringify(kirimMedreq.response || kirimMedreq, null, 2));
                }

                itemSeq++;

            }
        }
    }
}

// Example usage:
// kirimMedicationRequest('2023-08-31');
// kirimMedicationRequest('2023/08/14/000189');

