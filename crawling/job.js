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

(async () => {
    let daynow = new Date().getDate();
    let monthnow = new Date().getMonth() + 1;
    for (let i = 1; i <= daynow; i++) {
        await kirm(`2026-${monthnow < 10 ? '0' + monthnow : monthnow}-${i < 10 ? '0' + i : i}`);
        console.log(`2026-${monthnow < 10 ? '0' + monthnow : monthnow}-${i < 10 ? '0' + i : i}`);
        console.log('selesai');
        // await new Promise(resolve => setTimeout(resolve, 3000));
    }

})();