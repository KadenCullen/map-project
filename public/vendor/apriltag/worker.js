// Worker entry. This file runs in a Web Worker.
// It loads your vendor worker code, which itself importScripts the wasm + Comlink.
importScripts('/vendor/apriltag/apriltag.js');
