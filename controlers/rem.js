const fs = require('fs');
const path = require('path');
const { data_batch, gudangbarang, databarang } = require("../models");
const { Op } = require('sequelize');


async function addKdBarang() {
    const fileContent = fs.readFileSync('./data/TABLET.json', 'utf-8');
    let dataObj = JSON.parse(fileContent);
    let obatKosong = [];
    for (let x of dataObj) {
        let obat = await databarang.findOne({
            where: {
                nama_brng: {
                    [Op.substring]: x["Nama Obat"]
                }
            },
            attributes: ['kode_brng', 'nama_brng']
        });
        console.log(x["Nama Obat"]);
        // console.log(obat);
        if (obat) {
        x.kode_brng = obat.kode_brng;
        } else {
            obatKosong.push(x["Nama Obat"]);
            // console.log(x["Nama Obat"]);
        }
    }
    console.log(obatKosong);
    fs.writeFileSync('./data/TABLET1.json', JSON.stringify(dataObj));
}

// addKdBarang();
addBatch();

async function addBatch() {
    const fileContent = fs.readFileSync('./data/TABLET1.json', 'utf-8');
    let dataObj = JSON.parse(fileContent);
    let kosong = 0;
    let isi = 0;
    for (let x of dataObj) {

        let hargaJual = Math.round(x["Harga Jual"]);
        console.log(hargaJual);
        console.log(x.kode_brng);
        // let z = await databarang.update(
        //     {
        //         dasar: x["Harga Dasar"],
        //         h_beli: x["Harga Dasar"],
        //         ralan: hargaJual,
        //         kelas1: hargaJual,
        //         kelas2: hargaJual,
        //         kelas3: hargaJual,
        //         utama: hargaJual,
        //         vip: hargaJual,
        //         vvip: hargaJual,
        //         beliluar: hargaJual,
        //         jualbebas: hargaJual,
        //         karyawan: hargaJual,

        //     },
        //     {
        //         where: {
        //             kode_brng: x.kode_brng
        //         }
        //     }
        // );
        // console.log(z);


        let batch = await data_batch.findOne({
            where: {
                no_batch: x["Batch"],
                kode_brng: x["kode_brng"]
            },
            attributes: ['no_batch', 'kode_brng']
        });
        // console.log(x["Batch"]);
        // console.log(batch);
        let tanggalbeli = '05/06/2024'
        tanggalbeli = tanggalbeli.split('/');
        tanggalbeli = tanggalbeli[2] + '-' + tanggalbeli[1] + '-' + tanggalbeli[0];
        x["ED"] = x["ED"].split('/');
        x["ED"] = x["ED"][2] + '-' + x["ED"][1] + '-' + x["ED"][0];
        if (!batch) {
            console.log(x["Batch"]);
            console.log(x["kode_brng"]);

            // await data_batch.create({
            //     no_batch: String(x["Batch"]),
            //     kode_brng: x["kode_brng"],
            //     tgl_beli: tanggalbeli,
            //     tgl_kadaluarsa: x["ED"],
            //     asal: 'Pengadaan',
            //     no_faktur: '2024-06-05',
            //     dasar: Math.round(x["Harga Dasar"]),
            //     h_beli: Math.round(x["Harga Dasar"]),
            //     ralan: hargaJual,
            //     kelas1: hargaJual,
            //     kelas2: hargaJual,
            //     kelas3: hargaJual,
            //     utama: hargaJual,
            //     vip: hargaJual,
            //     vvip: hargaJual,
            //     beliluar: hargaJual,
            //     jualbebas: hargaJual,
            //     karyawan: hargaJual,
            //     jumlahbeli: hargaJual,
            //     sisa: x["Stok Apotek"] + x["Gudang"],
            // });

            kosong++;
        }
        else {
            // await data_batch.update(
            //     {
            //         // tgl_kadaluarsa: x["ED"],
            //         no_faktur: '2024-06-05',
            //         dasar: x["Harga Dasar"],
            //         h_beli: x["Harga Dasar"],
            //         ralan: hargaJual,
            //         kelas1: hargaJual,
            //         kelas2: hargaJual,
            //         kelas3: hargaJual,
            //         utama: hargaJual,
            //         vip: hargaJual,
            //         vvip: hargaJual,
            //         beliluar: hargaJual,
            //         jualbebas: hargaJual,
            //         karyawan: hargaJual,
            //         jumlahbeli: hargaJual,
            //         sisa: x["Stok Apotek"] + x["Gudang"],
            //     },
            //     {
            //         where: {
            //             no_batch: String(x["Batch"]),
            //             kode_brng: x["kode_brng"]
            //         }
            //     }
            // );
            isi++;
        }
        // x.kode_batch = batch.kode_batch;
        try {
            await gudangbarang.create({
                kode_brng: x["kode_brng"],
                kd_bangsal: 'AP',
                stok: x["Stok Apotek"] + x["Gudang"],
                no_batch: x["Batch"],
                no_faktur: '2024-06-05'
            });
        } catch (error) {
            console.log(error);
        }


    }
    console.log(dataObj.length);
    console.log(kosong);
    console.log(isi);

}