require('dotenv').config()
const mongoose = require('mongoose');
const Practitioner = require("../modelsMongoose/Practitioner");
const Patient = require("../modelsMongoose/Patient");
const Encounter = require("../modelsMongoose/Encounter");
const Observation = require("../modelsMongoose/Observation");
const { data_triase_igd, data_triase_igdprimer, data_triase_igdsekunder, penilaian_awal_keperawatan_igd, satu_sehat_encounter, pemeriksaan_ralan, pemeriksaan_ranap, pegawai, } = require("../models");
const { Op } = require("sequelize");
const { getPesertabyKatu } = require("../helpersfetch/bpjs");
const { fetchSatusehat, fetchSatusehatPatch } = require("../helpersfetch/satusehat");
const { createClient } = require("redis");

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
const REDIS_DB = process.env.REDIS_DB || 0;

const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: process.env.REDIS_URL_PORT,
    },
    database: REDIS_DB, // letakkan di sini, bukan dalam socket
});
client.connect();

function Mahasiswa(nama, jurusan) {
    this.nama = nama;
    this.jurusan = jurusan;
}

const mhs1 = new Mahasiswa("Budi", "Informatika");
console.log(mhs1); // Output: Budi

