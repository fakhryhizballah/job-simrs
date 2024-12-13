const { satu_sehat_encounter, satu_sehat_condition, diagnosa_pasien, penyakit } = require("../models");
const { postCondition } = require("../hooks/satusehat");
const { Op } = require("sequelize");


async function pCondition(date) {
    let no_rawat = date.split("-").join("/");
    let encounter = await satu_sehat_encounter.findAll({
        where: {
            no_rawat: { [Op.startsWith]: no_rawat },
        },
        include: [{
            model: diagnosa_pasien,
            as: 'diagnosa_pasien',
            include: [{
                model: penyakit,
                as: 'penyakit'
            }]
        }]
    })
    // console.log(encounter);
    console.log(JSON.stringify(encounter[0], null, 2));
}
pCondition('2024-11-01')