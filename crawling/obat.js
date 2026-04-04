require('dotenv').config()
const mongoose = require('mongoose');
const Practitioner = require("../modelsMongoose/Practitioner");
const Patient = require("../modelsMongoose/Patient");
const Encounter = require("../modelsMongoose/Encounter");
const KFA = require("../modelsMongoose/Kfa");
const { resep_obat, resep_luar, resep_dokter, databarang, resep_dokter_racikan, satu_sehat_encounter, satu_sehat_mapping_lokasi_ralan, satu_sehat_mapping_lokasi_ranap, resume_pasien_ranap, bangsal, poliklinik, reg_periksa, kamar_inap, kamar, pasien, kelurahan, kecamatan, kabupaten, propinsi, pegawai, referensi_mobilejkn_bpjs_taskid, diagnosa_pasien, penyakit } = require("../models");
const { Op } = require("sequelize");
const { getPesertabyKatu } = require("../hooks/bpjs");
const { fetchSatusehat, fetchKFH } = require("../hooks/satusehat");
const { findBestMatchKFA } = require("../helpers/");

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
        }).limit(10);
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
        return encounters;

    } catch (error) {
        console.error("Error fetching encounter from MongoDB:", error);
        return [];
    }
}

getEncounterbyTanggal('2026-');