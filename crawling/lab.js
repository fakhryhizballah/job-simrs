const mongoose = require('mongoose');
const Practitioner = require("../modelsMongoose/Practitioner");
const Patient = require("../modelsMongoose/Patient");
const Encounter = require("../modelsMongoose/Encounter");
const KFA = require("../modelsMongoose/Kfa");
const Medication = require("../modelsMongoose/Medication");
const MedicationRequest = require("../modelsMongoose/MedicationRequest");
const Condition = require("../modelsMongoose/Condition");
const Procedure = require("../modelsMongoose/Procedure");
const ServiceRequest = require("../modelsMongoose/ServiceRequest");
const { getPesertabyKatu } = require("../helpersfetch/bpjs");
const { fetchSatusehat, fetchSatusehatPatch } = require("../helpersfetch/satusehat");
const { findBestMatchKFA } = require("../helpers/");
const Org_id = process.env.Organization_id_SATUSEHAT

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Terhubung ke MongoDB!'))
    .catch(err => console.error('Gagal terhubung ke MongoDB:', err));
const { satu_sehat_encounter, satu_sehat_condition, satu_sehat_procedure, diagnosa_pasien, penyakit, prosedur_pasien, icd9 } = require("../models");
const { getEncounter, postData } = require("../helpersfetch/satusehat");
const { Op } = require("sequelize");



