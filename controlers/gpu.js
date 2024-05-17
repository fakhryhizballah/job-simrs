const { GPU } = require('gpu.js');
const gpu = new GPU();
const kernel = gpu.createKernel(function () {
    return [1, 2, 3, 4];
}, { output: [1] });
console.log(kernel()); // [Float32Array([1,2,3,4])];
const json = kernel.toJSON();
const newKernelFromJson = gpu.createKernel(json);
console.log(newKernelFromJSON()); // [Float32Array([1,2,3,4])];