async function init() {
  const bytes = new Int8Array([
    0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01,
    0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, 0x03, 0x02, 0x01, 0x00, 0x07,
    0x0a, 0x01, 0x06, 0x61, 0x64, 0x64, 0x54, 0x77, 0x6f, 0x00, 0x00,
    0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b,
    0x00, 0x0a, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x02, 0x03, 0x01, 0x01,
    0x00,
  ]);
  const wasm = await WebAssembly.instantiate(bytes.buffer);
  const { addTwo } = wasm.instance.exports;
  console.log(addTwo(100, 200));
}

init();

