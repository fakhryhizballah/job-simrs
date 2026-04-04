require('dotenv').config()
const mongoose = require('mongoose');
const Practitioner = require("../modelsMongoose/Practitioner");
const Patient = require("../modelsMongoose/Patient");
const Encounter = require("../modelsMongoose/Encounter");
const KFA = require("../modelsMongoose/Kfa");
const Medication = require("../modelsMongoose/Medication");
const { resep_obat, resep_luar, resep_dokter, databarang, resep_dokter_racikan, satu_sehat_encounter, satu_sehat_mapping_lokasi_ralan, satu_sehat_mapping_lokasi_ranap, resume_pasien_ranap, bangsal, poliklinik, reg_periksa, kamar_inap, kamar, pasien, kelurahan, kecamatan, kabupaten, propinsi, pegawai, referensi_mobilejkn_bpjs_taskid, diagnosa_pasien, penyakit } = require("../models");
const { Op } = require("sequelize");
const { getPesertabyKatu } = require("../hooks/bpjs");
const { fetchSatusehat, fetchKFH } = require("../hooks/satusehat");
const { findBestMatchKFA } = require("../helpers/");
const Org_id = process.env.Organization_id_SATUSEHAT

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Terhubung ke MongoDB!'))
    .catch(err => console.error('Gagal terhubung ke MongoDB:', err));
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from DB');
});


async function getEncounterbyTanggal(date) {
    let dateFormatted = date.split("-").join("/").replace(/-/g, "/");
    console.log(dateFormatted);
    try {
        const encounters = await Encounter.find({
            'identifier.value': { $regex: new RegExp(`^${dateFormatted}`) },
        });
        console.log(encounters);
        for (let x of encounters) {
            let dataResepObat = await resep_obat.findAll({
                where: {
                    no_rawat: x.identifier[0].value
                },
                include: [
                    {
                        model: resep_dokter,
                        include: [
                            {
                                model: databarang,
                                attributes: ['nama_brng', 'kode_sat', 'letak_barang']
                            }
                        ]
                    }
                ]
            });
            console.log(JSON.stringify(dataResepObat, null, 2));
            if (dataResepObat.length > 0) {
                for (let y of dataResepObat) {
                    for (let z of y.resep_dokters) {
                        console.log(z.databarang.nama_brng);
                        let isExist = await KFA.findOne({
                            kode_brng: z.kode_brng
                        })
                        console.log(isExist);
                        if (!isExist) {
                            let findKFA = await fetchKFH(z.databarang.nama_brng);

                            let bestMatch = null;
                            if (findKFA && findKFA.items && findKFA.items.data) {
                                bestMatch = findBestMatchKFA(z.databarang.nama_brng, findKFA.items.data);
                                console.log("BEST MATCH FOR:", z.databarang.nama_brng);
                            }
                            console.log(JSON.stringify(bestMatch, null, 2));
                            if (!bestMatch) {
                                continue;
                            }
                            let dataObat = {
                                kode_brng: z.kode_brng,
                                nama_brng: z.databarang.nama_brng,
                                kode_sat: z.databarang.kode_sat,
                                letak_barang: z.databarang.letak_barang,
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
                            console.log(JSON.stringify(dataObat, null, 2));
                            await KFA.create(dataObat);
                        }
                    }
                    // let findKFA = await fetchKFH(y.databarang.nama_brng);
                    // console.log(findKFA);
                }
            }
            // return
        }
        console.log("selesai");
        return

    } catch (error) {
        console.error("Error fetching encounter from MongoDB:", error);
        return [];
    }
}

// getEncounterbyTanggal('2026-');

async function medicationSystem() {

    let getKFA = await KFA.find({
    });
    let mapKodeBrng = getKFA.map(x => x.kode_brng);
    console.log(mapKodeBrng);
    let findMedication = await Medication.find({
        'identifier.value': {
            $in: mapKodeBrng
        }
    });
    // console.log(findMedication);
    let flterKFA = getKFA.filter(x => !findMedication.some(y => y.identifier[0].value === x.kode_brng));
    console.log(flterKFA.map(x => x.kode_brng));
    // return;
    for (let x of flterKFA) {
        let dataObat = {
            resourceType: "Medication",
            meta: {
                profile: [
                    "https://fhir.kemkes.go.id/r4/StructureDefinition/Medication"
                ]
            },
            identifier: [
                {
                    system: "http://sys-ids.kemkes.go.id/medication/" + Org_id,
                    use: "official",
                    value: x.kode_brng
                }
            ],
            code: {
                coding: [
                    {
                        code: x.dataKFA.code,
                        system: x.dataKFA.system,
                        display: x.dataKFA.display
                    }
                ]
            },
            form: {
                coding: [
                    {
                        code: x.form_system.code,
                        system: x.form_system.system,
                        display: x.form_system.display
                    }
                ]
            },
            ingredient:
                x.active_ingredients.map(y => {
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
                })
            ,
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
        console.log(JSON.stringify(dataObat, null, 2));
        let kirimMedication = await fetchSatusehat("POST", 'Medication', dataObat);
        if (kirimMedication.error) {
            console.log(kirimMedication.error);
            continue;
        }
        console.log(JSON.stringify(kirimMedication, null, 2));
        await Medication.create(kirimMedication);
        // return;
    }
    console.log("selesai");

}
medicationSystem();