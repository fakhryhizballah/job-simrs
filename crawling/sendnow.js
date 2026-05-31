const { postEncouter, updateEncounter, updateEncounterRanap } = require("./identitas.js");
const { pCondition, pProcedure } = require("./icd.js");
const { kirimMedicationRequest, kirimMedicationDispense } = require("./Medication.js");
const { kirimObservation } = require("./Observation.js");
const { kirimInstuksiDiet } = require("./Composition.js");
async function kirm(date) {
    await postEncouter(date)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await kirimObservation(date)
    await pCondition(date)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await kirimInstuksiDiet(date)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await pProcedure(date)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await updateEncounter(date)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await updateEncounterRanap(date)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await kirimMedicationRequest(date)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await kirimMedicationDispense(date)
    console.log('done' + date);
}

(async () => {
    try {
        let yearnow = new Date().getFullYear();
        let hariIni = new Date();
        let tanggalLampau = new Date();
        tanggalLampau.setDate(hariIni.getDate() - 1);
        let tanggal = tanggalLampau.getDate();
        let bulan = tanggalLampau.getMonth() + 1;
        for (let i = 1; i <= tanggal; i++) {
            console.log('run' + i);
            await kirm(`${yearnow}-${bulan < 10 ? '0' + bulan : bulan}-${i < 10 ? '0' + i : i}`);
            console.log(`${yearnow}-${bulan < 10 ? '0' + bulan : bulan}-${i < 10 ? '0' + i : i}`);
        }
    } catch (err) {
        console.error(err);
    }
})();

