require('dotenv').config()
const mongoose = require('mongoose');
const Practitioner = require("../modelsMongoose/Practitioner");
const Patient = require("../modelsMongoose/Patient");
const Encounter = require("../modelsMongoose/Encounter");
const KFA = require("../modelsMongoose/Kfa");
const Medication = require("../modelsMongoose/Medication");
const MedicationRequest = require("../modelsMongoose/MedicationRequest");
const Organization = require("../modelsMongoose/Organization");
const Location = require("../modelsMongoose/Location");
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

async function getOrganization() {
    const data = await fetchSatusehat("GET", 'Organization?partof=' + Org_id);
    console.log(JSON.stringify(data, null, 2));

    await Organization.bulkWrite(data.entry.map(x => ({ insertOne: { document: x.resource } })));
    return data;
}
// getOrganization()

async function getLocation() {
    const organizations = await Organization.find();
    for (const org of organizations) {
        const data = await fetchSatusehat("GET", `Location?organization=${org.id}`);
        if (data.entry && data.entry.length > 0) {
            const bulkOps = data.entry.map(item => ({
                replaceOne: {
                    filter: { id: item.resource.id },
                    replacement: item.resource,
                    upsert: true
                }
            }));
            await Location.bulkWrite(bulkOps);
        }
    }
}

getLocation();

