const cron = require('node-cron');
const { postEncouter, updateEncounter } = require("./identitas.js");
const { pCondition, pProcedure } = require("./icd.js");
const { kirimMedicationRequest, kirimMedicationDispense } = require("./Medication.js");
// async function kirm(date) {
//     await postEncouter(date)
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     await kirimMedicationRequest(date)
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     await kirimMedicationDispense(date)
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     await pCondition(date)
//     await new Promise(resolve => setTimeout(resolve, 2000));
//     await pProcedure(date)

//     console.log('done');
// }

cron.schedule('0 18 * * *', async () => {
    let yearnow = new Date().getFullYear();
    let hariIni = new Date();
    let tanggalLampau = new Date();
    tanggalLampau.setDate(hariIni.getDate() - 1);
    let tanggal = tanggalLampau.getDate();
    let bulan = tanggalLampau.getMonth() + 1;
    await postEncouter(`${yearnow}-${bulan < 10 ? '0' + bulan : bulan}-${tanggal < 10 ? '0' + tanggal : tanggal}`)
    await kirimMedicationRequest(`${yearnow}-${bulan < 10 ? '0' + bulan : bulan}-${tanggal < 10 ? '0' + tanggal : tanggal}`)
});

cron.schedule('0 20 * * *', async () => {
    let yearnow = new Date().getFullYear();
    let hariIni = new Date();
    let tanggalLampau = new Date();
    tanggalLampau.setDate(hariIni.getDate() - 1);
    let tanggal = tanggalLampau.getDate();
    let bulan = tanggalLampau.getMonth() + 1;
    await kirimMedicationRequest(`${yearnow}-${bulan < 10 ? '0' + bulan : bulan}-${tanggal < 10 ? '0' + tanggal : tanggal}`)
    await kirimMedicationDispense(`${yearnow}-${bulan < 10 ? '0' + bulan : bulan}-${tanggal < 10 ? '0' + tanggal : tanggal}`)
});

cron.schedule('0 23 * * *', async () => {
    let yearnow = new Date().getFullYear();
    let hariIni = new Date();
    let tanggalLampau = new Date();
    tanggalLampau.setDate(hariIni.getDate() - 3);
    let tanggal = tanggalLampau.getDate();
    let bulan = tanggalLampau.getMonth() + 1;
    await pCondition(`${yearnow}-${bulan < 10 ? '0' + bulan : bulan}-${tanggal < 10 ? '0' + tanggal : tanggal}`)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await pProcedure(`${yearnow}-${bulan < 10 ? '0' + bulan : bulan}-${tanggal < 10 ? '0' + tanggal : tanggal}`)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await updateEncounter(`${yearnow}-${bulan < 10 ? '0' + bulan : bulan}-${tanggal < 10 ? '0' + tanggal : tanggal}`)
});

let yearnow = new Date().getFullYear();
let hariIni = new Date();
let tanggalLampau = new Date();
tanggalLampau.setDate(hariIni.getDate());
let tanggal = tanggalLampau.getDate();
let bulan = tanggalLampau.getMonth() + 1;
console.log(`${yearnow}-${bulan < 10 ? '0' + bulan : bulan}-${tanggal < 10 ? '0' + tanggal : tanggal}`);
// console.log(bulan);