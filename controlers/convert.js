const fs = require('fs');
const path = require('path');

// Fungsi untuk membaca dan mengonversi file .txt ke JSON
const convertTxtToJson = (inputFile, outputFile) => {
    fs.readFile(inputFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        try {
            // Pisahkan data berdasarkan baris
            const lines = data.split('\n').filter(line => line.trim() !== '');

            // Baris pertama adalah header
            const headers = lines[0].split('\t');

            // Sisanya adalah isi data
            const jsonData = lines.slice(1).map(line => {
                const values = line.split('\t');
                return headers.reduce((obj, header, index) => {
                    obj[header] = values[index] || null; // Set nilai ke null jika tidak ada
                    return obj;
                }, {});
            });

            // Simpan data JSON ke file
            fs.writeFile(outputFile, JSON.stringify(jsonData, null, 4), err => {
                if (err) {
                    console.error('Error writing JSON file:', err);
                    return;
                }
                console.log(`File berhasil disimpan sebagai ${outputFile}`);
            });
        } catch (parseErr) {
            console.error('Error parsing data:', parseErr);
        }
    });
};

// Jalankan fungsi
const inputFile = path.join(__dirname, '../cache/6172011_20241213_MIX.TXT'); // Ganti dengan nama file .txt Anda
const outputFile = path.join(__dirname, '../cache/6172011_20241213_MIX.json');
convertTxtToJson(inputFile, outputFile);