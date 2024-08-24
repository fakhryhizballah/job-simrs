const { referensi_mobilejkn_bpjs_taskid, reg_periksa } = require("../models");
const { Op } = require("sequelize");
const { getlisttask } = require("../hooks/bpjs");
const { setStingTodate } = require("../helpers");
async function addTaksid(date) {
    let regSudah = await reg_periksa.findAll({
        where: {
            tgl_registrasi: date,
            status_lanjut: 'Ralan',
            stts: 'Sudah',
            kd_poli: { [Op.notIn]: ['IGDK', 'U0003', 'U0008', 'U0022', 'U0055', 'U0054'] },
        },
        attributes: ['no_rawat'],
    });
    let kodebookingfilter = regSudah.map((item) => item.no_rawat);
    console.log(kodebookingfilter);

    for (const item of kodebookingfilter) {

        const gettaks = await getlisttask(item);
        console.log(gettaks.response);
        if (gettaks.response == undefined) {
            console.log(item);
            continue;
        }
        try {
            for (const x of gettaks.response) {
                let isexist = await referensi_mobilejkn_bpjs_taskid.findOne({
                    where: {
                        no_rawat: item,
                        taskid: x.taskid
                    }
                });
                if (!isexist) {
                    await referensi_mobilejkn_bpjs_taskid.create({
                        no_rawat: item,
                        taskid: x.taskid,
                        waktu: setStingTodate(x.wakturs)
                    });
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }

}
addTaksid('2024-08-24');