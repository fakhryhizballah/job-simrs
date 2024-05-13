const { Op } = require("sequelize");
const { data_batch, gudangbarang } = require("../models");


async function getObat() {
    let dataBatch = await data_batch.findAll({
        where: {
            tgl_beli: {
                [Op.startsWith]: '2024-%'
            }
        },
        attributes: ['no_batch', 'kode_brng', 'tgl_beli', 'tgl_kadaluarsa', 'no_faktur', 'jumlahbeli', 'sisa'],
    }
    );
    let tidak_sama = 0;
    console.log(dataBatch.length);
    for (const element of dataBatch) {
        console.log(element.no_batch, element.kode_brng, element.tgl_beli, element.tgl_kadaluarsa, element.no_faktur, element.jumlahbeli, element.sisa);
        let count = await gudangbarang.findAll({
            where: {
                kode_brng: element.kode_brng,
                no_batch: element.no_batch,
                no_faktur: element.no_faktur
            }
        });
        let stok = 0;
        for (const item of count) {
            stok += item.stok;
        }
        console.log("stok aktual:" + stok);
        // update sisa
        if (stok != element.sisa) {
            tidak_sama++;
            console.log("sisa tidak sama");
            console.log("sisa:" + element.sisa);
            console.log("stok:" + stok);
            await data_batch.update({
                sisa: stok
            }, {
                where: {
                    no_batch: element.no_batch,
                    kode_brng: element.kode_brng,
                    tgl_beli: element.tgl_beli,
                    no_faktur: element.no_faktur
                }
            });
        }
        // await data_batch.update({
        //     sisa: stok
        // }, {
        //     where: {
        //         no_batch: element.no_batch,
        //         kode_brng: element.kode_brng,
        //         tgl_beli: element.tgl_beli,
        //         no_faktur: element.no_faktur
        //     }
        // });

    }
    console.log("tidak sama:" + tidak_sama);
    console.log("total:" + dataBatch.length);
}

getObat();