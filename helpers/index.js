function convmils(datetime, delay) {
    const dateString = datetime;
    let date = new Date(dateString);
    date.setMinutes(date.getMinutes() + delay);
    const estimasidilayani = date.getTime();
    return estimasidilayani;
}
function milsPlus(mils, delay) {
    let date = new Date(mils);
    date.setMinutes(date.getMinutes() + delay);
    const estimasidilayani = date.getTime();
    return estimasidilayani;
}

function getRandomTimeInMillis(min, max) {
    let randomFraction = Math.random();
    let minTime = min * 60 * 1000; // 1 menit dalam milidetik
    let maxTime = max * 60 * 1000; // 5 menit dalam milidetik
    let randomTime = minTime + Math.floor(randomFraction * (maxTime - minTime + 1));

    return randomTime;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function setStingTodate(y) {
    let [tanggal, waktu, zonaWaktu] = y.split(' ');
    let [hari, bulan, tahun] = tanggal.split('-');
    let tanggalJS = `${bulan}-${hari}-${tahun}`;
    let timestampString = `${tanggalJS} ${waktu}`;
    let dateObj = new Date(timestampString);
    let timestampInMillis = dateObj.getTime();
    return timestampInMillis;
}
function days(date) {
    let dateObj = new Date(date);
    let day = dateObj.getDay();
    switch (day) {
        case 0:
            day = 'MINGGU';
            break;
        case 1:
            day = 'SENIN';
            break;
        case 2:
            day = 'SELASA';
            break;
        case 3:
            day = 'RABU';
            break;
        case 4:
            day = 'KAMIS';
            break;
        case 5:
            day = 'JUMAT';
            break;
        case 6:
            day = 'SABTU';
            break;
    }
    return day;
}


module.exports = {
    convmils,
    milsPlus,
    getRandomTimeInMillis,
    getRandomInt,
    setStingTodate,
    days
}