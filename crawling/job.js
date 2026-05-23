const cron = require('node-cron');
const { postEncouter } = require("./identitas.js");
const { pCondition, pProcedure } = require("./icd.js");
const { kirimMedicationRequest, kirimMedicationDispense } = require("./Medication.js");
async function kirm(date) {
    await postEncouter(date)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await kirimMedicationRequest(date)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await kirimMedicationDispense(date)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await pCondition(date)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await pProcedure(date)

    console.log('done');
}

cron.schedule('0 23 * * *', async () => {
    let yearnow = new Date().getFullYear();
    let daynow = new Date().getDate();
    let monthnow = new Date().getMonth() + 1;
    await postEncouter(`${yearnow}-${monthnow < 10 ? '0' + monthnow : monthnow}-${i < 10 ? '0' + i : i}`)
    await kirimMedicationRequest(`${yearnow}-${monthnow < 10 ? '0' + monthnow : monthnow}-${i < 10 ? '0' + i : i}`)
});

cron.schedule('0 3 * * *', async () => {
    let yearnow = new Date().getFullYear();
    let hariIni = new Date();
    let tanggalLampau = new Date();
    tanggalLampau.setDate(hariIni.getDate() - 20);
    let tanggal = tanggalLampau.getDate();
    let bulan = tanggalLampau.getMonth() + 1;
    console.log(tanggal);
    console.log(bulan);
    await kirimMedicationDispense(`${yearnow}-${bulan < 10 ? '0' + bulan : bulan}-${tanggal < 10 ? '0' + tanggal : tanggal}`)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await pCondition(`${yearnow}-${bulan < 10 ? '0' + bulan : bulan}-${tanggal < 10 ? '0' + tanggal : tanggal}`)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await pProcedure(`${yearnow}-${bulan < 10 ? '0' + bulan : bulan}-${tanggal < 10 ? '0' + tanggal : tanggal}`)
});