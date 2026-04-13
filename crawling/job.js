const { postEncouter } = require("./identitas.js");
const { pCondition } = require("./icd.js");
const { kirimMedicationRequest } = require("./Medication.js");
async function kirm(date) {
    await postEncouter(date)
    await new Promise(resolve => setTimeout(resolve, 3000));
    await pCondition(date)
    await new Promise(resolve => setTimeout(resolve, 1000));
    await kirimMedicationRequest(date)
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