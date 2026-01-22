const { postEncouter } = require("./identitas.js");
async function kirm(date) {
    await postEncouter(date)
    console.log('done');
}

(async () => {
    for (let i = 1; i <= 22; i++) {
        await kirm(`2026-01-${i < 10 ? '0' + i : i}`);
        console.log(`2026-01-${i < 10 ? '0' + i : i}`);
        console.log('selesai');
        // await new Promise(resolve => setTimeout(resolve, 3000));
    }
})();