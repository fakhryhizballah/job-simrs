const { satu_sehat_encounter, satu_sehat_mapping_lokasi_ralan, poliklinik, reg_periksa, pasien, pegawai, referensi_mobilejkn_bpjs_taskid } = require("../models");
const { postEncouter } = require("../hooks/satusehat");
const { Op } = require("sequelize");
require("dotenv").config();

async function postEncouterRalan(date) {
    let no_rawat = date.split("-").join("/");
    console.log(no_rawat)
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

    for (let x of dataFiletr) {
        let TaksID3 = await referensi_mobilejkn_bpjs_taskid.findOne({
            where: {
                taskid: '3',
                no_rawat: x.no_rawat,
            }
        })
        console.log(x);
        console.log(x.no_rawat);
        console.log(x.reg.pasien.no_ktp);
        let dataEndcounter = await postEncouter(x, TaksID3.waktu, x.waktu);
        if (dataEndcounter != undefined) {
            console.log(dataEndcounter.id);
            await satu_sehat_encounter.create({
                id_encounter: dataEndcounter.id,
                no_rawat: x.no_rawat
            })
        }
        // return;
    }

}
postEncouterRalan("2024-11-");
// console
