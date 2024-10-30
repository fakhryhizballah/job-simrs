const { referensi_mobilejkn_bpjs_taskid, reg_periksa, bridging_sep } = require("../models");
const { Op, where } = require("sequelize");
const { getlisttask, getAntrian } = require("../hooks/bpjs");
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

async function esep(date) {
    let regBooking = await reg_periksa.findAll({
        where: {
            // no_rawat: { [Op.notIn]: kodebooking },
            tgl_registrasi: date,
            // kd_pj: 'BPJ',
            status_lanjut: 'Ralan',
            kd_poli: { [Op.notIn]: ['IGDK', 'U0003', 'U0008', 'U0022', 'U0055', 'U0054'] },
        }
    })

    let kd_boking = regBooking.map((item) => item.no_rawat);
    // console.log(kd_boking)
    let sep = await bridging_sep.findAll({
        where: {
            tglsep: date,
            jnspelayanan: 2,
            kdpolitujuan: { [Op.notIn]: ['IGD', 'HDL', 'RDO', 'MKB'] }
        }
    })
    let kd_sep = sep.map((item) => item.no_rawat)
    // console.log(kd_sep)
    // console.log(sep)
    let res = await getAntrian(date);
    console.log(res.response.length)
    let filterkd_sep = kd_sep.filter(x => !kd_boking.includes(x))
    let filterkd_boking = kd_boking.filter(x => !kd_sep.includes(x))
    console.log(filterkd_sep)
    console.log(filterkd_boking)
    console.log("reg =" + regBooking.length)
    console.log("sep =" + sep.length);
    return;

}
esep('2024-10-17');
// addTaksid('2024-08-24');