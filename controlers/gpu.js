const { GPU } = require('gpu.js');
const gpu = new GPU();
const kernel = gpu.createKernel(function () {
    return [1, 2, 3, 4];
}, { output: [1] });
console.log(kernel()); // [Float32Array([1,2,3,4])];
const json = kernel.toJSON();
const newKernelFromJson = gpu.createKernel(json);
console.log(newKernelFromJSON()); // [Float32Array([1,2,3,4])];


async function zz() {
    // let x = await client.keys('data:SEP:klaim:2:*');
    let x = await client.keys('data:monitoring:klaim:2023-06-01:2023-06-02:*');
    console.log(x);
    for (let i = 0; i < x.length; i++) {
        console.log(x[i]);
        client.del(x[i]);
    }
}

// zz();    