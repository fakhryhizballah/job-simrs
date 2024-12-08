const { satu_sehat_encounter, satu_sehat_mapping_lokasi_ralan, satu_sehat_mapping_lokasi_ranap, bangsal, poliklinik, reg_periksa, kamar_inap, kamar, pasien, pegawai, referensi_mobilejkn_bpjs_taskid } = require("../models");
const { postEncouter, postEncouter2 } = require("../hooks/satusehat");
const { getlisttask } = require("../hooks/bpjs");
const { convertToISO, setStingTodate } = require("../helpers/");
const { Op } = require("sequelize");
require("dotenv").config();

async function postEncouterRalan(date) {
    let no_rawat = date.split("-").join("/");
    let dataFiletr = await referensi_mobilejkn_bpjs_taskid.findAll({
        where: {
            taskid: '5',
            no_rawat: { [Op.startsWith]: no_rawat },
            '$encounter.id_encounter$': { [Op.is]: null },
            '$reg.status_lanjut$': 'Ralan',
            '$reg.kd_poli$': { [Op.notIn]: ['IGDK'] }
        },
        include: [{
            model: satu_sehat_encounter,
            as: 'encounter',
            // attributes: ['id_encounter'],
            required: false,
        }, {
            model: reg_periksa,
            as: 'reg',
            attributes: ['no_rkm_medis', 'kd_dokter', 'kd_poli'],
            include: [{
                model: pasien,
                as: 'pasien',
                attributes: ['no_ktp', 'nm_pasien']
            },
            {
                model: pegawai,
                as: 'pegawai',
                attributes: ['nama', 'no_ktp'],
            }, {
                model: satu_sehat_mapping_lokasi_ralan,
                as: 'satu_sehat_mapping_lokasi_ralan',
                attributes: ['id_organisasi_satusehat', 'id_lokasi_satusehat'],
                // required: false,
            }, {
                model: poliklinik,
                as: 'poliklinik',
                attributes: ['kd_poli', 'nm_poli']
            }
            ]
        }],
        // limit: 1
    })
    let count = 0;
    for (let x of dataFiletr) {
        let TaksID3 = await referensi_mobilejkn_bpjs_taskid.findOne({
            where: {
                taskid: '3',
                no_rawat: x.no_rawat,
            }
        })
        if (TaksID3 == null) {
            TaksID3 = {
                taskid: '3',
                no_rawat: x.no_rawat
            }
            let gettaks = await getlisttask(x.no_rawat);
            let index = gettaks.response.findIndex(obj => obj.taskid === 3);
            TaksID3.waktu = convertToISO(gettaks.response[index].wakturs);
            referensi_mobilejkn_bpjs_taskid.create({
                no_rawat: x.no_rawat,
                taskid: 3,
                waktu: setStingTodate(gettaks.response[index].wakturs)
            });
            // return;
        }
        console.log(x.no_rawat);
        console.log(x.reg.pasien.no_ktp);
        let code = {
            id: 'AMB',
            display: 'ambulatory'

        }
        let dataEndcounter = await postEncouter(x, TaksID3.waktu, x.waktu, code);
        if (dataEndcounter != undefined) {
            console.log(dataEndcounter.id);
            count++;
            await satu_sehat_encounter.create({
                id_encounter: dataEndcounter.id,
                no_rawat: x.no_rawat
            })
        }
        // return;
    }
    console.log("data akan dikrirm " + dataFiletr.length);
    console.log("data dikirim " + count);

}
// postEncouterRalan("2024-12-02");

async function postEncouterIGD(date) {
    let dataFiletr = await reg_periksa.findAll({
        where: {
            tgl_registrasi: date,
            status_lanjut: 'Ralan',
            kd_poli: 'IGDK',
            '$encounter.id_encounter$': { [Op.is]: null },
        },
        attributes: ['no_rawat', 'tgl_registrasi', 'jam_reg'],
        include: [{
            model: satu_sehat_encounter,
            as: 'encounter',
            // attributes: ['id_encounter'],
            required: false,
        }, {
            model: pasien,
            as: 'pasien',
            attributes: ['no_ktp', 'nm_pasien']
        },
        {
            model: pegawai,
            as: 'pegawai',
            attributes: ['nama', 'no_ktp'],
        }, {
            model: satu_sehat_mapping_lokasi_ralan,
            as: 'satu_sehat_mapping_lokasi_ralan',
            attributes: ['id_organisasi_satusehat', 'id_lokasi_satusehat'],
            // required: false,
        }, {
            model: poliklinik,
            as: 'poliklinik',
            attributes: ['kd_poli', 'nm_poli']
        }],
        // limit: 1
    })
    let count = 0;
    for (let x of dataFiletr) {
        let data = {
            reg: {
                pasien: {

                },
                pegawai: {

                },
                satu_sehat_mapping_lokasi_ralan: {

                },
                poliklinik: {
                }
            }
        }
        data.no_rawat = x.dataValues.no_rawat;
        data.reg.pasien.no_ktp = x.dataValues.pasien.dataValues.no_ktp;
        data.reg.pegawai.no_ktp = x.dataValues.pegawai.dataValues.no_ktp;
        data.reg.satu_sehat_mapping_lokasi_ralan.id_lokasi_satusehat = x.dataValues.satu_sehat_mapping_lokasi_ralan.id_lokasi_satusehat;
        data.reg.poliklinik.nm_poli = x.dataValues.poliklinik.nm_poli;
        // console.log(data);
        let code = {
            id: 'EMER',
            display: 'emergency'
        }
        let datetime = new Date(x.dataValues.tgl_registrasi + "T" + x.dataValues.jam_reg + ".000Z").toISOString();
        let dataEndcounter = await postEncouter(data, datetime, null, code);
        if (dataEndcounter != undefined) {
            console.log(dataEndcounter.id);
            count++;
            let encoun = await satu_sehat_encounter.create({
                id_encounter: dataEndcounter.id,
                no_rawat: x.no_rawat
            })
            console.log(encoun.no_rawat);
        } else {
            console.log(x.no_rawat);
        }
    }
    console.log("data akan dikrirm " + dataFiletr.length);
    console.log("data dikirim " + count);

}
// for (let i = 0; i < 9; i++) {
//     postEncouterIGD("2024-12-0" + i);
// }
// postEncouterIGD("2024-12-08");

async function postEncouterRanap(date) {
    let dataFiletr = await reg_periksa.findAll({
        where: {
            tgl_registrasi: date,
            status_lanjut: 'Ranap',
            // kd_poli: 'IGDK',
            '$encounter.id_encounter$': { [Op.is]: null },
        },
        attributes: ['no_rawat', 'tgl_registrasi', 'jam_reg'],
        include: [{
            model: satu_sehat_encounter,
            as: 'encounter',
            attributes: ['id_encounter'],
            required: false,
        }, {
                model: pasien,
                as: 'pasien',
                attributes: ['no_ktp', 'nm_pasien']
            },
            {
                model: pegawai,
                as: 'pegawai',
                attributes: ['nama', 'no_ktp'],
            }, {
                model: satu_sehat_mapping_lokasi_ralan,
                as: 'satu_sehat_mapping_lokasi_ralan',
                attributes: ['id_organisasi_satusehat', 'id_lokasi_satusehat'],
                // required: false,
            }, {
                model: poliklinik,
                as: 'poliklinik',
                attributes: ['kd_poli', 'nm_poli']
            },
            {
                model: kamar_inap,
                as: 'kamar_inap',
                // attributes: ['kd_kamar', 'tgl_masuk', 'jam_masuk', 'tgl_keluar', 'jam_keluar'],
                include: [{
                    model: satu_sehat_mapping_lokasi_ranap,
                    as: 'mapping_lokasi_ranap',
                }, {
                        model: kamar,
                        as: 'kode_kamar',
                        attributes: ['kd_bangsal'],
                        include: [{
                            model: bangsal,
                            as: 'bangsal',
                            attributes: ['nm_bangsal']
                        }]
                    }]
        }],

    })
    let code = {
        id: 'IMP',
        display: 'inpatient encounter'
    }
    // console.log(JSON.stringify(dataFiletr[0], null, 2));
    // await postEncouter2(dataFiletr[0], code);
    let count = 0;
    for (let x of dataFiletr) {
        let dataEndcounter = await postEncouter2(x, code);
        if (dataEndcounter != undefined) {
            console.log(dataEndcounter.id);
            count++;
            let encoun = await satu_sehat_encounter.create({
                id_encounter: dataEndcounter.id,
                no_rawat: x.no_rawat
            })
            console.log(encoun.no_rawat);
        } else {
            console.log(x.no_rawat);
        }
    }
    console.log("data akan dikrirm " + dataFiletr.length);
    console.log("data dikirim " + count);
}
postEncouterRanap("2024-12-07");