const crypto = require('crypto');
const LZString = require('lz-string');

class Bpjs {
    getSignature() {
        // Node.js membaca variable di .env dengan bracket notation jika menggunakan titik
        const secretKey = process.env['BPJS.secretKey']
        const consId = process.env['BPJS.X_cons_id']
        const ppk = process.env['BPJS.kodeppk']

        // Setara dengan time() - strtotime('1970-01-01 00:00:00') di PHP (Unix timestamp dalam detik)
        const tStamp = Math.floor(Date.now() / 1000).toString();

        // Membuat HMAC-SHA256 signature lalu langsung di-encode base64
        const dataToSign = `${consId}&${tStamp}`;
        const signature = crypto.createHmac('sha256', secretKey)
            .update(dataToSign)
            .digest('base64');

        return {
            timestamp: tStamp,
            signature: signature,
            secretKey: secretKey,
            X_cons_id: consId
        };
    }

    // Saya buatkan alias untuk menjaga kompatibilitas jika di sistem sebelumnya
    // method dipanggil dengan typo "getSingnature"
    getSingnature() {
        return this.getSignature();
    }

    stringDecrypt(key, string) {
        // Hash key menggunakan SHA256 (menghasilkan buffer 32 byte)
        const keyHash = crypto.createHash('sha256').update(key).digest();

        // IV diambil dari 16 byte pertama dari key hash
        // Setara dengan substr(hex2bin(hash('sha256', $key)), 0, 16)
        const iv = keyHash.subarray(0, 16);

        const decipher = crypto.createDecipheriv('aes-256-cbc', keyHash, iv);

        // Eksekusi dekripsi dari string base64 kembali ke format string
        let decrypted = decipher.update(string, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    decompress(string) {
        return LZString.decompressFromEncodedURIComponent(string);
    }
}

module.exports = Bpjs