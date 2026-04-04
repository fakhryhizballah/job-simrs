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

function convertToISO(input) {
    // Pisahkan bagian tanggal dan waktu
    const [date, time] = input.split(' ');
    // Format tanggal dari DD-MM-YYYY ke YYYY-MM-DD
    const [day, month, year] = date.split('-');
    const formattedDate = `${year}-${month}-${day}`;

    console.log(`${formattedDate}T${time}+07:00`);
    // Buat objek Date dengan zona waktu WIB (UTC+7)
    const dateObj = new Date(`${formattedDate}T${time}+07:00`);

    // Format ulang ke ISO
    return dateObj.toISOString();
}

function convertToISO2(input) {
    // Pisahkan bagian tanggal dan waktu
    const [date, time] = input.split(' ');
    // Format tanggal dari DD-MM-YYYY ke YYYY-MM-DD
    const [year, month, day] = date.split('-');
    const formattedDate = `${year}-${month}-${day}`;

    // console.log(`${formattedDate}T${time}+07:00`);
    // Buat objek Date dengan zona waktu WIB (UTC+7)
    const dateObj = new Date(`${formattedDate}T${time}+07:00`);

    // Tambahkan 7 jam ke waktu
    let startTime = new Date(dateObj.getTime() + 7 * 60 * 60 * 1000);
    // Format hasil ke ISO 8601 dengan offset +07:00
    let formattedStartTime = startTime.toISOString().replace('.000Z', '+07:00');

    return formattedStartTime
}
function convertToISO3(input) {
    // Pisahkan bagian tanggal dan waktu
    const [date, time] = input.split(' ');
    // Format tanggal dari DD-MM-YYYY ke YYYY-MM-DD
    const [day, month, year] = date.split('-');
    const formattedDate = `${year}-${month}-${day}`;

    return (`${formattedDate}T${time}+07:00`);
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
function validateNIK(nik) {
    if (typeof nik !== 'string') {
        return { valid: false, error: 'NIK harus berupa string' };
    }

    // bersihkan (hapus spasi/strip)
    const cleaned = nik.replace(/\s|-/g, '');

    // cek panjang & hanya angka
    if (!/^\d{16}$/.test(cleaned)) {
        return { valid: false, error: 'NIK harus 16 digit angka (tanpa spasi)' };
    }

    // region code (6 digit pertama) — kita hanya ambil sebagai info, validasinya non-ekstensif
    const regionCode = cleaned.slice(0, 6);

    // tanggal lahir bagian: digit 7-12 (index 6..11) -> DDMMYY
    const dobPart = cleaned.slice(6, 12);
    let dd = parseInt(dobPart.slice(0, 2), 10);
    const mm = parseInt(dobPart.slice(2, 4), 10);
    const yy = parseInt(dobPart.slice(4, 6), 10);

    // deteksi gender: jika DD > 40 maka perempuan
    let gender = 'M';
    if (dd > 40) {
        dd -= 40;
        gender = 'F';
    }

    // validasi range dd/mm
    if (mm < 1 || mm > 12) {
        return { valid: false, error: 'Bulan lahir tidak valid' };
    }
    if (dd < 1 || dd > 31) {
        return { valid: false, error: 'Tanggal lahir tidak valid' };
    }

    // tentukan abad (asumsi umum):
    // jika YY > currentYear%100 → anggap 1900+YY, else 2000+YY.
    // Contoh: sekarang 2025 -> cutoff 25 -> YY=30 -> 1930, YY=20 -> 2020.
    const now = new Date();
    const cutoff = now.getFullYear() % 100;
    const fullYear = (yy > cutoff) ? (1900 + yy) : (2000 + yy);

    // cek validitas tanggal (menghandle bulan dengan jumlah hari bener, leap year)
    const date = new Date(fullYear, mm - 1, dd);
    if (
        date.getFullYear() !== fullYear ||
        date.getMonth() !== (mm - 1) ||
        date.getDate() !== dd
    ) {
        return { valid: false, error: 'Tanggal lahir tidak valid (kontradiksi kalender)' };
    }

    // Semua pengecekan lulus
    return {
        valid: true,
        info: {
            gender,                       // 'M' atau 'F'
            birthDate: date,              // objek Date
            regionCode                    // 6 digit kode wilayah (informasi)
        }
    };
}

/**
 * Finds the best match for a drug name within a list of KFA items.
 * Scores items based on keyword overlap.
 * @param {string} keyword - The search keyword (e.g. nama_brng)
 * @param {Array} items - The items array from KFA response
 * @returns {Object|null} The best matching item or null
 */
function findBestMatchKFA(keyword, items) {
    if (!items || !Array.isArray(items) || items.length === 0) return null;

    const clean = (str) => str.toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .split(/\s+/)
        .filter(x => x.length > 0);

    const kwParts = clean(keyword);
    let bestItem = items[0]; // Default to first item
    let maxScore = -1;

    for (const item of items) {
        const itemName = item.name || "";
        const itemParts = clean(itemName);

        let score = 0;
        let matchedParts = 0;

        kwParts.forEach(part => {
            if (itemParts.includes(part)) {
                score += 10;
                matchedParts++;
            } else if (itemName.toLowerCase().includes(part)) {
                score += 5; // Partial match (e.g. word inside another word)
            }
        });

        // Bonus for exact word count match
        if (matchedParts === kwParts.length) {
            score += 20;
        }

        // Penalty for extra words in item name (prefer more specific matches)
        score -= (itemParts.length - matchedParts) * 2;

        // Bonus if the first word matches (usually the drug name)
        if (itemParts[0] === kwParts[0]) {
            score += 15;
        }

        if (score > maxScore) {
            maxScore = score;
            bestItem = item;
        }
    }

    return bestItem;
}

module.exports = {
    convmils,
    milsPlus,
    getRandomTimeInMillis,
    getRandomInt,
    setStingTodate,
    convertToISO,
    convertToISO2,
    convertToISO3,
    days,
    validateNIK,
    findBestMatchKFA
}