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
function stringToEpoch(dateString) {
    // Ubah ke format ISO 8601 dengan zona waktu WIB (UTC+7)
    let [day, month, year, time] = dateString.replace(' WIB', '').split(/[- ]/);
    let isoString = `${year}-${month}-${day}T${time}+07:00`;

    // Buat objek Date dan ambil epoch time dalam milliseconds
    let epochMilliseconds = new Date(isoString).getTime();
    return epochMilliseconds;

}
function epochToDatetime(epochSeconds, useUTC = false) {
    const date = new Date(epochSeconds * 1000);

    const pad = (num) => String(num).padStart(2, '0');

    if (useUTC) {
        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1);
        const day = pad(date.getUTCDate());
        const hours = pad(date.getUTCHours());
        const minutes = pad(date.getUTCMinutes());
        const seconds = pad(date.getUTCSeconds());
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
    days,
    stringToEpoch,
    epochToDatetime
}