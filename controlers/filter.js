const fs = require('fs');
const path = require('path');

async function uji(namefile, filterData) {
    let cekfile = fs.readFileSync(path.join(__dirname, '../cache/2024A.json'));
    cekfile = JSON.parse(cekfile);
    let jsonData = cekfile.filter(item => {
        let diagArr = item.DIAGLIST.split(";");
        return diagArr.some(diagCode => filterData.some(filterCode => diagCode.startsWith(filterCode)));
    });
    fs.writeFile(path.join(__dirname, '../cache/' + namefile + '.json'), JSON.stringify(jsonData, null, 4), err => {
                    if (err) {
                        console.error('Error writing JSON file:', err);
                        return;
                    }
        console.log(`File berhasil disimpan sebagai ${namefile}.json`);
                });

}



let jantung =["I00", "I01", "I02", "I05", "I06", "I07", "I08", "I09", "I10", "I11", "I12", "I13", "I14", "I15", "I20", "I21", "I22", "I23", "I24", "I25", "I26", "I27", "I28", "I30", "I31", "I32", "I33", "I34", "I35", "I36", "I37", "I38", "I39", "I40", "I41", "I42", "I43", "I44", "I45", "I46", "I47", "I48", "I49", "I50", "I51", "I52", "I60", "I61", "I62", "I63", "I64", "I65", "I66", "I67", "I68", "I69", "I70", "I71", "I72", "I73", "I74", "I75", "I76", "I77", "I78", "I79", "I80", "I81", "I82", "I83", "I84", "I85", "I86", "I87", "I88", "I89", "I95", "I96", "I97", "I98", "I99"]
let urologi = ["N00", "N01", "N02", "N03", "N04", "N05", "N06", "N07", "N08", "N10", "N11", "N12", "N13", "N14", "N15", "N16", "N17", "N18", "N19", "N20", "N21", "N22", "N23", "N25", "N26", "N27", "N28", "N29", "N30", "N31", "N32", "N33", "N34", "N35", "N36", "N37", "N38", "N39", "N40", "N41", "N42", "N43", "N44", "N45", "N46", "N47", "N48", "N49", "N50", "N51", "N60", "N61", "N62", "N63", "N64", "N70", "N71", "N72", "N73", "N74", "N75", "N76", "N77", "N80", "N81", "N82", "N83", "N84", "N85", "N86", "N87", "N88", "N89", "N90", "N91", "N92", "N93", "N94", "N95", "N96", "N97", "N98", "N99"];
let strok = ["I60", "I61", "I62", "I63", "I64", "I65", "I66", "I67", "I68", "I69"];
let Kangker = ["C00", "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12", "C13", "C14", "C15", "C16", "C17", "C18", "C19", "C20", "C21", "C22", "C23", "C24", "C25", "C26", "C27", "C28", "C29", "C30", "C31", "C32", "C33", "C34", "C35", "C36", "C37", "C38", "C39", "C40", "C41", "C42", "C43", "C44", "C45", "C46", "C47", "C48", "C49", "C50", "C51", "C52", "C53", "C54", "C55", "C56", "C57", "C58", "C59", "C60", "C61", "C62", "C63", "C64", "C65", "C66", "C67", "C68", "C69", "C70", "C71", "C72", "C73", "C74", "C75", "C76", "C77", "C78", "C79", "C80", "C81", "C82", "C83", "C84", "C85", "C86", "C87", "C88", "C89", "C90", "C91", "C92", "C93", "C94", "C95", "C96", "C97", "C98", "C99", "D00", "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "D13", "D14", "D15", "D16", "D17", "D18", "D19", "D20", "D21", "D22", "D23", "D24", "D25", "D26", "D27", "D28", "D29", "D30", "D31", "D32", "D33", "D34", "D35", "D36", "D37", "D38", "D39", "D40", "D41", "D42", "D43", "D44", "D45", "D46", "D47", "D48"];
// uji("Kangker", Kangker);

async function convert(file) {
    let cekfile = fs.readFileSync(path.join(__dirname, '../cache/' + file + '.json'));
    cekfile = JSON.parse(cekfile)
    for (let x of cekfile) {
        x.TARIF_INACBG = parseInt(x.TARIF_INACBG);
        x.TARIF_RS = parseInt(x.TARIF_RS);
        x.TOTAL_TARIF = parseInt(x.TOTAL_TARIF);

    }
    fs.writeFile(path.join(__dirname, '../cache/' + file + '.json'), JSON.stringify(cekfile, null, 4), err => {
        if (err) {
            console.error('Error writing JSON file:', err);
            return;
        }
        console.log(`File berhasil disimpan sebagai ${file}.json`);
    });
    
}
convert('2024A') 