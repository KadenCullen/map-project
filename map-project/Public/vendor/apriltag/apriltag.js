<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2487.7">
  <style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica; min-height: 14.0px}
  </style>
</head>
<body>
<p class="p1">importScripts('apriltag_wasm.js');</p>
<p class="p1">importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");</p>
<p class="p2"><br></p>
<p class="p1">/**</p>
<p class="p1"><span class="Apple-converted-space"> </span>* This is a wrapper class that calls apriltag_wasm to load the WASM module and wraps the c implementation calls.</p>
<p class="p1"><span class="Apple-converted-space"> </span>* The apriltag dectector uses the tag36h11 family.</p>
<p class="p1"><span class="Apple-converted-space"> </span>* For tag pose estimation, call set_tag_size allows to indicate the size of known tags.</p>
<p class="p1"><span class="Apple-converted-space"> </span>* If size is not defined using set_tag_size() will default to the defaukt tag size of 0.15 meters</p>
<p class="p1"><span class="Apple-converted-space"> </span>*</p>
<p class="p1"><span class="Apple-converted-space"> </span>*/</p>
<p class="p1">class Apriltag {</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">  </span>/**</p>
<p class="p1"><span class="Apple-converted-space">   </span>* Contructor</p>
<p class="p1"><span class="Apple-converted-space">   </span>* @param {function} onDetectorReadyCallback Callback when the detector is ready</p>
<p class="p1"><span class="Apple-converted-space">   </span>*/</p>
<p class="p1"><span class="Apple-converted-space">    </span>constructor(onDetectorReadyCallback) {</p>
<p class="p1"><span class="Apple-converted-space">        </span>//detectorOptions = detectorOptions || {};</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">        </span>this.onDetectorReadyCallback = onDetectorReadyCallback;</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">        </span>// detector options</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._opt = {</p>
<p class="p1"><span class="Apple-converted-space">          </span>// Decimate input image by this factor</p>
<p class="p1"><span class="Apple-converted-space">          </span>quad_decimate: 2.0,</p>
<p class="p1"><span class="Apple-converted-space">          </span>// What Gaussian blur should be applied to the segmented image; standard deviation in pixels</p>
<p class="p1"><span class="Apple-converted-space">          </span>quad_sigma: 0.0,</p>
<p class="p1"><span class="Apple-converted-space">           </span>// Use this many CPU threads (no effect)</p>
<p class="p1"><span class="Apple-converted-space">          </span>nthreads: 1,</p>
<p class="p1"><span class="Apple-converted-space">          </span>// Spend more time trying to align edges of tags</p>
<p class="p1"><span class="Apple-converted-space">          </span>refine_edges: 1,</p>
<p class="p1"><span class="Apple-converted-space">          </span>// Maximum detections to return (0=return all)</p>
<p class="p1"><span class="Apple-converted-space">          </span>max_detections: 0,</p>
<p class="p1"><span class="Apple-converted-space">          </span>// Return pose (requires camera parameters)</p>
<p class="p1"><span class="Apple-converted-space">          </span>return_pose: 1,</p>
<p class="p1"><span class="Apple-converted-space">          </span>// Return pose solutions details</p>
<p class="p1"><span class="Apple-converted-space">          </span>return_solutions: 1</p>
<p class="p1"><span class="Apple-converted-space">        </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">        </span>let _this = this;</p>
<p class="p1"><span class="Apple-converted-space">        </span>AprilTagWasm().then(function (Module) {</p>
<p class="p1"><span class="Apple-converted-space">            </span>console.log("Apriltag WASM module loaded.");</p>
<p class="p1"><span class="Apple-converted-space">            </span>_this.onWasmInit(Module);</p>
<p class="p1"><span class="Apple-converted-space">        </span>});</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>/**</p>
<p class="p1"><span class="Apple-converted-space">     </span>* Init warapper calls</p>
<p class="p1"><span class="Apple-converted-space">     </span>* @param {*} Module WASM module instance</p>
<p class="p1"><span class="Apple-converted-space">     </span>*/</p>
<p class="p1"><span class="Apple-converted-space">    </span>onWasmInit(Module) {</p>
<p class="p1"><span class="Apple-converted-space">        </span>// save a reference to the module here</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._Module = Module;</p>
<p class="p1"><span class="Apple-converted-space">        </span>//int atagjs_init(); Init the apriltag detector with default options</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._init = Module.cwrap('atagjs_init', 'number', []);</p>
<p class="p1"><span class="Apple-converted-space">        </span>//int atagjs_destroy(); Releases resources allocated by the wasm module</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._destroy = Module.cwrap('atagjs_destroy', 'number', []);</p>
<p class="p1"><span class="Apple-converted-space">        </span>//int atagjs_set_detector_options(float decimate, float sigma, int nthreads, int refine_edges, int max_detections, int return_pose, int return_solutions); Sets the given detector options</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._set_detector_options = Module.cwrap('atagjs_set_detector_options', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']);</p>
<p class="p1"><span class="Apple-converted-space">        </span>//int atagjs_set_pose_info(double fx, double fy, double cx, double cy); Sets the tag size (meters) and camera intrinsics (in pixels) for tag pose estimation</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._set_pose_info = Module.cwrap('atagjs_set_pose_info', 'number', ['number', 'number', 'number', 'number']);</p>
<p class="p1"><span class="Apple-converted-space">        </span>//uint8_t* atagjs_set_img_buffer(int width, int height, int stride); Creates/changes size of the image buffer where we receive the images to process</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._set_img_buffer = Module.cwrap('atagjs_set_img_buffer', 'number', ['number', 'number', 'number']);</p>
<p class="p1"><span class="Apple-converted-space">        </span>//void *atagjs_set_tag_size(int tagid, double size)</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._atagjs_set_tag_size = Module.cwrap('atagjs_set_tag_size', null, ['number', 'number']);</p>
<p class="p1"><span class="Apple-converted-space">        </span>//t_str_json* atagjs_detect(); Detect tags in image previously stored in the buffer.</p>
<p class="p1"><span class="Apple-converted-space">        </span>//returns pointer to buffer starting with an int32 indicating the size of the remaining buffer (a string of chars with the json describing the detections)</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._detect = Module.cwrap('atagjs_detect', 'number', []);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">        </span>// inits detector</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._init();</p>
<p class="p2"><br></p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">        </span>// set max_detections = 0, meaning no max; will return all detections</p>
<p class="p1"><span class="Apple-converted-space">        </span>//options: float decimate, float sigma, int nthreads, int refine_edges, int max_detections, int return_pose, int return_solutions</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._set_detector_options(</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.quad_decimate,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.quad_sigma,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.nthreads,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.refine_edges,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.max_detections,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.return_pose,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.return_solutions);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">        </span>this.onDetectorReadyCallback();</p>
<p class="p1"><span class="Apple-converted-space">      </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">      </span>/**</p>
<p class="p1"><span class="Apple-converted-space">       </span>* **public** detect method</p>
<p class="p1"><span class="Apple-converted-space">       </span>* @param {Array} grayscaleImg grayscale image buffer</p>
<p class="p1"><span class="Apple-converted-space">       </span>* @param {Number} imgWidth image with</p>
<p class="p1"><span class="Apple-converted-space">       </span>* @param {Number} imgHeight image height</p>
<p class="p1"><span class="Apple-converted-space">       </span>* @return {detection} detection object</p>
<p class="p1"><span class="Apple-converted-space">       </span>*/</p>
<p class="p1"><span class="Apple-converted-space">    </span>detect(grayscaleImg, imgWidth, imgHeight) {</p>
<p class="p1"><span class="Apple-converted-space">        </span>// set_img_buffer allocates the buffer for image and returns it; just returns the previously allocated buffer if size has not changed</p>
<p class="p1"><span class="Apple-converted-space">        </span>let imgBuffer = this._set_img_buffer(imgWidth, imgHeight, imgWidth);</p>
<p class="p1"><span class="Apple-converted-space">        </span>if (imgWidth * imgHeight &lt; grayscaleImg.length) return { result: "Image data too large." };</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._Module.HEAPU8.set(grayscaleImg, imgBuffer); // copy grayscale image data</p>
<p class="p1"><span class="Apple-converted-space">        </span>let strJsonPtr = this._detect();</p>
<p class="p1"><span class="Apple-converted-space">        </span>/* detect returns a pointer to a t_str_json c struct as follows</p>
<p class="p1"><span class="Apple-converted-space">            </span>size_t len; // string length</p>
<p class="p1"><span class="Apple-converted-space">            </span>char *str;</p>
<p class="p1"><span class="Apple-converted-space">            </span>size_t alloc_size; // allocated size */</p>
<p class="p1"><span class="Apple-converted-space">        </span>let strJsonLen = this._Module.getValue(strJsonPtr, "i32"); // get len from struct</p>
<p class="p1"><span class="Apple-converted-space">        </span>if (strJsonLen == 0) { // returned empty string</p>
<p class="p1"><span class="Apple-converted-space">            </span>return [];</p>
<p class="p1"><span class="Apple-converted-space">        </span>}</p>
<p class="p1"><span class="Apple-converted-space">        </span>let strJsonStrPtr = this._Module.getValue(strJsonPtr + 4, "i32"); // get *str from struct</p>
<p class="p1"><span class="Apple-converted-space">        </span>const strJsonView = new Uint8Array(this._Module.HEAP8.buffer, strJsonStrPtr, strJsonLen);</p>
<p class="p1"><span class="Apple-converted-space">        </span>let detectionsJson = ''; // build this javascript string from returned characters</p>
<p class="p1"><span class="Apple-converted-space">        </span>for (let i = 0; i &lt; strJsonLen; i++) {</p>
<p class="p1"><span class="Apple-converted-space">            </span>detectionsJson += String.fromCharCode(strJsonView[i]);</p>
<p class="p1"><span class="Apple-converted-space">        </span>}</p>
<p class="p1"><span class="Apple-converted-space">        </span>//console.log(detectionsJson);</p>
<p class="p1"><span class="Apple-converted-space">        </span>let detections = JSON.parse(detectionsJson);</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">        </span>return detections;</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>/**</p>
<p class="p1"><span class="Apple-converted-space">     </span>* **public** set camera parameters</p>
<p class="p1"><span class="Apple-converted-space">     </span>* @param {Number} fx camera focal length</p>
<p class="p1"><span class="Apple-converted-space">     </span>* @param {Number} fy camera focal length</p>
<p class="p1"><span class="Apple-converted-space">     </span>* @param {Number} cx camera principal point</p>
<p class="p1"><span class="Apple-converted-space">     </span>* @param {Number} cy camera principal point</p>
<p class="p1"><span class="Apple-converted-space">     </span>*/</p>
<p class="p1"><span class="Apple-converted-space">    </span>set_camera_info(fx, fy, cx, cy) {</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._set_pose_info(fx, fy, cx, cy);</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>/**</p>
<p class="p1"><span class="Apple-converted-space">     </span>* **public** set size of known tag (size in meters)</p>
<p class="p1"><span class="Apple-converted-space">     </span>* @param {Number} tagid the tag id</p>
<p class="p1"><span class="Apple-converted-space">     </span>* @param {Number} size the size of the tag in meters</p>
<p class="p1"><span class="Apple-converted-space">     </span>*/</p>
<p class="p1"><span class="Apple-converted-space">    </span>set_tag_size(tagid, size) {</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._atagjs_set_tag_size(tagid, size);</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>/**</p>
<p class="p1"><span class="Apple-converted-space">     </span>* **public** set maximum detections to return (0=return all)</p>
<p class="p1"><span class="Apple-converted-space">     </span>* @param {Number} maxDetections</p>
<p class="p1"><span class="Apple-converted-space">     </span>*/</p>
<p class="p1"><span class="Apple-converted-space">    </span>set_max_detections(maxDetections) {</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._opt.max_detections = maxDetections;</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._set_detector_options(</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.quad_decimate,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.quad_sigma,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.nthreads,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.refine_edges,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.max_detections,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.return_pose,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.return_solutions);</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>/**</p>
<p class="p1"><span class="Apple-converted-space">     </span>* **public** set return pose estimate (0=do not return; 1=return)</p>
<p class="p1"><span class="Apple-converted-space">     </span>* @param {Number} returnPose</p>
<p class="p1"><span class="Apple-converted-space">     </span>*/</p>
<p class="p1"><span class="Apple-converted-space">    </span>set_return_pose(returnPose) {</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._opt.return_pose = returnPose;</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._set_detector_options(</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.quad_decimate,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.quad_sigma,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.nthreads,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.refine_edges,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.max_detections,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.return_pose,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.return_solutions);</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p2"><br></p>
<p class="p1"><span class="Apple-converted-space">    </span>/**</p>
<p class="p1"><span class="Apple-converted-space">     </span>* **public** set return pose estimate alternative solution details (0=do not return; 1=return)</p>
<p class="p1"><span class="Apple-converted-space">     </span>* @param {Number} returnSolutions</p>
<p class="p1"><span class="Apple-converted-space">     </span>*/</p>
<p class="p1"><span class="Apple-converted-space">    </span>set_return_solutions(returnSolutions) {</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._opt.return_solutions = returnSolutions;</p>
<p class="p1"><span class="Apple-converted-space">        </span>this._set_detector_options(</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.quad_decimate,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.quad_sigma,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.nthreads,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.refine_edges,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.max_detections,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.return_pose,</p>
<p class="p1"><span class="Apple-converted-space">          </span>this._opt.return_solutions);</p>
<p class="p1"><span class="Apple-converted-space">    </span>}</p>
<p class="p2"><br></p>
<p class="p1">}</p>
<p class="p2"><br></p>
<p class="p1">Comlink.expose(Apriltag);</p>
</body>
</html>
