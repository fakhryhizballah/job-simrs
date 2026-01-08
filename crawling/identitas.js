require('dotenv').config()
const mongoose = require('mongoose');
const Practitioner = require("../modelsMongoose/Practitioner");
const { satu_sehat_encounter, satu_sehat_mapping_lokasi_ralan, satu_sehat_mapping_lokasi_ranap, resume_pasien_ranap, bangsal, poliklinik, reg_periksa, kamar_inap, kamar, pasien, pegawai, referensi_mobilejkn_bpjs_taskid, diagnosa_pasien, penyakit } = require("../models");
const { postEncouter, postEncouter2, postData, getIHS, postCondition, getEncounter, getStatus, updateEncounter } = require("../hooks/satusehat");
const { getlisttask, post } = require("../hooks/bpjs");
const { fetchSatusehat } = require("../hooks/satusehat");

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

async function postPractitioner(nik) {
    let isexist = await Practitioner.findOne({
        'identifier.value': nik
    })
    if (isexist) {
        return false
    }
    let cariIHSnumber = await fetchSatusehat("GET",`/Practitioner?identifier=https://fhir.kemkes.go.id/id/nik|${nik}`)
    if (cariIHSnumber.total > 0) {
        console.log(cariIHSnumber.entry[0].resource.id);
        let dataIHSnumber = await fetchSatusehat("GET", `/Practitioner/${cariIHSnumber.entry[0].resource.id}`)
        console.log(dataIHSnumber);
        return dataIHSnumber
    }
    return false
}

async function petugas() {
    let findPegawai = await pegawai.findAll({
        attributes: ['no_ktp', 'nama', 'nik'],
        // limit: 1
    })
    for (let x of findPegawai){
        let dataIHSnumber = await postPractitioner(x.no_ktp)
        if (dataIHSnumber) {
            dataIHSnumber.identifier.push({
                "system": "https://fhir.kemkes.go.id/id/rsid",
                "value": x.nik
            })
            await Practitioner.create(dataIHSnumber);
        }
        
    }
    mongoose.disconnect();
    console.log('selesai')
}
petugas();

