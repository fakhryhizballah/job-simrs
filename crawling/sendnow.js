const { postEncouter, updateEncounter, updateEncounterRanap } = require("./identitas.js");
const { pCondition, pProcedure } = require("./icd.js");
const { kirimMedicationRequest, kirimMedicationDispense } = require("./Medication.js");
async function kirm(date) {
    await postEncouter(date)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await pCondition(date)
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
kirm('2026-05-04');