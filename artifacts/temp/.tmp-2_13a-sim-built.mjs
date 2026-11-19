import fs from "node:fs/promises";
import path from "node:path";
/**
* @license
* Copyright 2010-2026 Three.js Authors
* SPDX-License-Identifier: MIT
*/
/**
* The skinned mesh shares the same world space as the skeleton.
*
* @type {string}
* @constant
*/
const AttachedBindMode = "attached";
/**
* The texture will simply repeat to infinity.
*
* @type {number}
* @constant
*/
const RepeatWrapping = 1e3;
/**
* The last pixel of the texture stretches to the edge of the mesh.
*
* @type {number}
* @constant
*/
const ClampToEdgeWrapping = 1001;
/**
* The texture will repeats to infinity, mirroring on each repeat.
*
* @type {number}
* @constant
*/
const MirroredRepeatWrapping = 1002;
/**
* Returns the value of the texture element that is nearest (in Manhattan distance)
* to the specified texture coordinates.
*
* @type {number}
* @constant
*/
const NearestFilter = 1003;
/**
* Chooses the mipmap that most closely matches the size of the pixel being textured
* and uses the `NearestFilter` criterion (the texel nearest to the center of the pixel)
* to produce a texture value.
*
* @type {number}
* @constant
*/
const NearestMipmapNearestFilter = 1004;
/**
* Chooses the two mipmaps that most closely match the size of the pixel being textured and
* uses the `NearestFilter` criterion to produce a texture value from each mipmap.
* The final texture value is a weighted average of those two values.
*
* @type {number}
* @constant
*/
const NearestMipmapLinearFilter = 1005;
/**
* Returns the weighted average of the four texture elements that are closest to the specified
* texture coordinates, and can include items wrapped or repeated from other parts of a texture,
* depending on the values of `wrapS` and `wrapT`, and on the exact mapping.
*
* @type {number}
* @constant
*/
const LinearFilter = 1006;
/**
* Chooses the mipmap that most closely matches the size of the pixel being textured and uses
* the `LinearFilter` criterion (a weighted average of the four texels that are closest to the
* center of the pixel) to produce a texture value.
*
* @type {number}
* @constant
*/
const LinearMipmapNearestFilter = 1007;
/**
* Chooses the two mipmaps that most closely match the size of the pixel being textured and uses
* the `LinearFilter` criterion to produce a texture value from each mipmap. The final texture value
* is a weighted average of those two values.
*
* @type {number}
* @constant
*/
const LinearMipmapLinearFilter = 1008;
/**
* An unsigned byte data type for textures.
*
* @type {number}
* @constant
*/
const UnsignedByteType = 1009;
/**
* A float data type for textures.
*
* @type {number}
* @constant
*/
const FloatType = 1015;
/**
* Reads the red, green, blue and alpha components.
*
* @type {number}
* @constant
*/
const RGBAFormat = 1023;
/**
* Discards the green, blue and alpha components and reads just the red component.
*
* @type {number}
* @constant
*/
const RedFormat = 1028;
/**
* Animations are played once.
*
* @type {number}
* @constant
*/
const LoopOnce = 2200;
/**
* Animations are played with a chosen number of repetitions, each time jumping from
* the end of the clip directly to its beginning.
*
* @type {number}
* @constant
*/
const LoopRepeat = 2201;
/**
* Animations are played with a chosen number of repetitions, alternately playing forward
* and backward.
*
* @type {number}
* @constant
*/
const LoopPingPong = 2202;
/**
* Discrete interpolation mode for keyframe tracks.
*
* @type {number}
* @constant
*/
const InterpolateDiscrete = 2300;
/**
* Linear interpolation mode for keyframe tracks.
*
* @type {number}
* @constant
*/
const InterpolateLinear = 2301;
/**
* Smooth interpolation mode for keyframe tracks.
*
* @type {number}
* @constant
*/
const InterpolateSmooth = 2302;
/**
* Bezier interpolation mode for keyframe tracks.
*
* Uses cubic Bezier curves with explicit 2D control points.
* Requires tangent data to be set on the track.
*
* @type {number}
* @constant
*/
const InterpolateBezier = 2303;
/**
* Zero curvature ending for animations.
*
* @type {number}
* @constant
*/
const ZeroCurvatureEnding = 2400;
/**
* Zero slope ending for animations.
*
* @type {number}
* @constant
*/
const ZeroSlopeEnding = 2401;
/**
* Wrap around ending for animations.
*
* @type {number}
* @constant
*/
const WrapAroundEnding = 2402;
/**
* Default animation blend mode.
*
* @type {number}
* @constant
*/
const NormalAnimationBlendMode = 2500;
/**
* Additive animation blend mode. Can be used to layer motions on top of
* each other to build complex performances from smaller re-usable assets.
*
* @type {number}
* @constant
*/
const AdditiveAnimationBlendMode = 2501;
/**
* sRGB color space.
*
* @type {string}
* @constant
*/
const SRGBColorSpace = "srgb";
/**
* sRGB-linear color space.
*
* @type {string}
* @constant
*/
const LinearSRGBColorSpace = "srgb-linear";
/**
* Linear transfer function.
*
* @type {string}
* @constant
*/
const LinearTransfer = "linear";
/**
* sRGB transfer function.
*
* @type {string}
* @constant
*/
const SRGBTransfer = "srgb";
/**
* Keeps the current value.
*
* @type {number}
* @constant
*/
const KeepStencilOp = 7680;
/**
* The contents are intended to be specified once by the application, and used many
* times as the source for drawing and image specification commands.
*
* @type {number}
* @constant
*/
const StaticDrawUsage = 35044;
/**
* WebGL coordinate system.
*
* @type {number}
* @constant
*/
const WebGLCoordinateSystem = 2e3;
/**
* This type represents mouse buttons and interaction types in context of controls.
*
* @typedef {Object} ConstantsMouse
* @property {number} MIDDLE - The left mouse button.
* @property {number} LEFT - The middle mouse button.
* @property {number} RIGHT - The right mouse button.
* @property {number} ROTATE - A rotate interaction.
* @property {number} DOLLY - A dolly interaction.
* @property {number} PAN - A pan interaction.
**/
/**
* This type represents touch interaction types in context of controls.
*
* @typedef {Object} ConstantsTouch
* @property {number} ROTATE - A rotate interaction.
* @property {number} PAN - A pan interaction.
* @property {number} DOLLY_PAN - The dolly-pan interaction.
* @property {number} DOLLY_ROTATE - A dolly-rotate interaction.
**/
/**
* This type represents the different timestamp query types.
*
* @typedef {Object} ConstantsTimestampQuery
* @property {string} COMPUTE - A `compute` timestamp query.
* @property {string} RENDER - A `render` timestamp query.
**/
/**
* Represents the different interpolation sampling types.
*
* @typedef {Object} ConstantsInterpolationSamplingType
* @property {string} PERSPECTIVE - Perspective-correct interpolation.
* @property {string} LINEAR - Linear interpolation.
* @property {string} FLAT - Flat interpolation.
*/
/**
* Represents the different interpolation sampling modes.
*
* @typedef {Object} ConstantsInterpolationSamplingMode
* @property {string} NORMAL - Normal sampling mode.
* @property {string} CENTROID - Centroid sampling mode.
* @property {string} SAMPLE - Sample-specific sampling mode.
* @property {string} FIRST - Flat interpolation using the first vertex.
* @property {string} EITHER - Flat interpolation using either vertex.
*/
/**
* Represents the refresh types of render objects.
*
* @typedef {Object} ConstantsRenderObjectRefreshType
* @property {number} NONE - No refresh required.
* @property {number} SHARED - Only shared uniform buffers require an update.
* @property {number} FULL - The render object requires a full refresh.
*/
/**
* Checks if an array contains values that require Uint32 representation.
*
* This function determines whether the array contains any values >= 65535,
* which would require a Uint32Array rather than a Uint16Array for proper storage.
* The function iterates from the end of the array, assuming larger values are
* typically located at the end.
*
* @private
* @param {Array<number>} array - The array to check.
* @return {boolean} True if the array contains values >= 65535, false otherwise.
*/
function arrayNeedsUint32(array) {
	for (let i = array.length - 1; i >= 0; --i) if (array[i] >= 65535) return true;
	return false;
}
/**
* Returns `true` if the given object is a typed array.
*
* @param {any} array - The object to check.
* @return {boolean} Whether the given object is a typed array.
*/
function isTypedArray(array) {
	return ArrayBuffer.isView(array) && !(array instanceof DataView);
}
/**
* Creates an XHTML element with the specified tag name.
*
* This function uses the XHTML namespace to create DOM elements,
* ensuring proper element creation in XML-based contexts.
*
* @private
* @param {string} name - The tag name of the element to create (e.g., 'canvas', 'div').
* @return {HTMLElement} The created XHTML element.
*/
function createElementNS(name) {
	return document.createElementNS("http://www.w3.org/1999/xhtml", name);
}
/**
* Internal cache for tracking warning messages to prevent duplicate warnings.
*
* @private
* @type {Object<string, boolean>}
*/
const _cache = {};
/**
* Logs an informational message with the 'THREE.' prefix.
*
* If a custom console function is set via setConsoleFunction(), it will be used
* instead of the native console.log. The first parameter is treated as the
* method name and is automatically prefixed with 'THREE.'.
*
* @param {...any} params - The message components. The first param is used as
*                          the method name and prefixed with 'THREE.'.
*/
function log(...params) {
	const message = "THREE." + params.shift();
	console.log(message, ...params);
}
/**
* Enhances log/warn/error messages related to TSL.
*
* @param {Array<any>} params - The original message parameters.
* @returns {Array<any>} The filtered and enhanced message parameters.
*/
function enhanceLogMessage(params) {
	const message = params[0];
	if (typeof message === "string" && message.startsWith("TSL:")) {
		const stackTrace = params[1];
		if (stackTrace && stackTrace.isStackTrace) params[0] += " " + stackTrace.getLocation();
		else params[1] = "Stack trace not available. Enable \"THREE.Node.captureStackTrace\" to capture stack traces.";
	}
	return params;
}
/**
* Logs a warning message with the 'THREE.' prefix.
*
* If a custom console function is set via setConsoleFunction(), it will be used
* instead of the native console.warn. The first parameter is treated as the
* method name and is automatically prefixed with 'THREE.'.
*
* @param {...any} params - The message components. The first param is used as
*                          the method name and prefixed with 'THREE.'.
*/
function warn(...params) {
	params = enhanceLogMessage(params);
	const message = "THREE." + params.shift();
	{
		const stackTrace = params[0];
		if (stackTrace && stackTrace.isStackTrace) console.warn(stackTrace.getError(message));
		else console.warn(message, ...params);
	}
}
/**
* Logs an error message with the 'THREE.' prefix.
*
* If a custom console function is set via setConsoleFunction(), it will be used
* instead of the native console.error. The first parameter is treated as the
* method name and is automatically prefixed with 'THREE.'.
*
* @param {...any} params - The message components. The first param is used as
*                          the method name and prefixed with 'THREE.'.
*/
function error(...params) {
	params = enhanceLogMessage(params);
	const message = "THREE." + params.shift();
	{
		const stackTrace = params[0];
		if (stackTrace && stackTrace.isStackTrace) console.error(stackTrace.getError(message));
		else console.error(message, ...params);
	}
}
/**
* Logs a warning message only once, preventing duplicate warnings.
*
* This function maintains an internal cache of warning messages and will only
* output each unique warning message once. Useful for warnings that may be
* triggered repeatedly but should only be shown to the user once.
*
* @param {...any} params - The warning message components.
*/
function warnOnce(...params) {
	const message = params.join(" ");
	if (message in _cache) return;
	_cache[message] = true;
	warn(...params);
}
/**
* This modules allows to dispatch event objects on custom JavaScript objects.
*
* Main repository: [eventdispatcher.js](https://github.com/mrdoob/eventdispatcher.js/)
*
* Code Example:
* ```js
* class Car extends EventDispatcher {
* 	start() {
*		this.dispatchEvent( { type: 'start', message: 'vroom vroom!' } );
*	}
*};
*
* // Using events with the custom object
* const car = new Car();
* car.addEventListener( 'start', function ( event ) {
* 	alert( event.message );
* } );
*
* car.start();
* ```
*/
var EventDispatcher = class {
	/**
	* Adds the given event listener to the given event type.
	*
	* @param {string} type - The type of event to listen to.
	* @param {Function} listener - The function that gets called when the event is fired.
	*/
	addEventListener(type, listener) {
		if (this._listeners === void 0) this._listeners = {};
		const listeners = this._listeners;
		if (listeners[type] === void 0) listeners[type] = [];
		if (listeners[type].indexOf(listener) === -1) listeners[type].push(listener);
	}
	/**
	* Returns `true` if the given event listener has been added to the given event type.
	*
	* @param {string} type - The type of event.
	* @param {Function} listener - The listener to check.
	* @return {boolean} Whether the given event listener has been added to the given event type.
	*/
	hasEventListener(type, listener) {
		const listeners = this._listeners;
		if (listeners === void 0) return false;
		return listeners[type] !== void 0 && listeners[type].indexOf(listener) !== -1;
	}
	/**
	* Removes the given event listener from the given event type.
	*
	* @param {string} type - The type of event.
	* @param {Function} listener - The listener to remove.
	*/
	removeEventListener(type, listener) {
		const listeners = this._listeners;
		if (listeners === void 0) return;
		const listenerArray = listeners[type];
		if (listenerArray !== void 0) {
			const index = listenerArray.indexOf(listener);
			if (index !== -1) listenerArray.splice(index, 1);
		}
	}
	/**
	* Dispatches an event object.
	*
	* @param {Object} event - The event that gets fired.
	*/
	dispatchEvent(event) {
		const listeners = this._listeners;
		if (listeners === void 0) return;
		const listenerArray = listeners[event.type];
		if (listenerArray !== void 0) {
			event.target = this;
			const array = listenerArray.slice(0);
			for (let i = 0, l = array.length; i < l; i++) array[i].call(this, event);
			event.target = null;
		}
	}
};
const _lut = [
	"00",
	"01",
	"02",
	"03",
	"04",
	"05",
	"06",
	"07",
	"08",
	"09",
	"0a",
	"0b",
	"0c",
	"0d",
	"0e",
	"0f",
	"10",
	"11",
	"12",
	"13",
	"14",
	"15",
	"16",
	"17",
	"18",
	"19",
	"1a",
	"1b",
	"1c",
	"1d",
	"1e",
	"1f",
	"20",
	"21",
	"22",
	"23",
	"24",
	"25",
	"26",
	"27",
	"28",
	"29",
	"2a",
	"2b",
	"2c",
	"2d",
	"2e",
	"2f",
	"30",
	"31",
	"32",
	"33",
	"34",
	"35",
	"36",
	"37",
	"38",
	"39",
	"3a",
	"3b",
	"3c",
	"3d",
	"3e",
	"3f",
	"40",
	"41",
	"42",
	"43",
	"44",
	"45",
	"46",
	"47",
	"48",
	"49",
	"4a",
	"4b",
	"4c",
	"4d",
	"4e",
	"4f",
	"50",
	"51",
	"52",
	"53",
	"54",
	"55",
	"56",
	"57",
	"58",
	"59",
	"5a",
	"5b",
	"5c",
	"5d",
	"5e",
	"5f",
	"60",
	"61",
	"62",
	"63",
	"64",
	"65",
	"66",
	"67",
	"68",
	"69",
	"6a",
	"6b",
	"6c",
	"6d",
	"6e",
	"6f",
	"70",
	"71",
	"72",
	"73",
	"74",
	"75",
	"76",
	"77",
	"78",
	"79",
	"7a",
	"7b",
	"7c",
	"7d",
	"7e",
	"7f",
	"80",
	"81",
	"82",
	"83",
	"84",
	"85",
	"86",
	"87",
	"88",
	"89",
	"8a",
	"8b",
	"8c",
	"8d",
	"8e",
	"8f",
	"90",
	"91",
	"92",
	"93",
	"94",
	"95",
	"96",
	"97",
	"98",
	"99",
	"9a",
	"9b",
	"9c",
	"9d",
	"9e",
	"9f",
	"a0",
	"a1",
	"a2",
	"a3",
	"a4",
	"a5",
	"a6",
	"a7",
	"a8",
	"a9",
	"aa",
	"ab",
	"ac",
	"ad",
	"ae",
	"af",
	"b0",
	"b1",
	"b2",
	"b3",
	"b4",
	"b5",
	"b6",
	"b7",
	"b8",
	"b9",
	"ba",
	"bb",
	"bc",
	"bd",
	"be",
	"bf",
	"c0",
	"c1",
	"c2",
	"c3",
	"c4",
	"c5",
	"c6",
	"c7",
	"c8",
	"c9",
	"ca",
	"cb",
	"cc",
	"cd",
	"ce",
	"cf",
	"d0",
	"d1",
	"d2",
	"d3",
	"d4",
	"d5",
	"d6",
	"d7",
	"d8",
	"d9",
	"da",
	"db",
	"dc",
	"dd",
	"de",
	"df",
	"e0",
	"e1",
	"e2",
	"e3",
	"e4",
	"e5",
	"e6",
	"e7",
	"e8",
	"e9",
	"ea",
	"eb",
	"ec",
	"ed",
	"ee",
	"ef",
	"f0",
	"f1",
	"f2",
	"f3",
	"f4",
	"f5",
	"f6",
	"f7",
	"f8",
	"f9",
	"fa",
	"fb",
	"fc",
	"fd",
	"fe",
	"ff"
];
let _seed = 1234567;
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
/**
* Generate a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)
* (universally unique identifier).
*
* @return {string} The UUID.
*/
function generateUUID() {
	const d0 = Math.random() * 4294967295 | 0;
	const d1 = Math.random() * 4294967295 | 0;
	const d2 = Math.random() * 4294967295 | 0;
	const d3 = Math.random() * 4294967295 | 0;
	return (_lut[d0 & 255] + _lut[d0 >> 8 & 255] + _lut[d0 >> 16 & 255] + _lut[d0 >> 24 & 255] + "-" + _lut[d1 & 255] + _lut[d1 >> 8 & 255] + "-" + _lut[d1 >> 16 & 15 | 64] + _lut[d1 >> 24 & 255] + "-" + _lut[d2 & 63 | 128] + _lut[d2 >> 8 & 255] + "-" + _lut[d2 >> 16 & 255] + _lut[d2 >> 24 & 255] + _lut[d3 & 255] + _lut[d3 >> 8 & 255] + _lut[d3 >> 16 & 255] + _lut[d3 >> 24 & 255]).toLowerCase();
}
/**
* Clamps the given value between min and max.
*
* @param {number} value - The value to clamp.
* @param {number} min - The min value.
* @param {number} max - The max value.
* @return {number} The clamped value.
*/
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
/**
* Computes the Euclidean modulo of the given parameters that
* is `( ( n % m ) + m ) % m`.
*
* @param {number} n - The first parameter.
* @param {number} m - The second parameter.
* @return {number} The Euclidean modulo.
*/
function euclideanModulo(n, m) {
	return (n % m + m) % m;
}
/**
* Performs a linear mapping from range `<a1, a2>` to range `<b1, b2>`
* for the given value. `a2` must be greater than `a1`.
*
* @param {number} x - The value to be mapped.
* @param {number} a1 - Minimum value for range A.
* @param {number} a2 - Maximum value for range A.
* @param {number} b1 - Minimum value for range B.
* @param {number} b2 - Maximum value for range B.
* @return {number} The mapped value.
*/
function mapLinear(x, a1, a2, b1, b2) {
	return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
}
/**
* Returns the percentage in the closed interval `[0, 1]` of the given value
* between the start and end point.
*
* @param {number} x - The start point
* @param {number} y - The end point.
* @param {number} value - A value between start and end.
* @return {number} The interpolation factor.
*/
function inverseLerp(x, y, value) {
	if (x !== y) return (value - x) / (y - x);
	else return 0;
}
/**
* Returns a value linearly interpolated from two known points based on the given interval -
* `t = 0` will return `x` and `t = 1` will return `y`.
*
* @param {number} x - The start point
* @param {number} y - The end point.
* @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
* @return {number} The interpolated value.
*/
function lerp(x, y, t) {
	return (1 - t) * x + t * y;
}
/**
* Smoothly interpolate a number from `x` to `y` in  a spring-like manner using a delta
* time to maintain frame rate independent movement. For details, see
* [Frame rate independent damping using lerp](http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/).
*
* @param {number} x - The current point.
* @param {number} y - The target point.
* @param {number} lambda - A higher lambda value will make the movement more sudden,
* and a lower value will make the movement more gradual.
* @param {number} dt - Delta time in seconds.
* @return {number} The interpolated value.
*/
function damp(x, y, lambda, dt) {
	return lerp(x, y, 1 - Math.exp(-lambda * dt));
}
/**
* Returns a value that alternates between `0` and the given `length` parameter.
*
* @param {number} x - The value to pingpong.
* @param {number} [length=1] - The positive value the function will pingpong to.
* @return {number} The alternated value.
*/
function pingpong(x, length = 1) {
	return length - Math.abs(euclideanModulo(x, length * 2) - length);
}
/**
* Returns a value in the range `[0,1]` that represents the percentage that `x` has
* moved between `min` and `max`, but smoothed or slowed down the closer `x` is to
* the `min` and `max`.
*
* See [Smoothstep](http://en.wikipedia.org/wiki/Smoothstep) for more details.
*
* @param {number} x - The value to evaluate based on its position between `min` and `max`.
* @param {number} min - The min value. Any `x` value below `min` will be `0`. `min` must be lower than `max`.
* @param {number} max - The max value. Any `x` value above `max` will be `1`. `max` must be greater than `min`.
* @return {number} The alternated value.
*/
function smoothstep(x, min, max) {
	if (x <= min) return 0;
	if (x >= max) return 1;
	x = (x - min) / (max - min);
	return x * x * (3 - 2 * x);
}
/**
* A [variation on smoothstep](https://en.wikipedia.org/wiki/Smoothstep#Variations)
* that has zero 1st and 2nd order derivatives at `x=0` and `x=1`.
*
* @param {number} x - The value to evaluate based on its position between `min` and `max`.
* @param {number} min - The min value. Any `x` value below `min` will be `0`. `min` must be lower than `max`.
* @param {number} max - The max value. Any `x` value above `max` will be `1`. `max` must be greater than `min`.
* @return {number} The alternated value.
*/
function smootherstep(x, min, max) {
	if (x <= min) return 0;
	if (x >= max) return 1;
	x = (x - min) / (max - min);
	return x * x * x * (x * (x * 6 - 15) + 10);
}
/**
* Returns a random integer from `<low, high>` interval.
*
* @param {number} low - The lower value boundary.
* @param {number} high - The upper value boundary
* @return {number} A random integer.
*/
function randInt(low, high) {
	return low + Math.floor(Math.random() * (high - low + 1));
}
/**
* Returns a random float from `<low, high>` interval.
*
* @param {number} low - The lower value boundary.
* @param {number} high - The upper value boundary
* @return {number} A random float.
*/
function randFloat(low, high) {
	return low + Math.random() * (high - low);
}
/**
* Returns a random integer from `<-range/2, range/2>` interval.
*
* @param {number} range - Defines the value range.
* @return {number} A random float.
*/
function randFloatSpread(range) {
	return range * (.5 - Math.random());
}
/**
* Returns a deterministic pseudo-random float in the interval `[0, 1]`.
*
* @param {number} [s] - The integer seed.
* @return {number} A random float.
*/
function seededRandom(s) {
	if (s !== void 0) _seed = s;
	let t = _seed += 1831565813;
	t = Math.imul(t ^ t >>> 15, t | 1);
	t ^= t + Math.imul(t ^ t >>> 7, t | 61);
	return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
/**
* Converts degrees to radians.
*
* @param {number} degrees - A value in degrees.
* @return {number} The converted value in radians.
*/
function degToRad(degrees) {
	return degrees * DEG2RAD;
}
/**
* Converts radians to degrees.
*
* @param {number} radians - A value in radians.
* @return {number} The converted value in degrees.
*/
function radToDeg(radians) {
	return radians * RAD2DEG;
}
/**
* Returns `true` if the given integer is a power of two.
*
* @param {number} value - The value to check.
* @return {boolean} Whether the given integer is a power of two or not.
*/
function isPowerOfTwo(value) {
	return value > 0 && Number.isInteger(value) && 2 ** Math.round(Math.log2(value)) === value;
}
/**
* Returns the smallest power of two that is greater than or equal to the given number.
*
* @param {number} value - The value to find a POT for. Must be greater than `0`.
* @return {number} The smallest power of two that is greater than or equal to the given number.
*/
function ceilPowerOfTwo(value) {
	return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
}
/**
* Returns the largest power of two that is less than or equal to the given number.
*
* @param {number} value - The value to find a POT for. Must be greater than `0`.
* @return {number} The largest power of two that is less than or equal to the given number.
*/
function floorPowerOfTwo(value) {
	return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
}
/**
* Sets the given quaternion from the [Intrinsic Proper Euler Angles](https://en.wikipedia.org/wiki/Euler_angles)
* defined by the given angles and order.
*
* Rotations are applied to the axes in the order specified by order:
* rotation by angle `a` is applied first, then by angle `b`, then by angle `c`.
*
* @param {Quaternion} q - The quaternion to set.
* @param {number} a - The rotation applied to the first axis, in radians.
* @param {number} b - The rotation applied to the second axis, in radians.
* @param {number} c - The rotation applied to the third axis, in radians.
* @param {('XYX'|'XZX'|'YXY'|'YZY'|'ZXZ'|'ZYZ')} order - A string specifying the axes order.
*/
function setQuaternionFromProperEuler(q, a, b, c, order) {
	const cos = Math.cos;
	const sin = Math.sin;
	const c2 = cos(b / 2);
	const s2 = sin(b / 2);
	const c13 = cos((a + c) / 2);
	const s13 = sin((a + c) / 2);
	const c1_3 = cos((a - c) / 2);
	const s1_3 = sin((a - c) / 2);
	const c3_1 = cos((c - a) / 2);
	const s3_1 = sin((c - a) / 2);
	switch (order) {
		case "XYX":
			q.set(c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13);
			break;
		case "YZY":
			q.set(s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13);
			break;
		case "ZXZ":
			q.set(s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13);
			break;
		case "XZX":
			q.set(c2 * s13, s2 * s3_1, s2 * c3_1, c2 * c13);
			break;
		case "YXY":
			q.set(s2 * c3_1, c2 * s13, s2 * s3_1, c2 * c13);
			break;
		case "ZYZ":
			q.set(s2 * s3_1, s2 * c3_1, c2 * s13, c2 * c13);
			break;
		default: warn("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + order);
	}
}
/**
* Denormalizes the given value according to the given typed array.
*
* @param {number} value - The value to denormalize.
* @param {TypedArray} array - The typed array that defines the data type of the value.
* @return {number} The denormalize (float) value in the range `[0,1]`.
*/
function denormalize(value, array) {
	switch (array.constructor) {
		case Float32Array: return value;
		case Uint32Array: return value / 4294967295;
		case Uint16Array: return value / 65535;
		case Uint8Array:
		case Uint8ClampedArray: return value / 255;
		case Int32Array: return Math.max(value / 2147483647, -1);
		case Int16Array: return Math.max(value / 32767, -1);
		case Int8Array: return Math.max(value / 127, -1);
		default: throw new Error("THREE.MathUtils: Invalid component type.");
	}
}
/**
* Normalizes the given value according to the given typed array.
*
* @param {number} value - The float value in the range `[0,1]` to normalize.
* @param {TypedArray} array - The typed array that defines the data type of the value.
* @return {number} The normalize value.
*/
function normalize(value, array) {
	switch (array.constructor) {
		case Float32Array: return value;
		case Uint32Array: return Math.round(value * 4294967295);
		case Uint16Array: return Math.round(value * 65535);
		case Uint8Array:
		case Uint8ClampedArray: return Math.round(value * 255);
		case Int32Array: return Math.round(value * 2147483647);
		case Int16Array: return Math.round(value * 32767);
		case Int8Array: return Math.round(value * 127);
		default: throw new Error("THREE.MathUtils: Invalid component type.");
	}
}
/**
* @class
* @classdesc A collection of math utility functions.
* @hideconstructor
*/
const MathUtils = {
	DEG2RAD,
	RAD2DEG,
	/**
	* Generate a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)
	* (universally unique identifier).
	*
	* @static
	* @method
	* @return {string} The UUID.
	*/
	generateUUID,
	/**
	* Clamps the given value between min and max.
	*
	* @static
	* @method
	* @param {number} value - The value to clamp.
	* @param {number} min - The min value.
	* @param {number} max - The max value.
	* @return {number} The clamped value.
	*/
	clamp,
	/**
	* Computes the Euclidean modulo of the given parameters that
	* is `( ( n % m ) + m ) % m`.
	*
	* @static
	* @method
	* @param {number} n - The first parameter.
	* @param {number} m - The second parameter.
	* @return {number} The Euclidean modulo.
	*/
	euclideanModulo,
	/**
	* Performs a linear mapping from range `<a1, a2>` to range `<b1, b2>`
	* for the given value.
	*
	* @static
	* @method
	* @param {number} x - The value to be mapped.
	* @param {number} a1 - Minimum value for range A.
	* @param {number} a2 - Maximum value for range A.
	* @param {number} b1 - Minimum value for range B.
	* @param {number} b2 - Maximum value for range B.
	* @return {number} The mapped value.
	*/
	mapLinear,
	/**
	* Returns the percentage in the closed interval `[0, 1]` of the given value
	* between the start and end point.
	*
	* @static
	* @method
	* @param {number} x - The start point
	* @param {number} y - The end point.
	* @param {number} value - A value between start and end.
	* @return {number} The interpolation factor.
	*/
	inverseLerp,
	/**
	* Returns a value linearly interpolated from two known points based on the given interval -
	* `t = 0` will return `x` and `t = 1` will return `y`.
	*
	* @static
	* @method
	* @param {number} x - The start point
	* @param {number} y - The end point.
	* @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
	* @return {number} The interpolated value.
	*/
	lerp,
	/**
	* Smoothly interpolate a number from `x` to `y` in  a spring-like manner using a delta
	* time to maintain frame rate independent movement. For details, see
	* [Frame rate independent damping using lerp](http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/).
	*
	* @static
	* @method
	* @param {number} x - The current point.
	* @param {number} y - The target point.
	* @param {number} lambda - A higher lambda value will make the movement more sudden,
	* and a lower value will make the movement more gradual.
	* @param {number} dt - Delta time in seconds.
	* @return {number} The interpolated value.
	*/
	damp,
	/**
	* Returns a value that alternates between `0` and the given `length` parameter.
	*
	* @static
	* @method
	* @param {number} x - The value to pingpong.
	* @param {number} [length=1] - The positive value the function will pingpong to.
	* @return {number} The alternated value.
	*/
	pingpong,
	/**
	* Returns a value in the range `[0,1]` that represents the percentage that `x` has
	* moved between `min` and `max`, but smoothed or slowed down the closer `x` is to
	* the `min` and `max`.
	*
	* See [Smoothstep](http://en.wikipedia.org/wiki/Smoothstep) for more details.
	*
	* @static
	* @method
	* @param {number} x - The value to evaluate based on its position between min and max.
	* @param {number} min - The min value. Any x value below min will be `0`.
	* @param {number} max - The max value. Any x value above max will be `1`.
	* @return {number} The alternated value.
	*/
	smoothstep,
	/**
	* A [variation on smoothstep](https://en.wikipedia.org/wiki/Smoothstep#Variations)
	* that has zero 1st and 2nd order derivatives at x=0 and x=1.
	*
	* @static
	* @method
	* @param {number} x - The value to evaluate based on its position between min and max.
	* @param {number} min - The min value. Any x value below min will be `0`.
	* @param {number} max - The max value. Any x value above max will be `1`.
	* @return {number} The alternated value.
	*/
	smootherstep,
	/**
	* Returns a random integer from `<low, high>` interval.
	*
	* @static
	* @method
	* @param {number} low - The lower value boundary.
	* @param {number} high - The upper value boundary
	* @return {number} A random integer.
	*/
	randInt,
	/**
	* Returns a random float from `<low, high>` interval.
	*
	* @static
	* @method
	* @param {number} low - The lower value boundary.
	* @param {number} high - The upper value boundary
	* @return {number} A random float.
	*/
	randFloat,
	/**
	* Returns a random integer from `<-range/2, range/2>` interval.
	*
	* @static
	* @method
	* @param {number} range - Defines the value range.
	* @return {number} A random float.
	*/
	randFloatSpread,
	/**
	* Returns a deterministic pseudo-random float in the interval `[0, 1]`.
	*
	* @static
	* @method
	* @param {number} [s] - The integer seed.
	* @return {number} A random float.
	*/
	seededRandom,
	/**
	* Converts degrees to radians.
	*
	* @static
	* @method
	* @param {number} degrees - A value in degrees.
	* @return {number} The converted value in radians.
	*/
	degToRad,
	/**
	* Converts radians to degrees.
	*
	* @static
	* @method
	* @param {number} radians - A value in radians.
	* @return {number} The converted value in degrees.
	*/
	radToDeg,
	/**
	* Returns `true` if the given number is a power of two.
	*
	* @static
	* @method
	* @param {number} value - The value to check.
	* @return {boolean} Whether the given number is a power of two or not.
	*/
	isPowerOfTwo,
	/**
	* Returns the smallest power of two that is greater than or equal to the given number.
	*
	* @static
	* @method
	* @param {number} value - The value to find a POT for.
	* @return {number} The smallest power of two that is greater than or equal to the given number.
	*/
	ceilPowerOfTwo,
	/**
	* Returns the largest power of two that is less than or equal to the given number.
	*
	* @static
	* @method
	* @param {number} value - The value to find a POT for.
	* @return {number} The largest power of two that is less than or equal to the given number.
	*/
	floorPowerOfTwo,
	/**
	* Sets the given quaternion from the [Intrinsic Proper Euler Angles](https://en.wikipedia.org/wiki/Euler_angles)
	* defined by the given angles and order.
	*
	* Rotations are applied to the axes in the order specified by order:
	* rotation by angle `a` is applied first, then by angle `b`, then by angle `c`.
	*
	* @static
	* @method
	* @param {Quaternion} q - The quaternion to set.
	* @param {number} a - The rotation applied to the first axis, in radians.
	* @param {number} b - The rotation applied to the second axis, in radians.
	* @param {number} c - The rotation applied to the third axis, in radians.
	* @param {('XYX'|'XZX'|'YXY'|'YZY'|'ZXZ'|'ZYZ')} order - A string specifying the axes order.
	*/
	setQuaternionFromProperEuler,
	/**
	* Normalizes the given value according to the given typed array.
	*
	* @static
	* @method
	* @param {number} value - The float value in the range `[0,1]` to normalize.
	* @param {TypedArray} array - The typed array that defines the data type of the value.
	* @return {number} The normalize value.
	*/
	normalize,
	/**
	* Denormalizes the given value according to the given typed array.
	*
	* @static
	* @method
	* @param {number} value - The value to denormalize.
	* @param {TypedArray} array - The typed array that defines the data type of the value.
	* @return {number} The denormalize (float) value in the range `[0,1]`.
	*/
	denormalize
};
/**
* Class representing a 2D vector. A 2D vector is an ordered pair of numbers
* (labeled x and y), which can be used to represent a number of things, such as:
*
* - A point in 2D space (i.e. a position on a plane).
* - A direction and length across a plane. In three.js the length will
* always be the Euclidean distance(straight-line distance) from `(0, 0)` to `(x, y)`
* and the direction is also measured from `(0, 0)` towards `(x, y)`.
* - Any arbitrary ordered pair of numbers.
*
* There are other things a 2D vector can be used to represent, such as
* momentum vectors, complex numbers and so on, however these are the most
* common uses in three.js.
*
* Iterating through a vector instance will yield its components `(x, y)` in
* the corresponding order.
* ```js
* const a = new THREE.Vector2( 0, 1 );
*
* //no arguments; will be initialised to (0, 0)
* const b = new THREE.Vector2( );
*
* const d = a.distanceTo( b );
* ```
*/
var Vector2 = class Vector2 {
	static {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		Vector2.prototype.isVector2 = true;
	}
	/**
	* Constructs a new 2D vector.
	*
	* @param {number} [x=0] - The x value of this vector.
	* @param {number} [y=0] - The y value of this vector.
	*/
	constructor(x = 0, y = 0) {
		/**
		* The x value of this vector.
		*
		* @type {number}
		*/
		this.x = x;
		/**
		* The y value of this vector.
		*
		* @type {number}
		*/
		this.y = y;
	}
	/**
	* Alias for {@link Vector2#x}.
	*
	* @type {number}
	*/
	get width() {
		return this.x;
	}
	set width(value) {
		this.x = value;
	}
	/**
	* Alias for {@link Vector2#y}.
	*
	* @type {number}
	*/
	get height() {
		return this.y;
	}
	set height(value) {
		this.y = value;
	}
	/**
	* Sets the vector components.
	*
	* @param {number} x - The value of the x component.
	* @param {number} y - The value of the y component.
	* @return {Vector2} A reference to this vector.
	*/
	set(x, y) {
		this.x = x;
		this.y = y;
		return this;
	}
	/**
	* Sets the vector components to the same value.
	*
	* @param {number} scalar - The value to set for all vector components.
	* @return {Vector2} A reference to this vector.
	*/
	setScalar(scalar) {
		this.x = scalar;
		this.y = scalar;
		return this;
	}
	/**
	* Sets the vector's x component to the given value
	*
	* @param {number} x - The value to set.
	* @return {Vector2} A reference to this vector.
	*/
	setX(x) {
		this.x = x;
		return this;
	}
	/**
	* Sets the vector's y component to the given value
	*
	* @param {number} y - The value to set.
	* @return {Vector2} A reference to this vector.
	*/
	setY(y) {
		this.y = y;
		return this;
	}
	/**
	* Allows to set a vector component with an index.
	*
	* @param {number} index - The component index. `0` equals to x, `1` equals to y.
	* @param {number} value - The value to set.
	* @return {Vector2} A reference to this vector.
	*/
	setComponent(index, value) {
		switch (index) {
			case 0:
				this.x = value;
				break;
			case 1:
				this.y = value;
				break;
			default: throw new Error("THREE.Vector2: index is out of range: " + index);
		}
		return this;
	}
	/**
	* Returns the value of the vector component which matches the given index.
	*
	* @param {number} index - The component index. `0` equals to x, `1` equals to y.
	* @return {number} A vector component value.
	*/
	getComponent(index) {
		switch (index) {
			case 0: return this.x;
			case 1: return this.y;
			default: throw new Error("THREE.Vector2: index is out of range: " + index);
		}
	}
	/**
	* Returns a new vector with copied values from this instance.
	*
	* @return {Vector2} A clone of this instance.
	*/
	clone() {
		return new this.constructor(this.x, this.y);
	}
	/**
	* Copies the values of the given vector to this instance.
	*
	* @param {Vector2} v - The vector to copy.
	* @return {Vector2} A reference to this vector.
	*/
	copy(v) {
		this.x = v.x;
		this.y = v.y;
		return this;
	}
	/**
	* Adds the given vector to this instance.
	*
	* @param {Vector2} v - The vector to add.
	* @return {Vector2} A reference to this vector.
	*/
	add(v) {
		this.x += v.x;
		this.y += v.y;
		return this;
	}
	/**
	* Adds the given scalar value to all components of this instance.
	*
	* @param {number} s - The scalar to add.
	* @return {Vector2} A reference to this vector.
	*/
	addScalar(s) {
		this.x += s;
		this.y += s;
		return this;
	}
	/**
	* Adds the given vectors and stores the result in this instance.
	*
	* @param {Vector2} a - The first vector.
	* @param {Vector2} b - The second vector.
	* @return {Vector2} A reference to this vector.
	*/
	addVectors(a, b) {
		this.x = a.x + b.x;
		this.y = a.y + b.y;
		return this;
	}
	/**
	* Adds the given vector scaled by the given factor to this instance.
	*
	* @param {Vector2} v - The vector.
	* @param {number} s - The factor that scales `v`.
	* @return {Vector2} A reference to this vector.
	*/
	addScaledVector(v, s) {
		this.x += v.x * s;
		this.y += v.y * s;
		return this;
	}
	/**
	* Subtracts the given vector from this instance.
	*
	* @param {Vector2} v - The vector to subtract.
	* @return {Vector2} A reference to this vector.
	*/
	sub(v) {
		this.x -= v.x;
		this.y -= v.y;
		return this;
	}
	/**
	* Subtracts the given scalar value from all components of this instance.
	*
	* @param {number} s - The scalar to subtract.
	* @return {Vector2} A reference to this vector.
	*/
	subScalar(s) {
		this.x -= s;
		this.y -= s;
		return this;
	}
	/**
	* Subtracts the given vectors and stores the result in this instance.
	*
	* @param {Vector2} a - The first vector.
	* @param {Vector2} b - The second vector.
	* @return {Vector2} A reference to this vector.
	*/
	subVectors(a, b) {
		this.x = a.x - b.x;
		this.y = a.y - b.y;
		return this;
	}
	/**
	* Multiplies the given vector with this instance.
	*
	* @param {Vector2} v - The vector to multiply.
	* @return {Vector2} A reference to this vector.
	*/
	multiply(v) {
		this.x *= v.x;
		this.y *= v.y;
		return this;
	}
	/**
	* Multiplies the given scalar value with all components of this instance.
	*
	* @param {number} scalar - The scalar to multiply.
	* @return {Vector2} A reference to this vector.
	*/
	multiplyScalar(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}
	/**
	* Divides this instance by the given vector.
	*
	* @param {Vector2} v - The vector to divide.
	* @return {Vector2} A reference to this vector.
	*/
	divide(v) {
		this.x /= v.x;
		this.y /= v.y;
		return this;
	}
	/**
	* Divides this vector by the given scalar.
	*
	* @param {number} scalar - The scalar to divide.
	* @return {Vector2} A reference to this vector.
	*/
	divideScalar(scalar) {
		return this.multiplyScalar(1 / scalar);
	}
	/**
	* Multiplies this vector (with an implicit 1 as the 3rd component) by
	* the given 3x3 matrix.
	*
	* @param {Matrix3} m - The matrix to apply.
	* @return {Vector2} A reference to this vector.
	*/
	applyMatrix3(m) {
		const x = this.x, y = this.y;
		const e = m.elements;
		this.x = e[0] * x + e[3] * y + e[6];
		this.y = e[1] * x + e[4] * y + e[7];
		return this;
	}
	/**
	* If this vector's x or y value is greater than the given vector's x or y
	* value, replace that value with the corresponding min value.
	*
	* @param {Vector2} v - The vector.
	* @return {Vector2} A reference to this vector.
	*/
	min(v) {
		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);
		return this;
	}
	/**
	* If this vector's x or y value is less than the given vector's x or y
	* value, replace that value with the corresponding max value.
	*
	* @param {Vector2} v - The vector.
	* @return {Vector2} A reference to this vector.
	*/
	max(v) {
		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);
		return this;
	}
	/**
	* If this vector's x or y value is greater than the max vector's x or y
	* value, it is replaced by the corresponding value.
	* If this vector's x or y value is less than the min vector's x or y value,
	* it is replaced by the corresponding value.
	*
	* @param {Vector2} min - The minimum x and y values.
	* @param {Vector2} max - The maximum x and y values in the desired range.
	* @return {Vector2} A reference to this vector.
	*/
	clamp(min, max) {
		this.x = clamp(this.x, min.x, max.x);
		this.y = clamp(this.y, min.y, max.y);
		return this;
	}
	/**
	* If this vector's x or y values are greater than the max value, they are
	* replaced by the max value.
	* If this vector's x or y values are less than the min value, they are
	* replaced by the min value.
	*
	* @param {number} minVal - The minimum value the components will be clamped to.
	* @param {number} maxVal - The maximum value the components will be clamped to.
	* @return {Vector2} A reference to this vector.
	*/
	clampScalar(minVal, maxVal) {
		this.x = clamp(this.x, minVal, maxVal);
		this.y = clamp(this.y, minVal, maxVal);
		return this;
	}
	/**
	* If this vector's length is greater than the max value, it is replaced by
	* the max value.
	* If this vector's length is less than the min value, it is replaced by the
	* min value.
	*
	* @param {number} min - The minimum value the vector length will be clamped to.
	* @param {number} max - The maximum value the vector length will be clamped to.
	* @return {Vector2} A reference to this vector.
	*/
	clampLength(min, max) {
		const length = this.length();
		return this.divideScalar(length || 1).multiplyScalar(clamp(length, min, max));
	}
	/**
	* The components of this vector are rounded down to the nearest integer value.
	*
	* @return {Vector2} A reference to this vector.
	*/
	floor() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	}
	/**
	* The components of this vector are rounded up to the nearest integer value.
	*
	* @return {Vector2} A reference to this vector.
	*/
	ceil() {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		return this;
	}
	/**
	* The components of this vector are rounded to the nearest integer value
	*
	* @return {Vector2} A reference to this vector.
	*/
	round() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	}
	/**
	* The components of this vector are rounded towards zero (up if negative,
	* down if positive) to an integer value.
	*
	* @return {Vector2} A reference to this vector.
	*/
	roundToZero() {
		this.x = Math.trunc(this.x);
		this.y = Math.trunc(this.y);
		return this;
	}
	/**
	* Inverts this vector - i.e. sets x = -x and y = -y.
	*
	* @return {Vector2} A reference to this vector.
	*/
	negate() {
		this.x = -this.x;
		this.y = -this.y;
		return this;
	}
	/**
	* Calculates the dot product of the given vector with this instance.
	*
	* @param {Vector2} v - The vector to compute the dot product with.
	* @return {number} The result of the dot product.
	*/
	dot(v) {
		return this.x * v.x + this.y * v.y;
	}
	/**
	* Calculates the cross product of the given vector with this instance.
	*
	* @param {Vector2} v - The vector to compute the cross product with.
	* @return {number} The result of the cross product.
	*/
	cross(v) {
		return this.x * v.y - this.y * v.x;
	}
	/**
	* Computes the square of the Euclidean length (straight-line length) from
	* (0, 0) to (x, y). If you are comparing the lengths of vectors, you should
	* compare the length squared instead as it is slightly more efficient to calculate.
	*
	* @return {number} The square length of this vector.
	*/
	lengthSq() {
		return this.x * this.x + this.y * this.y;
	}
	/**
	* Computes the  Euclidean length (straight-line length) from (0, 0) to (x, y).
	*
	* @return {number} The length of this vector.
	*/
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	/**
	* Computes the Manhattan length of this vector.
	*
	* @return {number} The length of this vector.
	*/
	manhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y);
	}
	/**
	* Converts this vector to a unit vector - that is, sets it equal to a vector
	* with the same direction as this one, but with a vector length of `1`.
	*
	* @return {Vector2} A reference to this vector.
	*/
	normalize() {
		return this.divideScalar(this.length() || 1);
	}
	/**
	* Computes the angle in radians of this vector with respect to the positive x-axis.
	*
	* @return {number} The angle in radians.
	*/
	angle() {
		return Math.atan2(-this.y, -this.x) + Math.PI;
	}
	/**
	* Returns the angle between the given vector and this instance in radians.
	*
	* @param {Vector2} v - The vector to compute the angle with.
	* @return {number} The angle in radians.
	*/
	angleTo(v) {
		const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
		if (denominator === 0) return Math.PI / 2;
		const theta = this.dot(v) / denominator;
		return Math.acos(clamp(theta, -1, 1));
	}
	/**
	* Computes the distance from the given vector to this instance.
	*
	* @param {Vector2} v - The vector to compute the distance to.
	* @return {number} The distance.
	*/
	distanceTo(v) {
		return Math.sqrt(this.distanceToSquared(v));
	}
	/**
	* Computes the squared distance from the given vector to this instance.
	* If you are just comparing the distance with another distance, you should compare
	* the distance squared instead as it is slightly more efficient to calculate.
	*
	* @param {Vector2} v - The vector to compute the squared distance to.
	* @return {number} The squared distance.
	*/
	distanceToSquared(v) {
		const dx = this.x - v.x, dy = this.y - v.y;
		return dx * dx + dy * dy;
	}
	/**
	* Computes the Manhattan distance from the given vector to this instance.
	*
	* @param {Vector2} v - The vector to compute the Manhattan distance to.
	* @return {number} The Manhattan distance.
	*/
	manhattanDistanceTo(v) {
		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
	}
	/**
	* Sets this vector to a vector with the same direction as this one, but
	* with the specified length.
	*
	* @param {number} length - The new length of this vector.
	* @return {Vector2} A reference to this vector.
	*/
	setLength(length) {
		return this.normalize().multiplyScalar(length);
	}
	/**
	* Linearly interpolates between the given vector and this instance, where
	* alpha is the percent distance along the line - alpha = 0 will be this
	* vector, and alpha = 1 will be the given one.
	*
	* @param {Vector2} v - The vector to interpolate towards.
	* @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
	* @return {Vector2} A reference to this vector.
	*/
	lerp(v, alpha) {
		this.x += (v.x - this.x) * alpha;
		this.y += (v.y - this.y) * alpha;
		return this;
	}
	/**
	* Linearly interpolates between the given vectors, where alpha is the percent
	* distance along the line - alpha = 0 will be first vector, and alpha = 1 will
	* be the second one. The result is stored in this instance.
	*
	* @param {Vector2} v1 - The first vector.
	* @param {Vector2} v2 - The second vector.
	* @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
	* @return {Vector2} A reference to this vector.
	*/
	lerpVectors(v1, v2, alpha) {
		this.x = v1.x + (v2.x - v1.x) * alpha;
		this.y = v1.y + (v2.y - v1.y) * alpha;
		return this;
	}
	/**
	* Returns `true` if this vector is equal with the given one.
	*
	* @param {Vector2} v - The vector to test for equality.
	* @return {boolean} Whether this vector is equal with the given one.
	*/
	equals(v) {
		return v.x === this.x && v.y === this.y;
	}
	/**
	* Sets this vector's x value to be `array[ offset ]` and y
	* value to be `array[ offset + 1 ]`.
	*
	* @param {Array<number>} array - An array holding the vector component values.
	* @param {number} [offset=0] - The offset into the array.
	* @return {Vector2} A reference to this vector.
	*/
	fromArray(array, offset = 0) {
		this.x = array[offset];
		this.y = array[offset + 1];
		return this;
	}
	/**
	* Writes the components of this vector to the given array. If no array is provided,
	* the method returns a new instance.
	*
	* @param {Array<number>} [array=[]] - The target array holding the vector components.
	* @param {number} [offset=0] - Index of the first element in the array.
	* @return {Array<number>} The vector components.
	*/
	toArray(array = [], offset = 0) {
		array[offset] = this.x;
		array[offset + 1] = this.y;
		return array;
	}
	/**
	* Sets the components of this vector from the given buffer attribute.
	*
	* @param {BufferAttribute} attribute - The buffer attribute holding vector data.
	* @param {number} index - The index into the attribute.
	* @return {Vector2} A reference to this vector.
	*/
	fromBufferAttribute(attribute, index) {
		this.x = attribute.getX(index);
		this.y = attribute.getY(index);
		return this;
	}
	/**
	* Rotates this vector around the given center by the given angle.
	*
	* @param {Vector2} center - The point around which to rotate.
	* @param {number} angle - The angle to rotate, in radians.
	* @return {Vector2} A reference to this vector.
	*/
	rotateAround(center, angle) {
		const c = Math.cos(angle), s = Math.sin(angle);
		const x = this.x - center.x;
		const y = this.y - center.y;
		this.x = x * c - y * s + center.x;
		this.y = x * s + y * c + center.y;
		return this;
	}
	/**
	* Sets each component of this vector to a pseudo-random value between `0` and
	* `1`, excluding `1`.
	*
	* @return {Vector2} A reference to this vector.
	*/
	random() {
		this.x = Math.random();
		this.y = Math.random();
		return this;
	}
	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
	}
};
/**
* Class for representing a Quaternion. Quaternions are used in three.js to represent rotations.
*
* Iterating through a vector instance will yield its components `(x, y, z, w)` in
* the corresponding order.
*
* Note that three.js expects Quaternions to be normalized.
* ```js
* const quaternion = new THREE.Quaternion();
* quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );
*
* const vector = new THREE.Vector3( 1, 0, 0 );
* vector.applyQuaternion( quaternion );
* ```
*/
var Quaternion = class {
	/**
	* Constructs a new quaternion.
	*
	* @param {number} [x=0] - The x value of this quaternion.
	* @param {number} [y=0] - The y value of this quaternion.
	* @param {number} [z=0] - The z value of this quaternion.
	* @param {number} [w=1] - The w value of this quaternion.
	*/
	constructor(x = 0, y = 0, z = 0, w = 1) {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isQuaternion = true;
		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;
	}
	/**
	* Interpolates between two quaternions via SLERP. This implementation assumes the
	* quaternion data are managed in flat arrays.
	*
	* @param {Array<number>} dst - The destination array.
	* @param {number} dstOffset - An offset into the destination array.
	* @param {Array<number>} src0 - The source array of the first quaternion.
	* @param {number} srcOffset0 - An offset into the first source array.
	* @param {Array<number>} src1 -  The source array of the second quaternion.
	* @param {number} srcOffset1 - An offset into the second source array.
	* @param {number} t - The interpolation factor. A value in the range `[0,1]` will interpolate. A value outside the range `[0,1]` will extrapolate.
	* @see {@link Quaternion#slerp}
	*/
	static slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
		let x0 = src0[srcOffset0 + 0], y0 = src0[srcOffset0 + 1], z0 = src0[srcOffset0 + 2], w0 = src0[srcOffset0 + 3];
		let x1 = src1[srcOffset1 + 0], y1 = src1[srcOffset1 + 1], z1 = src1[srcOffset1 + 2], w1 = src1[srcOffset1 + 3];
		if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
			let dot = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1;
			if (dot < 0) {
				x1 = -x1;
				y1 = -y1;
				z1 = -z1;
				w1 = -w1;
				dot = -dot;
			}
			let s = 1 - t;
			if (dot < .9995) {
				const theta = Math.acos(dot);
				const sin = Math.sin(theta);
				s = Math.sin(s * theta) / sin;
				t = Math.sin(t * theta) / sin;
				x0 = x0 * s + x1 * t;
				y0 = y0 * s + y1 * t;
				z0 = z0 * s + z1 * t;
				w0 = w0 * s + w1 * t;
			} else {
				x0 = x0 * s + x1 * t;
				y0 = y0 * s + y1 * t;
				z0 = z0 * s + z1 * t;
				w0 = w0 * s + w1 * t;
				const f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);
				x0 *= f;
				y0 *= f;
				z0 *= f;
				w0 *= f;
			}
		}
		dst[dstOffset] = x0;
		dst[dstOffset + 1] = y0;
		dst[dstOffset + 2] = z0;
		dst[dstOffset + 3] = w0;
	}
	/**
	* Multiplies two quaternions. This implementation assumes the quaternion data are managed
	* in flat arrays.
	*
	* @param {Array<number>} dst - The destination array.
	* @param {number} dstOffset - An offset into the destination array.
	* @param {Array<number>} src0 - The source array of the first quaternion.
	* @param {number} srcOffset0 - An offset into the first source array.
	* @param {Array<number>} src1 -  The source array of the second quaternion.
	* @param {number} srcOffset1 - An offset into the second source array.
	* @return {Array<number>} The destination array.
	* @see {@link Quaternion#multiplyQuaternions}.
	*/
	static multiplyQuaternionsFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1) {
		const x0 = src0[srcOffset0];
		const y0 = src0[srcOffset0 + 1];
		const z0 = src0[srcOffset0 + 2];
		const w0 = src0[srcOffset0 + 3];
		const x1 = src1[srcOffset1];
		const y1 = src1[srcOffset1 + 1];
		const z1 = src1[srcOffset1 + 2];
		const w1 = src1[srcOffset1 + 3];
		dst[dstOffset] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
		dst[dstOffset + 1] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
		dst[dstOffset + 2] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
		dst[dstOffset + 3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;
		return dst;
	}
	/**
	* The x value of this quaternion.
	*
	* @type {number}
	* @default 0
	*/
	get x() {
		return this._x;
	}
	set x(value) {
		this._x = value;
		this._onChangeCallback();
	}
	/**
	* The y value of this quaternion.
	*
	* @type {number}
	* @default 0
	*/
	get y() {
		return this._y;
	}
	set y(value) {
		this._y = value;
		this._onChangeCallback();
	}
	/**
	* The z value of this quaternion.
	*
	* @type {number}
	* @default 0
	*/
	get z() {
		return this._z;
	}
	set z(value) {
		this._z = value;
		this._onChangeCallback();
	}
	/**
	* The w value of this quaternion.
	*
	* @type {number}
	* @default 1
	*/
	get w() {
		return this._w;
	}
	set w(value) {
		this._w = value;
		this._onChangeCallback();
	}
	/**
	* Sets the quaternion components.
	*
	* @param {number} x - The x value of this quaternion.
	* @param {number} y - The y value of this quaternion.
	* @param {number} z - The z value of this quaternion.
	* @param {number} w - The w value of this quaternion.
	* @return {Quaternion} A reference to this quaternion.
	*/
	set(x, y, z, w) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;
		this._onChangeCallback();
		return this;
	}
	/**
	* Returns a new quaternion with copied values from this instance.
	*
	* @return {Quaternion} A clone of this instance.
	*/
	clone() {
		return new this.constructor(this._x, this._y, this._z, this._w);
	}
	/**
	* Copies the values of the given quaternion to this instance.
	*
	* @param {Quaternion} quaternion - The quaternion to copy.
	* @return {Quaternion} A reference to this quaternion.
	*/
	copy(quaternion) {
		this._x = quaternion.x;
		this._y = quaternion.y;
		this._z = quaternion.z;
		this._w = quaternion.w;
		this._onChangeCallback();
		return this;
	}
	/**
	* Sets this quaternion from the rotation specified by the given
	* Euler angles.
	*
	* @param {Euler} euler - The Euler angles.
	* @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
	* @return {Quaternion} A reference to this quaternion.
	*/
	setFromEuler(euler, update = true) {
		const x = euler._x, y = euler._y, z = euler._z, order = euler._order;
		const cos = Math.cos;
		const sin = Math.sin;
		const c1 = cos(x / 2);
		const c2 = cos(y / 2);
		const c3 = cos(z / 2);
		const s1 = sin(x / 2);
		const s2 = sin(y / 2);
		const s3 = sin(z / 2);
		switch (order) {
			case "XYZ":
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;
			case "YXZ":
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;
			case "ZXY":
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;
			case "ZYX":
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;
			case "YZX":
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;
			case "XZY":
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;
			default: warn("Quaternion: .setFromEuler() encountered an unknown order: " + order);
		}
		if (update === true) this._onChangeCallback();
		return this;
	}
	/**
	* Sets this quaternion from the given axis and angle.
	*
	* @param {Vector3} axis - The normalized axis.
	* @param {number} angle - The angle in radians.
	* @return {Quaternion} A reference to this quaternion.
	*/
	setFromAxisAngle(axis, angle) {
		const halfAngle = angle / 2, s = Math.sin(halfAngle);
		this._x = axis.x * s;
		this._y = axis.y * s;
		this._z = axis.z * s;
		this._w = Math.cos(halfAngle);
		this._onChangeCallback();
		return this;
	}
	/**
	* Sets this quaternion from the given rotation matrix.
	*
	* @param {Matrix4} m - A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).
	* @return {Quaternion} A reference to this quaternion.
	*/
	setFromRotationMatrix(m) {
		const te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10], trace = m11 + m22 + m33;
		if (trace > 0) {
			const s = .5 / Math.sqrt(trace + 1);
			this._w = .25 / s;
			this._x = (m32 - m23) * s;
			this._y = (m13 - m31) * s;
			this._z = (m21 - m12) * s;
		} else if (m11 > m22 && m11 > m33) {
			const s = 2 * Math.sqrt(1 + m11 - m22 - m33);
			this._w = (m32 - m23) / s;
			this._x = .25 * s;
			this._y = (m12 + m21) / s;
			this._z = (m13 + m31) / s;
		} else if (m22 > m33) {
			const s = 2 * Math.sqrt(1 + m22 - m11 - m33);
			this._w = (m13 - m31) / s;
			this._x = (m12 + m21) / s;
			this._y = .25 * s;
			this._z = (m23 + m32) / s;
		} else {
			const s = 2 * Math.sqrt(1 + m33 - m11 - m22);
			this._w = (m21 - m12) / s;
			this._x = (m13 + m31) / s;
			this._y = (m23 + m32) / s;
			this._z = .25 * s;
		}
		this._onChangeCallback();
		return this;
	}
	/**
	* Sets this quaternion to the rotation required to rotate the direction vector
	* `vFrom` to the direction vector `vTo`.
	*
	* @param {Vector3} vFrom - The first (normalized) direction vector.
	* @param {Vector3} vTo - The second (normalized) direction vector.
	* @return {Quaternion} A reference to this quaternion.
	*/
	setFromUnitVectors(vFrom, vTo) {
		let r = vFrom.dot(vTo) + 1;
		if (r < 1e-8) {
			r = 0;
			if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
				this._x = -vFrom.y;
				this._y = vFrom.x;
				this._z = 0;
				this._w = r;
			} else {
				this._x = 0;
				this._y = -vFrom.z;
				this._z = vFrom.y;
				this._w = r;
			}
		} else {
			this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
			this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
			this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
			this._w = r;
		}
		return this.normalize();
	}
	/**
	* Returns the angle between this quaternion and the given one in radians.
	*
	* @param {Quaternion} q - The quaternion to compute the angle with.
	* @return {number} The angle in radians.
	*/
	angleTo(q) {
		return 2 * Math.acos(Math.abs(clamp(this.dot(q), -1, 1)));
	}
	/**
	* Rotates this quaternion by a given angular step to the given quaternion.
	* The method ensures that the final quaternion will not overshoot `q`.
	*
	* @param {Quaternion} q - The target quaternion.
	* @param {number} step - The angular step in radians.
	* @return {Quaternion} A reference to this quaternion.
	*/
	rotateTowards(q, step) {
		const angle = this.angleTo(q);
		if (angle === 0) return this;
		const t = Math.min(1, step / angle);
		this.slerp(q, t);
		return this;
	}
	/**
	* Sets this quaternion to the identity quaternion; that is, to the
	* quaternion that represents "no rotation".
	*
	* @return {Quaternion} A reference to this quaternion.
	*/
	identity() {
		return this.set(0, 0, 0, 1);
	}
	/**
	* Inverts this quaternion via {@link Quaternion#conjugate}. The
	* quaternion is assumed to have unit length.
	*
	* @return {Quaternion} A reference to this quaternion.
	*/
	invert() {
		return this.conjugate();
	}
	/**
	* Returns the rotational conjugate of this quaternion. The conjugate of a
	* quaternion represents the same rotation in the opposite direction about
	* the rotational axis.
	*
	* @return {Quaternion} A reference to this quaternion.
	*/
	conjugate() {
		this._x *= -1;
		this._y *= -1;
		this._z *= -1;
		this._onChangeCallback();
		return this;
	}
	/**
	* Calculates the dot product of this quaternion and the given one.
	*
	* @param {Quaternion} v - The quaternion to compute the dot product with.
	* @return {number} The result of the dot product.
	*/
	dot(v) {
		return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
	}
	/**
	* Computes the squared Euclidean length (straight-line length) of this quaternion,
	* considered as a 4 dimensional vector. This can be useful if you are comparing the
	* lengths of two quaternions, as this is a slightly more efficient calculation than
	* {@link Quaternion#length}.
	*
	* @return {number} The squared Euclidean length.
	*/
	lengthSq() {
		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
	}
	/**
	* Computes the Euclidean length (straight-line length) of this quaternion,
	* considered as a 4 dimensional vector.
	*
	* @return {number} The Euclidean length.
	*/
	length() {
		return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
	}
	/**
	* Normalizes this quaternion - that is, calculated the quaternion that performs
	* the same rotation as this one, but has a length equal to `1`.
	*
	* @return {Quaternion} A reference to this quaternion.
	*/
	normalize() {
		let l = this.length();
		if (l === 0) {
			this._x = 0;
			this._y = 0;
			this._z = 0;
			this._w = 1;
		} else {
			l = 1 / l;
			this._x = this._x * l;
			this._y = this._y * l;
			this._z = this._z * l;
			this._w = this._w * l;
		}
		this._onChangeCallback();
		return this;
	}
	/**
	* Multiplies this quaternion by the given one.
	*
	* @param {Quaternion} q - The quaternion.
	* @return {Quaternion} A reference to this quaternion.
	*/
	multiply(q) {
		return this.multiplyQuaternions(this, q);
	}
	/**
	* Pre-multiplies this quaternion by the given one.
	*
	* @param {Quaternion} q - The quaternion.
	* @return {Quaternion} A reference to this quaternion.
	*/
	premultiply(q) {
		return this.multiplyQuaternions(q, this);
	}
	/**
	* Multiplies the given quaternions and stores the result in this instance.
	*
	* @param {Quaternion} a - The first quaternion.
	* @param {Quaternion} b - The second quaternion.
	* @return {Quaternion} A reference to this quaternion.
	*/
	multiplyQuaternions(a, b) {
		const qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
		const qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;
		this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
		this._onChangeCallback();
		return this;
	}
	/**
	* Performs a spherical linear interpolation between this quaternion and the target quaternion.
	*
	* @param {Quaternion} qb - The target quaternion.
	* @param {number} t - The interpolation factor. A value in the range `[0,1]` will interpolate. A value outside the range `[0,1]` will extrapolate.
	* @return {Quaternion} A reference to this quaternion.
	*/
	slerp(qb, t) {
		let x = qb._x, y = qb._y, z = qb._z, w = qb._w;
		let dot = this.dot(qb);
		if (dot < 0) {
			x = -x;
			y = -y;
			z = -z;
			w = -w;
			dot = -dot;
		}
		let s = 1 - t;
		if (dot < .9995) {
			const theta = Math.acos(dot);
			const sin = Math.sin(theta);
			s = Math.sin(s * theta) / sin;
			t = Math.sin(t * theta) / sin;
			this._x = this._x * s + x * t;
			this._y = this._y * s + y * t;
			this._z = this._z * s + z * t;
			this._w = this._w * s + w * t;
			this._onChangeCallback();
		} else {
			this._x = this._x * s + x * t;
			this._y = this._y * s + y * t;
			this._z = this._z * s + z * t;
			this._w = this._w * s + w * t;
			this.normalize();
		}
		return this;
	}
	/**
	* Performs a spherical linear interpolation between the given quaternions
	* and stores the result in this quaternion.
	*
	* @param {Quaternion} qa - The source quaternion.
	* @param {Quaternion} qb - The target quaternion.
	* @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
	* @return {Quaternion} A reference to this quaternion.
	*/
	slerpQuaternions(qa, qb, t) {
		return this.copy(qa).slerp(qb, t);
	}
	/**
	* Sets this quaternion to a uniformly random, normalized quaternion.
	*
	* @return {Quaternion} A reference to this quaternion.
	*/
	random() {
		const theta1 = 2 * Math.PI * Math.random();
		const theta2 = 2 * Math.PI * Math.random();
		const x0 = Math.random();
		const r1 = Math.sqrt(1 - x0);
		const r2 = Math.sqrt(x0);
		return this.set(r1 * Math.sin(theta1), r1 * Math.cos(theta1), r2 * Math.sin(theta2), r2 * Math.cos(theta2));
	}
	/**
	* Returns `true` if this quaternion is equal with the given one.
	*
	* @param {Quaternion} quaternion - The quaternion to test for equality.
	* @return {boolean} Whether this quaternion is equal with the given one.
	*/
	equals(quaternion) {
		return quaternion._x === this._x && quaternion._y === this._y && quaternion._z === this._z && quaternion._w === this._w;
	}
	/**
	* Sets this quaternion's components from the given array.
	*
	* @param {Array<number>} array - An array holding the quaternion component values.
	* @param {number} [offset=0] - The offset into the array.
	* @return {Quaternion} A reference to this quaternion.
	*/
	fromArray(array, offset = 0) {
		this._x = array[offset];
		this._y = array[offset + 1];
		this._z = array[offset + 2];
		this._w = array[offset + 3];
		this._onChangeCallback();
		return this;
	}
	/**
	* Writes the components of this quaternion to the given array. If no array is provided,
	* the method returns a new instance.
	*
	* @param {Array<number>} [array=[]] - The target array holding the quaternion components.
	* @param {number} [offset=0] - Index of the first element in the array.
	* @return {Array<number>} The quaternion components.
	*/
	toArray(array = [], offset = 0) {
		array[offset] = this._x;
		array[offset + 1] = this._y;
		array[offset + 2] = this._z;
		array[offset + 3] = this._w;
		return array;
	}
	/**
	* Sets the components of this quaternion from the given buffer attribute.
	*
	* @param {BufferAttribute} attribute - The buffer attribute holding quaternion data.
	* @param {number} index - The index into the attribute.
	* @return {Quaternion} A reference to this quaternion.
	*/
	fromBufferAttribute(attribute, index) {
		this._x = attribute.getX(index);
		this._y = attribute.getY(index);
		this._z = attribute.getZ(index);
		this._w = attribute.getW(index);
		this._onChangeCallback();
		return this;
	}
	/**
	* This methods defines the serialization result of this class. Returns the
	* numerical elements of this quaternion in an array of format `[x, y, z, w]`.
	*
	* @return {Array<number>} The serialized quaternion.
	*/
	toJSON() {
		return this.toArray();
	}
	_onChange(callback) {
		this._onChangeCallback = callback;
		return this;
	}
	_onChangeCallback() {}
	*[Symbol.iterator]() {
		yield this._x;
		yield this._y;
		yield this._z;
		yield this._w;
	}
};
/**
* Class representing a 3D vector. A 3D vector is an ordered triplet of numbers
* (labeled x, y and z), which can be used to represent a number of things, such as:
*
* - A point in 3D space.
* - A direction and length in 3D space. In three.js the length will
* always be the Euclidean distance(straight-line distance) from `(0, 0, 0)` to `(x, y, z)`
* and the direction is also measured from `(0, 0, 0)` towards `(x, y, z)`.
* - Any arbitrary ordered triplet of numbers.
*
* There are other things a 3D vector can be used to represent, such as
* momentum vectors and so on, however these are the most
* common uses in three.js.
*
* Iterating through a vector instance will yield its components `(x, y, z)` in
* the corresponding order.
* ```js
* const a = new THREE.Vector3( 0, 1, 0 );
*
* //no arguments; will be initialised to (0, 0, 0)
* const b = new THREE.Vector3( );
*
* const d = a.distanceTo( b );
* ```
*/
var Vector3 = class Vector3 {
	static {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		Vector3.prototype.isVector3 = true;
	}
	/**
	* Constructs a new 3D vector.
	*
	* @param {number} [x=0] - The x value of this vector.
	* @param {number} [y=0] - The y value of this vector.
	* @param {number} [z=0] - The z value of this vector.
	*/
	constructor(x = 0, y = 0, z = 0) {
		/**
		* The x value of this vector.
		*
		* @type {number}
		*/
		this.x = x;
		/**
		* The y value of this vector.
		*
		* @type {number}
		*/
		this.y = y;
		/**
		* The z value of this vector.
		*
		* @type {number}
		*/
		this.z = z;
	}
	/**
	* Sets the vector components.
	*
	* @param {number} x - The value of the x component.
	* @param {number} y - The value of the y component.
	* @param {number} z - The value of the z component.
	* @return {Vector3} A reference to this vector.
	*/
	set(x, y, z) {
		if (z === void 0) z = this.z;
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}
	/**
	* Sets the vector components to the same value.
	*
	* @param {number} scalar - The value to set for all vector components.
	* @return {Vector3} A reference to this vector.
	*/
	setScalar(scalar) {
		this.x = scalar;
		this.y = scalar;
		this.z = scalar;
		return this;
	}
	/**
	* Sets the vector's x component to the given value.
	*
	* @param {number} x - The value to set.
	* @return {Vector3} A reference to this vector.
	*/
	setX(x) {
		this.x = x;
		return this;
	}
	/**
	* Sets the vector's y component to the given value.
	*
	* @param {number} y - The value to set.
	* @return {Vector3} A reference to this vector.
	*/
	setY(y) {
		this.y = y;
		return this;
	}
	/**
	* Sets the vector's z component to the given value.
	*
	* @param {number} z - The value to set.
	* @return {Vector3} A reference to this vector.
	*/
	setZ(z) {
		this.z = z;
		return this;
	}
	/**
	* Allows to set a vector component with an index.
	*
	* @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
	* @param {number} value - The value to set.
	* @return {Vector3} A reference to this vector.
	*/
	setComponent(index, value) {
		switch (index) {
			case 0:
				this.x = value;
				break;
			case 1:
				this.y = value;
				break;
			case 2:
				this.z = value;
				break;
			default: throw new Error("THREE.Vector3: index is out of range: " + index);
		}
		return this;
	}
	/**
	* Returns the value of the vector component which matches the given index.
	*
	* @param {number} index - The component index. `0` equals to x, `1` equals to y, `2` equals to z.
	* @return {number} A vector component value.
	*/
	getComponent(index) {
		switch (index) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error("THREE.Vector3: index is out of range: " + index);
		}
	}
	/**
	* Returns a new vector with copied values from this instance.
	*
	* @return {Vector3} A clone of this instance.
	*/
	clone() {
		return new this.constructor(this.x, this.y, this.z);
	}
	/**
	* Copies the values of the given vector to this instance.
	*
	* @param {Vector3} v - The vector to copy.
	* @return {Vector3} A reference to this vector.
	*/
	copy(v) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		return this;
	}
	/**
	* Adds the given vector to this instance.
	*
	* @param {Vector3} v - The vector to add.
	* @return {Vector3} A reference to this vector.
	*/
	add(v) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		return this;
	}
	/**
	* Adds the given scalar value to all components of this instance.
	*
	* @param {number} s - The scalar to add.
	* @return {Vector3} A reference to this vector.
	*/
	addScalar(s) {
		this.x += s;
		this.y += s;
		this.z += s;
		return this;
	}
	/**
	* Adds the given vectors and stores the result in this instance.
	*
	* @param {Vector3} a - The first vector.
	* @param {Vector3} b - The second vector.
	* @return {Vector3} A reference to this vector.
	*/
	addVectors(a, b) {
		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;
		return this;
	}
	/**
	* Adds the given vector scaled by the given factor to this instance.
	*
	* @param {Vector3|Vector4} v - The vector.
	* @param {number} s - The factor that scales `v`.
	* @return {Vector3} A reference to this vector.
	*/
	addScaledVector(v, s) {
		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;
		return this;
	}
	/**
	* Subtracts the given vector from this instance.
	*
	* @param {Vector3} v - The vector to subtract.
	* @return {Vector3} A reference to this vector.
	*/
	sub(v) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		return this;
	}
	/**
	* Subtracts the given scalar value from all components of this instance.
	*
	* @param {number} s - The scalar to subtract.
	* @return {Vector3} A reference to this vector.
	*/
	subScalar(s) {
		this.x -= s;
		this.y -= s;
		this.z -= s;
		return this;
	}
	/**
	* Subtracts the given vectors and stores the result in this instance.
	*
	* @param {Vector3} a - The first vector.
	* @param {Vector3} b - The second vector.
	* @return {Vector3} A reference to this vector.
	*/
	subVectors(a, b) {
		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;
		return this;
	}
	/**
	* Multiplies the given vector with this instance.
	*
	* @param {Vector3} v - The vector to multiply.
	* @return {Vector3} A reference to this vector.
	*/
	multiply(v) {
		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;
		return this;
	}
	/**
	* Multiplies the given scalar value with all components of this instance.
	*
	* @param {number} scalar - The scalar to multiply.
	* @return {Vector3} A reference to this vector.
	*/
	multiplyScalar(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		return this;
	}
	/**
	* Multiplies the given vectors and stores the result in this instance.
	*
	* @param {Vector3} a - The first vector.
	* @param {Vector3} b - The second vector.
	* @return {Vector3} A reference to this vector.
	*/
	multiplyVectors(a, b) {
		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;
		return this;
	}
	/**
	* Applies the given Euler rotation to this vector.
	*
	* @param {Euler} euler - The Euler angles.
	* @return {Vector3} A reference to this vector.
	*/
	applyEuler(euler) {
		return this.applyQuaternion(_quaternion$5.setFromEuler(euler));
	}
	/**
	* Applies a rotation specified by an axis and an angle to this vector.
	*
	* @param {Vector3} axis - A normalized vector representing the rotation axis.
	* @param {number} angle - The angle in radians.
	* @return {Vector3} A reference to this vector.
	*/
	applyAxisAngle(axis, angle) {
		return this.applyQuaternion(_quaternion$5.setFromAxisAngle(axis, angle));
	}
	/**
	* Multiplies this vector with the given 3x3 matrix.
	*
	* @param {Matrix3} m - The 3x3 matrix.
	* @return {Vector3} A reference to this vector.
	*/
	applyMatrix3(m) {
		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;
		this.x = e[0] * x + e[3] * y + e[6] * z;
		this.y = e[1] * x + e[4] * y + e[7] * z;
		this.z = e[2] * x + e[5] * y + e[8] * z;
		return this;
	}
	/**
	* Multiplies this vector by the given normal matrix and normalizes
	* the result.
	*
	* @param {Matrix3} m - The normal matrix.
	* @return {Vector3} A reference to this vector.
	*/
	applyNormalMatrix(m) {
		return this.applyMatrix3(m).normalize();
	}
	/**
	* Multiplies this vector (with an implicit 1 in the 4th dimension) by m, and
	* divides by perspective.
	*
	* @param {Matrix4} m - The matrix to apply.
	* @return {Vector3} A reference to this vector.
	*/
	applyMatrix4(m) {
		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;
		const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
		this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
		this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
		this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
		return this;
	}
	/**
	* Applies the given Quaternion to this vector.
	*
	* @param {Quaternion} q - The Quaternion.
	* @return {Vector3} A reference to this vector.
	*/
	applyQuaternion(q) {
		const vx = this.x, vy = this.y, vz = this.z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
		const tx = 2 * (qy * vz - qz * vy);
		const ty = 2 * (qz * vx - qx * vz);
		const tz = 2 * (qx * vy - qy * vx);
		this.x = vx + qw * tx + qy * tz - qz * ty;
		this.y = vy + qw * ty + qz * tx - qx * tz;
		this.z = vz + qw * tz + qx * ty - qy * tx;
		return this;
	}
	/**
	* Projects this vector from world space into the camera's normalized
	* device coordinate (NDC) space.
	*
	* @param {Camera} camera - The camera.
	* @return {Vector3} A reference to this vector.
	*/
	project(camera) {
		return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
	}
	/**
	* Unprojects this vector from the camera's normalized device coordinate (NDC)
	* space into world space.
	*
	* @param {Camera} camera - The camera.
	* @return {Vector3} A reference to this vector.
	*/
	unproject(camera) {
		return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);
	}
	/**
	* Transforms this vector by the upper left 3x3 sub-matrix of the given 4x4 matrix,
	* and normalizes the result.
	*
	* @param {Matrix4} m - The matrix.
	* @return {Vector3} A reference to this vector.
	*/
	transformDirection(m) {
		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;
		this.x = e[0] * x + e[4] * y + e[8] * z;
		this.y = e[1] * x + e[5] * y + e[9] * z;
		this.z = e[2] * x + e[6] * y + e[10] * z;
		return this.normalize();
	}
	/**
	* Divides this instance by the given vector.
	*
	* @param {Vector3} v - The vector to divide.
	* @return {Vector3} A reference to this vector.
	*/
	divide(v) {
		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;
		return this;
	}
	/**
	* Divides this vector by the given scalar.
	*
	* @param {number} scalar - The scalar to divide.
	* @return {Vector3} A reference to this vector.
	*/
	divideScalar(scalar) {
		return this.multiplyScalar(1 / scalar);
	}
	/**
	* If this vector's x, y or z value is greater than the given vector's x, y or z
	* value, replace that value with the corresponding min value.
	*
	* @param {Vector3} v - The vector.
	* @return {Vector3} A reference to this vector.
	*/
	min(v) {
		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);
		this.z = Math.min(this.z, v.z);
		return this;
	}
	/**
	* If this vector's x, y or z value is less than the given vector's x, y or z
	* value, replace that value with the corresponding max value.
	*
	* @param {Vector3} v - The vector.
	* @return {Vector3} A reference to this vector.
	*/
	max(v) {
		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);
		this.z = Math.max(this.z, v.z);
		return this;
	}
	/**
	* If this vector's x, y or z value is greater than the max vector's x, y or z
	* value, it is replaced by the corresponding value.
	* If this vector's x, y or z value is less than the min vector's x, y or z value,
	* it is replaced by the corresponding value.
	*
	* @param {Vector3} min - The minimum x, y and z values.
	* @param {Vector3} max - The maximum x, y and z values in the desired range.
	* @return {Vector3} A reference to this vector.
	*/
	clamp(min, max) {
		this.x = clamp(this.x, min.x, max.x);
		this.y = clamp(this.y, min.y, max.y);
		this.z = clamp(this.z, min.z, max.z);
		return this;
	}
	/**
	* If this vector's x, y or z values are greater than the max value, they are
	* replaced by the max value.
	* If this vector's x, y or z values are less than the min value, they are
	* replaced by the min value.
	*
	* @param {number} minVal - The minimum value the components will be clamped to.
	* @param {number} maxVal - The maximum value the components will be clamped to.
	* @return {Vector3} A reference to this vector.
	*/
	clampScalar(minVal, maxVal) {
		this.x = clamp(this.x, minVal, maxVal);
		this.y = clamp(this.y, minVal, maxVal);
		this.z = clamp(this.z, minVal, maxVal);
		return this;
	}
	/**
	* If this vector's length is greater than the max value, it is replaced by
	* the max value.
	* If this vector's length is less than the min value, it is replaced by the
	* min value.
	*
	* @param {number} min - The minimum value the vector length will be clamped to.
	* @param {number} max - The maximum value the vector length will be clamped to.
	* @return {Vector3} A reference to this vector.
	*/
	clampLength(min, max) {
		const length = this.length();
		return this.divideScalar(length || 1).multiplyScalar(clamp(length, min, max));
	}
	/**
	* The components of this vector are rounded down to the nearest integer value.
	*
	* @return {Vector3} A reference to this vector.
	*/
	floor() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.z = Math.floor(this.z);
		return this;
	}
	/**
	* The components of this vector are rounded up to the nearest integer value.
	*
	* @return {Vector3} A reference to this vector.
	*/
	ceil() {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		this.z = Math.ceil(this.z);
		return this;
	}
	/**
	* The components of this vector are rounded to the nearest integer value
	*
	* @return {Vector3} A reference to this vector.
	*/
	round() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.z = Math.round(this.z);
		return this;
	}
	/**
	* The components of this vector are rounded towards zero (up if negative,
	* down if positive) to an integer value.
	*
	* @return {Vector3} A reference to this vector.
	*/
	roundToZero() {
		this.x = Math.trunc(this.x);
		this.y = Math.trunc(this.y);
		this.z = Math.trunc(this.z);
		return this;
	}
	/**
	* Inverts this vector - i.e. sets x = -x, y = -y and z = -z.
	*
	* @return {Vector3} A reference to this vector.
	*/
	negate() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		return this;
	}
	/**
	* Calculates the dot product of the given vector with this instance.
	*
	* @param {Vector3} v - The vector to compute the dot product with.
	* @return {number} The result of the dot product.
	*/
	dot(v) {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}
	/**
	* Computes the square of the Euclidean length (straight-line length) from
	* (0, 0, 0) to (x, y, z). If you are comparing the lengths of vectors, you should
	* compare the length squared instead as it is slightly more efficient to calculate.
	*
	* @return {number} The square length of this vector.
	*/
	lengthSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}
	/**
	* Computes the  Euclidean length (straight-line length) from (0, 0, 0) to (x, y, z).
	*
	* @return {number} The length of this vector.
	*/
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}
	/**
	* Computes the Manhattan length of this vector.
	*
	* @return {number} The length of this vector.
	*/
	manhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
	}
	/**
	* Converts this vector to a unit vector - that is, sets it equal to a vector
	* with the same direction as this one, but with a vector length of `1`.
	*
	* @return {Vector3} A reference to this vector.
	*/
	normalize() {
		return this.divideScalar(this.length() || 1);
	}
	/**
	* Sets this vector to a vector with the same direction as this one, but
	* with the specified length.
	*
	* @param {number} length - The new length of this vector.
	* @return {Vector3} A reference to this vector.
	*/
	setLength(length) {
		return this.normalize().multiplyScalar(length);
	}
	/**
	* Linearly interpolates between the given vector and this instance, where
	* alpha is the percent distance along the line - alpha = 0 will be this
	* vector, and alpha = 1 will be the given one.
	*
	* @param {Vector3} v - The vector to interpolate towards.
	* @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
	* @return {Vector3} A reference to this vector.
	*/
	lerp(v, alpha) {
		this.x += (v.x - this.x) * alpha;
		this.y += (v.y - this.y) * alpha;
		this.z += (v.z - this.z) * alpha;
		return this;
	}
	/**
	* Linearly interpolates between the given vectors, where alpha is the percent
	* distance along the line - alpha = 0 will be first vector, and alpha = 1 will
	* be the second one. The result is stored in this instance.
	*
	* @param {Vector3} v1 - The first vector.
	* @param {Vector3} v2 - The second vector.
	* @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
	* @return {Vector3} A reference to this vector.
	*/
	lerpVectors(v1, v2, alpha) {
		this.x = v1.x + (v2.x - v1.x) * alpha;
		this.y = v1.y + (v2.y - v1.y) * alpha;
		this.z = v1.z + (v2.z - v1.z) * alpha;
		return this;
	}
	/**
	* Calculates the cross product of the given vector with this instance.
	*
	* @param {Vector3} v - The vector to compute the cross product with.
	* @return {Vector3} The result of the cross product.
	*/
	cross(v) {
		return this.crossVectors(this, v);
	}
	/**
	* Calculates the cross product of the given vectors and stores the result
	* in this instance.
	*
	* @param {Vector3} a - The first vector.
	* @param {Vector3} b - The second vector.
	* @return {Vector3} A reference to this vector.
	*/
	crossVectors(a, b) {
		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;
		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;
		return this;
	}
	/**
	* Projects this vector onto the given one.
	*
	* @param {Vector3} v - The vector to project to.
	* @return {Vector3} A reference to this vector.
	*/
	projectOnVector(v) {
		const denominator = v.lengthSq();
		if (denominator === 0) return this.set(0, 0, 0);
		const scalar = v.dot(this) / denominator;
		return this.copy(v).multiplyScalar(scalar);
	}
	/**
	* Projects this vector onto a plane by subtracting this
	* vector projected onto the plane's normal from this vector.
	*
	* @param {Vector3} planeNormal - The plane normal.
	* @return {Vector3} A reference to this vector.
	*/
	projectOnPlane(planeNormal) {
		_vector$c.copy(this).projectOnVector(planeNormal);
		return this.sub(_vector$c);
	}
	/**
	* Reflects this vector off a plane orthogonal to the given normal vector.
	*
	* @param {Vector3} normal - The (normalized) normal vector.
	* @return {Vector3} A reference to this vector.
	*/
	reflect(normal) {
		return this.sub(_vector$c.copy(normal).multiplyScalar(2 * this.dot(normal)));
	}
	/**
	* Returns the angle between the given vector and this instance in radians.
	*
	* @param {Vector3} v - The vector to compute the angle with.
	* @return {number} The angle in radians.
	*/
	angleTo(v) {
		const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
		if (denominator === 0) return Math.PI / 2;
		const theta = this.dot(v) / denominator;
		return Math.acos(clamp(theta, -1, 1));
	}
	/**
	* Computes the distance from the given vector to this instance.
	*
	* @param {Vector3} v - The vector to compute the distance to.
	* @return {number} The distance.
	*/
	distanceTo(v) {
		return Math.sqrt(this.distanceToSquared(v));
	}
	/**
	* Computes the squared distance from the given vector to this instance.
	* If you are just comparing the distance with another distance, you should compare
	* the distance squared instead as it is slightly more efficient to calculate.
	*
	* @param {Vector3} v - The vector to compute the squared distance to.
	* @return {number} The squared distance.
	*/
	distanceToSquared(v) {
		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return dx * dx + dy * dy + dz * dz;
	}
	/**
	* Computes the Manhattan distance from the given vector to this instance.
	*
	* @param {Vector3} v - The vector to compute the Manhattan distance to.
	* @return {number} The Manhattan distance.
	*/
	manhattanDistanceTo(v) {
		return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
	}
	/**
	* Sets the vector components from the given spherical coordinates.
	*
	* @param {Spherical} s - The spherical coordinates.
	* @return {Vector3} A reference to this vector.
	*/
	setFromSpherical(s) {
		return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
	}
	/**
	* Sets the vector components from the given spherical coordinates.
	*
	* @param {number} radius - The radius.
	* @param {number} phi - The phi angle in radians.
	* @param {number} theta - The theta angle in radians.
	* @return {Vector3} A reference to this vector.
	*/
	setFromSphericalCoords(radius, phi, theta) {
		const sinPhiRadius = Math.sin(phi) * radius;
		this.x = sinPhiRadius * Math.sin(theta);
		this.y = Math.cos(phi) * radius;
		this.z = sinPhiRadius * Math.cos(theta);
		return this;
	}
	/**
	* Sets the vector components from the given cylindrical coordinates.
	*
	* @param {Cylindrical} c - The cylindrical coordinates.
	* @return {Vector3} A reference to this vector.
	*/
	setFromCylindrical(c) {
		return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
	}
	/**
	* Sets the vector components from the given cylindrical coordinates.
	*
	* @param {number} radius - The radius.
	* @param {number} theta - The theta angle in radians.
	* @param {number} y - The y value.
	* @return {Vector3} A reference to this vector.
	*/
	setFromCylindricalCoords(radius, theta, y) {
		this.x = radius * Math.sin(theta);
		this.y = y;
		this.z = radius * Math.cos(theta);
		return this;
	}
	/**
	* Sets the vector components to the position elements of the
	* given transformation matrix.
	*
	* @param {Matrix4} m - The 4x4 matrix.
	* @return {Vector3} A reference to this vector.
	*/
	setFromMatrixPosition(m) {
		const e = m.elements;
		this.x = e[12];
		this.y = e[13];
		this.z = e[14];
		return this;
	}
	/**
	* Sets the vector components to the scale elements of the
	* given transformation matrix.
	*
	* @param {Matrix4} m - The 4x4 matrix.
	* @return {Vector3} A reference to this vector.
	*/
	setFromMatrixScale(m) {
		const sx = this.setFromMatrixColumn(m, 0).length();
		const sy = this.setFromMatrixColumn(m, 1).length();
		const sz = this.setFromMatrixColumn(m, 2).length();
		this.x = sx;
		this.y = sy;
		this.z = sz;
		return this;
	}
	/**
	* Sets the vector components from the specified matrix column.
	*
	* @param {Matrix4} m - The 4x4 matrix.
	* @param {number} index - The column index.
	* @return {Vector3} A reference to this vector.
	*/
	setFromMatrixColumn(m, index) {
		return this.fromArray(m.elements, index * 4);
	}
	/**
	* Sets the vector components from the specified matrix column.
	*
	* @param {Matrix3} m - The 3x3 matrix.
	* @param {number} index - The column index.
	* @return {Vector3} A reference to this vector.
	*/
	setFromMatrix3Column(m, index) {
		return this.fromArray(m.elements, index * 3);
	}
	/**
	* Sets the vector components from the given Euler angles.
	*
	* @param {Euler} e - The Euler angles to set.
	* @return {Vector3} A reference to this vector.
	*/
	setFromEuler(e) {
		this.x = e._x;
		this.y = e._y;
		this.z = e._z;
		return this;
	}
	/**
	* Sets the vector components from the RGB components of the
	* given color.
	*
	* @param {Color} c - The color to set.
	* @return {Vector3} A reference to this vector.
	*/
	setFromColor(c) {
		this.x = c.r;
		this.y = c.g;
		this.z = c.b;
		return this;
	}
	/**
	* Returns `true` if this vector is equal with the given one.
	*
	* @param {Vector3} v - The vector to test for equality.
	* @return {boolean} Whether this vector is equal with the given one.
	*/
	equals(v) {
		return v.x === this.x && v.y === this.y && v.z === this.z;
	}
	/**
	* Sets this vector's x value to be `array[ offset ]`, y value to be `array[ offset + 1 ]`
	* and z value to be `array[ offset + 2 ]`.
	*
	* @param {Array<number>} array - An array holding the vector component values.
	* @param {number} [offset=0] - The offset into the array.
	* @return {Vector3} A reference to this vector.
	*/
	fromArray(array, offset = 0) {
		this.x = array[offset];
		this.y = array[offset + 1];
		this.z = array[offset + 2];
		return this;
	}
	/**
	* Writes the components of this vector to the given array. If no array is provided,
	* the method returns a new instance.
	*
	* @param {Array<number>} [array=[]] - The target array holding the vector components.
	* @param {number} [offset=0] - Index of the first element in the array.
	* @return {Array<number>} The vector components.
	*/
	toArray(array = [], offset = 0) {
		array[offset] = this.x;
		array[offset + 1] = this.y;
		array[offset + 2] = this.z;
		return array;
	}
	/**
	* Sets the components of this vector from the given buffer attribute.
	*
	* @param {BufferAttribute} attribute - The buffer attribute holding vector data.
	* @param {number} index - The index into the attribute.
	* @return {Vector3} A reference to this vector.
	*/
	fromBufferAttribute(attribute, index) {
		this.x = attribute.getX(index);
		this.y = attribute.getY(index);
		this.z = attribute.getZ(index);
		return this;
	}
	/**
	* Sets each component of this vector to a pseudo-random value between `0` and
	* `1`, excluding `1`.
	*
	* @return {Vector3} A reference to this vector.
	*/
	random() {
		this.x = Math.random();
		this.y = Math.random();
		this.z = Math.random();
		return this;
	}
	/**
	* Sets this vector to a uniformly random point on a unit sphere.
	*
	* @return {Vector3} A reference to this vector.
	*/
	randomDirection() {
		const theta = Math.random() * Math.PI * 2;
		const u = Math.random() * 2 - 1;
		const c = Math.sqrt(1 - u * u);
		this.x = c * Math.cos(theta);
		this.y = u;
		this.z = c * Math.sin(theta);
		return this;
	}
	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		yield this.z;
	}
};
const _vector$c = /*@__PURE__*/ new Vector3();
const _quaternion$5 = /*@__PURE__*/ new Quaternion();
/**
* Represents a 3x3 matrix.
*
* A Note on Row-Major and Column-Major Ordering:
*
* The constructor and {@link Matrix3#set} method take arguments in
* [row-major](https://en.wikipedia.org/wiki/Row-_and_column-major_order#Column-major_order)
* order, while internally they are stored in the {@link Matrix3#elements} array in column-major order.
* This means that calling:
* ```js
* const m = new THREE.Matrix();
* m.set( 11, 12, 13,
*        21, 22, 23,
*        31, 32, 33 );
* ```
* will result in the elements array containing:
* ```js
* m.elements = [ 11, 21, 31,
*                12, 22, 32,
*                13, 23, 33 ];
* ```
* and internally all calculations are performed using column-major ordering.
* However, as the actual ordering makes no difference mathematically and
* most people are used to thinking about matrices in row-major order, the
* three.js documentation shows matrices in row-major order. Just bear in
* mind that if you are reading the source code, you'll have to take the
* transpose of any matrices outlined here to make sense of the calculations.
*/
var Matrix3 = class Matrix3 {
	static {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		Matrix3.prototype.isMatrix3 = true;
	}
	/**
	* Constructs a new 3x3 matrix. The arguments are supposed to be
	* in row-major order. If no arguments are provided, the constructor
	* initializes the matrix as an identity matrix.
	*
	* @param {number} [n11] - 1-1 matrix element.
	* @param {number} [n12] - 1-2 matrix element.
	* @param {number} [n13] - 1-3 matrix element.
	* @param {number} [n21] - 2-1 matrix element.
	* @param {number} [n22] - 2-2 matrix element.
	* @param {number} [n23] - 2-3 matrix element.
	* @param {number} [n31] - 3-1 matrix element.
	* @param {number} [n32] - 3-2 matrix element.
	* @param {number} [n33] - 3-3 matrix element.
	*/
	constructor(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
		/**
		* A column-major list of matrix values.
		*
		* @type {Array<number>}
		*/
		this.elements = [
			1,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			1
		];
		if (n11 !== void 0) this.set(n11, n12, n13, n21, n22, n23, n31, n32, n33);
	}
	/**
	* Sets the elements of the matrix.The arguments are supposed to be
	* in row-major order.
	*
	* @param {number} [n11] - 1-1 matrix element.
	* @param {number} [n12] - 1-2 matrix element.
	* @param {number} [n13] - 1-3 matrix element.
	* @param {number} [n21] - 2-1 matrix element.
	* @param {number} [n22] - 2-2 matrix element.
	* @param {number} [n23] - 2-3 matrix element.
	* @param {number} [n31] - 3-1 matrix element.
	* @param {number} [n32] - 3-2 matrix element.
	* @param {number} [n33] - 3-3 matrix element.
	* @return {Matrix3} A reference to this matrix.
	*/
	set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
		const te = this.elements;
		te[0] = n11;
		te[1] = n21;
		te[2] = n31;
		te[3] = n12;
		te[4] = n22;
		te[5] = n32;
		te[6] = n13;
		te[7] = n23;
		te[8] = n33;
		return this;
	}
	/**
	* Sets this matrix to the 3x3 identity matrix.
	*
	* @return {Matrix3} A reference to this matrix.
	*/
	identity() {
		this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);
		return this;
	}
	/**
	* Copies the values of the given matrix to this instance.
	*
	* @param {Matrix3} m - The matrix to copy.
	* @return {Matrix3} A reference to this matrix.
	*/
	copy(m) {
		const te = this.elements;
		const me = m.elements;
		te[0] = me[0];
		te[1] = me[1];
		te[2] = me[2];
		te[3] = me[3];
		te[4] = me[4];
		te[5] = me[5];
		te[6] = me[6];
		te[7] = me[7];
		te[8] = me[8];
		return this;
	}
	/**
	* Extracts the basis of this matrix into the three axis vectors provided.
	*
	* @param {Vector3} xAxis - The basis's x axis.
	* @param {Vector3} yAxis - The basis's y axis.
	* @param {Vector3} zAxis - The basis's z axis.
	* @return {Matrix3} A reference to this matrix.
	*/
	extractBasis(xAxis, yAxis, zAxis) {
		xAxis.setFromMatrix3Column(this, 0);
		yAxis.setFromMatrix3Column(this, 1);
		zAxis.setFromMatrix3Column(this, 2);
		return this;
	}
	/**
	* Set this matrix to the upper 3x3 matrix of the given 4x4 matrix.
	*
	* @param {Matrix4} m - The 4x4 matrix.
	* @return {Matrix3} A reference to this matrix.
	*/
	setFromMatrix4(m) {
		const me = m.elements;
		this.set(me[0], me[4], me[8], me[1], me[5], me[9], me[2], me[6], me[10]);
		return this;
	}
	/**
	* Post-multiplies this matrix by the given 3x3 matrix.
	*
	* @param {Matrix3} m - The matrix to multiply with.
	* @return {Matrix3} A reference to this matrix.
	*/
	multiply(m) {
		return this.multiplyMatrices(this, m);
	}
	/**
	* Pre-multiplies this matrix by the given 3x3 matrix.
	*
	* @param {Matrix3} m - The matrix to multiply with.
	* @return {Matrix3} A reference to this matrix.
	*/
	premultiply(m) {
		return this.multiplyMatrices(m, this);
	}
	/**
	* Multiples the given 3x3 matrices and stores the result
	* in this matrix.
	*
	* @param {Matrix3} a - The first matrix.
	* @param {Matrix3} b - The second matrix.
	* @return {Matrix3} A reference to this matrix.
	*/
	multiplyMatrices(a, b) {
		const ae = a.elements;
		const be = b.elements;
		const te = this.elements;
		const a11 = ae[0], a12 = ae[3], a13 = ae[6];
		const a21 = ae[1], a22 = ae[4], a23 = ae[7];
		const a31 = ae[2], a32 = ae[5], a33 = ae[8];
		const b11 = be[0], b12 = be[3], b13 = be[6];
		const b21 = be[1], b22 = be[4], b23 = be[7];
		const b31 = be[2], b32 = be[5], b33 = be[8];
		te[0] = a11 * b11 + a12 * b21 + a13 * b31;
		te[3] = a11 * b12 + a12 * b22 + a13 * b32;
		te[6] = a11 * b13 + a12 * b23 + a13 * b33;
		te[1] = a21 * b11 + a22 * b21 + a23 * b31;
		te[4] = a21 * b12 + a22 * b22 + a23 * b32;
		te[7] = a21 * b13 + a22 * b23 + a23 * b33;
		te[2] = a31 * b11 + a32 * b21 + a33 * b31;
		te[5] = a31 * b12 + a32 * b22 + a33 * b32;
		te[8] = a31 * b13 + a32 * b23 + a33 * b33;
		return this;
	}
	/**
	* Multiplies every component of the matrix by the given scalar.
	*
	* @param {number} s - The scalar.
	* @return {Matrix3} A reference to this matrix.
	*/
	multiplyScalar(s) {
		const te = this.elements;
		te[0] *= s;
		te[3] *= s;
		te[6] *= s;
		te[1] *= s;
		te[4] *= s;
		te[7] *= s;
		te[2] *= s;
		te[5] *= s;
		te[8] *= s;
		return this;
	}
	/**
	* Computes and returns the determinant of this matrix.
	*
	* @return {number} The determinant.
	*/
	determinant() {
		const te = this.elements;
		const a = te[0], b = te[1], c = te[2], d = te[3], e = te[4], f = te[5], g = te[6], h = te[7], i = te[8];
		return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
	}
	/**
	* Inverts this matrix, using the [analytic method](https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution).
	* You can not invert with a determinant of zero. If you attempt this, the method produces
	* a zero matrix instead.
	*
	* @return {Matrix3} A reference to this matrix.
	*/
	invert() {
		const te = this.elements, n11 = te[0], n21 = te[1], n31 = te[2], n12 = te[3], n22 = te[4], n32 = te[5], n13 = te[6], n23 = te[7], n33 = te[8], t11 = n33 * n22 - n32 * n23, t12 = n32 * n13 - n33 * n12, t13 = n23 * n12 - n22 * n13, det = n11 * t11 + n21 * t12 + n31 * t13;
		if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
		const detInv = 1 / det;
		te[0] = t11 * detInv;
		te[1] = (n31 * n23 - n33 * n21) * detInv;
		te[2] = (n32 * n21 - n31 * n22) * detInv;
		te[3] = t12 * detInv;
		te[4] = (n33 * n11 - n31 * n13) * detInv;
		te[5] = (n31 * n12 - n32 * n11) * detInv;
		te[6] = t13 * detInv;
		te[7] = (n21 * n13 - n23 * n11) * detInv;
		te[8] = (n22 * n11 - n21 * n12) * detInv;
		return this;
	}
	/**
	* Transposes this matrix in place.
	*
	* @return {Matrix3} A reference to this matrix.
	*/
	transpose() {
		let tmp;
		const m = this.elements;
		tmp = m[1];
		m[1] = m[3];
		m[3] = tmp;
		tmp = m[2];
		m[2] = m[6];
		m[6] = tmp;
		tmp = m[5];
		m[5] = m[7];
		m[7] = tmp;
		return this;
	}
	/**
	* Computes the normal matrix which is the inverse transpose of the upper
	* left 3x3 portion of the given 4x4 matrix.
	*
	* @param {Matrix4} matrix4 - The 4x4 matrix.
	* @return {Matrix3} A reference to this matrix.
	*/
	getNormalMatrix(matrix4) {
		return this.setFromMatrix4(matrix4).invert().transpose();
	}
	/**
	* Transposes this matrix into the supplied array, and returns itself unchanged.
	*
	* @param {Array<number>} r - An array to store the transposed matrix elements.
	* @return {Matrix3} A reference to this matrix.
	*/
	transposeIntoArray(r) {
		const m = this.elements;
		r[0] = m[0];
		r[1] = m[3];
		r[2] = m[6];
		r[3] = m[1];
		r[4] = m[4];
		r[5] = m[7];
		r[6] = m[2];
		r[7] = m[5];
		r[8] = m[8];
		return this;
	}
	/**
	* Sets the UV transform matrix from offset, repeat, rotation, and center.
	*
	* @param {number} tx - Offset x.
	* @param {number} ty - Offset y.
	* @param {number} sx - Repeat x.
	* @param {number} sy - Repeat y.
	* @param {number} rotation - Rotation, in radians. Positive values rotate counterclockwise.
	* @param {number} cx - Center x of rotation.
	* @param {number} cy - Center y of rotation
	* @return {Matrix3} A reference to this matrix.
	*/
	setUvTransform(tx, ty, sx, sy, rotation, cx, cy) {
		const c = Math.cos(rotation);
		const s = Math.sin(rotation);
		this.set(sx * c, sx * s, -sx * (c * cx + s * cy) + cx + tx, -sy * s, sy * c, -sy * (-s * cx + c * cy) + cy + ty, 0, 0, 1);
		return this;
	}
	/**
	* Scales this matrix with the given scalar values.
	*
	* @deprecated
	* @param {number} sx - The amount to scale in the X axis.
	* @param {number} sy - The amount to scale in the Y axis.
	* @return {Matrix3} A reference to this matrix.
	*/
	scale(sx, sy) {
		warnOnce("Matrix3: .scale() is deprecated. Use .makeScale() instead.");
		this.premultiply(_m3.makeScale(sx, sy));
		return this;
	}
	/**
	* Rotates this matrix by the given angle.
	*
	* @deprecated
	* @param {number} theta - The rotation in radians.
	* @return {Matrix3} A reference to this matrix.
	*/
	rotate(theta) {
		warnOnce("Matrix3: .rotate() is deprecated. Use .makeRotation() instead.");
		this.premultiply(_m3.makeRotation(-theta));
		return this;
	}
	/**
	* Translates this matrix by the given scalar values.
	*
	* @deprecated
	* @param {number} tx - The amount to translate in the X axis.
	* @param {number} ty - The amount to translate in the Y axis.
	* @return {Matrix3} A reference to this matrix.
	*/
	translate(tx, ty) {
		warnOnce("Matrix3: .translate() is deprecated. Use .makeTranslation() instead.");
		this.premultiply(_m3.makeTranslation(tx, ty));
		return this;
	}
	/**
	* Sets this matrix as a 2D translation transform.
	*
	* @param {number|Vector2} x - The amount to translate in the X axis or alternatively a translation vector.
	* @param {number} y - The amount to translate in the Y axis.
	* @return {Matrix3} A reference to this matrix.
	*/
	makeTranslation(x, y) {
		if (x.isVector2) this.set(1, 0, x.x, 0, 1, x.y, 0, 0, 1);
		else this.set(1, 0, x, 0, 1, y, 0, 0, 1);
		return this;
	}
	/**
	* Sets this matrix as a 2D rotational transformation.
	*
	* @param {number} theta - The rotation in radians.
	* @return {Matrix3} A reference to this matrix.
	*/
	makeRotation(theta) {
		const c = Math.cos(theta);
		const s = Math.sin(theta);
		this.set(c, -s, 0, s, c, 0, 0, 0, 1);
		return this;
	}
	/**
	* Sets this matrix as a 2D scale transform.
	*
	* @param {number} x - The amount to scale in the X axis.
	* @param {number} y - The amount to scale in the Y axis.
	* @return {Matrix3} A reference to this matrix.
	*/
	makeScale(x, y) {
		this.set(x, 0, 0, 0, y, 0, 0, 0, 1);
		return this;
	}
	/**
	* Returns `true` if this matrix is equal with the given one.
	*
	* @param {Matrix3} matrix - The matrix to test for equality.
	* @return {boolean} Whether this matrix is equal with the given one.
	*/
	equals(matrix) {
		const te = this.elements;
		const me = matrix.elements;
		for (let i = 0; i < 9; i++) if (te[i] !== me[i]) return false;
		return true;
	}
	/**
	* Sets the elements of the matrix from the given array.
	*
	* @param {Array<number>} array - The matrix elements in column-major order.
	* @param {number} [offset=0] - Index of the first element in the array.
	* @return {Matrix3} A reference to this matrix.
	*/
	fromArray(array, offset = 0) {
		for (let i = 0; i < 9; i++) this.elements[i] = array[i + offset];
		return this;
	}
	/**
	* Writes the elements of this matrix to the given array. If no array is provided,
	* the method returns a new instance.
	*
	* @param {Array<number>} [array=[]] - The target array holding the matrix elements in column-major order.
	* @param {number} [offset=0] - Index of the first element in the array.
	* @return {Array<number>} The matrix elements in column-major order.
	*/
	toArray(array = [], offset = 0) {
		const te = this.elements;
		array[offset] = te[0];
		array[offset + 1] = te[1];
		array[offset + 2] = te[2];
		array[offset + 3] = te[3];
		array[offset + 4] = te[4];
		array[offset + 5] = te[5];
		array[offset + 6] = te[6];
		array[offset + 7] = te[7];
		array[offset + 8] = te[8];
		return array;
	}
	/**
	* Returns a matrix with copied values from this instance.
	*
	* @return {Matrix3} A clone of this instance.
	*/
	clone() {
		return new this.constructor().fromArray(this.elements);
	}
};
const _m3 = /*@__PURE__*/ new Matrix3();
const LINEAR_REC709_TO_XYZ = /*@__PURE__*/ new Matrix3().set(.4123908, .3575843, .1804808, .212639, .7151687, .0721923, .0193308, .1191948, .9505322);
const XYZ_TO_LINEAR_REC709 = /*@__PURE__*/ new Matrix3().set(3.2409699, -1.5373832, -.4986108, -.9692436, 1.8759675, .0415551, .0556301, -.203977, 1.0569715);
function createColorManagement() {
	const ColorManagement = {
		enabled: true,
		workingColorSpace: LinearSRGBColorSpace,
		/**
		* Implementations of supported color spaces.
		*
		* Required:
		*	- primaries: chromaticity coordinates [ rx ry gx gy bx by ]
		*	- whitePoint: reference white [ x y ]
		*	- transfer: transfer function (pre-defined)
		*	- toXYZ: Matrix3 RGB to XYZ transform
		*	- fromXYZ: Matrix3 XYZ to RGB transform
		*	- luminanceCoefficients: RGB luminance coefficients
		*
		* Optional:
		*  - outputColorSpaceConfig: { drawingBufferColorSpace: ColorSpace, toneMappingMode: 'extended' | 'standard' }
		*  - workingColorSpaceConfig: { unpackColorSpace: ColorSpace }
		*
		* Reference:
		* - https://www.russellcottrell.com/photo/matrixCalculator.htm
		*/
		spaces: {},
		convert: function(color, sourceColorSpace, targetColorSpace) {
			if (this.enabled === false || sourceColorSpace === targetColorSpace || !sourceColorSpace || !targetColorSpace) return color;
			if (this.spaces[sourceColorSpace].transfer === "srgb") {
				color.r = SRGBToLinear(color.r);
				color.g = SRGBToLinear(color.g);
				color.b = SRGBToLinear(color.b);
			}
			if (this.spaces[sourceColorSpace].primaries !== this.spaces[targetColorSpace].primaries) {
				color.applyMatrix3(this.spaces[sourceColorSpace].toXYZ);
				color.applyMatrix3(this.spaces[targetColorSpace].fromXYZ);
			}
			if (this.spaces[targetColorSpace].transfer === "srgb") {
				color.r = LinearToSRGB(color.r);
				color.g = LinearToSRGB(color.g);
				color.b = LinearToSRGB(color.b);
			}
			return color;
		},
		workingToColorSpace: function(color, targetColorSpace) {
			return this.convert(color, this.workingColorSpace, targetColorSpace);
		},
		colorSpaceToWorking: function(color, sourceColorSpace) {
			return this.convert(color, sourceColorSpace, this.workingColorSpace);
		},
		getPrimaries: function(colorSpace) {
			return this.spaces[colorSpace].primaries;
		},
		getTransfer: function(colorSpace) {
			if (colorSpace === "") return LinearTransfer;
			return this.spaces[colorSpace].transfer;
		},
		getToneMappingMode: function(colorSpace) {
			return this.spaces[colorSpace].outputColorSpaceConfig.toneMappingMode || "standard";
		},
		getLuminanceCoefficients: function(target, colorSpace = this.workingColorSpace) {
			return target.fromArray(this.spaces[colorSpace].luminanceCoefficients);
		},
		define: function(colorSpaces) {
			Object.assign(this.spaces, colorSpaces);
		},
		_getMatrix: function(targetMatrix, sourceColorSpace, targetColorSpace) {
			return targetMatrix.copy(this.spaces[sourceColorSpace].toXYZ).multiply(this.spaces[targetColorSpace].fromXYZ);
		},
		_getDrawingBufferColorSpace: function(colorSpace) {
			return this.spaces[colorSpace].outputColorSpaceConfig.drawingBufferColorSpace;
		},
		_getUnpackColorSpace: function(colorSpace = this.workingColorSpace) {
			return this.spaces[colorSpace].workingColorSpaceConfig.unpackColorSpace;
		},
		fromWorkingColorSpace: function(color, targetColorSpace) {
			warnOnce("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().");
			return ColorManagement.workingToColorSpace(color, targetColorSpace);
		},
		toWorkingColorSpace: function(color, sourceColorSpace) {
			warnOnce("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().");
			return ColorManagement.colorSpaceToWorking(color, sourceColorSpace);
		}
	};
	/******************************************************************************
	* sRGB definitions
	*/
	const REC709_PRIMARIES = [
		.64,
		.33,
		.3,
		.6,
		.15,
		.06
	];
	const REC709_LUMINANCE_COEFFICIENTS = [
		.2126,
		.7152,
		.0722
	];
	const D65 = [.3127, .329];
	ColorManagement.define({
		[LinearSRGBColorSpace]: {
			primaries: REC709_PRIMARIES,
			whitePoint: D65,
			transfer: LinearTransfer,
			toXYZ: LINEAR_REC709_TO_XYZ,
			fromXYZ: XYZ_TO_LINEAR_REC709,
			luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
			workingColorSpaceConfig: { unpackColorSpace: SRGBColorSpace },
			outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace }
		},
		[SRGBColorSpace]: {
			primaries: REC709_PRIMARIES,
			whitePoint: D65,
			transfer: SRGBTransfer,
			toXYZ: LINEAR_REC709_TO_XYZ,
			fromXYZ: XYZ_TO_LINEAR_REC709,
			luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
			outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace }
		}
	});
	return ColorManagement;
}
const ColorManagement = /*@__PURE__*/ createColorManagement();
function SRGBToLinear(c) {
	return c < .04045 ? c * .0773993808 : Math.pow(c * .9478672986 + .0521327014, 2.4);
}
function LinearToSRGB(c) {
	return c < .0031308 ? c * 12.92 : 1.055 * Math.pow(c, .41666) - .055;
}
let _canvas;
/**
* A class containing utility functions for images.
*
* @hideconstructor
*/
var ImageUtils = class {
	/**
	* Returns a data URI containing a representation of the given image.
	*
	* @param {(HTMLImageElement|HTMLCanvasElement)} image - The image object.
	* @param {string} [type='image/png'] - Indicates the image format.
	* @return {string} The data URI.
	*/
	static getDataURL(image, type = "image/png") {
		if (/^data:/i.test(image.src)) return image.src;
		if (typeof HTMLCanvasElement === "undefined") return image.src;
		let canvas;
		if (image instanceof HTMLCanvasElement) canvas = image;
		else {
			if (_canvas === void 0) _canvas = createElementNS("canvas");
			_canvas.width = image.width;
			_canvas.height = image.height;
			const context = _canvas.getContext("2d");
			if (image instanceof ImageData) context.putImageData(image, 0, 0);
			else context.drawImage(image, 0, 0, image.width, image.height);
			canvas = _canvas;
		}
		return canvas.toDataURL(type);
	}
	/**
	* Converts the given sRGB image data to linear color space.
	*
	* @param {(HTMLImageElement|HTMLCanvasElement|ImageBitmap|Object)} image - The image object.
	* @return {HTMLCanvasElement|Object} The converted image.
	*/
	static sRGBToLinear(image) {
		if (typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement || typeof HTMLCanvasElement !== "undefined" && image instanceof HTMLCanvasElement || typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
			const canvas = createElementNS("canvas");
			canvas.width = image.width;
			canvas.height = image.height;
			const context = canvas.getContext("2d");
			context.drawImage(image, 0, 0, image.width, image.height);
			const imageData = context.getImageData(0, 0, image.width, image.height);
			const data = imageData.data;
			for (let i = 0; i < data.length; i++) data[i] = SRGBToLinear(data[i] / 255) * 255;
			context.putImageData(imageData, 0, 0);
			return canvas;
		} else if (image.data) {
			const data = image.data.slice(0);
			for (let i = 0; i < data.length; i++) if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) data[i] = Math.floor(SRGBToLinear(data[i] / 255) * 255);
			else data[i] = SRGBToLinear(data[i]);
			return {
				data,
				width: image.width,
				height: image.height
			};
		} else {
			warn("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.");
			return image;
		}
	}
};
let _sourceId = 0;
/**
* Represents the data source of a texture.
*
* The main purpose of this class is to decouple the data definition from the texture
* definition so the same data can be used with multiple texture instances.
*/
var TextureSource = class {
	/**
	* Constructs a new texture source.
	*
	* @param {any} [data=null] - The data definition of a texture.
	*/
	constructor(data = null) {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isTextureSource = true;
		/**
		* The ID of the source.
		*
		* @name TextureSource#id
		* @type {number}
		* @readonly
		*/
		Object.defineProperty(this, "id", { value: _sourceId++ });
		/**
		* The UUID of the source.
		*
		* @type {string}
		* @readonly
		*/
		this.uuid = generateUUID();
		/**
		* The data definition of a texture.
		*
		* @type {any}
		*/
		this.data = data;
		/**
		* This property is only relevant when {@link TextureSource#needsUpdate} is set to `true` and
		* provides more control on how texture data should be processed. When `dataReady` is set
		* to `false`, the engine performs the memory allocation (if necessary) but does not transfer
		* the data into the GPU memory.
		*
		* @type {boolean}
		* @default true
		*/
		this.dataReady = true;
		/**
		* This starts at `0` and counts how many times {@link TextureSource#needsUpdate} is set to `true`.
		*
		* @type {number}
		* @readonly
		* @default 0
		*/
		this.version = 0;
	}
	/**
	* Returns the dimensions of the source into the given target vector.
	*
	* @param {(Vector2|Vector3)} target - The target object the result is written into.
	* @return {(Vector2|Vector3)} The dimensions of the source.
	*/
	getSize(target) {
		const data = this.data;
		if (typeof HTMLVideoElement !== "undefined" && data instanceof HTMLVideoElement) target.set(data.videoWidth, data.videoHeight, 0);
		else if (typeof VideoFrame !== "undefined" && data instanceof VideoFrame) target.set(data.displayWidth, data.displayHeight, 0);
		else if (data !== null) target.set(data.width, data.height, data.depth || 0);
		else target.set(0, 0, 0);
		return target;
	}
	/**
	* When the property is set to `true`, the engine allocates the memory
	* for the texture (if necessary) and triggers the actual texture upload
	* to the GPU next time the source is used.
	*
	* @type {boolean}
	* @default false
	* @param {boolean} value
	*/
	set needsUpdate(value) {
		if (value === true) this.version++;
	}
	/**
	* Serializes the source into JSON.
	*
	* @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
	* @return {Object} A JSON object representing the serialized source.
	* @see {@link ObjectLoader#parse}
	*/
	toJSON(meta) {
		const isRootObject = meta === void 0 || typeof meta === "string";
		if (!isRootObject && meta.images[this.uuid] !== void 0) return meta.images[this.uuid];
		const output = {
			uuid: this.uuid,
			url: ""
		};
		const data = this.data;
		if (data !== null) {
			let url;
			if (Array.isArray(data)) {
				url = [];
				for (let i = 0, l = data.length; i < l; i++) if (data[i].isDataTexture) url.push(serializeImage(data[i].image));
				else url.push(serializeImage(data[i]));
			} else url = serializeImage(data);
			output.url = url;
		}
		if (!isRootObject) meta.images[this.uuid] = output;
		return output;
	}
};
function serializeImage(image) {
	if (typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement || typeof HTMLCanvasElement !== "undefined" && image instanceof HTMLCanvasElement || typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) return ImageUtils.getDataURL(image);
	else if (image.data) return {
		data: Array.from(image.data),
		width: image.width,
		height: image.height,
		type: image.data.constructor.name
	};
	else {
		warn("Texture: Unable to serialize Texture.");
		return {};
	}
}
let _textureId = 0;
const _tempVec3 = /*@__PURE__*/ new Vector3();
/**
* Base class for all textures.
*
* Note: After the initial use of a texture, its dimensions, format, and type
* cannot be changed. Instead, call {@link Texture#dispose} on the texture and instantiate a new one.
*
* @augments EventDispatcher
*/
var Texture = class Texture extends EventDispatcher {
	/**
	* Constructs a new texture.
	*
	* @param {?Object} [image=Texture.DEFAULT_IMAGE] - The image holding the texture data.
	* @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
	* @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	* @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	* @param {number} [magFilter=LinearFilter] - The mag filter value.
	* @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
	* @param {number} [format=RGBAFormat] - The texture format.
	* @param {number} [type=UnsignedByteType] - The texture type.
	* @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
	* @param {string} [colorSpace=NoColorSpace] - The color space.
	*/
	constructor(image = Texture.DEFAULT_IMAGE, mapping = Texture.DEFAULT_MAPPING, wrapS = ClampToEdgeWrapping, wrapT = ClampToEdgeWrapping, magFilter = LinearFilter, minFilter = LinearMipmapLinearFilter, format = RGBAFormat, type = UnsignedByteType, anisotropy = Texture.DEFAULT_ANISOTROPY, colorSpace = "") {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isTexture = true;
		/**
		* The ID of the texture.
		*
		* @name Texture#id
		* @type {number}
		* @readonly
		*/
		Object.defineProperty(this, "id", { value: _textureId++ });
		/**
		* The UUID of the texture.
		*
		* @type {string}
		* @readonly
		*/
		this.uuid = generateUUID();
		/**
		* The name of the texture.
		*
		* @type {string}
		*/
		this.name = "";
		/**
		* The data definition of a texture. A reference to the data source can be
		* shared across textures. This is often useful in context of spritesheets
		* where multiple textures render the same data but with different texture
		* transformations.
		*
		* @type {TextureSource}
		*/
		this.source = new TextureSource(image);
		/**
		* An array holding user-defined mipmaps.
		*
		* @type {Array<Object>}
		*/
		this.mipmaps = [];
		/**
		* How the texture is applied to the object. The value `UVMapping`
		* is the default, where texture or uv coordinates are used to apply the map.
		*
		* @type {(UVMapping|CubeReflectionMapping|CubeRefractionMapping|EquirectangularReflectionMapping|EquirectangularRefractionMapping|CubeUVReflectionMapping)}
		* @default UVMapping
		*/
		this.mapping = mapping;
		/**
		* Lets you select the uv attribute to map the texture to. `0` for `uv`,
		* `1` for `uv1`, `2` for `uv2` and `3` for `uv3`.
		*
		* @type {number}
		* @default 0
		*/
		this.channel = 0;
		/**
		* This defines how the texture is wrapped horizontally and corresponds to
		* *U* in UV mapping.
		*
		* @type {(RepeatWrapping|ClampToEdgeWrapping|MirroredRepeatWrapping)}
		* @default ClampToEdgeWrapping
		*/
		this.wrapS = wrapS;
		/**
		* This defines how the texture is wrapped horizontally and corresponds to
		* *V* in UV mapping.
		*
		* @type {(RepeatWrapping|ClampToEdgeWrapping|MirroredRepeatWrapping)}
		* @default ClampToEdgeWrapping
		*/
		this.wrapT = wrapT;
		/**
		* How the texture is sampled when a texel covers more than one pixel.
		*
		* @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
		* @default LinearFilter
		*/
		this.magFilter = magFilter;
		/**
		* How the texture is sampled when a texel covers less than one pixel.
		*
		* @type {(NearestFilter|NearestMipmapNearestFilter|NearestMipmapLinearFilter|LinearFilter|LinearMipmapNearestFilter|LinearMipmapLinearFilter)}
		* @default LinearMipmapLinearFilter
		*/
		this.minFilter = minFilter;
		/**
		* The number of samples taken along the axis through the pixel that has the
		* highest density of texels. By default, this value is `1`. A higher value
		* gives a less blurry result than a basic mipmap, at the cost of more
		* texture samples being used.
		*
		* @type {number}
		* @default Texture.DEFAULT_ANISOTROPY
		*/
		this.anisotropy = anisotropy;
		/**
		* The format of the texture.
		*
		* @type {number}
		* @default RGBAFormat
		*/
		this.format = format;
		/**
		* The default internal format is derived from {@link Texture#format} and {@link Texture#type} and
		* defines how the texture data is going to be stored on the GPU.
		*
		* This property allows to overwrite the default format.
		*
		* @type {?string}
		* @default null
		*/
		this.internalFormat = null;
		/**
		* The data type of the texture.
		*
		* @type {number}
		* @default UnsignedByteType
		*/
		this.type = type;
		/**
		* How much a single repetition of the texture is offset from the beginning,
		* in each direction U and V. Typical range is `0.0` to `1.0`.
		*
		* @type {Vector2}
		* @default (0,0)
		*/
		this.offset = new Vector2(0, 0);
		/**
		* How many times the texture is repeated across the surface, in each
		* direction U and V. If repeat is set greater than `1` in either direction,
		* the corresponding wrap parameter should also be set to `RepeatWrapping`
		* or `MirroredRepeatWrapping` to achieve the desired tiling effect.
		*
		* @type {Vector2}
		* @default (1,1)
		*/
		this.repeat = new Vector2(1, 1);
		/**
		* The point around which rotation occurs. A value of `(0.5, 0.5)` corresponds
		* to the center of the texture. Default is `(0, 0)`, the lower left.
		*
		* @type {Vector2}
		* @default (0,0)
		*/
		this.center = new Vector2(0, 0);
		/**
		* How much the texture is rotated around the center point, in radians.
		* Positive values are counter-clockwise.
		*
		* @type {number}
		* @default 0
		*/
		this.rotation = 0;
		/**
		* Whether to update the texture's uv-transformation {@link Texture#matrix}
		* from the properties {@link Texture#offset}, {@link Texture#repeat},
		* {@link Texture#rotation}, and {@link Texture#center}.
		*
		* Set this to `false` if you are specifying the uv-transform matrix directly.
		*
		* @type {boolean}
		* @default true
		*/
		this.matrixAutoUpdate = true;
		/**
		* The uv-transformation matrix of the texture.
		*
		* @type {Matrix3}
		*/
		this.matrix = new Matrix3();
		/**
		* Whether to generate mipmaps (if possible) for a texture.
		*
		* Set this to `false` if you are creating mipmaps manually.
		*
		* @type {boolean}
		* @default true
		*/
		this.generateMipmaps = true;
		/**
		* If set to `true`, the alpha channel, if present, is multiplied into the
		* color channels when the texture is uploaded to the GPU.
		*
		* Note that this property has no effect when using `ImageBitmap`. You need to
		* configure premultiply alpha on bitmap creation instead.
		*
		* @type {boolean}
		* @default false
		*/
		this.premultiplyAlpha = false;
		/**
		* If set to `true`, the texture is flipped along the vertical axis when
		* uploaded to the GPU.
		*
		* Note that this property has no effect when using `ImageBitmap`. You need to
		* configure the flip on bitmap creation instead.
		*
		* @type {boolean}
		* @default true
		*/
		this.flipY = true;
		/**
		* Specifies the alignment requirements for the start of each pixel row in memory.
		* The allowable values are `1` (byte-alignment), `2` (rows aligned to even-numbered bytes),
		* `4` (word-alignment), and `8` (rows start on double-word boundaries).
		*
		* @type {number}
		* @default 4
		*/
		this.unpackAlignment = 4;
		/**
		* Textures containing color data should be annotated with `SRGBColorSpace` or `LinearSRGBColorSpace`.
		*
		* @type {string}
		* @default NoColorSpace
		*/
		this.colorSpace = colorSpace;
		/**
		* An object that can be used to store custom data about the texture. It
		* should not hold references to functions as these will not be cloned.
		*
		* @type {Object}
		*/
		this.userData = {};
		/**
		* This can be used to only update a subregion or specific rows of the texture (for example, just the
		* first 3 rows). Use the `addUpdateRange()` function to add ranges to this array.
		*
		* @type {Array<Object>}
		*/
		this.updateRanges = [];
		/**
		* This starts at `0` and counts how many times {@link Texture#needsUpdate} is set to `true`.
		*
		* @type {number}
		* @readonly
		* @default 0
		*/
		this.version = 0;
		/**
		* A callback function, called when the texture is updated (e.g., when
		* {@link Texture#needsUpdate} has been set to true and then the texture is used).
		*
		* @type {?Function}
		* @default null
		*/
		this.onUpdate = null;
		/**
		* An optional back reference to the textures render target.
		*
		* @type {?(RenderTarget|WebGLRenderTarget)}
		* @default null
		*/
		this.renderTarget = null;
		/**
		* Indicates whether a texture belongs to a render target or not.
		*
		* @type {boolean}
		* @readonly
		* @default false
		*/
		this.isRenderTargetTexture = false;
		/**
		* Indicates if a texture should be handled like a texture array.
		*
		* @type {boolean}
		* @readonly
		* @default false
		*/
		this.isArrayTexture = image && image.depth && image.depth > 1 ? true : false;
		/**
		* Indicates whether this texture should be processed by `PMREMGenerator` or not
		* (only relevant for render target textures).
		*
		* @type {number}
		* @readonly
		* @default 0
		*/
		this.pmremVersion = 0;
		/**
		* Whether the texture should use one of the 16 bit integer formats which are normalized
		* to [0, 1] or [-1, 1] (depending on signed/unsigned) when sampled.
		*
		* @type {boolean}
		* @default false
		*/
		this.normalized = false;
	}
	/**
	* The width of the texture in pixels.
	*/
	get width() {
		return this.source.getSize(_tempVec3).x;
	}
	/**
	* The height of the texture in pixels.
	*/
	get height() {
		return this.source.getSize(_tempVec3).y;
	}
	/**
	* The depth of the texture in pixels.
	*/
	get depth() {
		return this.source.getSize(_tempVec3).z;
	}
	/**
	* The image object holding the texture data.
	*
	* @type {?Object}
	*/
	get image() {
		return this.source.data;
	}
	set image(value) {
		this.source.data = value;
	}
	/**
	* Updates the texture transformation matrix from the properties {@link Texture#offset},
	* {@link Texture#repeat}, {@link Texture#rotation}, and {@link Texture#center}.
	*/
	updateMatrix() {
		this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
	}
	/**
	* Adds a range of data in the data texture to be updated on the GPU.
	*
	* @param {number} start - Position at which to start update.
	* @param {number} count - The number of components to update.
	*/
	addUpdateRange(start, count) {
		this.updateRanges.push({
			start,
			count
		});
	}
	/**
	* Clears the update ranges.
	*/
	clearUpdateRanges() {
		this.updateRanges.length = 0;
	}
	/**
	* Returns a new texture with copied values from this instance.
	*
	* @return {Texture} A clone of this instance.
	*/
	clone() {
		return new this.constructor().copy(this);
	}
	/**
	* Copies the values of the given texture to this instance.
	*
	* @param {Texture} source - The texture to copy.
	* @return {Texture} A reference to this instance.
	*/
	copy(source) {
		this.name = source.name;
		this.source = source.source;
		this.mipmaps = source.mipmaps.slice(0);
		this.mapping = source.mapping;
		this.channel = source.channel;
		this.wrapS = source.wrapS;
		this.wrapT = source.wrapT;
		this.magFilter = source.magFilter;
		this.minFilter = source.minFilter;
		this.anisotropy = source.anisotropy;
		this.format = source.format;
		this.internalFormat = source.internalFormat;
		this.type = source.type;
		this.normalized = source.normalized;
		this.offset.copy(source.offset);
		this.repeat.copy(source.repeat);
		this.center.copy(source.center);
		this.rotation = source.rotation;
		this.matrixAutoUpdate = source.matrixAutoUpdate;
		this.matrix.copy(source.matrix);
		this.generateMipmaps = source.generateMipmaps;
		this.premultiplyAlpha = source.premultiplyAlpha;
		this.flipY = source.flipY;
		this.unpackAlignment = source.unpackAlignment;
		this.colorSpace = source.colorSpace;
		this.renderTarget = source.renderTarget;
		this.isRenderTargetTexture = source.isRenderTargetTexture;
		this.isArrayTexture = source.isArrayTexture;
		this.userData = JSON.parse(JSON.stringify(source.userData));
		this.needsUpdate = true;
		return this;
	}
	/**
	* Sets this texture's properties based on `values`.
	* @param {Object} values - A container with texture parameters.
	*/
	setValues(values) {
		for (const key in values) {
			const newValue = values[key];
			if (newValue === void 0) {
				warn(`Texture.setValues(): parameter '${key}' has value of undefined.`);
				continue;
			}
			const currentValue = this[key];
			if (currentValue === void 0) {
				warn(`Texture.setValues(): property '${key}' does not exist.`);
				continue;
			}
			if (currentValue && newValue && currentValue.isVector2 && newValue.isVector2) currentValue.copy(newValue);
			else if (currentValue && newValue && currentValue.isVector3 && newValue.isVector3) currentValue.copy(newValue);
			else if (currentValue && newValue && currentValue.isMatrix3 && newValue.isMatrix3) currentValue.copy(newValue);
			else this[key] = newValue;
		}
	}
	/**
	* Serializes the texture into JSON.
	*
	* @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
	* @return {Object} A JSON object representing the serialized texture.
	* @see {@link ObjectLoader#parse}
	*/
	toJSON(meta) {
		const isRootObject = meta === void 0 || typeof meta === "string";
		if (!isRootObject && meta.textures[this.uuid] !== void 0) return meta.textures[this.uuid];
		const output = {
			metadata: {
				version: 4.7,
				type: "Texture",
				generator: "Texture.toJSON"
			},
			uuid: this.uuid,
			name: this.name,
			image: this.source.toJSON(meta).uuid,
			mapping: this.mapping,
			channel: this.channel,
			repeat: [this.repeat.x, this.repeat.y],
			offset: [this.offset.x, this.offset.y],
			center: [this.center.x, this.center.y],
			rotation: this.rotation,
			wrap: [this.wrapS, this.wrapT],
			format: this.format,
			internalFormat: this.internalFormat,
			type: this.type,
			normalized: this.normalized,
			colorSpace: this.colorSpace,
			minFilter: this.minFilter,
			magFilter: this.magFilter,
			anisotropy: this.anisotropy,
			flipY: this.flipY,
			generateMipmaps: this.generateMipmaps,
			premultiplyAlpha: this.premultiplyAlpha,
			unpackAlignment: this.unpackAlignment
		};
		if (Object.keys(this.userData).length > 0) output.userData = this.userData;
		if (!isRootObject) meta.textures[this.uuid] = output;
		return output;
	}
	/**
	* Frees the GPU-related resources allocated by this instance. Call this
	* method whenever this instance is no longer used in your app.
	*
	* @fires Texture#dispose
	*/
	dispose() {
		/**
		* Fires when the texture has been disposed of.
		*
		* @event Texture#dispose
		* @type {Object}
		*/
		this.dispatchEvent({ type: "dispose" });
	}
	/**
	* Transforms the given uv vector with the textures uv transformation matrix.
	*
	* @param {Vector2} uv - The uv vector.
	* @return {Vector2} The transformed uv vector.
	*/
	transformUv(uv) {
		if (this.mapping !== 300) return uv;
		uv.applyMatrix3(this.matrix);
		if (uv.x < 0 || uv.x > 1) switch (this.wrapS) {
			case RepeatWrapping:
				uv.x = uv.x - Math.floor(uv.x);
				break;
			case ClampToEdgeWrapping:
				uv.x = uv.x < 0 ? 0 : 1;
				break;
			case MirroredRepeatWrapping: if (Math.abs(Math.floor(uv.x) % 2) === 1) uv.x = Math.ceil(uv.x) - uv.x;
			else uv.x = uv.x - Math.floor(uv.x);
		}
		if (uv.y < 0 || uv.y > 1) switch (this.wrapT) {
			case RepeatWrapping:
				uv.y = uv.y - Math.floor(uv.y);
				break;
			case ClampToEdgeWrapping:
				uv.y = uv.y < 0 ? 0 : 1;
				break;
			case MirroredRepeatWrapping: if (Math.abs(Math.floor(uv.y) % 2) === 1) uv.y = Math.ceil(uv.y) - uv.y;
			else uv.y = uv.y - Math.floor(uv.y);
		}
		if (this.flipY) uv.y = 1 - uv.y;
		return uv;
	}
	/**
	* Setting this property to `true` indicates the engine the texture
	* must be updated in the next render. This triggers a texture upload
	* to the GPU and ensures correct texture parameter configuration.
	*
	* @type {boolean}
	* @default false
	* @param {boolean} value
	*/
	set needsUpdate(value) {
		if (value === true) {
			this.version++;
			this.source.needsUpdate = true;
		}
	}
	/**
	* Setting this property to `true` indicates the engine the PMREM
	* must be regenerated.
	*
	* @type {boolean}
	* @default false
	* @param {boolean} value
	*/
	set needsPMREMUpdate(value) {
		if (value === true) this.pmremVersion++;
	}
};
/**
* The default image for all textures.
*
* @static
* @type {?Image}
* @default null
*/
Texture.DEFAULT_IMAGE = null;
/**
* The default mapping for all textures.
*
* @static
* @type {number}
* @default UVMapping
*/
Texture.DEFAULT_MAPPING = 300;
/**
* The default anisotropy value for all textures.
*
* @static
* @type {number}
* @default 1
*/
Texture.DEFAULT_ANISOTROPY = 1;
/**
* Class representing a 4D vector. A 4D vector is an ordered quadruplet of numbers
* (labeled x, y, z and w), which can be used to represent a number of things, such as:
*
* - A point in 4D space.
* - A direction and length in 4D space. In three.js the length will
* always be the Euclidean distance(straight-line distance) from `(0, 0, 0, 0)` to `(x, y, z, w)`
* and the direction is also measured from `(0, 0, 0, 0)` towards `(x, y, z, w)`.
* - Any arbitrary ordered quadruplet of numbers.
*
* There are other things a 4D vector can be used to represent, however these
* are the most common uses in *three.js*.
*
* Iterating through a vector instance will yield its components `(x, y, z, w)` in
* the corresponding order.
* ```js
* const a = new THREE.Vector4( 0, 1, 0, 0 );
*
* //no arguments; will be initialised to (0, 0, 0, 1)
* const b = new THREE.Vector4( );
*
* const d = a.dot( b );
* ```
*/
var Vector4 = class Vector4 {
	static {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		Vector4.prototype.isVector4 = true;
	}
	/**
	* Constructs a new 4D vector.
	*
	* @param {number} [x=0] - The x value of this vector.
	* @param {number} [y=0] - The y value of this vector.
	* @param {number} [z=0] - The z value of this vector.
	* @param {number} [w=1] - The w value of this vector.
	*/
	constructor(x = 0, y = 0, z = 0, w = 1) {
		/**
		* The x value of this vector.
		*
		* @type {number}
		*/
		this.x = x;
		/**
		* The y value of this vector.
		*
		* @type {number}
		*/
		this.y = y;
		/**
		* The z value of this vector.
		*
		* @type {number}
		*/
		this.z = z;
		/**
		* The w value of this vector.
		*
		* @type {number}
		*/
		this.w = w;
	}
	/**
	* Alias for {@link Vector4#z}.
	*
	* @type {number}
	*/
	get width() {
		return this.z;
	}
	set width(value) {
		this.z = value;
	}
	/**
	* Alias for {@link Vector4#w}.
	*
	* @type {number}
	*/
	get height() {
		return this.w;
	}
	set height(value) {
		this.w = value;
	}
	/**
	* Sets the vector components.
	*
	* @param {number} x - The value of the x component.
	* @param {number} y - The value of the y component.
	* @param {number} z - The value of the z component.
	* @param {number} w - The value of the w component.
	* @return {Vector4} A reference to this vector.
	*/
	set(x, y, z, w) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
		return this;
	}
	/**
	* Sets the vector components to the same value.
	*
	* @param {number} scalar - The value to set for all vector components.
	* @return {Vector4} A reference to this vector.
	*/
	setScalar(scalar) {
		this.x = scalar;
		this.y = scalar;
		this.z = scalar;
		this.w = scalar;
		return this;
	}
	/**
	* Sets the vector's x component to the given value
	*
	* @param {number} x - The value to set.
	* @return {Vector4} A reference to this vector.
	*/
	setX(x) {
		this.x = x;
		return this;
	}
	/**
	* Sets the vector's y component to the given value
	*
	* @param {number} y - The value to set.
	* @return {Vector4} A reference to this vector.
	*/
	setY(y) {
		this.y = y;
		return this;
	}
	/**
	* Sets the vector's z component to the given value
	*
	* @param {number} z - The value to set.
	* @return {Vector4} A reference to this vector.
	*/
	setZ(z) {
		this.z = z;
		return this;
	}
	/**
	* Sets the vector's w component to the given value
	*
	* @param {number} w - The value to set.
	* @return {Vector4} A reference to this vector.
	*/
	setW(w) {
		this.w = w;
		return this;
	}
	/**
	* Allows to set a vector component with an index.
	*
	* @param {number} index - The component index. `0` equals to x, `1` equals to y,
	* `2` equals to z, `3` equals to w.
	* @param {number} value - The value to set.
	* @return {Vector4} A reference to this vector.
	*/
	setComponent(index, value) {
		switch (index) {
			case 0:
				this.x = value;
				break;
			case 1:
				this.y = value;
				break;
			case 2:
				this.z = value;
				break;
			case 3:
				this.w = value;
				break;
			default: throw new Error("THREE.Vector4: index is out of range: " + index);
		}
		return this;
	}
	/**
	* Returns the value of the vector component which matches the given index.
	*
	* @param {number} index - The component index. `0` equals to x, `1` equals to y,
	* `2` equals to z, `3` equals to w.
	* @return {number} A vector component value.
	*/
	getComponent(index) {
		switch (index) {
			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			case 3: return this.w;
			default: throw new Error("THREE.Vector4: index is out of range: " + index);
		}
	}
	/**
	* Returns a new vector with copied values from this instance.
	*
	* @return {Vector4} A clone of this instance.
	*/
	clone() {
		return new this.constructor(this.x, this.y, this.z, this.w);
	}
	/**
	* Copies the values of the given vector to this instance.
	*
	* @param {Vector3|Vector4} v - The vector to copy.
	* @return {Vector4} A reference to this vector.
	*/
	copy(v) {
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		this.w = v.w !== void 0 ? v.w : 1;
		return this;
	}
	/**
	* Adds the given vector to this instance.
	*
	* @param {Vector4} v - The vector to add.
	* @return {Vector4} A reference to this vector.
	*/
	add(v) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
		this.w += v.w;
		return this;
	}
	/**
	* Adds the given scalar value to all components of this instance.
	*
	* @param {number} s - The scalar to add.
	* @return {Vector4} A reference to this vector.
	*/
	addScalar(s) {
		this.x += s;
		this.y += s;
		this.z += s;
		this.w += s;
		return this;
	}
	/**
	* Adds the given vectors and stores the result in this instance.
	*
	* @param {Vector4} a - The first vector.
	* @param {Vector4} b - The second vector.
	* @return {Vector4} A reference to this vector.
	*/
	addVectors(a, b) {
		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;
		this.w = a.w + b.w;
		return this;
	}
	/**
	* Adds the given vector scaled by the given factor to this instance.
	*
	* @param {Vector4} v - The vector.
	* @param {number} s - The factor that scales `v`.
	* @return {Vector4} A reference to this vector.
	*/
	addScaledVector(v, s) {
		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;
		this.w += v.w * s;
		return this;
	}
	/**
	* Subtracts the given vector from this instance.
	*
	* @param {Vector4} v - The vector to subtract.
	* @return {Vector4} A reference to this vector.
	*/
	sub(v) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		this.w -= v.w;
		return this;
	}
	/**
	* Subtracts the given scalar value from all components of this instance.
	*
	* @param {number} s - The scalar to subtract.
	* @return {Vector4} A reference to this vector.
	*/
	subScalar(s) {
		this.x -= s;
		this.y -= s;
		this.z -= s;
		this.w -= s;
		return this;
	}
	/**
	* Subtracts the given vectors and stores the result in this instance.
	*
	* @param {Vector4} a - The first vector.
	* @param {Vector4} b - The second vector.
	* @return {Vector4} A reference to this vector.
	*/
	subVectors(a, b) {
		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;
		this.w = a.w - b.w;
		return this;
	}
	/**
	* Multiplies the given vector with this instance.
	*
	* @param {Vector4} v - The vector to multiply.
	* @return {Vector4} A reference to this vector.
	*/
	multiply(v) {
		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;
		this.w *= v.w;
		return this;
	}
	/**
	* Multiplies the given scalar value with all components of this instance.
	*
	* @param {number} scalar - The scalar to multiply.
	* @return {Vector4} A reference to this vector.
	*/
	multiplyScalar(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		this.w *= scalar;
		return this;
	}
	/**
	* Multiplies this vector with the given 4x4 matrix.
	*
	* @param {Matrix4} m - The 4x4 matrix.
	* @return {Vector4} A reference to this vector.
	*/
	applyMatrix4(m) {
		const x = this.x, y = this.y, z = this.z, w = this.w;
		const e = m.elements;
		this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
		this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
		this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
		this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
		return this;
	}
	/**
	* Divides this instance by the given vector.
	*
	* @param {Vector4} v - The vector to divide.
	* @return {Vector4} A reference to this vector.
	*/
	divide(v) {
		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;
		this.w /= v.w;
		return this;
	}
	/**
	* Divides this vector by the given scalar.
	*
	* @param {number} scalar - The scalar to divide.
	* @return {Vector4} A reference to this vector.
	*/
	divideScalar(scalar) {
		return this.multiplyScalar(1 / scalar);
	}
	/**
	* Sets the x, y and z components of this
	* vector to the quaternion's axis and w to the angle.
	*
	* @param {Quaternion} q - The Quaternion to set.
	* @return {Vector4} A reference to this vector.
	*/
	setAxisAngleFromQuaternion(q) {
		this.w = 2 * Math.acos(q.w);
		const s = Math.sqrt(1 - q.w * q.w);
		if (s < 1e-4) {
			this.x = 1;
			this.y = 0;
			this.z = 0;
		} else {
			this.x = q.x / s;
			this.y = q.y / s;
			this.z = q.z / s;
		}
		return this;
	}
	/**
	* Sets the x, y and z components of this
	* vector to the axis of rotation and w to the angle.
	*
	* @param {Matrix4} m - A 4x4 matrix of which the upper left 3x3 matrix is a pure rotation matrix.
	* @return {Vector4} A reference to this vector.
	*/
	setAxisAngleFromRotationMatrix(m) {
		let angle, x, y, z;
		const epsilon = .01, epsilon2 = .1, te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1], m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10];
		if (Math.abs(m12 - m21) < epsilon && Math.abs(m13 - m31) < epsilon && Math.abs(m23 - m32) < epsilon) {
			if (Math.abs(m12 + m21) < epsilon2 && Math.abs(m13 + m31) < epsilon2 && Math.abs(m23 + m32) < epsilon2 && Math.abs(m11 + m22 + m33 - 3) < epsilon2) {
				this.set(1, 0, 0, 0);
				return this;
			}
			angle = Math.PI;
			const xx = (m11 + 1) / 2;
			const yy = (m22 + 1) / 2;
			const zz = (m33 + 1) / 2;
			const xy = (m12 + m21) / 4;
			const xz = (m13 + m31) / 4;
			const yz = (m23 + m32) / 4;
			if (xx > yy && xx > zz) {
				if (xx < epsilon) {
					x = 0;
					y = .707106781;
					z = .707106781;
				} else {
					x = Math.sqrt(xx);
					y = xy / x;
					z = xz / x;
				}
			} else if (yy > zz) {
				if (yy < epsilon) {
					x = .707106781;
					y = 0;
					z = .707106781;
				} else {
					y = Math.sqrt(yy);
					x = xy / y;
					z = yz / y;
				}
			} else if (zz < epsilon) {
				x = .707106781;
				y = .707106781;
				z = 0;
			} else {
				z = Math.sqrt(zz);
				x = xz / z;
				y = yz / z;
			}
			this.set(x, y, z, angle);
			return this;
		}
		let s = Math.sqrt((m32 - m23) * (m32 - m23) + (m13 - m31) * (m13 - m31) + (m21 - m12) * (m21 - m12));
		if (Math.abs(s) < .001) s = 1;
		this.x = (m32 - m23) / s;
		this.y = (m13 - m31) / s;
		this.z = (m21 - m12) / s;
		this.w = Math.acos((m11 + m22 + m33 - 1) / 2);
		return this;
	}
	/**
	* Sets the vector components to the position elements of the
	* given transformation matrix.
	*
	* @param {Matrix4} m - The 4x4 matrix.
	* @return {Vector4} A reference to this vector.
	*/
	setFromMatrixPosition(m) {
		const e = m.elements;
		this.x = e[12];
		this.y = e[13];
		this.z = e[14];
		this.w = e[15];
		return this;
	}
	/**
	* If this vector's x, y, z or w value is greater than the given vector's x, y, z or w
	* value, replace that value with the corresponding min value.
	*
	* @param {Vector4} v - The vector.
	* @return {Vector4} A reference to this vector.
	*/
	min(v) {
		this.x = Math.min(this.x, v.x);
		this.y = Math.min(this.y, v.y);
		this.z = Math.min(this.z, v.z);
		this.w = Math.min(this.w, v.w);
		return this;
	}
	/**
	* If this vector's x, y, z or w value is less than the given vector's x, y, z or w
	* value, replace that value with the corresponding max value.
	*
	* @param {Vector4} v - The vector.
	* @return {Vector4} A reference to this vector.
	*/
	max(v) {
		this.x = Math.max(this.x, v.x);
		this.y = Math.max(this.y, v.y);
		this.z = Math.max(this.z, v.z);
		this.w = Math.max(this.w, v.w);
		return this;
	}
	/**
	* If this vector's x, y, z or w value is greater than the max vector's x, y, z or w
	* value, it is replaced by the corresponding value.
	* If this vector's x, y, z or w value is less than the min vector's x, y, z or w value,
	* it is replaced by the corresponding value.
	*
	* @param {Vector4} min - The minimum x, y and z values.
	* @param {Vector4} max - The maximum x, y and z values in the desired range.
	* @return {Vector4} A reference to this vector.
	*/
	clamp(min, max) {
		this.x = clamp(this.x, min.x, max.x);
		this.y = clamp(this.y, min.y, max.y);
		this.z = clamp(this.z, min.z, max.z);
		this.w = clamp(this.w, min.w, max.w);
		return this;
	}
	/**
	* If this vector's x, y, z or w values are greater than the max value, they are
	* replaced by the max value.
	* If this vector's x, y, z or w values are less than the min value, they are
	* replaced by the min value.
	*
	* @param {number} minVal - The minimum value the components will be clamped to.
	* @param {number} maxVal - The maximum value the components will be clamped to.
	* @return {Vector4} A reference to this vector.
	*/
	clampScalar(minVal, maxVal) {
		this.x = clamp(this.x, minVal, maxVal);
		this.y = clamp(this.y, minVal, maxVal);
		this.z = clamp(this.z, minVal, maxVal);
		this.w = clamp(this.w, minVal, maxVal);
		return this;
	}
	/**
	* If this vector's length is greater than the max value, it is replaced by
	* the max value.
	* If this vector's length is less than the min value, it is replaced by the
	* min value.
	*
	* @param {number} min - The minimum value the vector length will be clamped to.
	* @param {number} max - The maximum value the vector length will be clamped to.
	* @return {Vector4} A reference to this vector.
	*/
	clampLength(min, max) {
		const length = this.length();
		return this.divideScalar(length || 1).multiplyScalar(clamp(length, min, max));
	}
	/**
	* The components of this vector are rounded down to the nearest integer value.
	*
	* @return {Vector4} A reference to this vector.
	*/
	floor() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.z = Math.floor(this.z);
		this.w = Math.floor(this.w);
		return this;
	}
	/**
	* The components of this vector are rounded up to the nearest integer value.
	*
	* @return {Vector4} A reference to this vector.
	*/
	ceil() {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		this.z = Math.ceil(this.z);
		this.w = Math.ceil(this.w);
		return this;
	}
	/**
	* The components of this vector are rounded to the nearest integer value
	*
	* @return {Vector4} A reference to this vector.
	*/
	round() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.z = Math.round(this.z);
		this.w = Math.round(this.w);
		return this;
	}
	/**
	* The components of this vector are rounded towards zero (up if negative,
	* down if positive) to an integer value.
	*
	* @return {Vector4} A reference to this vector.
	*/
	roundToZero() {
		this.x = Math.trunc(this.x);
		this.y = Math.trunc(this.y);
		this.z = Math.trunc(this.z);
		this.w = Math.trunc(this.w);
		return this;
	}
	/**
	* Inverts this vector - i.e. sets x = -x, y = -y, z = -z, w = -w.
	*
	* @return {Vector4} A reference to this vector.
	*/
	negate() {
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		this.w = -this.w;
		return this;
	}
	/**
	* Calculates the dot product of the given vector with this instance.
	*
	* @param {Vector4} v - The vector to compute the dot product with.
	* @return {number} The result of the dot product.
	*/
	dot(v) {
		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
	}
	/**
	* Computes the square of the Euclidean length (straight-line length) from
	* (0, 0, 0, 0) to (x, y, z, w). If you are comparing the lengths of vectors, you should
	* compare the length squared instead as it is slightly more efficient to calculate.
	*
	* @return {number} The square length of this vector.
	*/
	lengthSq() {
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	}
	/**
	* Computes the  Euclidean length (straight-line length) from (0, 0, 0, 0) to (x, y, z, w).
	*
	* @return {number} The length of this vector.
	*/
	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	}
	/**
	* Computes the Manhattan length of this vector.
	*
	* @return {number} The length of this vector.
	*/
	manhattanLength() {
		return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
	}
	/**
	* Converts this vector to a unit vector - that is, sets it equal to a vector
	* with the same direction as this one, but with a vector length of `1`.
	*
	* @return {Vector4} A reference to this vector.
	*/
	normalize() {
		return this.divideScalar(this.length() || 1);
	}
	/**
	* Sets this vector to a vector with the same direction as this one, but
	* with the specified length.
	*
	* @param {number} length - The new length of this vector.
	* @return {Vector4} A reference to this vector.
	*/
	setLength(length) {
		return this.normalize().multiplyScalar(length);
	}
	/**
	* Linearly interpolates between the given vector and this instance, where
	* alpha is the percent distance along the line - alpha = 0 will be this
	* vector, and alpha = 1 will be the given one.
	*
	* @param {Vector4} v - The vector to interpolate towards.
	* @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
	* @return {Vector4} A reference to this vector.
	*/
	lerp(v, alpha) {
		this.x += (v.x - this.x) * alpha;
		this.y += (v.y - this.y) * alpha;
		this.z += (v.z - this.z) * alpha;
		this.w += (v.w - this.w) * alpha;
		return this;
	}
	/**
	* Linearly interpolates between the given vectors, where alpha is the percent
	* distance along the line - alpha = 0 will be first vector, and alpha = 1 will
	* be the second one. The result is stored in this instance.
	*
	* @param {Vector4} v1 - The first vector.
	* @param {Vector4} v2 - The second vector.
	* @param {number} alpha - The interpolation factor, typically in the closed interval `[0, 1]`.
	* @return {Vector4} A reference to this vector.
	*/
	lerpVectors(v1, v2, alpha) {
		this.x = v1.x + (v2.x - v1.x) * alpha;
		this.y = v1.y + (v2.y - v1.y) * alpha;
		this.z = v1.z + (v2.z - v1.z) * alpha;
		this.w = v1.w + (v2.w - v1.w) * alpha;
		return this;
	}
	/**
	* Returns `true` if this vector is equal with the given one.
	*
	* @param {Vector4} v - The vector to test for equality.
	* @return {boolean} Whether this vector is equal with the given one.
	*/
	equals(v) {
		return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
	}
	/**
	* Sets this vector's x value to be `array[ offset ]`, y value to be `array[ offset + 1 ]`,
	* z value to be `array[ offset + 2 ]`, w value to be `array[ offset + 3 ]`.
	*
	* @param {Array<number>} array - An array holding the vector component values.
	* @param {number} [offset=0] - The offset into the array.
	* @return {Vector4} A reference to this vector.
	*/
	fromArray(array, offset = 0) {
		this.x = array[offset];
		this.y = array[offset + 1];
		this.z = array[offset + 2];
		this.w = array[offset + 3];
		return this;
	}
	/**
	* Writes the components of this vector to the given array. If no array is provided,
	* the method returns a new instance.
	*
	* @param {Array<number>} [array=[]] - The target array holding the vector components.
	* @param {number} [offset=0] - Index of the first element in the array.
	* @return {Array<number>} The vector components.
	*/
	toArray(array = [], offset = 0) {
		array[offset] = this.x;
		array[offset + 1] = this.y;
		array[offset + 2] = this.z;
		array[offset + 3] = this.w;
		return array;
	}
	/**
	* Sets the components of this vector from the given buffer attribute.
	*
	* @param {BufferAttribute} attribute - The buffer attribute holding vector data.
	* @param {number} index - The index into the attribute.
	* @return {Vector4} A reference to this vector.
	*/
	fromBufferAttribute(attribute, index) {
		this.x = attribute.getX(index);
		this.y = attribute.getY(index);
		this.z = attribute.getZ(index);
		this.w = attribute.getW(index);
		return this;
	}
	/**
	* Sets each component of this vector to a pseudo-random value between `0` and
	* `1`, excluding `1`.
	*
	* @return {Vector4} A reference to this vector.
	*/
	random() {
		this.x = Math.random();
		this.y = Math.random();
		this.z = Math.random();
		this.w = Math.random();
		return this;
	}
	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		yield this.z;
		yield this.w;
	}
};
/**
* Represents a 4x4 matrix.
*
* The most common use of a 4x4 matrix in 3D computer graphics is as a transformation matrix.
* For an introduction to transformation matrices as used in WebGL, check out [this tutorial](https://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices)
*
* This allows a 3D vector representing a point in 3D space to undergo
* transformations such as translation, rotation, shear, scale, reflection,
* orthogonal or perspective projection and so on, by being multiplied by the
* matrix. This is known as `applying` the matrix to the vector.
*
* A Note on Row-Major and Column-Major Ordering:
*
* The constructor and {@link Matrix3#set} method take arguments in
* [row-major](https://en.wikipedia.org/wiki/Row-_and_column-major_order#Column-major_order)
* order, while internally they are stored in the {@link Matrix3#elements} array in column-major order.
* This means that calling:
* ```js
* const m = new THREE.Matrix4();
* m.set( 11, 12, 13, 14,
*        21, 22, 23, 24,
*        31, 32, 33, 34,
*        41, 42, 43, 44 );
* ```
* will result in the elements array containing:
* ```js
* m.elements = [ 11, 21, 31, 41,
*                12, 22, 32, 42,
*                13, 23, 33, 43,
*                14, 24, 34, 44 ];
* ```
* and internally all calculations are performed using column-major ordering.
* However, as the actual ordering makes no difference mathematically and
* most people are used to thinking about matrices in row-major order, the
* three.js documentation shows matrices in row-major order. Just bear in
* mind that if you are reading the source code, you'll have to take the
* transpose of any matrices outlined here to make sense of the calculations.
*/
var Matrix4 = class Matrix4 {
	static {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		Matrix4.prototype.isMatrix4 = true;
	}
	/**
	* Constructs a new 4x4 matrix. The arguments are supposed to be
	* in row-major order. If no arguments are provided, the constructor
	* initializes the matrix as an identity matrix.
	*
	* @param {number} [n11] - 1-1 matrix element.
	* @param {number} [n12] - 1-2 matrix element.
	* @param {number} [n13] - 1-3 matrix element.
	* @param {number} [n14] - 1-4 matrix element.
	* @param {number} [n21] - 2-1 matrix element.
	* @param {number} [n22] - 2-2 matrix element.
	* @param {number} [n23] - 2-3 matrix element.
	* @param {number} [n24] - 2-4 matrix element.
	* @param {number} [n31] - 3-1 matrix element.
	* @param {number} [n32] - 3-2 matrix element.
	* @param {number} [n33] - 3-3 matrix element.
	* @param {number} [n34] - 3-4 matrix element.
	* @param {number} [n41] - 4-1 matrix element.
	* @param {number} [n42] - 4-2 matrix element.
	* @param {number} [n43] - 4-3 matrix element.
	* @param {number} [n44] - 4-4 matrix element.
	*/
	constructor(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
		/**
		* A column-major list of matrix values.
		*
		* @type {Array<number>}
		*/
		this.elements = [
			1,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			0,
			1
		];
		if (n11 !== void 0) this.set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44);
	}
	/**
	* Sets the elements of the matrix.The arguments are supposed to be
	* in row-major order.
	*
	* @param {number} [n11] - 1-1 matrix element.
	* @param {number} [n12] - 1-2 matrix element.
	* @param {number} [n13] - 1-3 matrix element.
	* @param {number} [n14] - 1-4 matrix element.
	* @param {number} [n21] - 2-1 matrix element.
	* @param {number} [n22] - 2-2 matrix element.
	* @param {number} [n23] - 2-3 matrix element.
	* @param {number} [n24] - 2-4 matrix element.
	* @param {number} [n31] - 3-1 matrix element.
	* @param {number} [n32] - 3-2 matrix element.
	* @param {number} [n33] - 3-3 matrix element.
	* @param {number} [n34] - 3-4 matrix element.
	* @param {number} [n41] - 4-1 matrix element.
	* @param {number} [n42] - 4-2 matrix element.
	* @param {number} [n43] - 4-3 matrix element.
	* @param {number} [n44] - 4-4 matrix element.
	* @return {Matrix4} A reference to this matrix.
	*/
	set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
		const te = this.elements;
		te[0] = n11;
		te[4] = n12;
		te[8] = n13;
		te[12] = n14;
		te[1] = n21;
		te[5] = n22;
		te[9] = n23;
		te[13] = n24;
		te[2] = n31;
		te[6] = n32;
		te[10] = n33;
		te[14] = n34;
		te[3] = n41;
		te[7] = n42;
		te[11] = n43;
		te[15] = n44;
		return this;
	}
	/**
	* Sets this matrix to the 4x4 identity matrix.
	*
	* @return {Matrix4} A reference to this matrix.
	*/
	identity() {
		this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
		return this;
	}
	/**
	* Returns a matrix with copied values from this instance.
	*
	* @return {Matrix4} A clone of this instance.
	*/
	clone() {
		return new Matrix4().fromArray(this.elements);
	}
	/**
	* Copies the values of the given matrix to this instance.
	*
	* @param {Matrix4} m - The matrix to copy.
	* @return {Matrix4} A reference to this matrix.
	*/
	copy(m) {
		const te = this.elements;
		const me = m.elements;
		te[0] = me[0];
		te[1] = me[1];
		te[2] = me[2];
		te[3] = me[3];
		te[4] = me[4];
		te[5] = me[5];
		te[6] = me[6];
		te[7] = me[7];
		te[8] = me[8];
		te[9] = me[9];
		te[10] = me[10];
		te[11] = me[11];
		te[12] = me[12];
		te[13] = me[13];
		te[14] = me[14];
		te[15] = me[15];
		return this;
	}
	/**
	* Copies the translation component of the given matrix
	* into this matrix's translation component.
	*
	* @param {Matrix4} m - The matrix to copy the translation component.
	* @return {Matrix4} A reference to this matrix.
	*/
	copyPosition(m) {
		const te = this.elements, me = m.elements;
		te[12] = me[12];
		te[13] = me[13];
		te[14] = me[14];
		return this;
	}
	/**
	* Set the upper 3x3 elements of this matrix to the values of given 3x3 matrix.
	*
	* @param {Matrix3} m - The 3x3 matrix.
	* @return {Matrix4} A reference to this matrix.
	*/
	setFromMatrix3(m) {
		const me = m.elements;
		this.set(me[0], me[3], me[6], 0, me[1], me[4], me[7], 0, me[2], me[5], me[8], 0, 0, 0, 0, 1);
		return this;
	}
	/**
	* Extracts the basis vectors of this matrix into the three vectors provided.
	*
	* @param {Vector3} xAxis - The basis's x axis.
	* @param {Vector3} yAxis - The basis's y axis.
	* @param {Vector3} zAxis - The basis's z axis.
	* @return {Matrix4} A reference to this matrix.
	*/
	extractBasis(xAxis, yAxis, zAxis) {
		if (this.determinantAffine() === 0) {
			xAxis.set(1, 0, 0);
			yAxis.set(0, 1, 0);
			zAxis.set(0, 0, 1);
			return this;
		}
		xAxis.setFromMatrixColumn(this, 0);
		yAxis.setFromMatrixColumn(this, 1);
		zAxis.setFromMatrixColumn(this, 2);
		return this;
	}
	/**
	* Sets the given basis vectors to this matrix.
	*
	* @param {Vector3} xAxis - The basis's x axis.
	* @param {Vector3} yAxis - The basis's y axis.
	* @param {Vector3} zAxis - The basis's z axis.
	* @return {Matrix4} A reference to this matrix.
	*/
	makeBasis(xAxis, yAxis, zAxis) {
		this.set(xAxis.x, yAxis.x, zAxis.x, 0, xAxis.y, yAxis.y, zAxis.y, 0, xAxis.z, yAxis.z, zAxis.z, 0, 0, 0, 0, 1);
		return this;
	}
	/**
	* Extracts the rotation component of the given matrix
	* into this matrix's rotation component.
	*
	* Note: This method does not support reflection matrices.
	*
	* @param {Matrix4} m - The matrix.
	* @return {Matrix4} A reference to this matrix.
	*/
	extractRotation(m) {
		if (m.determinantAffine() === 0) return this.identity();
		const te = this.elements;
		const me = m.elements;
		const scaleX = 1 / _v1$7.setFromMatrixColumn(m, 0).length();
		const scaleY = 1 / _v1$7.setFromMatrixColumn(m, 1).length();
		const scaleZ = 1 / _v1$7.setFromMatrixColumn(m, 2).length();
		te[0] = me[0] * scaleX;
		te[1] = me[1] * scaleX;
		te[2] = me[2] * scaleX;
		te[3] = 0;
		te[4] = me[4] * scaleY;
		te[5] = me[5] * scaleY;
		te[6] = me[6] * scaleY;
		te[7] = 0;
		te[8] = me[8] * scaleZ;
		te[9] = me[9] * scaleZ;
		te[10] = me[10] * scaleZ;
		te[11] = 0;
		te[12] = 0;
		te[13] = 0;
		te[14] = 0;
		te[15] = 1;
		return this;
	}
	/**
	* Sets the rotation component (the upper left 3x3 matrix) of this matrix to
	* the rotation specified by the given Euler angles. The rest of
	* the matrix is set to the identity. Depending on the {@link Euler#order},
	* there are six possible outcomes. See [this page](https://en.wikipedia.org/wiki/Euler_angles#Rotation_matrix)
	* for a complete list.
	*
	* @param {Euler} euler - The Euler angles.
	* @return {Matrix4} A reference to this matrix.
	*/
	makeRotationFromEuler(euler) {
		const te = this.elements;
		const x = euler.x, y = euler.y, z = euler.z;
		const a = Math.cos(x), b = Math.sin(x);
		const c = Math.cos(y), d = Math.sin(y);
		const e = Math.cos(z), f = Math.sin(z);
		if (euler.order === "XYZ") {
			const ae = a * e, af = a * f, be = b * e, bf = b * f;
			te[0] = c * e;
			te[4] = -c * f;
			te[8] = d;
			te[1] = af + be * d;
			te[5] = ae - bf * d;
			te[9] = -b * c;
			te[2] = bf - ae * d;
			te[6] = be + af * d;
			te[10] = a * c;
		} else if (euler.order === "YXZ") {
			const ce = c * e, cf = c * f, de = d * e, df = d * f;
			te[0] = ce + df * b;
			te[4] = de * b - cf;
			te[8] = a * d;
			te[1] = a * f;
			te[5] = a * e;
			te[9] = -b;
			te[2] = cf * b - de;
			te[6] = df + ce * b;
			te[10] = a * c;
		} else if (euler.order === "ZXY") {
			const ce = c * e, cf = c * f, de = d * e, df = d * f;
			te[0] = ce - df * b;
			te[4] = -a * f;
			te[8] = de + cf * b;
			te[1] = cf + de * b;
			te[5] = a * e;
			te[9] = df - ce * b;
			te[2] = -a * d;
			te[6] = b;
			te[10] = a * c;
		} else if (euler.order === "ZYX") {
			const ae = a * e, af = a * f, be = b * e, bf = b * f;
			te[0] = c * e;
			te[4] = be * d - af;
			te[8] = ae * d + bf;
			te[1] = c * f;
			te[5] = bf * d + ae;
			te[9] = af * d - be;
			te[2] = -d;
			te[6] = b * c;
			te[10] = a * c;
		} else if (euler.order === "YZX") {
			const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
			te[0] = c * e;
			te[4] = bd - ac * f;
			te[8] = bc * f + ad;
			te[1] = f;
			te[5] = a * e;
			te[9] = -b * e;
			te[2] = -d * e;
			te[6] = ad * f + bc;
			te[10] = ac - bd * f;
		} else if (euler.order === "XZY") {
			const ac = a * c, ad = a * d, bc = b * c, bd = b * d;
			te[0] = c * e;
			te[4] = -f;
			te[8] = d * e;
			te[1] = ac * f + bd;
			te[5] = a * e;
			te[9] = ad * f - bc;
			te[2] = bc * f - ad;
			te[6] = b * e;
			te[10] = bd * f + ac;
		}
		te[3] = 0;
		te[7] = 0;
		te[11] = 0;
		te[12] = 0;
		te[13] = 0;
		te[14] = 0;
		te[15] = 1;
		return this;
	}
	/**
	* Sets the rotation component of this matrix to the rotation specified by
	* the given Quaternion as outlined [here](https://en.wikipedia.org/wiki/Rotation_matrix#Quaternion)
	* The rest of the matrix is set to the identity.
	*
	* @param {Quaternion} q - The Quaternion.
	* @return {Matrix4} A reference to this matrix.
	*/
	makeRotationFromQuaternion(q) {
		return this.compose(_zero, q, _one);
	}
	/**
	* Sets the rotation component of the transformation matrix, looking from `eye` towards
	* `target`, and oriented by the up-direction.
	*
	* @param {Vector3} eye - The eye vector.
	* @param {Vector3} target - The target vector.
	* @param {Vector3} up - The up vector.
	* @return {Matrix4} A reference to this matrix.
	*/
	lookAt(eye, target, up) {
		const te = this.elements;
		_z.subVectors(eye, target);
		if (_z.lengthSq() === 0) _z.z = 1;
		_z.normalize();
		_x.crossVectors(up, _z);
		if (_x.lengthSq() === 0) {
			if (Math.abs(up.z) === 1) _z.x += 1e-4;
			else _z.z += 1e-4;
			_z.normalize();
			_x.crossVectors(up, _z);
		}
		_x.normalize();
		_y.crossVectors(_z, _x);
		te[0] = _x.x;
		te[4] = _y.x;
		te[8] = _z.x;
		te[1] = _x.y;
		te[5] = _y.y;
		te[9] = _z.y;
		te[2] = _x.z;
		te[6] = _y.z;
		te[10] = _z.z;
		return this;
	}
	/**
	* Post-multiplies this matrix by the given 4x4 matrix.
	*
	* @param {Matrix4} m - The matrix to multiply with.
	* @return {Matrix4} A reference to this matrix.
	*/
	multiply(m) {
		return this.multiplyMatrices(this, m);
	}
	/**
	* Pre-multiplies this matrix by the given 4x4 matrix.
	*
	* @param {Matrix4} m - The matrix to multiply with.
	* @return {Matrix4} A reference to this matrix.
	*/
	premultiply(m) {
		return this.multiplyMatrices(m, this);
	}
	/**
	* Multiples the given 4x4 matrices and stores the result
	* in this matrix.
	*
	* @param {Matrix4} a - The first matrix.
	* @param {Matrix4} b - The second matrix.
	* @return {Matrix4} A reference to this matrix.
	*/
	multiplyMatrices(a, b) {
		const ae = a.elements;
		const be = b.elements;
		const te = this.elements;
		const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
		const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
		const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
		const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];
		const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
		const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
		const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
		const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];
		te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
		te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
		te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
		te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
		return this;
	}
	/**
	* Multiplies every component of the matrix by the given scalar.
	*
	* @param {number} s - The scalar.
	* @return {Matrix4} A reference to this matrix.
	*/
	multiplyScalar(s) {
		const te = this.elements;
		te[0] *= s;
		te[4] *= s;
		te[8] *= s;
		te[12] *= s;
		te[1] *= s;
		te[5] *= s;
		te[9] *= s;
		te[13] *= s;
		te[2] *= s;
		te[6] *= s;
		te[10] *= s;
		te[14] *= s;
		te[3] *= s;
		te[7] *= s;
		te[11] *= s;
		te[15] *= s;
		return this;
	}
	/**
	* Computes and returns the determinant of this matrix.
	*
	* @return {number} The determinant.
	*/
	determinant() {
		const te = this.elements;
		const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
		const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
		const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
		const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];
		const t11 = n23 * n34 - n24 * n33;
		const t12 = n22 * n34 - n24 * n32;
		const t13 = n22 * n33 - n23 * n32;
		const t21 = n21 * n34 - n24 * n31;
		const t22 = n21 * n33 - n23 * n31;
		const t23 = n21 * n32 - n22 * n31;
		return n11 * (n42 * t11 - n43 * t12 + n44 * t13) - n12 * (n41 * t11 - n43 * t21 + n44 * t22) + n13 * (n41 * t12 - n42 * t21 + n44 * t23) - n14 * (n41 * t13 - n42 * t22 + n43 * t23);
	}
	/**
	* Computes and returns the determinant of the 4x4 matrix, but assumes the
	* matrix is affine, saving some computations.
	*
	* For affine matrices (like an object's world matrix), this value equals the
	* full 4x4 {@link Matrix4#determinant} but is cheaper to compute.
	*
	* Assumes the bottom row is [0, 0, 0, 1].
	*
	* @return {number} The determinant of the matrix.
	*/
	determinantAffine() {
		const te = this.elements;
		const n11 = te[0], n12 = te[4], n13 = te[8];
		const n21 = te[1], n22 = te[5], n23 = te[9];
		const n31 = te[2], n32 = te[6], n33 = te[10];
		return n11 * (n22 * n33 - n23 * n32) - n12 * (n21 * n33 - n23 * n31) + n13 * (n21 * n32 - n22 * n31);
	}
	/**
	* Transposes this matrix in place.
	*
	* @return {Matrix4} A reference to this matrix.
	*/
	transpose() {
		const te = this.elements;
		let tmp;
		tmp = te[1];
		te[1] = te[4];
		te[4] = tmp;
		tmp = te[2];
		te[2] = te[8];
		te[8] = tmp;
		tmp = te[6];
		te[6] = te[9];
		te[9] = tmp;
		tmp = te[3];
		te[3] = te[12];
		te[12] = tmp;
		tmp = te[7];
		te[7] = te[13];
		te[13] = tmp;
		tmp = te[11];
		te[11] = te[14];
		te[14] = tmp;
		return this;
	}
	/**
	* Sets the position component for this matrix from the given vector,
	* without affecting the rest of the matrix.
	*
	* @param {number|Vector3} x - The x component of the vector or alternatively the vector object.
	* @param {number} y - The y component of the vector.
	* @param {number} z - The z component of the vector.
	* @return {Matrix4} A reference to this matrix.
	*/
	setPosition(x, y, z) {
		const te = this.elements;
		if (x.isVector3) {
			te[12] = x.x;
			te[13] = x.y;
			te[14] = x.z;
		} else {
			te[12] = x;
			te[13] = y;
			te[14] = z;
		}
		return this;
	}
	/**
	* Inverts this matrix, using the [analytic method](https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution).
	* You can not invert with a determinant of zero. If you attempt this, the method produces
	* a zero matrix instead.
	*
	* @return {Matrix4} A reference to this matrix.
	*/
	invert() {
		const te = this.elements, n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3], n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7], n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11], n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15], t1 = n11 * n22 - n21 * n12, t2 = n11 * n32 - n31 * n12, t3 = n11 * n42 - n41 * n12, t4 = n21 * n32 - n31 * n22, t5 = n21 * n42 - n41 * n22, t6 = n31 * n42 - n41 * n32, t7 = n13 * n24 - n23 * n14, t8 = n13 * n34 - n33 * n14, t9 = n13 * n44 - n43 * n14, t10 = n23 * n34 - n33 * n24, t11 = n23 * n44 - n43 * n24, t12 = n33 * n44 - n43 * n34;
		const det = t1 * t12 - t2 * t11 + t3 * t10 + t4 * t9 - t5 * t8 + t6 * t7;
		if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		const detInv = 1 / det;
		te[0] = (n22 * t12 - n32 * t11 + n42 * t10) * detInv;
		te[1] = (n31 * t11 - n21 * t12 - n41 * t10) * detInv;
		te[2] = (n24 * t6 - n34 * t5 + n44 * t4) * detInv;
		te[3] = (n33 * t5 - n23 * t6 - n43 * t4) * detInv;
		te[4] = (n32 * t9 - n12 * t12 - n42 * t8) * detInv;
		te[5] = (n11 * t12 - n31 * t9 + n41 * t8) * detInv;
		te[6] = (n34 * t3 - n14 * t6 - n44 * t2) * detInv;
		te[7] = (n13 * t6 - n33 * t3 + n43 * t2) * detInv;
		te[8] = (n12 * t11 - n22 * t9 + n42 * t7) * detInv;
		te[9] = (n21 * t9 - n11 * t11 - n41 * t7) * detInv;
		te[10] = (n14 * t5 - n24 * t3 + n44 * t1) * detInv;
		te[11] = (n23 * t3 - n13 * t5 - n43 * t1) * detInv;
		te[12] = (n22 * t8 - n12 * t10 - n32 * t7) * detInv;
		te[13] = (n11 * t10 - n21 * t8 + n31 * t7) * detInv;
		te[14] = (n24 * t2 - n14 * t4 - n34 * t1) * detInv;
		te[15] = (n13 * t4 - n23 * t2 + n33 * t1) * detInv;
		return this;
	}
	/**
	* Scales each of the first three columns of this matrix by the corresponding component of the given vector.
	*
	* @param {Vector3} v - The scale vector.
	* @return {Matrix4} A reference to this matrix.
	*/
	scale(v) {
		const te = this.elements;
		const x = v.x, y = v.y, z = v.z;
		te[0] *= x;
		te[4] *= y;
		te[8] *= z;
		te[1] *= x;
		te[5] *= y;
		te[9] *= z;
		te[2] *= x;
		te[6] *= y;
		te[10] *= z;
		te[3] *= x;
		te[7] *= y;
		te[11] *= z;
		return this;
	}
	/**
	* Gets the maximum scale value of the three axes.
	*
	* @return {number} The maximum scale.
	*/
	getMaxScaleOnAxis() {
		const te = this.elements;
		const scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
		const scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
		const scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
		return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
	}
	/**
	* Sets this matrix as a translation transform from the given vector.
	*
	* @param {number|Vector3} x - The amount to translate in the X axis or alternatively a translation vector.
	* @param {number} y - The amount to translate in the Y axis.
	* @param {number} z - The amount to translate in the z axis.
	* @return {Matrix4} A reference to this matrix.
	*/
	makeTranslation(x, y, z) {
		if (x.isVector3) this.set(1, 0, 0, x.x, 0, 1, 0, x.y, 0, 0, 1, x.z, 0, 0, 0, 1);
		else this.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
		return this;
	}
	/**
	* Sets this matrix as a rotational transformation around the X axis by
	* the given angle.
	*
	* @param {number} theta - The rotation in radians.
	* @return {Matrix4} A reference to this matrix.
	*/
	makeRotationX(theta) {
		const c = Math.cos(theta), s = Math.sin(theta);
		this.set(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);
		return this;
	}
	/**
	* Sets this matrix as a rotational transformation around the Y axis by
	* the given angle.
	*
	* @param {number} theta - The rotation in radians.
	* @return {Matrix4} A reference to this matrix.
	*/
	makeRotationY(theta) {
		const c = Math.cos(theta), s = Math.sin(theta);
		this.set(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);
		return this;
	}
	/**
	* Sets this matrix as a rotational transformation around the Z axis by
	* the given angle.
	*
	* @param {number} theta - The rotation in radians.
	* @return {Matrix4} A reference to this matrix.
	*/
	makeRotationZ(theta) {
		const c = Math.cos(theta), s = Math.sin(theta);
		this.set(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
		return this;
	}
	/**
	* Sets this matrix as a rotational transformation around the given axis by
	* the given angle.
	*
	* @param {Vector3} axis - The normalized rotation axis.
	* @param {number} angle - The rotation in radians.
	* @return {Matrix4} A reference to this matrix.
	*/
	makeRotationAxis(axis, angle) {
		const c = Math.cos(angle);
		const s = Math.sin(angle);
		const t = 1 - c;
		const x = axis.x, y = axis.y, z = axis.z;
		const tx = t * x, ty = t * y;
		this.set(tx * x + c, tx * y - s * z, tx * z + s * y, 0, tx * y + s * z, ty * y + c, ty * z - s * x, 0, tx * z - s * y, ty * z + s * x, t * z * z + c, 0, 0, 0, 0, 1);
		return this;
	}
	/**
	* Sets this matrix as a scale transformation.
	*
	* @param {number} x - The amount to scale in the X axis.
	* @param {number} y - The amount to scale in the Y axis.
	* @param {number} z - The amount to scale in the Z axis.
	* @return {Matrix4} A reference to this matrix.
	*/
	makeScale(x, y, z) {
		this.set(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
		return this;
	}
	/**
	* Sets this matrix as a shear transformation.
	*
	* @param {number} xy - The amount to shear X by Y.
	* @param {number} xz - The amount to shear X by Z.
	* @param {number} yx - The amount to shear Y by X.
	* @param {number} yz - The amount to shear Y by Z.
	* @param {number} zx - The amount to shear Z by X.
	* @param {number} zy - The amount to shear Z by Y.
	* @return {Matrix4} A reference to this matrix.
	*/
	makeShear(xy, xz, yx, yz, zx, zy) {
		this.set(1, yx, zx, 0, xy, 1, zy, 0, xz, yz, 1, 0, 0, 0, 0, 1);
		return this;
	}
	/**
	* Sets this matrix to the transformation composed of the given position,
	* rotation (Quaternion) and scale.
	*
	* @param {Vector3} position - The position vector.
	* @param {Quaternion} quaternion - The rotation as a Quaternion.
	* @param {Vector3} scale - The scale vector.
	* @return {Matrix4} A reference to this matrix.
	*/
	compose(position, quaternion, scale) {
		const te = this.elements;
		const x = quaternion._x, y = quaternion._y, z = quaternion._z, w = quaternion._w;
		const x2 = x + x, y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2;
		const yy = y * y2, yz = y * z2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;
		const sx = scale.x, sy = scale.y, sz = scale.z;
		te[0] = (1 - (yy + zz)) * sx;
		te[1] = (xy + wz) * sx;
		te[2] = (xz - wy) * sx;
		te[3] = 0;
		te[4] = (xy - wz) * sy;
		te[5] = (1 - (xx + zz)) * sy;
		te[6] = (yz + wx) * sy;
		te[7] = 0;
		te[8] = (xz + wy) * sz;
		te[9] = (yz - wx) * sz;
		te[10] = (1 - (xx + yy)) * sz;
		te[11] = 0;
		te[12] = position.x;
		te[13] = position.y;
		te[14] = position.z;
		te[15] = 1;
		return this;
	}
	/**
	* Decomposes this matrix into its position, rotation and scale components
	* and provides the result in the given objects.
	*
	* Note: Not all matrices are decomposable in this way. For example, if an
	* object has a non-uniformly scaled parent, then the object's world matrix
	* may not be decomposable, and this method may not be appropriate.
	*
	* @param {Vector3} position - The position vector.
	* @param {Quaternion} quaternion - The rotation as a Quaternion.
	* @param {Vector3} scale - The scale vector.
	* @return {Matrix4} A reference to this matrix.
	*/
	decompose(position, quaternion, scale) {
		const te = this.elements;
		position.x = te[12];
		position.y = te[13];
		position.z = te[14];
		const det = this.determinantAffine();
		if (det === 0) {
			scale.set(1, 1, 1);
			quaternion.identity();
			return this;
		}
		let sx = _v1$7.set(te[0], te[1], te[2]).length();
		const sy = _v1$7.set(te[4], te[5], te[6]).length();
		const sz = _v1$7.set(te[8], te[9], te[10]).length();
		if (det < 0) sx = -sx;
		_m1$2.copy(this);
		const invSX = 1 / sx;
		const invSY = 1 / sy;
		const invSZ = 1 / sz;
		_m1$2.elements[0] *= invSX;
		_m1$2.elements[1] *= invSX;
		_m1$2.elements[2] *= invSX;
		_m1$2.elements[4] *= invSY;
		_m1$2.elements[5] *= invSY;
		_m1$2.elements[6] *= invSY;
		_m1$2.elements[8] *= invSZ;
		_m1$2.elements[9] *= invSZ;
		_m1$2.elements[10] *= invSZ;
		quaternion.setFromRotationMatrix(_m1$2);
		scale.x = sx;
		scale.y = sy;
		scale.z = sz;
		return this;
	}
	/**
	* Creates a perspective projection matrix. This is used internally by
	* {@link PerspectiveCamera#updateProjectionMatrix}.
	
	* @param {number} left - Left boundary of the viewing frustum at the near plane.
	* @param {number} right - Right boundary of the viewing frustum at the near plane.
	* @param {number} top - Top boundary of the viewing frustum at the near plane.
	* @param {number} bottom - Bottom boundary of the viewing frustum at the near plane.
	* @param {number} near - The distance from the camera to the near plane.
	* @param {number} far - The distance from the camera to the far plane.
	* @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} [coordinateSystem=WebGLCoordinateSystem] - The coordinate system.
	* @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
	* @return {Matrix4} A reference to this matrix.
	*/
	makePerspective(left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem, reversedDepth = false) {
		const te = this.elements;
		const x = 2 * near / (right - left);
		const y = 2 * near / (top - bottom);
		const a = (right + left) / (right - left);
		const b = (top + bottom) / (top - bottom);
		let c, d;
		if (reversedDepth) {
			c = near / (far - near);
			d = far * near / (far - near);
		} else if (coordinateSystem === 2e3) {
			c = -(far + near) / (far - near);
			d = -2 * far * near / (far - near);
		} else if (coordinateSystem === 2001) {
			c = -far / (far - near);
			d = -far * near / (far - near);
		} else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + coordinateSystem);
		te[0] = x;
		te[4] = 0;
		te[8] = a;
		te[12] = 0;
		te[1] = 0;
		te[5] = y;
		te[9] = b;
		te[13] = 0;
		te[2] = 0;
		te[6] = 0;
		te[10] = c;
		te[14] = d;
		te[3] = 0;
		te[7] = 0;
		te[11] = -1;
		te[15] = 0;
		return this;
	}
	/**
	* Creates a orthographic projection matrix. This is used internally by
	* {@link OrthographicCamera#updateProjectionMatrix}.
	
	* @param {number} left - Left boundary of the viewing frustum at the near plane.
	* @param {number} right - Right boundary of the viewing frustum at the near plane.
	* @param {number} top - Top boundary of the viewing frustum at the near plane.
	* @param {number} bottom - Bottom boundary of the viewing frustum at the near plane.
	* @param {number} near - The distance from the camera to the near plane.
	* @param {number} far - The distance from the camera to the far plane.
	* @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} [coordinateSystem=WebGLCoordinateSystem] - The coordinate system.
	* @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
	* @return {Matrix4} A reference to this matrix.
	*/
	makeOrthographic(left, right, top, bottom, near, far, coordinateSystem = WebGLCoordinateSystem, reversedDepth = false) {
		const te = this.elements;
		const x = 2 / (right - left);
		const y = 2 / (top - bottom);
		const a = -(right + left) / (right - left);
		const b = -(top + bottom) / (top - bottom);
		let c, d;
		if (reversedDepth) {
			c = 1 / (far - near);
			d = far / (far - near);
		} else if (coordinateSystem === 2e3) {
			c = -2 / (far - near);
			d = -(far + near) / (far - near);
		} else if (coordinateSystem === 2001) {
			c = -1 / (far - near);
			d = -near / (far - near);
		} else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + coordinateSystem);
		te[0] = x;
		te[4] = 0;
		te[8] = 0;
		te[12] = a;
		te[1] = 0;
		te[5] = y;
		te[9] = 0;
		te[13] = b;
		te[2] = 0;
		te[6] = 0;
		te[10] = c;
		te[14] = d;
		te[3] = 0;
		te[7] = 0;
		te[11] = 0;
		te[15] = 1;
		return this;
	}
	/**
	* Returns `true` if this matrix is equal with the given one.
	*
	* @param {Matrix4} matrix - The matrix to test for equality.
	* @return {boolean} Whether this matrix is equal with the given one.
	*/
	equals(matrix) {
		const te = this.elements;
		const me = matrix.elements;
		for (let i = 0; i < 16; i++) if (te[i] !== me[i]) return false;
		return true;
	}
	/**
	* Sets the elements of the matrix from the given array.
	*
	* @param {Array<number>} array - The matrix elements in column-major order.
	* @param {number} [offset=0] - Index of the first element in the array.
	* @return {Matrix4} A reference to this matrix.
	*/
	fromArray(array, offset = 0) {
		for (let i = 0; i < 16; i++) this.elements[i] = array[i + offset];
		return this;
	}
	/**
	* Writes the elements of this matrix to the given array. If no array is provided,
	* the method returns a new instance.
	*
	* @param {Array<number>} [array=[]] - The target array holding the matrix elements in column-major order.
	* @param {number} [offset=0] - Index of the first element in the array.
	* @return {Array<number>} The matrix elements in column-major order.
	*/
	toArray(array = [], offset = 0) {
		const te = this.elements;
		array[offset] = te[0];
		array[offset + 1] = te[1];
		array[offset + 2] = te[2];
		array[offset + 3] = te[3];
		array[offset + 4] = te[4];
		array[offset + 5] = te[5];
		array[offset + 6] = te[6];
		array[offset + 7] = te[7];
		array[offset + 8] = te[8];
		array[offset + 9] = te[9];
		array[offset + 10] = te[10];
		array[offset + 11] = te[11];
		array[offset + 12] = te[12];
		array[offset + 13] = te[13];
		array[offset + 14] = te[14];
		array[offset + 15] = te[15];
		return array;
	}
};
const _v1$7 = /*@__PURE__*/ new Vector3();
const _m1$2 = /*@__PURE__*/ new Matrix4();
const _zero = /*@__PURE__*/ new Vector3(0, 0, 0);
const _one = /*@__PURE__*/ new Vector3(1, 1, 1);
const _x = /*@__PURE__*/ new Vector3();
const _y = /*@__PURE__*/ new Vector3();
const _z = /*@__PURE__*/ new Vector3();
const _matrix$2 = /*@__PURE__*/ new Matrix4();
const _quaternion$4 = /*@__PURE__*/ new Quaternion();
/**
* A class representing Euler angles.
*
* Euler angles describe a rotational transformation by rotating an object on
* its various axes in specified amounts per axis, and a specified axis
* order.
*
* Iterating through an instance will yield its components (x, y, z,
* order) in the corresponding order.
*
* ```js
* const a = new THREE.Euler( 0, 1, 1.57, 'XYZ' );
* const b = new THREE.Vector3( 1, 0, 1 );
* b.applyEuler(a);
* ```
*/
var Euler = class Euler {
	/**
	* Constructs a new euler instance.
	*
	* @param {number} [x=0] - The angle of the x axis in radians.
	* @param {number} [y=0] - The angle of the y axis in radians.
	* @param {number} [z=0] - The angle of the z axis in radians.
	* @param {string} [order=Euler.DEFAULT_ORDER] - A string representing the order that the rotations are applied.
	*/
	constructor(x = 0, y = 0, z = 0, order = Euler.DEFAULT_ORDER) {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isEuler = true;
		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;
	}
	/**
	* The angle of the x axis in radians.
	*
	* @type {number}
	* @default 0
	*/
	get x() {
		return this._x;
	}
	set x(value) {
		this._x = value;
		this._onChangeCallback();
	}
	/**
	* The angle of the y axis in radians.
	*
	* @type {number}
	* @default 0
	*/
	get y() {
		return this._y;
	}
	set y(value) {
		this._y = value;
		this._onChangeCallback();
	}
	/**
	* The angle of the z axis in radians.
	*
	* @type {number}
	* @default 0
	*/
	get z() {
		return this._z;
	}
	set z(value) {
		this._z = value;
		this._onChangeCallback();
	}
	/**
	* A string representing the order that the rotations are applied.
	*
	* @type {string}
	* @default 'XYZ'
	*/
	get order() {
		return this._order;
	}
	set order(value) {
		this._order = value;
		this._onChangeCallback();
	}
	/**
	* Sets the Euler components.
	*
	* @param {number} x - The angle of the x axis in radians.
	* @param {number} y - The angle of the y axis in radians.
	* @param {number} z - The angle of the z axis in radians.
	* @param {string} [order] - A string representing the order that the rotations are applied.
	* @return {Euler} A reference to this Euler instance.
	*/
	set(x, y, z, order = this._order) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;
		this._onChangeCallback();
		return this;
	}
	/**
	* Returns a new Euler instance with copied values from this instance.
	*
	* @return {Euler} A clone of this instance.
	*/
	clone() {
		return new this.constructor(this._x, this._y, this._z, this._order);
	}
	/**
	* Copies the values of the given Euler instance to this instance.
	*
	* @param {Euler} euler - The Euler instance to copy.
	* @return {Euler} A reference to this Euler instance.
	*/
	copy(euler) {
		this._x = euler._x;
		this._y = euler._y;
		this._z = euler._z;
		this._order = euler._order;
		this._onChangeCallback();
		return this;
	}
	/**
	* Sets the angles of this Euler instance from a pure rotation matrix.
	*
	* @param {Matrix4} m - A 4x4 matrix of which the upper 3x3 of matrix is a pure rotation matrix (i.e. unscaled).
	* @param {string} [order] - A string representing the order that the rotations are applied.
	* @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
	* @return {Euler} A reference to this Euler instance.
	*/
	setFromRotationMatrix(m, order = this._order, update = true) {
		const te = m.elements;
		const m11 = te[0], m12 = te[4], m13 = te[8];
		const m21 = te[1], m22 = te[5], m23 = te[9];
		const m31 = te[2], m32 = te[6], m33 = te[10];
		switch (order) {
			case "XYZ":
				this._y = Math.asin(clamp(m13, -1, 1));
				if (Math.abs(m13) < .9999999) {
					this._x = Math.atan2(-m23, m33);
					this._z = Math.atan2(-m12, m11);
				} else {
					this._x = Math.atan2(m32, m22);
					this._z = 0;
				}
				break;
			case "YXZ":
				this._x = Math.asin(-clamp(m23, -1, 1));
				if (Math.abs(m23) < .9999999) {
					this._y = Math.atan2(m13, m33);
					this._z = Math.atan2(m21, m22);
				} else {
					this._y = Math.atan2(-m31, m11);
					this._z = 0;
				}
				break;
			case "ZXY":
				this._x = Math.asin(clamp(m32, -1, 1));
				if (Math.abs(m32) < .9999999) {
					this._y = Math.atan2(-m31, m33);
					this._z = Math.atan2(-m12, m22);
				} else {
					this._y = 0;
					this._z = Math.atan2(m21, m11);
				}
				break;
			case "ZYX":
				this._y = Math.asin(-clamp(m31, -1, 1));
				if (Math.abs(m31) < .9999999) {
					this._x = Math.atan2(m32, m33);
					this._z = Math.atan2(m21, m11);
				} else {
					this._x = 0;
					this._z = Math.atan2(-m12, m22);
				}
				break;
			case "YZX":
				this._z = Math.asin(clamp(m21, -1, 1));
				if (Math.abs(m21) < .9999999) {
					this._x = Math.atan2(-m23, m22);
					this._y = Math.atan2(-m31, m11);
				} else {
					this._x = 0;
					this._y = Math.atan2(m13, m33);
				}
				break;
			case "XZY":
				this._z = Math.asin(-clamp(m12, -1, 1));
				if (Math.abs(m12) < .9999999) {
					this._x = Math.atan2(m32, m22);
					this._y = Math.atan2(m13, m11);
				} else {
					this._x = Math.atan2(-m23, m33);
					this._y = 0;
				}
				break;
			default: warn("Euler: .setFromRotationMatrix() encountered an unknown order: " + order);
		}
		this._order = order;
		if (update === true) this._onChangeCallback();
		return this;
	}
	/**
	* Sets the angles of this Euler instance from a normalized quaternion.
	*
	* @param {Quaternion} q - A normalized Quaternion.
	* @param {string} [order] - A string representing the order that the rotations are applied.
	* @param {boolean} [update=true] - Whether the internal `onChange` callback should be executed or not.
	* @return {Euler} A reference to this Euler instance.
	*/
	setFromQuaternion(q, order, update) {
		_matrix$2.makeRotationFromQuaternion(q);
		return this.setFromRotationMatrix(_matrix$2, order, update);
	}
	/**
	* Sets the angles of this Euler instance from the given vector.
	*
	* @param {Vector3} v - The vector.
	* @param {string} [order] - A string representing the order that the rotations are applied.
	* @return {Euler} A reference to this Euler instance.
	*/
	setFromVector3(v, order = this._order) {
		return this.set(v.x, v.y, v.z, order);
	}
	/**
	* Resets the euler angle with a new order by creating a quaternion from this
	* euler angle and then setting this euler angle with the quaternion and the
	* new order.
	*
	* Warning: This discards revolution information.
	*
	* @param {string} [newOrder] - A string representing the new order that the rotations are applied.
	* @return {Euler} A reference to this Euler instance.
	*/
	reorder(newOrder) {
		_quaternion$4.setFromEuler(this);
		return this.setFromQuaternion(_quaternion$4, newOrder);
	}
	/**
	* Returns `true` if this Euler instance is equal with the given one.
	*
	* @param {Euler} euler - The Euler instance to test for equality.
	* @return {boolean} Whether this Euler instance is equal with the given one.
	*/
	equals(euler) {
		return euler._x === this._x && euler._y === this._y && euler._z === this._z && euler._order === this._order;
	}
	/**
	* Sets this Euler instance's components to values from the given array. The first three
	* entries of the array are assign to the x,y and z components. An optional fourth entry
	* defines the Euler order.
	*
	* @param {Array<number,number,number,?string>} array - An array holding the Euler component values.
	* @return {Euler} A reference to this Euler instance.
	*/
	fromArray(array) {
		this._x = array[0];
		this._y = array[1];
		this._z = array[2];
		if (array[3] !== void 0) this._order = array[3];
		this._onChangeCallback();
		return this;
	}
	/**
	* Writes the components of this Euler instance to the given array. If no array is provided,
	* the method returns a new instance.
	*
	* @param {Array<number,number,number,string>} [array=[]] - The target array holding the Euler components.
	* @param {number} [offset=0] - Index of the first element in the array.
	* @return {Array<number,number,number,string>} The Euler components.
	*/
	toArray(array = [], offset = 0) {
		array[offset] = this._x;
		array[offset + 1] = this._y;
		array[offset + 2] = this._z;
		array[offset + 3] = this._order;
		return array;
	}
	_onChange(callback) {
		this._onChangeCallback = callback;
		return this;
	}
	_onChangeCallback() {}
	*[Symbol.iterator]() {
		yield this._x;
		yield this._y;
		yield this._z;
		yield this._order;
	}
};
/**
* The default Euler angle order.
*
* @static
* @type {string}
* @default 'XYZ'
*/
Euler.DEFAULT_ORDER = "XYZ";
/**
* A layers object assigns an 3D object to 1 or more of 32
* layers numbered `0` to `31` - internally the layers are stored as a
* bit mask], and by default all 3D objects are a member of layer `0`.
*
* This can be used to control visibility - an object must share a layer with
* a camera to be visible when that camera's view is
* rendered.
*
* All classes that inherit from {@link Object3D} have an `layers` property which
* is an instance of this class.
*/
var Layers = class {
	/**
	* Constructs a new layers instance, with membership
	* initially set to layer `0`.
	*/
	constructor() {
		/**
		* A bit mask storing which of the 32 layers this layers object is currently
		* a member of.
		*
		* @type {number}
		*/
		this.mask = 1;
	}
	/**
	* Sets membership to the given layer, and remove membership all other layers.
	*
	* @param {number} layer - The layer to set.
	*/
	set(layer) {
		this.mask = (1 << layer | 0) >>> 0;
	}
	/**
	* Adds membership of the given layer.
	*
	* @param {number} layer - The layer to enable.
	*/
	enable(layer) {
		this.mask |= 1 << layer | 0;
	}
	/**
	* Adds membership to all layers.
	*/
	enableAll() {
		this.mask = -1;
	}
	/**
	* Toggles the membership of the given layer.
	*
	* @param {number} layer - The layer to toggle.
	*/
	toggle(layer) {
		this.mask ^= 1 << layer | 0;
	}
	/**
	* Removes membership of the given layer.
	*
	* @param {number} layer - The layer to enable.
	*/
	disable(layer) {
		this.mask &= ~(1 << layer | 0);
	}
	/**
	* Removes the membership from all layers.
	*/
	disableAll() {
		this.mask = 0;
	}
	/**
	* Returns `true` if this and the given layers object have at least one
	* layer in common.
	*
	* @param {Layers} layers - The layers to test.
	* @return {boolean } Whether this and the given layers object have at least one layer in common or not.
	*/
	test(layers) {
		return (this.mask & layers.mask) !== 0;
	}
	/**
	* Returns `true` if the given layer is enabled.
	*
	* @param {number} layer - The layer to test.
	* @return {boolean } Whether the given layer is enabled or not.
	*/
	isEnabled(layer) {
		return (this.mask & (1 << layer | 0)) !== 0;
	}
};
let _object3DId = 0;
const _v1$6 = /*@__PURE__*/ new Vector3();
const _q1 = /*@__PURE__*/ new Quaternion();
const _m1$1 = /*@__PURE__*/ new Matrix4();
const _target = /*@__PURE__*/ new Vector3();
const _position$4 = /*@__PURE__*/ new Vector3();
const _scale$3 = /*@__PURE__*/ new Vector3();
const _quaternion$3 = /*@__PURE__*/ new Quaternion();
const _xAxis = /*@__PURE__*/ new Vector3(1, 0, 0);
const _yAxis = /*@__PURE__*/ new Vector3(0, 1, 0);
const _zAxis = /*@__PURE__*/ new Vector3(0, 0, 1);
/**
* Fires when the object has been added to its parent object.
*
* @event Object3D#added
* @type {Object}
*/
const _addedEvent = { type: "added" };
/**
* Fires when the object has been removed from its parent object.
*
* @event Object3D#removed
* @type {Object}
*/
const _removedEvent = { type: "removed" };
/**
* Fires when a new child object has been added.
*
* @event Object3D#childadded
* @type {Object}
*/
const _childaddedEvent = {
	type: "childadded",
	child: null
};
/**
* Fires when a child object has been removed.
*
* @event Object3D#childremoved
* @type {Object}
*/
const _childremovedEvent = {
	type: "childremoved",
	child: null
};
/**
* This is the base class for most objects in three.js and provides a set of
* properties and methods for manipulating objects in 3D space.
*
* @augments EventDispatcher
*/
var Object3D = class Object3D extends EventDispatcher {
	/**
	* Constructs a new 3D object.
	*/
	constructor() {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isObject3D = true;
		/**
		* The ID of the 3D object.
		*
		* @name Object3D#id
		* @type {number}
		* @readonly
		*/
		Object.defineProperty(this, "id", { value: _object3DId++ });
		/**
		* The UUID of the 3D object.
		*
		* @type {string}
		* @readonly
		*/
		this.uuid = generateUUID();
		/**
		* The name of the 3D object.
		*
		* @type {string}
		*/
		this.name = "";
		/**
		* The type property is used for detecting the object type
		* in context of serialization/deserialization.
		*
		* @type {string}
		* @readonly
		*/
		this.type = "Object3D";
		/**
		* A reference to the parent object.
		*
		* @type {?Object3D}
		* @default null
		*/
		this.parent = null;
		/**
		* An array holding the child 3D objects of this instance.
		*
		* @type {Array<Object3D>}
		*/
		this.children = [];
		/**
		* Defines the `up` direction of the 3D object which influences
		* the orientation via methods like {@link Object3D#lookAt}.
		*
		* The default values for all 3D objects is defined by `Object3D.DEFAULT_UP`.
		*
		* @type {Vector3}
		*/
		this.up = Object3D.DEFAULT_UP.clone();
		const position = new Vector3();
		const rotation = new Euler();
		const quaternion = new Quaternion();
		const scale = new Vector3(1, 1, 1);
		function onRotationChange() {
			quaternion.setFromEuler(rotation, false);
		}
		function onQuaternionChange() {
			rotation.setFromQuaternion(quaternion, void 0, false);
		}
		rotation._onChange(onRotationChange);
		quaternion._onChange(onQuaternionChange);
		Object.defineProperties(this, {
			/**
			* Represents the object's local position.
			*
			* @name Object3D#position
			* @type {Vector3}
			* @default (0,0,0)
			*/
			position: {
				configurable: true,
				enumerable: true,
				value: position
			},
			/**
			* Represents the object's local rotation as Euler angles, in radians.
			*
			* @name Object3D#rotation
			* @type {Euler}
			* @default (0,0,0)
			*/
			rotation: {
				configurable: true,
				enumerable: true,
				value: rotation
			},
			/**
			* Represents the object's local rotation as Quaternions.
			*
			* @name Object3D#quaternion
			* @type {Quaternion}
			*/
			quaternion: {
				configurable: true,
				enumerable: true,
				value: quaternion
			},
			/**
			* Represents the object's local scale.
			*
			* @name Object3D#scale
			* @type {Vector3}
			* @default (1,1,1)
			*/
			scale: {
				configurable: true,
				enumerable: true,
				value: scale
			},
			/**
			* Represents the object's model-view matrix.
			*
			* @name Object3D#modelViewMatrix
			* @type {Matrix4}
			*/
			modelViewMatrix: { value: new Matrix4() },
			/**
			* Represents the object's normal matrix.
			*
			* @name Object3D#normalMatrix
			* @type {Matrix3}
			*/
			normalMatrix: { value: new Matrix3() }
		});
		/**
		* Represents the object's transformation matrix in local space.
		*
		* @type {Matrix4}
		*/
		this.matrix = new Matrix4();
		/**
		* Represents the object's transformation matrix in world space.
		* If the 3D object has no parent, then it's identical to the local transformation matrix
		*
		* @type {Matrix4}
		*/
		this.matrixWorld = new Matrix4();
		/**
		* When set to `true`, the engine automatically computes the local matrix from position,
		* rotation and scale every frame. If set to `false`, the app is responsible for recomputing
		* the local matrix by calling `updateMatrix()`.
		*
		* The default values for all 3D objects is defined by `Object3D.DEFAULT_MATRIX_AUTO_UPDATE`.
		*
		* @type {boolean}
		* @default true
		*/
		this.matrixAutoUpdate = Object3D.DEFAULT_MATRIX_AUTO_UPDATE;
		/**
		* When set to `true`, the engine automatically computes the world matrix from the current local
		* matrix and the object's transformation hierarchy. If set to `false`, the app is responsible for
		* recomputing the world matrix by directly updating the `matrixWorld` property.
		*
		* The default values for all 3D objects is defined by `Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE`.
		*
		* @type {boolean}
		* @default true
		*/
		this.matrixWorldAutoUpdate = Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE;
		/**
		* When set to `true`, it calculates the world matrix in that frame and resets this property
		* to `false`.
		*
		* @type {boolean}
		* @default false
		*/
		this.matrixWorldNeedsUpdate = false;
		/**
		* The layer membership of the 3D object. The 3D object is only visible if it has
		* at least one layer in common with the camera in use. This property can also be
		* used to filter out unwanted objects in ray-intersection tests when using {@link Raycaster}.
		*
		* @type {Layers}
		*/
		this.layers = new Layers();
		/**
		* When set to `true`, the 3D object gets rendered.
		*
		* @type {boolean}
		* @default true
		*/
		this.visible = true;
		/**
		* When set to `true`, the 3D object gets rendered into shadow maps.
		*
		* @type {boolean}
		* @default false
		*/
		this.castShadow = false;
		/**
		* When set to `true`, the 3D object is affected by shadows in the scene.
		*
		* @type {boolean}
		* @default false
		*/
		this.receiveShadow = false;
		/**
		* When set to `true`, the 3D object is honored by view frustum culling.
		*
		* @type {boolean}
		* @default true
		*/
		this.frustumCulled = true;
		/**
		* This value allows the default rendering order of scene graph objects to be
		* overridden although opaque and transparent objects remain sorted independently.
		* When this property is set for an instance of {@link Group},all descendants
		* objects will be sorted and rendered together. Sorting is from lowest to highest
		* render order.
		*
		* @type {number}
		* @default 0
		*/
		this.renderOrder = 0;
		/**
		* An array holding the animation clips of the 3D object.
		*
		* @type {Array<AnimationClip>}
		*/
		this.animations = [];
		/**
		* Custom depth material to be used when rendering to the depth map. Can only be used
		* in context of meshes. When shadow-casting with a {@link DirectionalLight} or {@link SpotLight},
		* if you are modifying vertex positions in the vertex shader you must specify a custom depth
		* material for proper shadows.
		*
		* Only relevant in context of {@link WebGLRenderer}.
		*
		* @type {(Material|undefined)}
		* @default undefined
		*/
		this.customDepthMaterial = void 0;
		/**
		* Same as {@link Object3D#customDepthMaterial}, but used with {@link PointLight}.
		*
		* Only relevant in context of {@link WebGLRenderer}.
		*
		* @type {(Material|undefined)}
		* @default undefined
		*/
		this.customDistanceMaterial = void 0;
		/**
		* Whether the 3D object is supposed to be static or not. If set to `true`, it means
		* the 3D object is not going to be changed after the initial renderer. This includes
		* geometry and material settings. A static 3D object can be processed by the renderer
		* slightly faster since certain state checks can be bypassed.
		*
		* Only relevant in context of {@link WebGPURenderer}.
		*
		* @type {boolean}
		* @default false
		*/
		this.static = false;
		/**
		* An object that can be used to store custom data about the 3D object. It
		* should not hold references to functions as these will not be cloned.
		*
		* @type {Object}
		*/
		this.userData = {};
		/**
		* The pivot point for rotation and scale transformations.
		* When set, rotation and scale are applied around this point
		* instead of the object's origin.
		*
		* @type {?Vector3}
		* @default null
		*/
		this.pivot = null;
	}
	/**
	* A callback that is executed immediately before a 3D object is rendered to a shadow map.
	*
	* @param {Renderer|WebGLRenderer} renderer - The renderer.
	* @param {Object3D} object - The 3D object.
	* @param {Camera} camera - The camera that is used to render the scene.
	* @param {Camera} shadowCamera - The shadow camera.
	* @param {BufferGeometry} geometry - The 3D object's geometry.
	* @param {Material} depthMaterial - The depth material.
	* @param {Object} group - The geometry group data.
	*/
	onBeforeShadow() {}
	/**
	* A callback that is executed immediately after a 3D object is rendered to a shadow map.
	*
	* @param {Renderer|WebGLRenderer} renderer - The renderer.
	* @param {Object3D} object - The 3D object.
	* @param {Camera} camera - The camera that is used to render the scene.
	* @param {Camera} shadowCamera - The shadow camera.
	* @param {BufferGeometry} geometry - The 3D object's geometry.
	* @param {Material} depthMaterial - The depth material.
	* @param {Object} group - The geometry group data.
	*/
	onAfterShadow() {}
	/**
	* A callback that is executed immediately before a 3D object is rendered.
	*
	* @param {Renderer|WebGLRenderer} renderer - The renderer.
	* @param {Object3D} object - The 3D object.
	* @param {Camera} camera - The camera that is used to render the scene.
	* @param {BufferGeometry} geometry - The 3D object's geometry.
	* @param {Material} material - The 3D object's material.
	* @param {Object} group - The geometry group data.
	*/
	onBeforeRender() {}
	/**
	* A callback that is executed immediately after a 3D object is rendered.
	*
	* @param {Renderer|WebGLRenderer} renderer - The renderer.
	* @param {Object3D} object - The 3D object.
	* @param {Camera} camera - The camera that is used to render the scene.
	* @param {BufferGeometry} geometry - The 3D object's geometry.
	* @param {Material} material - The 3D object's material.
	* @param {Object} group - The geometry group data.
	*/
	onAfterRender() {}
	/**
	* Applies the given transformation matrix to the object and updates the object's position,
	* rotation and scale.
	*
	* @param {Matrix4} matrix - The transformation matrix.
	*/
	applyMatrix4(matrix) {
		if (this.matrixAutoUpdate) this.updateMatrix();
		this.matrix.premultiply(matrix);
		this.matrix.decompose(this.position, this.quaternion, this.scale);
	}
	/**
	* Applies a rotation represented by given the quaternion to the 3D object.
	*
	* @param {Quaternion} q - The quaternion.
	* @return {Object3D} A reference to this instance.
	*/
	applyQuaternion(q) {
		this.quaternion.premultiply(q);
		return this;
	}
	/**
	* Sets the given rotation represented as an axis/angle couple to the 3D object.
	*
	* @param {Vector3} axis - The (normalized) axis vector.
	* @param {number} angle - The angle in radians.
	*/
	setRotationFromAxisAngle(axis, angle) {
		this.quaternion.setFromAxisAngle(axis, angle);
	}
	/**
	* Sets the given rotation represented as Euler angles to the 3D object.
	*
	* @param {Euler} euler - The Euler angles.
	*/
	setRotationFromEuler(euler) {
		this.quaternion.setFromEuler(euler, true);
	}
	/**
	* Sets the given rotation represented as rotation matrix to the 3D object.
	*
	* @param {Matrix4} m - Although a 4x4 matrix is expected, the upper 3x3 portion must be
	* a pure rotation matrix (i.e, unscaled).
	*/
	setRotationFromMatrix(m) {
		this.quaternion.setFromRotationMatrix(m);
	}
	/**
	* Sets the given rotation represented as a Quaternion to the 3D object.
	*
	* @param {Quaternion} q - The Quaternion
	*/
	setRotationFromQuaternion(q) {
		this.quaternion.copy(q);
	}
	/**
	* Rotates the 3D object along an axis in local space.
	*
	* @param {Vector3} axis - The (normalized) axis vector.
	* @param {number} angle - The angle in radians.
	* @return {Object3D} A reference to this instance.
	*/
	rotateOnAxis(axis, angle) {
		_q1.setFromAxisAngle(axis, angle);
		this.quaternion.multiply(_q1);
		return this;
	}
	/**
	* Rotates the 3D object along an axis in world space.
	*
	* @param {Vector3} axis - The (normalized) axis vector.
	* @param {number} angle - The angle in radians.
	* @return {Object3D} A reference to this instance.
	*/
	rotateOnWorldAxis(axis, angle) {
		_q1.setFromAxisAngle(axis, angle);
		this.quaternion.premultiply(_q1);
		return this;
	}
	/**
	* Rotates the 3D object around its X axis in local space.
	*
	* @param {number} angle - The angle in radians.
	* @return {Object3D} A reference to this instance.
	*/
	rotateX(angle) {
		return this.rotateOnAxis(_xAxis, angle);
	}
	/**
	* Rotates the 3D object around its Y axis in local space.
	*
	* @param {number} angle - The angle in radians.
	* @return {Object3D} A reference to this instance.
	*/
	rotateY(angle) {
		return this.rotateOnAxis(_yAxis, angle);
	}
	/**
	* Rotates the 3D object around its Z axis in local space.
	*
	* @param {number} angle - The angle in radians.
	* @return {Object3D} A reference to this instance.
	*/
	rotateZ(angle) {
		return this.rotateOnAxis(_zAxis, angle);
	}
	/**
	* Translate the 3D object by a distance along the given axis in local space.
	*
	* @param {Vector3} axis - The (normalized) axis vector.
	* @param {number} distance - The distance in world units.
	* @return {Object3D} A reference to this instance.
	*/
	translateOnAxis(axis, distance) {
		_v1$6.copy(axis).applyQuaternion(this.quaternion);
		this.position.add(_v1$6.multiplyScalar(distance));
		return this;
	}
	/**
	* Translate the 3D object by a distance along its X-axis in local space.
	*
	* @param {number} distance - The distance in world units.
	* @return {Object3D} A reference to this instance.
	*/
	translateX(distance) {
		return this.translateOnAxis(_xAxis, distance);
	}
	/**
	* Translate the 3D object by a distance along its Y-axis in local space.
	*
	* @param {number} distance - The distance in world units.
	* @return {Object3D} A reference to this instance.
	*/
	translateY(distance) {
		return this.translateOnAxis(_yAxis, distance);
	}
	/**
	* Translate the 3D object by a distance along its Z-axis in local space.
	*
	* @param {number} distance - The distance in world units.
	* @return {Object3D} A reference to this instance.
	*/
	translateZ(distance) {
		return this.translateOnAxis(_zAxis, distance);
	}
	/**
	* Converts the given vector from this 3D object's local space to world space.
	*
	* @param {Vector3} vector - The vector to convert.
	* @return {Vector3} The converted vector.
	*/
	localToWorld(vector) {
		this.updateWorldMatrix(true, false);
		return vector.applyMatrix4(this.matrixWorld);
	}
	/**
	* Converts the given vector from this 3D object's world space to local space.
	*
	* @param {Vector3} vector - The vector to convert.
	* @return {Vector3} The converted vector.
	*/
	worldToLocal(vector) {
		this.updateWorldMatrix(true, false);
		return vector.applyMatrix4(_m1$1.copy(this.matrixWorld).invert());
	}
	/**
	* Rotates the object to face a point in world space.
	*
	* This method does not support objects having non-uniformly-scaled parent(s).
	*
	* @param {number|Vector3} x - The x coordinate in world space. Alternatively, a vector representing a position in world space
	* @param {number} [y] - The y coordinate in world space.
	* @param {number} [z] - The z coordinate in world space.
	*/
	lookAt(x, y, z) {
		if (x.isVector3) _target.copy(x);
		else _target.set(x, y, z);
		const parent = this.parent;
		this.updateWorldMatrix(true, false);
		_position$4.setFromMatrixPosition(this.matrixWorld);
		if (this.isCamera || this.isLight) _m1$1.lookAt(_position$4, _target, this.up);
		else _m1$1.lookAt(_target, _position$4, this.up);
		this.quaternion.setFromRotationMatrix(_m1$1);
		if (parent) {
			_m1$1.extractRotation(parent.matrixWorld);
			_q1.setFromRotationMatrix(_m1$1);
			this.quaternion.premultiply(_q1.invert());
		}
	}
	/**
	* Adds the given 3D object as a child to this 3D object. An arbitrary number of
	* objects may be added. Any current parent on an object passed in here will be
	* removed, since an object can have at most one parent.
	*
	* @fires Object3D#added
	* @fires Object3D#childadded
	* @param {Object3D} object - The 3D object to add.
	* @return {Object3D} A reference to this instance.
	*/
	add(object) {
		if (arguments.length > 1) {
			for (let i = 0; i < arguments.length; i++) this.add(arguments[i]);
			return this;
		}
		if (object === this) {
			error("Object3D.add: object can't be added as a child of itself.", object);
			return this;
		}
		if (object && object.isObject3D) {
			object.removeFromParent();
			object.parent = this;
			this.children.push(object);
			object.dispatchEvent(_addedEvent);
			_childaddedEvent.child = object;
			this.dispatchEvent(_childaddedEvent);
			_childaddedEvent.child = null;
		} else error("Object3D.add: object not an instance of THREE.Object3D.", object);
		return this;
	}
	/**
	* Removes the given 3D object as child from this 3D object.
	* An arbitrary number of objects may be removed.
	*
	* @fires Object3D#removed
	* @fires Object3D#childremoved
	* @param {Object3D} object - The 3D object to remove.
	* @return {Object3D} A reference to this instance.
	*/
	remove(object) {
		if (arguments.length > 1) {
			for (let i = 0; i < arguments.length; i++) this.remove(arguments[i]);
			return this;
		}
		const index = this.children.indexOf(object);
		if (index !== -1) {
			object.parent = null;
			this.children.splice(index, 1);
			object.dispatchEvent(_removedEvent);
			_childremovedEvent.child = object;
			this.dispatchEvent(_childremovedEvent);
			_childremovedEvent.child = null;
		}
		return this;
	}
	/**
	* Removes this 3D object from its current parent.
	*
	* @fires Object3D#removed
	* @fires Object3D#childremoved
	* @return {Object3D} A reference to this instance.
	*/
	removeFromParent() {
		const parent = this.parent;
		if (parent !== null) parent.remove(this);
		return this;
	}
	/**
	* Removes all child objects.
	*
	* @fires Object3D#removed
	* @fires Object3D#childremoved
	* @return {Object3D} A reference to this instance.
	*/
	clear() {
		return this.remove(...this.children);
	}
	/**
	* Adds the given 3D object as a child of this 3D object, while maintaining the object's world
	* transform. This method does not support scene graphs having non-uniformly-scaled nodes(s).
	*
	* @fires Object3D#added
	* @fires Object3D#childadded
	* @param {Object3D} object - The 3D object to attach.
	* @return {Object3D} A reference to this instance.
	*/
	attach(object) {
		this.updateWorldMatrix(true, false);
		_m1$1.copy(this.matrixWorld).invert();
		if (object.parent !== null) {
			object.parent.updateWorldMatrix(true, false);
			_m1$1.multiply(object.parent.matrixWorld);
		}
		object.applyMatrix4(_m1$1);
		object.removeFromParent();
		object.parent = this;
		this.children.push(object);
		object.updateWorldMatrix(false, true);
		object.dispatchEvent(_addedEvent);
		_childaddedEvent.child = object;
		this.dispatchEvent(_childaddedEvent);
		_childaddedEvent.child = null;
		return this;
	}
	/**
	* Searches through the 3D object and its children, starting with the 3D object
	* itself, and returns the first with a matching ID.
	*
	* @param {number} id - The id.
	* @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
	*/
	getObjectById(id) {
		return this.getObjectByProperty("id", id);
	}
	/**
	* Searches through the 3D object and its children, starting with the 3D object
	* itself, and returns the first with a matching name.
	*
	* @param {string} name - The name.
	* @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
	*/
	getObjectByName(name) {
		return this.getObjectByProperty("name", name);
	}
	/**
	* Searches through the 3D object and its children, starting with the 3D object
	* itself, and returns the first with a matching property value.
	*
	* @param {string} name - The name of the property.
	* @param {any} value - The value.
	* @return {Object3D|undefined} The found 3D object. Returns `undefined` if no 3D object has been found.
	*/
	getObjectByProperty(name, value) {
		if (this[name] === value) return this;
		for (let i = 0, l = this.children.length; i < l; i++) {
			const object = this.children[i].getObjectByProperty(name, value);
			if (object !== void 0) return object;
		}
	}
	/**
	* Searches through the 3D object and its children, starting with the 3D object
	* itself, and returns all 3D objects with a matching property value.
	*
	* @param {string} name - The name of the property.
	* @param {any} value - The value.
	* @param {Array<Object3D>} result - The method stores the result in this array.
	* @return {Array<Object3D>} The found 3D objects.
	*/
	getObjectsByProperty(name, value, result = []) {
		if (this[name] === value) result.push(this);
		const children = this.children;
		for (let i = 0, l = children.length; i < l; i++) children[i].getObjectsByProperty(name, value, result);
		return result;
	}
	/**
	* Returns a vector representing the position of the 3D object in world space.
	*
	* @param {Vector3} target - The target vector the result is stored to.
	* @return {Vector3} The 3D object's position in world space.
	*/
	getWorldPosition(target) {
		this.updateWorldMatrix(true, false);
		return target.setFromMatrixPosition(this.matrixWorld);
	}
	/**
	* Returns a Quaternion representing the position of the 3D object in world space.
	*
	* @param {Quaternion} target - The target Quaternion the result is stored to.
	* @return {Quaternion} The 3D object's rotation in world space.
	*/
	getWorldQuaternion(target) {
		this.updateWorldMatrix(true, false);
		this.matrixWorld.decompose(_position$4, target, _scale$3);
		return target;
	}
	/**
	* Returns a vector representing the scale of the 3D object in world space.
	*
	* @param {Vector3} target - The target vector the result is stored to.
	* @return {Vector3} The 3D object's scale in world space.
	*/
	getWorldScale(target) {
		this.updateWorldMatrix(true, false);
		this.matrixWorld.decompose(_position$4, _quaternion$3, target);
		return target;
	}
	/**
	* Returns a vector representing the ("look") direction of the 3D object in world space.
	*
	* @param {Vector3} target - The target vector the result is stored to.
	* @return {Vector3} The 3D object's direction in world space.
	*/
	getWorldDirection(target) {
		this.updateWorldMatrix(true, false);
		const e = this.matrixWorld.elements;
		return target.set(e[8], e[9], e[10]).normalize();
	}
	/**
	* Abstract method to get intersections between a casted ray and this
	* 3D object. Renderable 3D objects such as {@link Mesh}, {@link Line} or {@link Points}
	* implement this method in order to use raycasting.
	*
	* @abstract
	* @param {Raycaster} raycaster - The raycaster.
	* @param {Array<Object>} intersects - An array holding the result of the method.
	*/
	raycast() {}
	/**
	* Abstract method to test whether this 3D object intersects the given frustum.
	* Renderable 3D objects such as {@link Mesh}, {@link Line} or {@link Points}
	* implement this method in order to use frustum culling.
	*
	* @abstract
	* @param {Frustum|FrustumArray} frustum - The frustum to test.
	* @return {boolean|undefined} Whether this 3D object intersects the given frustum or not.
	*/
	intersectsFrustum() {}
	/**
	* Executes the callback on this 3D object and all descendants.
	*
	* Note: Modifying the scene graph inside the callback is discouraged.
	*
	* @param {Function} callback - A callback function that allows to process the current 3D object.
	*/
	traverse(callback) {
		callback(this);
		const children = this.children;
		for (let i = 0, l = children.length; i < l; i++) children[i].traverse(callback);
	}
	/**
	* Like {@link Object3D#traverse}, but the callback will only be executed for visible 3D objects.
	* Descendants of invisible 3D objects are not traversed.
	*
	* Note: Modifying the scene graph inside the callback is discouraged.
	*
	* @param {Function} callback - A callback function that allows to process the current 3D object.
	*/
	traverseVisible(callback) {
		if (this.visible === false) return;
		callback(this);
		const children = this.children;
		for (let i = 0, l = children.length; i < l; i++) children[i].traverseVisible(callback);
	}
	/**
	* Like {@link Object3D#traverse}, but the callback will only be executed for all ancestors.
	*
	* Note: Modifying the scene graph inside the callback is discouraged.
	*
	* @param {Function} callback - A callback function that allows to process the current 3D object.
	*/
	traverseAncestors(callback) {
		const parent = this.parent;
		if (parent !== null) {
			callback(parent);
			parent.traverseAncestors(callback);
		}
	}
	/**
	* Updates the transformation matrix in local space by computing it from the current
	* position, rotation and scale values.
	*/
	updateMatrix() {
		this.matrix.compose(this.position, this.quaternion, this.scale);
		const pivot = this.pivot;
		if (pivot !== null) {
			const px = pivot.x, py = pivot.y, pz = pivot.z;
			const te = this.matrix.elements;
			te[12] += px - te[0] * px - te[4] * py - te[8] * pz;
			te[13] += py - te[1] * px - te[5] * py - te[9] * pz;
			te[14] += pz - te[2] * px - te[6] * py - te[10] * pz;
		}
		this.matrixWorldNeedsUpdate = true;
	}
	/**
	* Updates the transformation matrix in world space of this 3D objects and its descendants.
	*
	* To ensure correct results, this method also recomputes the 3D object's transformation matrix in
	* local space. The computation of the local and world matrix can be controlled with the
	* {@link Object3D#matrixAutoUpdate} and {@link Object3D#matrixWorldAutoUpdate} flags which are both
	* `true` by default.  Set these flags to `false` if you need more control over the update matrix process.
	*
	* @param {boolean} [force=false] - When set to `true`, a recomputation of world matrices is forced even
	* when {@link Object3D#matrixWorldNeedsUpdate} is `false`.
	*/
	updateMatrixWorld(force) {
		if (this.matrixAutoUpdate) this.updateMatrix();
		if (this.matrixWorldNeedsUpdate || force) {
			if (this.matrixWorldAutoUpdate === true) {
				if (this.parent === null) this.matrixWorld.copy(this.matrix);
				else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
			}
			this.matrixWorldNeedsUpdate = false;
			force = true;
		}
		const children = this.children;
		for (let i = 0, l = children.length; i < l; i++) children[i].updateMatrixWorld(force);
	}
	/**
	* An alternative version of {@link Object3D#updateMatrixWorld} with more control over the
	* update of ancestor and descendant nodes.
	*
	* @param {boolean} [updateParents=false] Whether ancestor nodes should be updated or not.
	* @param {boolean} [updateChildren=false] Whether descendant nodes should be updated or not.
	* @param {boolean} [force=false] - When set to `true`, a recomputation of world matrices is forced even
	* when {@link Object3D#matrixWorldNeedsUpdate} is `false`.
	*/
	updateWorldMatrix(updateParents, updateChildren, force = false) {
		const parent = this.parent;
		if (updateParents === true && parent !== null) parent.updateWorldMatrix(true, false);
		if (this.matrixAutoUpdate) this.updateMatrix();
		if (this.matrixWorldNeedsUpdate || force) {
			if (this.matrixWorldAutoUpdate === true) {
				if (this.parent === null) this.matrixWorld.copy(this.matrix);
				else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
			}
			this.matrixWorldNeedsUpdate = false;
			force = true;
		}
		if (updateChildren === true) {
			const children = this.children;
			for (let i = 0, l = children.length; i < l; i++) children[i].updateWorldMatrix(false, true, force);
		}
	}
	/**
	* Serializes the 3D object into JSON.
	*
	* @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
	* @return {Object} A JSON object representing the serialized 3D object.
	* @see {@link ObjectLoader#parse}
	*/
	toJSON(meta) {
		const isRootObject = meta === void 0 || typeof meta === "string";
		const output = {};
		if (isRootObject) {
			meta = {
				geometries: {},
				materials: {},
				textures: {},
				images: {},
				shapes: {},
				skeletons: {},
				animations: {},
				nodes: {}
			};
			output.metadata = {
				version: 4.7,
				type: "Object",
				generator: "Object3D.toJSON"
			};
		}
		const object = {};
		object.uuid = this.uuid;
		object.type = this.type;
		object.name = this.name;
		object.castShadow = this.castShadow;
		object.receiveShadow = this.receiveShadow;
		object.visible = this.visible;
		object.frustumCulled = this.frustumCulled;
		object.renderOrder = this.renderOrder;
		object.static = this.static;
		object.matrixAutoUpdate = this.matrixAutoUpdate;
		if (Object.keys(this.userData).length > 0) object.userData = this.userData;
		object.layers = this.layers.mask;
		object.matrix = this.matrix.toArray();
		object.up = this.up.toArray();
		if (this.pivot !== null) object.pivot = this.pivot.toArray();
		if (this.morphTargetDictionary !== void 0) object.morphTargetDictionary = Object.assign({}, this.morphTargetDictionary);
		if (this.morphTargetInfluences !== void 0) object.morphTargetInfluences = this.morphTargetInfluences.slice();
		if (this.isInstancedMesh) {
			object.type = "InstancedMesh";
			object.count = this.count;
			object.instanceMatrix = this.instanceMatrix.toJSON();
			if (this.instanceColor !== null) object.instanceColor = this.instanceColor.toJSON();
		}
		if (this.isBatchedMesh) {
			object.type = "BatchedMesh";
			object.perObjectFrustumCulled = this.perObjectFrustumCulled;
			object.sortObjects = this.sortObjects;
			object.drawRanges = this._drawRanges;
			object.reservedRanges = this._reservedRanges;
			object.geometryInfo = this._geometryInfo.map((info) => ({
				...info,
				boundingBox: info.boundingBox ? info.boundingBox.toJSON() : void 0,
				boundingSphere: info.boundingSphere ? info.boundingSphere.toJSON() : void 0
			}));
			object.instanceInfo = this._instanceInfo.map((info) => ({ ...info }));
			object.availableInstanceIds = this._availableInstanceIds.slice();
			object.availableGeometryIds = this._availableGeometryIds.slice();
			object.nextIndexStart = this._nextIndexStart;
			object.nextVertexStart = this._nextVertexStart;
			object.geometryCount = this._geometryCount;
			object.maxInstanceCount = this._maxInstanceCount;
			object.maxVertexCount = this._maxVertexCount;
			object.maxIndexCount = this._maxIndexCount;
			object.geometryInitialized = this._geometryInitialized;
			object.matricesTexture = this._matricesTexture.toJSON(meta);
			object.indirectTexture = this._indirectTexture.toJSON(meta);
			if (this._colorsTexture !== null) object.colorsTexture = this._colorsTexture.toJSON(meta);
			if (this.boundingSphere !== null) object.boundingSphere = this.boundingSphere.toJSON();
			if (this.boundingBox !== null) object.boundingBox = this.boundingBox.toJSON();
		}
		function serialize(library, element) {
			if (library[element.uuid] === void 0) library[element.uuid] = element.toJSON(meta);
			return element.uuid;
		}
		if (this.isScene) {
			if (this.background) {
				if (this.background.isColor) object.background = this.background.toJSON();
				else if (this.background.isTexture) object.background = this.background.toJSON(meta).uuid;
			}
			if (this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== true) object.environment = this.environment.toJSON(meta).uuid;
		} else if (this.isMesh || this.isLine || this.isPoints) {
			object.geometry = serialize(meta.geometries, this.geometry);
			const parameters = this.geometry.parameters;
			if (parameters !== void 0 && parameters.shapes !== void 0) {
				const shapes = parameters.shapes;
				if (Array.isArray(shapes)) for (let i = 0, l = shapes.length; i < l; i++) {
					const shape = shapes[i];
					serialize(meta.shapes, shape);
				}
				else serialize(meta.shapes, shapes);
			}
		}
		if (this.isSkinnedMesh) {
			object.bindMode = this.bindMode;
			object.bindMatrix = this.bindMatrix.toArray();
			if (this.skeleton !== void 0) {
				serialize(meta.skeletons, this.skeleton);
				object.skeleton = this.skeleton.uuid;
			}
		}
		if (this.material !== void 0) {
			if (Array.isArray(this.material)) {
				const uuids = [];
				for (let i = 0, l = this.material.length; i < l; i++) uuids.push(serialize(meta.materials, this.material[i]));
				object.material = uuids;
			} else object.material = serialize(meta.materials, this.material);
		}
		if (this.children.length > 0) {
			object.children = [];
			for (let i = 0; i < this.children.length; i++) object.children.push(this.children[i].toJSON(meta).object);
		}
		if (this.animations.length > 0) {
			object.animations = [];
			for (let i = 0; i < this.animations.length; i++) {
				const animation = this.animations[i];
				object.animations.push(serialize(meta.animations, animation));
			}
		}
		if (isRootObject) {
			const geometries = extractFromCache(meta.geometries);
			const materials = extractFromCache(meta.materials);
			const textures = extractFromCache(meta.textures);
			const images = extractFromCache(meta.images);
			const shapes = extractFromCache(meta.shapes);
			const skeletons = extractFromCache(meta.skeletons);
			const animations = extractFromCache(meta.animations);
			const nodes = extractFromCache(meta.nodes);
			if (geometries.length > 0) output.geometries = geometries;
			if (materials.length > 0) output.materials = materials;
			if (textures.length > 0) output.textures = textures;
			if (images.length > 0) output.images = images;
			if (shapes.length > 0) output.shapes = shapes;
			if (skeletons.length > 0) output.skeletons = skeletons;
			if (animations.length > 0) output.animations = animations;
			if (nodes.length > 0) output.nodes = nodes;
		}
		output.object = object;
		return output;
		function extractFromCache(cache) {
			const values = [];
			for (const key in cache) {
				const data = cache[key];
				delete data.metadata;
				values.push(data);
			}
			return values;
		}
	}
	/**
	* Returns a new 3D object with copied values from this instance.
	*
	* @param {boolean} [recursive=true] - When set to `true`, descendants of the 3D object are also cloned.
	* @return {Object3D} A clone of this instance.
	*/
	clone(recursive) {
		return new this.constructor().copy(this, recursive);
	}
	/**
	* Copies the values of the given 3D object to this instance.
	*
	* @param {Object3D} source - The 3D object to copy.
	* @param {boolean} [recursive=true] - When set to `true`, descendants of the 3D object are cloned.
	* @return {Object3D} A reference to this instance.
	*/
	copy(source, recursive = true) {
		this.name = source.name;
		this.up.copy(source.up);
		this.position.copy(source.position);
		this.rotation.order = source.rotation.order;
		this.quaternion.copy(source.quaternion);
		this.scale.copy(source.scale);
		this.pivot = source.pivot !== null ? source.pivot.clone() : null;
		this.matrix.copy(source.matrix);
		this.matrixWorld.copy(source.matrixWorld);
		this.matrixAutoUpdate = source.matrixAutoUpdate;
		this.matrixWorldAutoUpdate = source.matrixWorldAutoUpdate;
		this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;
		this.layers.mask = source.layers.mask;
		this.visible = source.visible;
		this.castShadow = source.castShadow;
		this.receiveShadow = source.receiveShadow;
		this.frustumCulled = source.frustumCulled;
		this.renderOrder = source.renderOrder;
		this.static = source.static;
		this.animations = source.animations.slice();
		this.userData = JSON.parse(JSON.stringify(source.userData));
		if (recursive === true) for (let i = 0; i < source.children.length; i++) {
			const child = source.children[i];
			this.add(child.clone());
		}
		return this;
	}
	/**
	* Frees the GPU-related resources allocated by this instance. Call this
	* method whenever this instance is no longer used in your app.
	*
	* Geometries, materials and textures are potentially shared with other
	* 3D objects and must be disposed of separately.
	*
	* @fires Object3D#dispose
	*/
	dispose() {
		/**
		* Fires when the 3D object has been disposed of.
		*
		* @event Object3D#dispose
		* @type {Object}
		*/
		this.dispatchEvent({ type: "dispose" });
	}
};
/**
* The default up direction for objects, also used as the default
* position for {@link DirectionalLight} and {@link HemisphereLight}.
*
* @static
* @type {Vector3}
* @default (0,1,0)
*/
Object3D.DEFAULT_UP = /*@__PURE__*/ new Vector3(0, 1, 0);
/**
* The default setting for {@link Object3D#matrixAutoUpdate} for
* newly created 3D objects.
*
* @static
* @type {boolean}
* @default true
*/
Object3D.DEFAULT_MATRIX_AUTO_UPDATE = true;
/**
* The default setting for {@link Object3D#matrixWorldAutoUpdate} for
* newly created 3D objects.
*
* @static
* @type {boolean}
* @default true
*/
Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;
/**
* This is almost identical to an {@link Object3D}. Its purpose is to
* make working with groups of objects syntactically clearer.
*
* ```js
* // Create a group and add the two cubes.
* // These cubes can now be rotated / scaled etc as a group.
* const group = new THREE.Group();
*
* group.add( meshA );
* group.add( meshB );
*
* scene.add( group );
* ```
*
* @augments Object3D
*/
var Group = class extends Object3D {
	constructor() {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isGroup = true;
		this.type = "Group";
	}
};
const _colorKeywords = {
	"aliceblue": 15792383,
	"antiquewhite": 16444375,
	"aqua": 65535,
	"aquamarine": 8388564,
	"azure": 15794175,
	"beige": 16119260,
	"bisque": 16770244,
	"black": 0,
	"blanchedalmond": 16772045,
	"blue": 255,
	"blueviolet": 9055202,
	"brown": 10824234,
	"burlywood": 14596231,
	"cadetblue": 6266528,
	"chartreuse": 8388352,
	"chocolate": 13789470,
	"coral": 16744272,
	"cornflowerblue": 6591981,
	"cornsilk": 16775388,
	"crimson": 14423100,
	"cyan": 65535,
	"darkblue": 139,
	"darkcyan": 35723,
	"darkgoldenrod": 12092939,
	"darkgray": 11119017,
	"darkgreen": 25600,
	"darkgrey": 11119017,
	"darkkhaki": 12433259,
	"darkmagenta": 9109643,
	"darkolivegreen": 5597999,
	"darkorange": 16747520,
	"darkorchid": 10040012,
	"darkred": 9109504,
	"darksalmon": 15308410,
	"darkseagreen": 9419919,
	"darkslateblue": 4734347,
	"darkslategray": 3100495,
	"darkslategrey": 3100495,
	"darkturquoise": 52945,
	"darkviolet": 9699539,
	"deeppink": 16716947,
	"deepskyblue": 49151,
	"dimgray": 6908265,
	"dimgrey": 6908265,
	"dodgerblue": 2003199,
	"firebrick": 11674146,
	"floralwhite": 16775920,
	"forestgreen": 2263842,
	"fuchsia": 16711935,
	"gainsboro": 14474460,
	"ghostwhite": 16316671,
	"gold": 16766720,
	"goldenrod": 14329120,
	"gray": 8421504,
	"green": 32768,
	"greenyellow": 11403055,
	"grey": 8421504,
	"honeydew": 15794160,
	"hotpink": 16738740,
	"indianred": 13458524,
	"indigo": 4915330,
	"ivory": 16777200,
	"khaki": 15787660,
	"lavender": 15132410,
	"lavenderblush": 16773365,
	"lawngreen": 8190976,
	"lemonchiffon": 16775885,
	"lightblue": 11393254,
	"lightcoral": 15761536,
	"lightcyan": 14745599,
	"lightgoldenrodyellow": 16448210,
	"lightgray": 13882323,
	"lightgreen": 9498256,
	"lightgrey": 13882323,
	"lightpink": 16758465,
	"lightsalmon": 16752762,
	"lightseagreen": 2142890,
	"lightskyblue": 8900346,
	"lightslategray": 7833753,
	"lightslategrey": 7833753,
	"lightsteelblue": 11584734,
	"lightyellow": 16777184,
	"lime": 65280,
	"limegreen": 3329330,
	"linen": 16445670,
	"magenta": 16711935,
	"maroon": 8388608,
	"mediumaquamarine": 6737322,
	"mediumblue": 205,
	"mediumorchid": 12211667,
	"mediumpurple": 9662683,
	"mediumseagreen": 3978097,
	"mediumslateblue": 8087790,
	"mediumspringgreen": 64154,
	"mediumturquoise": 4772300,
	"mediumvioletred": 13047173,
	"midnightblue": 1644912,
	"mintcream": 16121850,
	"mistyrose": 16770273,
	"moccasin": 16770229,
	"navajowhite": 16768685,
	"navy": 128,
	"oldlace": 16643558,
	"olive": 8421376,
	"olivedrab": 7048739,
	"orange": 16753920,
	"orangered": 16729344,
	"orchid": 14315734,
	"palegoldenrod": 15657130,
	"palegreen": 10025880,
	"paleturquoise": 11529966,
	"palevioletred": 14381203,
	"papayawhip": 16773077,
	"peachpuff": 16767673,
	"peru": 13468991,
	"pink": 16761035,
	"plum": 14524637,
	"powderblue": 11591910,
	"purple": 8388736,
	"rebeccapurple": 6697881,
	"red": 16711680,
	"rosybrown": 12357519,
	"royalblue": 4286945,
	"saddlebrown": 9127187,
	"salmon": 16416882,
	"sandybrown": 16032864,
	"seagreen": 3050327,
	"seashell": 16774638,
	"sienna": 10506797,
	"silver": 12632256,
	"skyblue": 8900331,
	"slateblue": 6970061,
	"slategray": 7372944,
	"slategrey": 7372944,
	"snow": 16775930,
	"springgreen": 65407,
	"steelblue": 4620980,
	"tan": 13808780,
	"teal": 32896,
	"thistle": 14204888,
	"tomato": 16737095,
	"turquoise": 4251856,
	"violet": 15631086,
	"wheat": 16113331,
	"white": 16777215,
	"whitesmoke": 16119285,
	"yellow": 16776960,
	"yellowgreen": 10145074
};
const _hslA = {
	h: 0,
	s: 0,
	l: 0
};
const _hslB = {
	h: 0,
	s: 0,
	l: 0
};
function hue2rgb(p, q, t) {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
	return p;
}
/**
* A Color instance is represented by RGB components in the linear <i>working
* color space</i>, which defaults to `LinearSRGBColorSpace`. Inputs
* conventionally using `SRGBColorSpace` (such as hexadecimals and CSS
* strings) are converted to the working color space automatically.
*
* ```js
* // converted automatically from SRGBColorSpace to LinearSRGBColorSpace
* const color = new THREE.Color().setHex( 0x112233 );
* ```
* Source color spaces may be specified explicitly, to ensure correct conversions.
* ```js
* // assumed already LinearSRGBColorSpace; no conversion
* const color = new THREE.Color().setRGB( 0.5, 0.5, 0.5 );
*
* // converted explicitly from SRGBColorSpace to LinearSRGBColorSpace
* const color = new THREE.Color().setRGB( 0.5, 0.5, 0.5, SRGBColorSpace );
* ```
* If THREE.ColorManagement is disabled, no conversions occur. For details,
* see <i>Color management</i>. Iterating through a Color instance will yield
* its components (r, g, b) in the corresponding order. A Color can be initialised
* in any of the following ways:
* ```js
* //empty constructor - will default white
* const color1 = new THREE.Color();
*
* //Hexadecimal color (recommended)
* const color2 = new THREE.Color( 0xff0000 );
*
* //RGB string
* const color3 = new THREE.Color("rgb(255, 0, 0)");
* const color4 = new THREE.Color("rgb(100%, 0%, 0%)");
*
* //X11 color name - all 140 color names are supported.
* //Note the lack of CamelCase in the name
* const color5 = new THREE.Color( 'skyblue' );
* //HSL string
* const color6 = new THREE.Color("hsl(0, 100%, 50%)");
*
* //Separate RGB values between 0 and 1
* const color7 = new THREE.Color( 1, 0, 0 );
* ```
*/
var Color = class {
	/**
	* Constructs a new color.
	*
	* Note that standard method of specifying color in three.js is with a hexadecimal triplet,
	* and that method is used throughout the rest of the documentation.
	*
	* @param {(number|string|Color)} [r] - The red component of the color. If `g` and `b` are
	* not provided, it can be hexadecimal triplet, a CSS-style string or another `Color` instance.
	* @param {number} [g] - The green component.
	* @param {number} [b] - The blue component.
	*/
	constructor(r, g, b) {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isColor = true;
		/**
		* The red component.
		*
		* @type {number}
		* @default 1
		*/
		this.r = 1;
		/**
		* The green component.
		*
		* @type {number}
		* @default 1
		*/
		this.g = 1;
		/**
		* The blue component.
		*
		* @type {number}
		* @default 1
		*/
		this.b = 1;
		return this.set(r, g, b);
	}
	/**
	* Sets the colors's components from the given values.
	*
	* @param {(number|string|Color)} [r] - The red component of the color. If `g` and `b` are
	* not provided, it can be hexadecimal triplet, a CSS-style string or another `Color` instance.
	* @param {number} [g] - The green component.
	* @param {number} [b] - The blue component.
	* @return {Color} A reference to this color.
	*/
	set(r, g, b) {
		if (g === void 0 && b === void 0) {
			const value = r;
			if (value && value.isColor) this.copy(value);
			else if (typeof value === "number") this.setHex(value);
			else if (typeof value === "string") this.setStyle(value);
		} else this.setRGB(r, g, b);
		return this;
	}
	/**
	* Sets the colors's components to the given scalar value.
	*
	* @param {number} scalar - The scalar value.
	* @return {Color} A reference to this color.
	*/
	setScalar(scalar) {
		this.r = scalar;
		this.g = scalar;
		this.b = scalar;
		return this;
	}
	/**
	* Sets this color from a hexadecimal value.
	*
	* @param {number} hex - The hexadecimal value.
	* @param {string} [colorSpace=SRGBColorSpace] - The color space.
	* @return {Color} A reference to this color.
	*/
	setHex(hex, colorSpace = SRGBColorSpace) {
		hex = Math.floor(hex);
		this.r = (hex >> 16 & 255) / 255;
		this.g = (hex >> 8 & 255) / 255;
		this.b = (hex & 255) / 255;
		ColorManagement.colorSpaceToWorking(this, colorSpace);
		return this;
	}
	/**
	* Sets this color from RGB values.
	*
	* @param {number} r - Red channel value between `0.0` and `1.0`.
	* @param {number} g - Green channel value between `0.0` and `1.0`.
	* @param {number} b - Blue channel value between `0.0` and `1.0`.
	* @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
	* @return {Color} A reference to this color.
	*/
	setRGB(r, g, b, colorSpace = ColorManagement.workingColorSpace) {
		this.r = r;
		this.g = g;
		this.b = b;
		ColorManagement.colorSpaceToWorking(this, colorSpace);
		return this;
	}
	/**
	* Sets this color from RGB values.
	*
	* @param {number} h - Hue value between `0.0` and `1.0`.
	* @param {number} s - Saturation value between `0.0` and `1.0`.
	* @param {number} l - Lightness value between `0.0` and `1.0`.
	* @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
	* @return {Color} A reference to this color.
	*/
	setHSL(h, s, l, colorSpace = ColorManagement.workingColorSpace) {
		h = euclideanModulo(h, 1);
		s = clamp(s, 0, 1);
		l = clamp(l, 0, 1);
		if (s === 0) this.r = this.g = this.b = l;
		else {
			const p = l <= .5 ? l * (1 + s) : l + s - l * s;
			const q = 2 * l - p;
			this.r = hue2rgb(q, p, h + 1 / 3);
			this.g = hue2rgb(q, p, h);
			this.b = hue2rgb(q, p, h - 1 / 3);
		}
		ColorManagement.colorSpaceToWorking(this, colorSpace);
		return this;
	}
	/**
	* Sets this color from a CSS-style string. For example, `rgb(250, 0,0)`,
	* `rgb(100%, 0%, 0%)`, `hsl(0, 100%, 50%)`, `#ff0000`, `#f00`, or `red` ( or
	* any [X11 color name](https://en.wikipedia.org/wiki/X11_color_names#Color_name_chart) -
	* all 140 color names are supported).
	*
	* @param {string} style - Color as a CSS-style string.
	* @param {string} [colorSpace=SRGBColorSpace] - The color space.
	* @return {Color} A reference to this color.
	*/
	setStyle(style, colorSpace = SRGBColorSpace) {
		function handleAlpha(string) {
			if (string === void 0) return;
			if (parseFloat(string) < 1) warn("Color: Alpha component of " + style + " will be ignored.");
		}
		let m;
		if (m = /^(\w+)\(([^\)]*)\)/.exec(style)) {
			let color;
			const name = m[1];
			const components = m[2];
			switch (name) {
				case "rgb":
				case "rgba":
					if (color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
						handleAlpha(color[4]);
						return this.setRGB(Math.min(255, parseInt(color[1], 10)) / 255, Math.min(255, parseInt(color[2], 10)) / 255, Math.min(255, parseInt(color[3], 10)) / 255, colorSpace);
					}
					if (color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
						handleAlpha(color[4]);
						return this.setRGB(Math.min(100, parseInt(color[1], 10)) / 100, Math.min(100, parseInt(color[2], 10)) / 100, Math.min(100, parseInt(color[3], 10)) / 100, colorSpace);
					}
					break;
				case "hsl":
				case "hsla":
					if (color = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
						handleAlpha(color[4]);
						return this.setHSL(parseFloat(color[1]) / 360, parseFloat(color[2]) / 100, parseFloat(color[3]) / 100, colorSpace);
					}
					break;
				default: warn("Color: Unknown color model " + style);
			}
		} else if (m = /^\#([A-Fa-f\d]+)$/.exec(style)) {
			const hex = m[1];
			const size = hex.length;
			if (size === 3) return this.setRGB(parseInt(hex.charAt(0), 16) / 15, parseInt(hex.charAt(1), 16) / 15, parseInt(hex.charAt(2), 16) / 15, colorSpace);
			else if (size === 6) return this.setHex(parseInt(hex, 16), colorSpace);
			else warn("Color: Invalid hex color " + style);
		} else if (style && style.length > 0) return this.setColorName(style, colorSpace);
		return this;
	}
	/**
	* Sets this color from a color name. Faster than {@link Color#setStyle} if
	* you don't need the other CSS-style formats.
	*
	* For convenience, the list of names is exposed in `Color.NAMES` as a hash.
	* ```js
	* Color.NAMES.aliceblue // returns 0xF0F8FF
	* ```
	*
	* @param {string} style - The color name.
	* @param {string} [colorSpace=SRGBColorSpace] - The color space.
	* @return {Color} A reference to this color.
	*/
	setColorName(style, colorSpace = SRGBColorSpace) {
		const hex = _colorKeywords[style.toLowerCase()];
		if (hex !== void 0) this.setHex(hex, colorSpace);
		else warn("Color: Unknown color " + style);
		return this;
	}
	/**
	* Returns a new color with copied values from this instance.
	*
	* @return {Color} A clone of this instance.
	*/
	clone() {
		return new this.constructor(this.r, this.g, this.b);
	}
	/**
	* Copies the values of the given color to this instance.
	*
	* @param {Color} color - The color to copy.
	* @return {Color} A reference to this color.
	*/
	copy(color) {
		this.r = color.r;
		this.g = color.g;
		this.b = color.b;
		return this;
	}
	/**
	* Copies the given color into this color, and then converts this color from
	* `SRGBColorSpace` to `LinearSRGBColorSpace`.
	*
	* @param {Color} color - The color to copy/convert.
	* @return {Color} A reference to this color.
	*/
	copySRGBToLinear(color) {
		this.r = SRGBToLinear(color.r);
		this.g = SRGBToLinear(color.g);
		this.b = SRGBToLinear(color.b);
		return this;
	}
	/**
	* Copies the given color into this color, and then converts this color from
	* `LinearSRGBColorSpace` to `SRGBColorSpace`.
	*
	* @param {Color} color - The color to copy/convert.
	* @return {Color} A reference to this color.
	*/
	copyLinearToSRGB(color) {
		this.r = LinearToSRGB(color.r);
		this.g = LinearToSRGB(color.g);
		this.b = LinearToSRGB(color.b);
		return this;
	}
	/**
	* Converts this color from `SRGBColorSpace` to `LinearSRGBColorSpace`.
	*
	* @return {Color} A reference to this color.
	*/
	convertSRGBToLinear() {
		this.copySRGBToLinear(this);
		return this;
	}
	/**
	* Converts this color from `LinearSRGBColorSpace` to `SRGBColorSpace`.
	*
	* @return {Color} A reference to this color.
	*/
	convertLinearToSRGB() {
		this.copyLinearToSRGB(this);
		return this;
	}
	/**
	* Returns the hexadecimal value of this color.
	*
	* @param {string} [colorSpace=SRGBColorSpace] - The color space.
	* @return {number} The hexadecimal value.
	*/
	getHex(colorSpace = SRGBColorSpace) {
		ColorManagement.workingToColorSpace(_color.copy(this), colorSpace);
		return Math.round(clamp(_color.r * 255, 0, 255)) * 65536 + Math.round(clamp(_color.g * 255, 0, 255)) * 256 + Math.round(clamp(_color.b * 255, 0, 255));
	}
	/**
	* Returns the hexadecimal value of this color as a string (for example, 'FFFFFF').
	*
	* @param {string} [colorSpace=SRGBColorSpace] - The color space.
	* @return {string} The hexadecimal value as a string.
	*/
	getHexString(colorSpace = SRGBColorSpace) {
		return ("000000" + this.getHex(colorSpace).toString(16)).slice(-6);
	}
	/**
	* Converts the colors RGB values into the HSL format and stores them into the
	* given target object.
	*
	* @param {{h:number,s:number,l:number}} target - The target object that is used to store the method's result.
	* @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
	* @return {{h:number,s:number,l:number}} The HSL representation of this color.
	*/
	getHSL(target, colorSpace = ColorManagement.workingColorSpace) {
		ColorManagement.workingToColorSpace(_color.copy(this), colorSpace);
		const r = _color.r, g = _color.g, b = _color.b;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let hue, saturation;
		const lightness = (min + max) / 2;
		if (min === max) {
			hue = 0;
			saturation = 0;
		} else {
			const delta = max - min;
			saturation = lightness <= .5 ? delta / (max + min) : delta / (2 - max - min);
			switch (max) {
				case r:
					hue = (g - b) / delta + (g < b ? 6 : 0);
					break;
				case g:
					hue = (b - r) / delta + 2;
					break;
				case b: hue = (r - g) / delta + 4;
			}
			hue /= 6;
		}
		target.h = hue;
		target.s = saturation;
		target.l = lightness;
		return target;
	}
	/**
	* Returns the RGB values of this color and stores them into the given target object.
	*
	* @param {Color} target - The target color that is used to store the method's result.
	* @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
	* @return {Color} The RGB representation of this color.
	*/
	getRGB(target, colorSpace = ColorManagement.workingColorSpace) {
		ColorManagement.workingToColorSpace(_color.copy(this), colorSpace);
		target.r = _color.r;
		target.g = _color.g;
		target.b = _color.b;
		return target;
	}
	/**
	* Returns the value of this color as a CSS style string. Example: `rgb(255,0,0)`.
	*
	* @param {string} [colorSpace=SRGBColorSpace] - The color space.
	* @return {string} The CSS representation of this color.
	*/
	getStyle(colorSpace = SRGBColorSpace) {
		ColorManagement.workingToColorSpace(_color.copy(this), colorSpace);
		const r = _color.r, g = _color.g, b = _color.b;
		if (colorSpace !== "srgb") return `color(${colorSpace} ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)})`;
		return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
	}
	/**
	* Adds the given HSL values to this color's values.
	* Internally, this converts the color's RGB values to HSL, adds HSL
	* and then converts the color back to RGB.
	*
	* @param {number} h - Hue value between `0.0` and `1.0`.
	* @param {number} s - Saturation value between `0.0` and `1.0`.
	* @param {number} l - Lightness value between `0.0` and `1.0`.
	* @return {Color} A reference to this color.
	*/
	offsetHSL(h, s, l) {
		this.getHSL(_hslA);
		return this.setHSL(_hslA.h + h, _hslA.s + s, _hslA.l + l);
	}
	/**
	* Adds the RGB values of the given color to the RGB values of this color.
	*
	* @param {Color} color - The color to add.
	* @return {Color} A reference to this color.
	*/
	add(color) {
		this.r += color.r;
		this.g += color.g;
		this.b += color.b;
		return this;
	}
	/**
	* Adds the RGB values of the given colors and stores the result in this instance.
	*
	* @param {Color} color1 - The first color.
	* @param {Color} color2 - The second color.
	* @return {Color} A reference to this color.
	*/
	addColors(color1, color2) {
		this.r = color1.r + color2.r;
		this.g = color1.g + color2.g;
		this.b = color1.b + color2.b;
		return this;
	}
	/**
	* Adds the given scalar value to the RGB values of this color.
	*
	* @param {number} s - The scalar to add.
	* @return {Color} A reference to this color.
	*/
	addScalar(s) {
		this.r += s;
		this.g += s;
		this.b += s;
		return this;
	}
	/**
	* Subtracts the RGB values of the given color from the RGB values of this color.
	*
	* @param {Color} color - The color to subtract.
	* @return {Color} A reference to this color.
	*/
	sub(color) {
		this.r = Math.max(0, this.r - color.r);
		this.g = Math.max(0, this.g - color.g);
		this.b = Math.max(0, this.b - color.b);
		return this;
	}
	/**
	* Multiplies the RGB values of the given color with the RGB values of this color.
	*
	* @param {Color} color - The color to multiply.
	* @return {Color} A reference to this color.
	*/
	multiply(color) {
		this.r *= color.r;
		this.g *= color.g;
		this.b *= color.b;
		return this;
	}
	/**
	* Multiplies the given scalar value with the RGB values of this color.
	*
	* @param {number} s - The scalar to multiply.
	* @return {Color} A reference to this color.
	*/
	multiplyScalar(s) {
		this.r *= s;
		this.g *= s;
		this.b *= s;
		return this;
	}
	/**
	* Linearly interpolates this color's RGB values toward the RGB values of the
	* given color. The alpha argument can be thought of as the ratio between
	* the two colors, where `0.0` is this color and `1.0` is the first argument.
	*
	* @param {Color} color - The color to converge on.
	* @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
	* @return {Color} A reference to this color.
	*/
	lerp(color, alpha) {
		this.r += (color.r - this.r) * alpha;
		this.g += (color.g - this.g) * alpha;
		this.b += (color.b - this.b) * alpha;
		return this;
	}
	/**
	* Linearly interpolates between the given colors and stores the result in this instance.
	* The alpha argument can be thought of as the ratio between the two colors, where `0.0`
	* is the first and `1.0` is the second color.
	*
	* @param {Color} color1 - The first color.
	* @param {Color} color2 - The second color.
	* @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
	* @return {Color} A reference to this color.
	*/
	lerpColors(color1, color2, alpha) {
		this.r = color1.r + (color2.r - color1.r) * alpha;
		this.g = color1.g + (color2.g - color1.g) * alpha;
		this.b = color1.b + (color2.b - color1.b) * alpha;
		return this;
	}
	/**
	* Linearly interpolates this color's HSL values toward the HSL values of the
	* given color. It differs from {@link Color#lerp} by not interpolating straight
	* from one color to the other, but instead going through all the hues in between
	* those two colors. The alpha argument can be thought of as the ratio between
	* the two colors, where 0.0 is this color and 1.0 is the first argument.
	*
	* @param {Color} color - The color to converge on.
	* @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
	* @return {Color} A reference to this color.
	*/
	lerpHSL(color, alpha) {
		this.getHSL(_hslA);
		color.getHSL(_hslB);
		const h = lerp(_hslA.h, _hslB.h, alpha);
		const s = lerp(_hslA.s, _hslB.s, alpha);
		const l = lerp(_hslA.l, _hslB.l, alpha);
		this.setHSL(h, s, l);
		return this;
	}
	/**
	* Sets the color's RGB components from the given 3D vector.
	*
	* @param {Vector3} v - The vector to set.
	* @return {Color} A reference to this color.
	*/
	setFromVector3(v) {
		this.r = v.x;
		this.g = v.y;
		this.b = v.z;
		return this;
	}
	/**
	* Transforms this color with the given 3x3 matrix.
	*
	* @param {Matrix3} m - The matrix.
	* @return {Color} A reference to this color.
	*/
	applyMatrix3(m) {
		const r = this.r, g = this.g, b = this.b;
		const e = m.elements;
		this.r = e[0] * r + e[3] * g + e[6] * b;
		this.g = e[1] * r + e[4] * g + e[7] * b;
		this.b = e[2] * r + e[5] * g + e[8] * b;
		return this;
	}
	/**
	* Returns `true` if this color is equal with the given one.
	*
	* @param {Color} c - The color to test for equality.
	* @return {boolean} Whether this bounding color is equal with the given one.
	*/
	equals(c) {
		return c.r === this.r && c.g === this.g && c.b === this.b;
	}
	/**
	* Sets this color's RGB components from the given array.
	*
	* @param {Array<number>} array - An array holding the RGB values.
	* @param {number} [offset=0] - The offset into the array.
	* @return {Color} A reference to this color.
	*/
	fromArray(array, offset = 0) {
		this.r = array[offset];
		this.g = array[offset + 1];
		this.b = array[offset + 2];
		return this;
	}
	/**
	* Writes the RGB components of this color to the given array. If no array is provided,
	* the method returns a new instance.
	*
	* @param {Array<number>} [array=[]] - The target array holding the color components.
	* @param {number} [offset=0] - Index of the first element in the array.
	* @return {Array<number>} The color components.
	*/
	toArray(array = [], offset = 0) {
		array[offset] = this.r;
		array[offset + 1] = this.g;
		array[offset + 2] = this.b;
		return array;
	}
	/**
	* Sets the components of this color from the given buffer attribute.
	*
	* @param {BufferAttribute} attribute - The buffer attribute holding color data.
	* @param {number} index - The index into the attribute.
	* @return {Color} A reference to this color.
	*/
	fromBufferAttribute(attribute, index) {
		this.r = attribute.getX(index);
		this.g = attribute.getY(index);
		this.b = attribute.getZ(index);
		return this;
	}
	/**
	* This methods defines the serialization result of this class. Returns the color
	* as a hexadecimal value.
	*
	* @return {number} The hexadecimal value.
	*/
	toJSON() {
		return this.getHex();
	}
	*[Symbol.iterator]() {
		yield this.r;
		yield this.g;
		yield this.b;
	}
};
const _color = /*@__PURE__*/ new Color();
/**
* A dictionary with X11 color names.
*
* Note that multiple words such as Dark Orange become the string 'darkorange'.
*
* @static
* @type {Object}
*/
Color.NAMES = _colorKeywords;
const _v0$2 = /*@__PURE__*/ new Vector3();
const _v1$5 = /*@__PURE__*/ new Vector3();
const _v2$4 = /*@__PURE__*/ new Vector3();
const _v3$2 = /*@__PURE__*/ new Vector3();
const _vab = /*@__PURE__*/ new Vector3();
const _vac = /*@__PURE__*/ new Vector3();
const _vbc = /*@__PURE__*/ new Vector3();
const _vap = /*@__PURE__*/ new Vector3();
const _vbp = /*@__PURE__*/ new Vector3();
const _vcp = /*@__PURE__*/ new Vector3();
const _v40 = /*@__PURE__*/ new Vector4();
const _v41 = /*@__PURE__*/ new Vector4();
const _v42 = /*@__PURE__*/ new Vector4();
/**
* A geometric triangle as defined by three vectors representing its three corners.
*/
var Triangle = class Triangle {
	/**
	* Constructs a new triangle.
	*
	* @param {Vector3} [a=(0,0,0)] - The first corner of the triangle.
	* @param {Vector3} [b=(0,0,0)] - The second corner of the triangle.
	* @param {Vector3} [c=(0,0,0)] - The third corner of the triangle.
	*/
	constructor(a = new Vector3(), b = new Vector3(), c = new Vector3()) {
		/**
		* The first corner of the triangle.
		*
		* @type {Vector3}
		*/
		this.a = a;
		/**
		* The second corner of the triangle.
		*
		* @type {Vector3}
		*/
		this.b = b;
		/**
		* The third corner of the triangle.
		*
		* @type {Vector3}
		*/
		this.c = c;
	}
	/**
	* Computes the normal vector of a triangle.
	*
	* @param {Vector3} a - The first corner of the triangle.
	* @param {Vector3} b - The second corner of the triangle.
	* @param {Vector3} c - The third corner of the triangle.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} The triangle's normal.
	*/
	static getNormal(a, b, c, target) {
		target.subVectors(c, b);
		_v0$2.subVectors(a, b);
		target.cross(_v0$2);
		const targetLengthSq = target.lengthSq();
		if (targetLengthSq > 0) return target.multiplyScalar(1 / Math.sqrt(targetLengthSq));
		return target.set(0, 0, 0);
	}
	/**
	* Computes a barycentric coordinates from the given vector.
	* Returns `null` if the triangle is degenerate.
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Vector3} a - The first corner of the triangle.
	* @param {Vector3} b - The second corner of the triangle.
	* @param {Vector3} c - The third corner of the triangle.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {?Vector3} The barycentric coordinates for the given point
	*/
	static getBarycoord(point, a, b, c, target) {
		_v0$2.subVectors(c, a);
		_v1$5.subVectors(b, a);
		_v2$4.subVectors(point, a);
		const dot00 = _v0$2.dot(_v0$2);
		const dot01 = _v0$2.dot(_v1$5);
		const dot02 = _v0$2.dot(_v2$4);
		const dot11 = _v1$5.dot(_v1$5);
		const dot12 = _v1$5.dot(_v2$4);
		const denom = dot00 * dot11 - dot01 * dot01;
		if (denom === 0) {
			target.set(0, 0, 0);
			return null;
		}
		const invDenom = 1 / denom;
		const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		return target.set(1 - u - v, v, u);
	}
	/**
	* Returns `true` if the given point, when projected onto the plane of the
	* triangle, lies within the triangle.
	*
	* @param {Vector3} point - The point in 3D space to test.
	* @param {Vector3} a - The first corner of the triangle.
	* @param {Vector3} b - The second corner of the triangle.
	* @param {Vector3} c - The third corner of the triangle.
	* @return {boolean} Whether the given point, when projected onto the plane of the
	* triangle, lies within the triangle or not.
	*/
	static containsPoint(point, a, b, c) {
		if (this.getBarycoord(point, a, b, c, _v3$2) === null) return false;
		return _v3$2.x >= 0 && _v3$2.y >= 0 && _v3$2.x + _v3$2.y <= 1;
	}
	/**
	* Computes the value barycentrically interpolated for the given point on the
	* triangle. Returns `null` if the triangle is degenerate.
	*
	* @param {Vector3} point - Position of interpolated point.
	* @param {Vector3} p1 - The first corner of the triangle.
	* @param {Vector3} p2 - The second corner of the triangle.
	* @param {Vector3} p3 - The third corner of the triangle.
	* @param {Vector3} v1 - Value to interpolate of first vertex.
	* @param {Vector3} v2 - Value to interpolate of second vertex.
	* @param {Vector3} v3 - Value to interpolate of third vertex.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {?Vector3} The interpolated value.
	*/
	static getInterpolation(point, p1, p2, p3, v1, v2, v3, target) {
		if (this.getBarycoord(point, p1, p2, p3, _v3$2) === null) {
			target.x = 0;
			target.y = 0;
			if ("z" in target) target.z = 0;
			if ("w" in target) target.w = 0;
			return null;
		}
		target.setScalar(0);
		target.addScaledVector(v1, _v3$2.x);
		target.addScaledVector(v2, _v3$2.y);
		target.addScaledVector(v3, _v3$2.z);
		return target;
	}
	/**
	* Computes the value barycentrically interpolated for the given attribute and indices.
	*
	* @param {BufferAttribute} attr - The attribute to interpolate.
	* @param {number} i1 - Index of first vertex.
	* @param {number} i2 - Index of second vertex.
	* @param {number} i3 - Index of third vertex.
	* @param {Vector3} barycoord - The barycoordinate value to use to interpolate.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} The interpolated attribute value.
	*/
	static getInterpolatedAttribute(attr, i1, i2, i3, barycoord, target) {
		_v40.setScalar(0);
		_v41.setScalar(0);
		_v42.setScalar(0);
		_v40.fromBufferAttribute(attr, i1);
		_v41.fromBufferAttribute(attr, i2);
		_v42.fromBufferAttribute(attr, i3);
		target.setScalar(0);
		target.addScaledVector(_v40, barycoord.x);
		target.addScaledVector(_v41, barycoord.y);
		target.addScaledVector(_v42, barycoord.z);
		return target;
	}
	/**
	* Returns `true` if the triangle is oriented towards the given direction.
	*
	* @param {Vector3} a - The first corner of the triangle.
	* @param {Vector3} b - The second corner of the triangle.
	* @param {Vector3} c - The third corner of the triangle.
	* @param {Vector3} direction - The (normalized) direction vector.
	* @return {boolean} Whether the triangle is oriented towards the given direction or not.
	*/
	static isFrontFacing(a, b, c, direction) {
		_v0$2.subVectors(c, b);
		_v1$5.subVectors(a, b);
		return _v0$2.cross(_v1$5).dot(direction) < 0;
	}
	/**
	* Sets the triangle's vertices by copying the given values.
	*
	* @param {Vector3} a - The first corner of the triangle.
	* @param {Vector3} b - The second corner of the triangle.
	* @param {Vector3} c - The third corner of the triangle.
	* @return {Triangle} A reference to this triangle.
	*/
	set(a, b, c) {
		this.a.copy(a);
		this.b.copy(b);
		this.c.copy(c);
		return this;
	}
	/**
	* Sets the triangle's vertices by copying the given array values.
	*
	* @param {Array<Vector3>} points - An array with 3D points.
	* @param {number} i0 - The array index representing the first corner of the triangle.
	* @param {number} i1 - The array index representing the second corner of the triangle.
	* @param {number} i2 - The array index representing the third corner of the triangle.
	* @return {Triangle} A reference to this triangle.
	*/
	setFromPointsAndIndices(points, i0, i1, i2) {
		this.a.copy(points[i0]);
		this.b.copy(points[i1]);
		this.c.copy(points[i2]);
		return this;
	}
	/**
	* Sets the triangle's vertices by copying the given attribute values.
	*
	* @param {BufferAttribute} attribute - A buffer attribute with 3D points data.
	* @param {number} i0 - The attribute index representing the first corner of the triangle.
	* @param {number} i1 - The attribute index representing the second corner of the triangle.
	* @param {number} i2 - The attribute index representing the third corner of the triangle.
	* @return {Triangle} A reference to this triangle.
	*/
	setFromAttributeAndIndices(attribute, i0, i1, i2) {
		this.a.fromBufferAttribute(attribute, i0);
		this.b.fromBufferAttribute(attribute, i1);
		this.c.fromBufferAttribute(attribute, i2);
		return this;
	}
	/**
	* Returns a new triangle with copied values from this instance.
	*
	* @return {Triangle} A clone of this instance.
	*/
	clone() {
		return new this.constructor().copy(this);
	}
	/**
	* Copies the values of the given triangle to this instance.
	*
	* @param {Triangle} triangle - The triangle to copy.
	* @return {Triangle} A reference to this triangle.
	*/
	copy(triangle) {
		this.a.copy(triangle.a);
		this.b.copy(triangle.b);
		this.c.copy(triangle.c);
		return this;
	}
	/**
	* Computes the area of the triangle.
	*
	* @return {number} The triangle's area.
	*/
	getArea() {
		_v0$2.subVectors(this.c, this.b);
		_v1$5.subVectors(this.a, this.b);
		return _v0$2.cross(_v1$5).length() * .5;
	}
	/**
	* Computes the midpoint of the triangle.
	*
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} The triangle's midpoint.
	*/
	getMidpoint(target) {
		return target.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
	}
	/**
	* Computes the normal of the triangle.
	*
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} The triangle's normal.
	*/
	getNormal(target) {
		return Triangle.getNormal(this.a, this.b, this.c, target);
	}
	/**
	* Computes a plane the triangle lies within.
	*
	* @param {Plane} target - The target vector that is used to store the method's result.
	* @return {Plane} The plane the triangle lies within.
	*/
	getPlane(target) {
		return target.setFromCoplanarPoints(this.a, this.b, this.c);
	}
	/**
	* Computes a barycentric coordinates from the given vector.
	* Returns `null` if the triangle is degenerate.
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {?Vector3} The barycentric coordinates for the given point
	*/
	getBarycoord(point, target) {
		return Triangle.getBarycoord(point, this.a, this.b, this.c, target);
	}
	/**
	* Computes the value barycentrically interpolated for the given point on the
	* triangle. Returns `null` if the triangle is degenerate.
	*
	* @param {Vector3} point - Position of interpolated point.
	* @param {Vector3} v1 - Value to interpolate of first vertex.
	* @param {Vector3} v2 - Value to interpolate of second vertex.
	* @param {Vector3} v3 - Value to interpolate of third vertex.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {?Vector3} The interpolated value.
	*/
	getInterpolation(point, v1, v2, v3, target) {
		return Triangle.getInterpolation(point, this.a, this.b, this.c, v1, v2, v3, target);
	}
	/**
	* Returns `true` if the given point, when projected onto the plane of the
	* triangle, lies within the triangle.
	*
	* @param {Vector3} point - The point in 3D space to test.
	* @return {boolean} Whether the given point, when projected onto the plane of the
	* triangle, lies within the triangle or not.
	*/
	containsPoint(point) {
		return Triangle.containsPoint(point, this.a, this.b, this.c);
	}
	/**
	* Returns `true` if the triangle is oriented towards the given direction.
	*
	* @param {Vector3} direction - The (normalized) direction vector.
	* @return {boolean} Whether the triangle is oriented towards the given direction or not.
	*/
	isFrontFacing(direction) {
		return Triangle.isFrontFacing(this.a, this.b, this.c, direction);
	}
	/**
	* Returns `true` if this triangle intersects with the given box.
	*
	* @param {Box3} box - The box to intersect.
	* @return {boolean} Whether this triangle intersects with the given box or not.
	*/
	intersectsBox(box) {
		return box.intersectsTriangle(this);
	}
	/**
	* Returns the closest point on the triangle to the given point.
	*
	* @param {Vector3} p - The point to compute the closest point for.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} The closest point on the triangle.
	*/
	closestPointToPoint(p, target) {
		const a = this.a, b = this.b, c = this.c;
		let v, w;
		_vab.subVectors(b, a);
		_vac.subVectors(c, a);
		_vap.subVectors(p, a);
		const d1 = _vab.dot(_vap);
		const d2 = _vac.dot(_vap);
		if (d1 <= 0 && d2 <= 0) return target.copy(a);
		_vbp.subVectors(p, b);
		const d3 = _vab.dot(_vbp);
		const d4 = _vac.dot(_vbp);
		if (d3 >= 0 && d4 <= d3) return target.copy(b);
		const vc = d1 * d4 - d3 * d2;
		if (vc <= 0 && d1 >= 0 && d3 <= 0) {
			v = d1 / (d1 - d3);
			return target.copy(a).addScaledVector(_vab, v);
		}
		_vcp.subVectors(p, c);
		const d5 = _vab.dot(_vcp);
		const d6 = _vac.dot(_vcp);
		if (d6 >= 0 && d5 <= d6) return target.copy(c);
		const vb = d5 * d2 - d1 * d6;
		if (vb <= 0 && d2 >= 0 && d6 <= 0) {
			w = d2 / (d2 - d6);
			return target.copy(a).addScaledVector(_vac, w);
		}
		const va = d3 * d6 - d5 * d4;
		if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
			_vbc.subVectors(c, b);
			w = (d4 - d3) / (d4 - d3 + (d5 - d6));
			return target.copy(b).addScaledVector(_vbc, w);
		}
		const denom = 1 / (va + vb + vc);
		v = vb * denom;
		w = vc * denom;
		return target.copy(a).addScaledVector(_vab, v).addScaledVector(_vac, w);
	}
	/**
	* Returns `true` if this triangle is equal with the given one.
	*
	* @param {Triangle} triangle - The triangle to test for equality.
	* @return {boolean} Whether this triangle is equal with the given one.
	*/
	equals(triangle) {
		return triangle.a.equals(this.a) && triangle.b.equals(this.b) && triangle.c.equals(this.c);
	}
};
/**
* Represents an axis-aligned bounding box (AABB) in 3D space.
*/
var Box3 = class {
	/**
	* Constructs a new bounding box.
	*
	* @param {Vector3} [min=(Infinity,Infinity,Infinity)] - A vector representing the lower boundary of the box.
	* @param {Vector3} [max=(-Infinity,-Infinity,-Infinity)] - A vector representing the upper boundary of the box.
	*/
	constructor(min = new Vector3(Infinity, Infinity, Infinity), max = new Vector3(-Infinity, -Infinity, -Infinity)) {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isBox3 = true;
		/**
		* The lower boundary of the box.
		*
		* @type {Vector3}
		*/
		this.min = min;
		/**
		* The upper boundary of the box.
		*
		* @type {Vector3}
		*/
		this.max = max;
	}
	/**
	* Sets the lower and upper boundaries of this box.
	* Please note that this method only copies the values from the given objects.
	*
	* @param {Vector3} min - The lower boundary of the box.
	* @param {Vector3} max - The upper boundary of the box.
	* @return {Box3} A reference to this bounding box.
	*/
	set(min, max) {
		this.min.copy(min);
		this.max.copy(max);
		return this;
	}
	/**
	* Sets the upper and lower bounds of this box so it encloses the position data
	* in the given array.
	*
	* @param {Array<number>} array - An array holding 3D position data.
	* @return {Box3} A reference to this bounding box.
	*/
	setFromArray(array) {
		this.makeEmpty();
		for (let i = 0, il = array.length; i < il; i += 3) this.expandByPoint(_vector$b.fromArray(array, i));
		return this;
	}
	/**
	* Sets the upper and lower bounds of this box so it encloses the position data
	* in the given buffer attribute.
	*
	* @param {BufferAttribute} attribute - A buffer attribute holding 3D position data.
	* @return {Box3} A reference to this bounding box.
	*/
	setFromBufferAttribute(attribute) {
		this.makeEmpty();
		for (let i = 0, il = attribute.count; i < il; i++) this.expandByPoint(_vector$b.fromBufferAttribute(attribute, i));
		return this;
	}
	/**
	* Sets the upper and lower bounds of this box so it encloses the position data
	* in the given array.
	*
	* @param {Array<Vector3>} points - An array holding 3D position data as instances of {@link Vector3}.
	* @return {Box3} A reference to this bounding box.
	*/
	setFromPoints(points) {
		this.makeEmpty();
		for (let i = 0, il = points.length; i < il; i++) this.expandByPoint(points[i]);
		return this;
	}
	/**
	* Centers this box on the given center vector and sets this box's width, height and
	* depth to the given size values.
	*
	* @param {Vector3} center - The center of the box.
	* @param {Vector3} size - The x, y and z dimensions of the box.
	* @return {Box3} A reference to this bounding box.
	*/
	setFromCenterAndSize(center, size) {
		const halfSize = _vector$b.copy(size).multiplyScalar(.5);
		this.min.copy(center).sub(halfSize);
		this.max.copy(center).add(halfSize);
		return this;
	}
	/**
	* Computes the world-axis-aligned bounding box for the given 3D object
	* (including its children), accounting for the object's, and children's,
	* world transforms. The function may result in a larger box than strictly necessary.
	*
	* Note: To compute the correct bounding box, make sure the given 3D object
	* has an up-to-date world matrix that reflects the current transformation of its
	* ancestor nodes. Call `object.updateWorldMatrix( true, false )` beforehand if
	* you're unsure.
	*
	* @param {Object3D} object - The 3D object to compute the bounding box for.
	* @param {boolean} [precise=false] - If set to `true`, the method computes the smallest
	* world-axis-aligned bounding box at the expense of more computation.
	* @return {Box3} A reference to this bounding box.
	*/
	setFromObject(object, precise = false) {
		this.makeEmpty();
		return this.expandByObject(object, precise);
	}
	/**
	* Returns a new box with copied values from this instance.
	*
	* @return {Box3} A clone of this instance.
	*/
	clone() {
		return new this.constructor().copy(this);
	}
	/**
	* Copies the values of the given box to this instance.
	*
	* @param {Box3} box - The box to copy.
	* @return {Box3} A reference to this bounding box.
	*/
	copy(box) {
		this.min.copy(box.min);
		this.max.copy(box.max);
		return this;
	}
	/**
	* Makes this box empty which means in encloses a zero space in 3D.
	*
	* @return {Box3} A reference to this bounding box.
	*/
	makeEmpty() {
		this.min.x = this.min.y = this.min.z = Infinity;
		this.max.x = this.max.y = this.max.z = -Infinity;
		return this;
	}
	/**
	* Returns true if this box includes zero points within its bounds.
	* Note that a box with equal lower and upper bounds still includes one
	* point, the one both bounds share.
	*
	* @return {boolean} Whether this box is empty or not.
	*/
	isEmpty() {
		return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
	}
	/**
	* Returns the center point of this box.
	*
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} The center point.
	*/
	getCenter(target) {
		return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(.5);
	}
	/**
	* Returns the dimensions of this box.
	*
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} The size.
	*/
	getSize(target) {
		return this.isEmpty() ? target.set(0, 0, 0) : target.subVectors(this.max, this.min);
	}
	/**
	* Expands the boundaries of this box to include the given point.
	*
	* @param {Vector3} point - The point that should be included by the bounding box.
	* @return {Box3} A reference to this bounding box.
	*/
	expandByPoint(point) {
		this.min.min(point);
		this.max.max(point);
		return this;
	}
	/**
	* Expands this box equilaterally by the given vector. The width of this
	* box will be expanded by the x component of the vector in both
	* directions. The height of this box will be expanded by the y component of
	* the vector in both directions. The depth of this box will be
	* expanded by the z component of the vector in both directions.
	*
	* @param {Vector3} vector - The vector that should expand the bounding box.
	* @return {Box3} A reference to this bounding box.
	*/
	expandByVector(vector) {
		this.min.sub(vector);
		this.max.add(vector);
		return this;
	}
	/**
	* Expands each dimension of the box by the given scalar. If negative, the
	* dimensions of the box will be contracted.
	*
	* @param {number} scalar - The scalar value that should expand the bounding box.
	* @return {Box3} A reference to this bounding box.
	*/
	expandByScalar(scalar) {
		this.min.addScalar(-scalar);
		this.max.addScalar(scalar);
		return this;
	}
	/**
	* Expands the boundaries of this box to include the given 3D object and
	* its children, accounting for the object's, and children's, world
	* transforms. The function may result in a larger box than strictly
	* necessary (unless the precise parameter is set to true).
	*
	* @param {Object3D} object - The 3D object that should expand the bounding box.
	* @param {boolean} precise - If set to `true`, the method expands the bounding box
	* as little as necessary at the expense of more computation.
	* @return {Box3} A reference to this bounding box.
	*/
	expandByObject(object, precise = false) {
		object.updateWorldMatrix(false, false);
		const geometry = object.geometry;
		if (geometry !== void 0) {
			const positionAttribute = geometry.getAttribute("position");
			if (precise === true && positionAttribute !== void 0 && object.isInstancedMesh !== true) for (let i = 0, l = positionAttribute.count; i < l; i++) {
				if (object.isMesh === true) object.getVertexPosition(i, _vector$b);
				else _vector$b.fromBufferAttribute(positionAttribute, i);
				_vector$b.applyMatrix4(object.matrixWorld);
				this.expandByPoint(_vector$b);
			}
			else {
				if (object.boundingBox !== void 0) {
					if (object.boundingBox === null) object.computeBoundingBox();
					_box$4.copy(object.boundingBox);
				} else {
					if (geometry.boundingBox === null) geometry.computeBoundingBox();
					_box$4.copy(geometry.boundingBox);
				}
				_box$4.applyMatrix4(object.matrixWorld);
				this.union(_box$4);
			}
		}
		const children = object.children;
		for (let i = 0, l = children.length; i < l; i++) this.expandByObject(children[i], precise);
		return this;
	}
	/**
	* Returns `true` if the given point lies within or on the boundaries of this box.
	*
	* @param {Vector3} point - The point to test.
	* @return {boolean} Whether the bounding box contains the given point or not.
	*/
	containsPoint(point) {
		return point.x >= this.min.x && point.x <= this.max.x && point.y >= this.min.y && point.y <= this.max.y && point.z >= this.min.z && point.z <= this.max.z;
	}
	/**
	* Returns `true` if this bounding box includes the entirety of the given bounding box.
	* If this box and the given one are identical, this function also returns `true`.
	*
	* @param {Box3} box - The bounding box to test.
	* @return {boolean} Whether the bounding box contains the given bounding box or not.
	*/
	containsBox(box) {
		return this.min.x <= box.min.x && box.max.x <= this.max.x && this.min.y <= box.min.y && box.max.y <= this.max.y && this.min.z <= box.min.z && box.max.z <= this.max.z;
	}
	/**
	* Returns a point as a proportion of this box's width, height and depth.
	*
	* @param {Vector3} point - A point in 3D space.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} A point as a proportion of this box's width, height and depth.
	*/
	getParameter(point, target) {
		return target.set((point.x - this.min.x) / (this.max.x - this.min.x), (point.y - this.min.y) / (this.max.y - this.min.y), (point.z - this.min.z) / (this.max.z - this.min.z));
	}
	/**
	* Returns `true` if the given bounding box intersects with this bounding box.
	*
	* @param {Box3} box - The bounding box to test.
	* @return {boolean} Whether the given bounding box intersects with this bounding box.
	*/
	intersectsBox(box) {
		return box.max.x >= this.min.x && box.min.x <= this.max.x && box.max.y >= this.min.y && box.min.y <= this.max.y && box.max.z >= this.min.z && box.min.z <= this.max.z;
	}
	/**
	* Returns `true` if the given bounding sphere intersects with this bounding box.
	*
	* @param {Sphere} sphere - The bounding sphere to test.
	* @return {boolean} Whether the given bounding sphere intersects with this bounding box.
	*/
	intersectsSphere(sphere) {
		this.clampPoint(sphere.center, _vector$b);
		return _vector$b.distanceToSquared(sphere.center) <= sphere.radius * sphere.radius;
	}
	/**
	* Returns `true` if the given plane intersects with this bounding box.
	*
	* @param {Plane} plane - The plane to test.
	* @return {boolean} Whether the given plane intersects with this bounding box.
	*/
	intersectsPlane(plane) {
		let min, max;
		if (plane.normal.x > 0) {
			min = plane.normal.x * this.min.x;
			max = plane.normal.x * this.max.x;
		} else {
			min = plane.normal.x * this.max.x;
			max = plane.normal.x * this.min.x;
		}
		if (plane.normal.y > 0) {
			min += plane.normal.y * this.min.y;
			max += plane.normal.y * this.max.y;
		} else {
			min += plane.normal.y * this.max.y;
			max += plane.normal.y * this.min.y;
		}
		if (plane.normal.z > 0) {
			min += plane.normal.z * this.min.z;
			max += plane.normal.z * this.max.z;
		} else {
			min += plane.normal.z * this.max.z;
			max += plane.normal.z * this.min.z;
		}
		return min <= -plane.constant && max >= -plane.constant;
	}
	/**
	* Returns `true` if the given triangle intersects with this bounding box.
	*
	* @param {Triangle} triangle - The triangle to test.
	* @return {boolean} Whether the given triangle intersects with this bounding box.
	*/
	intersectsTriangle(triangle) {
		if (this.isEmpty()) return false;
		this.getCenter(_center);
		_extents.subVectors(this.max, _center);
		_v0$1.subVectors(triangle.a, _center);
		_v1$4.subVectors(triangle.b, _center);
		_v2$3.subVectors(triangle.c, _center);
		_f0.subVectors(_v1$4, _v0$1);
		_f1.subVectors(_v2$3, _v1$4);
		_f2.subVectors(_v0$1, _v2$3);
		let axes = [
			0,
			-_f0.z,
			_f0.y,
			0,
			-_f1.z,
			_f1.y,
			0,
			-_f2.z,
			_f2.y,
			_f0.z,
			0,
			-_f0.x,
			_f1.z,
			0,
			-_f1.x,
			_f2.z,
			0,
			-_f2.x,
			-_f0.y,
			_f0.x,
			0,
			-_f1.y,
			_f1.x,
			0,
			-_f2.y,
			_f2.x,
			0
		];
		if (!satForAxes(axes, _v0$1, _v1$4, _v2$3, _extents)) return false;
		axes = [
			1,
			0,
			0,
			0,
			1,
			0,
			0,
			0,
			1
		];
		if (!satForAxes(axes, _v0$1, _v1$4, _v2$3, _extents)) return false;
		_triangleNormal.crossVectors(_f0, _f1);
		axes = [
			_triangleNormal.x,
			_triangleNormal.y,
			_triangleNormal.z
		];
		return satForAxes(axes, _v0$1, _v1$4, _v2$3, _extents);
	}
	/**
	* Clamps the given point within the bounds of this box.
	*
	* @param {Vector3} point - The point to clamp.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} The clamped point.
	*/
	clampPoint(point, target) {
		return target.copy(point).clamp(this.min, this.max);
	}
	/**
	* Returns the euclidean distance from any edge of this box to the specified point. If
	* the given point lies inside of this box, the distance will be `0`.
	*
	* @param {Vector3} point - The point to compute the distance to.
	* @return {number} The euclidean distance.
	*/
	distanceToPoint(point) {
		return this.clampPoint(point, _vector$b).distanceTo(point);
	}
	/**
	* Returns a bounding sphere that encloses this bounding box.
	*
	* @param {Sphere} target - The target sphere that is used to store the method's result.
	* @return {Sphere} The bounding sphere that encloses this bounding box.
	*/
	getBoundingSphere(target) {
		if (this.isEmpty()) target.makeEmpty();
		else {
			this.getCenter(target.center);
			target.radius = this.getSize(_vector$b).length() * .5;
		}
		return target;
	}
	/**
	* Computes the intersection of this bounding box and the given one, setting the upper
	* bound of this box to the lesser of the two boxes' upper bounds and the
	* lower bound of this box to the greater of the two boxes' lower bounds. If
	* there's no overlap, makes this box empty.
	*
	* @param {Box3} box - The bounding box to intersect with.
	* @return {Box3} A reference to this bounding box.
	*/
	intersect(box) {
		this.min.max(box.min);
		this.max.min(box.max);
		if (this.isEmpty()) this.makeEmpty();
		return this;
	}
	/**
	* Computes the union of this box and another and the given one, setting the upper
	* bound of this box to the greater of the two boxes' upper bounds and the
	* lower bound of this box to the lesser of the two boxes' lower bounds.
	*
	* @param {Box3} box - The bounding box that will be unioned with this instance.
	* @return {Box3} A reference to this bounding box.
	*/
	union(box) {
		this.min.min(box.min);
		this.max.max(box.max);
		return this;
	}
	/**
	* Transforms this bounding box by the given 4x4 transformation matrix.
	*
	* @param {Matrix4} matrix - The transformation matrix.
	* @return {Box3} A reference to this bounding box.
	*/
	applyMatrix4(matrix) {
		if (this.isEmpty()) return this;
		_points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix);
		_points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix);
		_points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix);
		_points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix);
		_points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix);
		_points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix);
		_points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix);
		_points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix);
		this.setFromPoints(_points);
		return this;
	}
	/**
	* Adds the given offset to both the upper and lower bounds of this bounding box,
	* effectively moving it in 3D space.
	*
	* @param {Vector3} offset - The offset that should be used to translate the bounding box.
	* @return {Box3} A reference to this bounding box.
	*/
	translate(offset) {
		this.min.add(offset);
		this.max.add(offset);
		return this;
	}
	/**
	* Returns `true` if this bounding box is equal with the given one.
	*
	* @param {Box3} box - The box to test for equality.
	* @return {boolean} Whether this bounding box is equal with the given one.
	*/
	equals(box) {
		return box.min.equals(this.min) && box.max.equals(this.max);
	}
	/**
	* Returns a serialized structure of the bounding box.
	*
	* @return {Object} Serialized structure with fields representing the object state.
	*/
	toJSON() {
		return {
			min: this.min.toArray(),
			max: this.max.toArray()
		};
	}
	/**
	* Returns a serialized structure of the bounding box.
	*
	* @param {Object} json - The serialized json to set the box from.
	* @return {Box3} A reference to this bounding box.
	*/
	fromJSON(json) {
		this.min.fromArray(json.min);
		this.max.fromArray(json.max);
		return this;
	}
};
const _points = [
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3(),
	/*@__PURE__*/ new Vector3()
];
const _vector$b = /*@__PURE__*/ new Vector3();
const _box$4 = /*@__PURE__*/ new Box3();
const _v0$1 = /*@__PURE__*/ new Vector3();
const _v1$4 = /*@__PURE__*/ new Vector3();
const _v2$3 = /*@__PURE__*/ new Vector3();
const _f0 = /*@__PURE__*/ new Vector3();
const _f1 = /*@__PURE__*/ new Vector3();
const _f2 = /*@__PURE__*/ new Vector3();
const _center = /*@__PURE__*/ new Vector3();
const _extents = /*@__PURE__*/ new Vector3();
const _triangleNormal = /*@__PURE__*/ new Vector3();
const _testAxis = /*@__PURE__*/ new Vector3();
function satForAxes(axes, v0, v1, v2, extents) {
	for (let i = 0, j = axes.length - 3; i <= j; i += 3) {
		_testAxis.fromArray(axes, i);
		const r = extents.x * Math.abs(_testAxis.x) + extents.y * Math.abs(_testAxis.y) + extents.z * Math.abs(_testAxis.z);
		const p0 = v0.dot(_testAxis);
		const p1 = v1.dot(_testAxis);
		const p2 = v2.dot(_testAxis);
		if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) return false;
	}
	return true;
}
const _vector$a = /*@__PURE__*/ new Vector3();
const _vector2$1 = /*@__PURE__*/ new Vector2();
let _id$2 = 0;
/**
* This class stores data for an attribute (such as vertex positions, face
* indices, normals, colors, UVs, and any custom attributes ) associated with
* a geometry, which allows for more efficient passing of data to the GPU.
*
* When working with vector-like data, the `fromBufferAttribute( attribute, index )`
* helper methods on vector and color class might be helpful. E.g. {@link Vector3#fromBufferAttribute}.
*/
var BufferAttribute = class extends EventDispatcher {
	/**
	* Constructs a new buffer attribute.
	*
	* @param {TypedArray} array - The array holding the attribute data.
	* @param {number} itemSize - The item size.
	* @param {boolean} [normalized=false] - Whether the data are normalized or not.
	*/
	constructor(array, itemSize, normalized = false) {
		super();
		if (Array.isArray(array)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isBufferAttribute = true;
		/**
		* The ID of the buffer attribute.
		*
		* @name BufferAttribute#id
		* @type {number}
		* @readonly
		*/
		Object.defineProperty(this, "id", { value: _id$2++ });
		/**
		* The name of the buffer attribute.
		*
		* @type {string}
		*/
		this.name = "";
		/**
		* The array holding the attribute data. It should have `itemSize * numVertices`
		* elements, where `numVertices` is the number of vertices in the associated geometry.
		*
		* @type {TypedArray}
		*/
		this.array = array;
		/**
		* The number of values of the array that should be associated with a particular vertex.
		* For instance, if this attribute is storing a 3-component vector (such as a position,
		* normal, or color), then the value should be `3`.
		*
		* @type {number}
		*/
		this.itemSize = itemSize;
		/**
		* Represents the number of items this buffer attribute stores. It is internally computed
		* by dividing the `array` length by the `itemSize`.
		*
		* @type {number}
		* @readonly
		*/
		this.count = array !== void 0 ? array.length / itemSize : 0;
		/**
		* Applies to integer data only. Indicates how the underlying data in the buffer maps to
		* the values in the GLSL code. For instance, if `array` is an instance of `UInt16Array`,
		* and `normalized` is `true`, the values `0 - +65535` in the array data will be mapped to
		* `0.0f - +1.0f` in the GLSL attribute. If `normalized` is `false`, the values will be converted
		* to floats unmodified, i.e. `65535` becomes `65535.0f`.
		*
		* @type {boolean}
		*/
		this.normalized = normalized;
		/**
		* Defines the intended usage pattern of the data store for optimization purposes.
		*
		* Note: After the initial use of a buffer, its usage cannot be changed. Instead,
		* instantiate a new one and set the desired usage before the next render.
		*
		* @type {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)}
		* @default StaticDrawUsage
		*/
		this.usage = StaticDrawUsage;
		/**
		* This can be used to only update some components of stored vectors (for example, just the
		* component related to color). Use the `addUpdateRange()` function to add ranges to this array.
		*
		* @type {Array<Object>}
		*/
		this.updateRanges = [];
		/**
		* Configures the bound GPU type for use in shaders.
		*
		* Note: this only has an effect for integer arrays and is not configurable for float arrays.
		* For lower precision float types, use `Float16BufferAttribute`.
		*
		* @type {(FloatType|IntType)}
		* @default FloatType
		*/
		this.gpuType = FloatType;
		/**
		* A version number, incremented every time the `needsUpdate` is set to `true`.
		*
		* @type {number}
		*/
		this.version = 0;
	}
	/**
	* A callback function that is executed after the renderer has transferred the attribute
	* array data to the GPU.
	*/
	onUploadCallback() {}
	/**
	* Flag to indicate that this attribute has changed and should be re-sent to
	* the GPU. Set this to `true` when you modify the value of the array.
	*
	* @type {number}
	* @default false
	* @param {boolean} value
	*/
	set needsUpdate(value) {
		if (value === true) this.version++;
	}
	/**
	* Sets the usage of this buffer attribute.
	*
	* @param {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)} value - The usage to set.
	* @return {BufferAttribute} A reference to this buffer attribute.
	*/
	setUsage(value) {
		this.usage = value;
		return this;
	}
	/**
	* Adds a range of data in the data array to be updated on the GPU.
	*
	* @param {number} start - Position at which to start update.
	* @param {number} count - The number of components to update.
	*/
	addUpdateRange(start, count) {
		this.updateRanges.push({
			start,
			count
		});
	}
	/**
	* Clears the update ranges.
	*/
	clearUpdateRanges() {
		this.updateRanges.length = 0;
	}
	/**
	* Copies the values of the given buffer attribute to this instance.
	*
	* @param {BufferAttribute} source - The buffer attribute to copy.
	* @return {BufferAttribute} A reference to this instance.
	*/
	copy(source) {
		this.name = source.name;
		this.array = new source.array.constructor(source.array);
		this.itemSize = source.itemSize;
		this.count = source.count;
		this.normalized = source.normalized;
		this.usage = source.usage;
		this.gpuType = source.gpuType;
		return this;
	}
	/**
	* Copies a vector from the given buffer attribute to this one. The start
	* and destination position in the attribute buffers are represented by the
	* given indices.
	*
	* @param {number} index1 - The destination index into this buffer attribute.
	* @param {BufferAttribute} attribute - The buffer attribute to copy from.
	* @param {number} index2 - The source index into the given buffer attribute.
	* @return {BufferAttribute} A reference to this instance.
	*/
	copyAt(index1, attribute, index2) {
		index1 *= this.itemSize;
		index2 *= attribute.itemSize;
		for (let i = 0, l = this.itemSize; i < l; i++) this.array[index1 + i] = attribute.array[index2 + i];
		return this;
	}
	/**
	* Copies the given array data into this buffer attribute.
	*
	* @param {(TypedArray|Array)} array - The array to copy.
	* @return {BufferAttribute} A reference to this instance.
	*/
	copyArray(array) {
		this.array.set(array);
		return this;
	}
	/**
	* Applies the given 3x3 matrix to the given attribute. Works with
	* item size `2` and `3`.
	*
	* @param {Matrix3} m - The matrix to apply.
	* @return {BufferAttribute} A reference to this instance.
	*/
	applyMatrix3(m) {
		if (this.itemSize === 2) for (let i = 0, l = this.count; i < l; i++) {
			_vector2$1.fromBufferAttribute(this, i);
			_vector2$1.applyMatrix3(m);
			this.setXY(i, _vector2$1.x, _vector2$1.y);
		}
		else if (this.itemSize === 3) for (let i = 0, l = this.count; i < l; i++) {
			_vector$a.fromBufferAttribute(this, i);
			_vector$a.applyMatrix3(m);
			this.setXYZ(i, _vector$a.x, _vector$a.y, _vector$a.z);
		}
		return this;
	}
	/**
	* Applies the given 4x4 matrix to the given attribute. Only works with
	* item size `3`.
	*
	* @param {Matrix4} m - The matrix to apply.
	* @return {BufferAttribute} A reference to this instance.
	*/
	applyMatrix4(m) {
		for (let i = 0, l = this.count; i < l; i++) {
			_vector$a.fromBufferAttribute(this, i);
			_vector$a.applyMatrix4(m);
			this.setXYZ(i, _vector$a.x, _vector$a.y, _vector$a.z);
		}
		return this;
	}
	/**
	* Applies the given 3x3 normal matrix to the given attribute. Only works with
	* item size `3`.
	*
	* @param {Matrix3} m - The normal matrix to apply.
	* @return {BufferAttribute} A reference to this instance.
	*/
	applyNormalMatrix(m) {
		for (let i = 0, l = this.count; i < l; i++) {
			_vector$a.fromBufferAttribute(this, i);
			_vector$a.applyNormalMatrix(m);
			this.setXYZ(i, _vector$a.x, _vector$a.y, _vector$a.z);
		}
		return this;
	}
	/**
	* Applies the given 4x4 matrix to the given attribute. Only works with
	* item size `3` and with direction vectors.
	*
	* @param {Matrix4} m - The matrix to apply.
	* @return {BufferAttribute} A reference to this instance.
	*/
	transformDirection(m) {
		for (let i = 0, l = this.count; i < l; i++) {
			_vector$a.fromBufferAttribute(this, i);
			_vector$a.transformDirection(m);
			this.setXYZ(i, _vector$a.x, _vector$a.y, _vector$a.z);
		}
		return this;
	}
	/**
	* Sets the given array data in the buffer attribute.
	*
	* @param {(TypedArray|Array)} value - The array data to set.
	* @param {number} [offset=0] - The offset in this buffer attribute's array.
	* @return {BufferAttribute} A reference to this instance.
	*/
	set(value, offset = 0) {
		this.array.set(value, offset);
		return this;
	}
	/**
	* Returns the given component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} component - The component index.
	* @return {number} The returned value.
	*/
	getComponent(index, component) {
		let value = this.array[index * this.itemSize + component];
		if (this.normalized) value = denormalize(value, this.array);
		return value;
	}
	/**
	* Sets the given value to the given component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} component - The component index.
	* @param {number} value - The value to set.
	* @return {BufferAttribute} A reference to this instance.
	*/
	setComponent(index, component, value) {
		if (this.normalized) value = normalize(value, this.array);
		this.array[index * this.itemSize + component] = value;
		return this;
	}
	/**
	* Returns the x component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @return {number} The x component.
	*/
	getX(index) {
		let x = this.array[index * this.itemSize];
		if (this.normalized) x = denormalize(x, this.array);
		return x;
	}
	/**
	* Sets the x component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} x - The value to set.
	* @return {BufferAttribute} A reference to this instance.
	*/
	setX(index, x) {
		if (this.normalized) x = normalize(x, this.array);
		this.array[index * this.itemSize] = x;
		return this;
	}
	/**
	* Returns the y component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @return {number} The y component.
	*/
	getY(index) {
		let y = this.array[index * this.itemSize + 1];
		if (this.normalized) y = denormalize(y, this.array);
		return y;
	}
	/**
	* Sets the y component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} y - The value to set.
	* @return {BufferAttribute} A reference to this instance.
	*/
	setY(index, y) {
		if (this.normalized) y = normalize(y, this.array);
		this.array[index * this.itemSize + 1] = y;
		return this;
	}
	/**
	* Returns the z component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @return {number} The z component.
	*/
	getZ(index) {
		let z = this.array[index * this.itemSize + 2];
		if (this.normalized) z = denormalize(z, this.array);
		return z;
	}
	/**
	* Sets the z component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} z - The value to set.
	* @return {BufferAttribute} A reference to this instance.
	*/
	setZ(index, z) {
		if (this.normalized) z = normalize(z, this.array);
		this.array[index * this.itemSize + 2] = z;
		return this;
	}
	/**
	* Returns the w component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @return {number} The w component.
	*/
	getW(index) {
		let w = this.array[index * this.itemSize + 3];
		if (this.normalized) w = denormalize(w, this.array);
		return w;
	}
	/**
	* Sets the w component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} w - The value to set.
	* @return {BufferAttribute} A reference to this instance.
	*/
	setW(index, w) {
		if (this.normalized) w = normalize(w, this.array);
		this.array[index * this.itemSize + 3] = w;
		return this;
	}
	/**
	* Sets the x and y component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} x - The value for the x component to set.
	* @param {number} y - The value for the y component to set.
	* @return {BufferAttribute} A reference to this instance.
	*/
	setXY(index, x, y) {
		index *= this.itemSize;
		if (this.normalized) {
			x = normalize(x, this.array);
			y = normalize(y, this.array);
		}
		this.array[index + 0] = x;
		this.array[index + 1] = y;
		return this;
	}
	/**
	* Sets the x, y and z component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} x - The value for the x component to set.
	* @param {number} y - The value for the y component to set.
	* @param {number} z - The value for the z component to set.
	* @return {BufferAttribute} A reference to this instance.
	*/
	setXYZ(index, x, y, z) {
		index *= this.itemSize;
		if (this.normalized) {
			x = normalize(x, this.array);
			y = normalize(y, this.array);
			z = normalize(z, this.array);
		}
		this.array[index + 0] = x;
		this.array[index + 1] = y;
		this.array[index + 2] = z;
		return this;
	}
	/**
	* Sets the x, y, z and w component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} x - The value for the x component to set.
	* @param {number} y - The value for the y component to set.
	* @param {number} z - The value for the z component to set.
	* @param {number} w - The value for the w component to set.
	* @return {BufferAttribute} A reference to this instance.
	*/
	setXYZW(index, x, y, z, w) {
		index *= this.itemSize;
		if (this.normalized) {
			x = normalize(x, this.array);
			y = normalize(y, this.array);
			z = normalize(z, this.array);
			w = normalize(w, this.array);
		}
		this.array[index + 0] = x;
		this.array[index + 1] = y;
		this.array[index + 2] = z;
		this.array[index + 3] = w;
		return this;
	}
	/**
	* Sets the given callback function that is executed after the Renderer has transferred
	* the attribute array data to the GPU. Can be used to perform clean-up operations after
	* the upload when attribute data are not needed anymore on the CPU side.
	*
	* @param {Function} callback - The `onUpload()` callback.
	* @return {BufferAttribute} A reference to this instance.
	*/
	onUpload(callback) {
		this.onUploadCallback = callback;
		return this;
	}
	/**
	* Returns a new buffer attribute with copied values from this instance.
	*
	* @return {BufferAttribute} A clone of this instance.
	*/
	clone() {
		return new this.constructor(this.array, this.itemSize).copy(this);
	}
	/**
	* Serializes the buffer attribute into JSON.
	*
	* @return {Object} A JSON object representing the serialized buffer attribute.
	*/
	toJSON() {
		const data = {
			itemSize: this.itemSize,
			type: this.array.constructor.name,
			array: Array.from(this.array),
			normalized: this.normalized
		};
		data.name = this.name;
		data.usage = this.usage;
		data.gpuType = this.gpuType;
		return data;
	}
	/**
	* Disposes of the buffer attribute. Available only in {@link WebGPURenderer}.
	*/
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
};
/**
* Convenient class that can be used when creating a `UInt16` buffer attribute with
* a plain `Array` instance.
*
* @augments BufferAttribute
*/
var Uint16BufferAttribute = class extends BufferAttribute {
	/**
	* Constructs a new buffer attribute.
	*
	* @param {(Array<number>|Uint16Array)} array - The array holding the attribute data.
	* @param {number} itemSize - The item size.
	* @param {boolean} [normalized=false] - Whether the data are normalized or not.
	*/
	constructor(array, itemSize, normalized) {
		super(new Uint16Array(array), itemSize, normalized);
	}
};
/**
* Convenient class that can be used when creating a `UInt32` buffer attribute with
* a plain `Array` instance.
*
* @augments BufferAttribute
*/
var Uint32BufferAttribute = class extends BufferAttribute {
	/**
	* Constructs a new buffer attribute.
	*
	* @param {(Array<number>|Uint32Array)} array - The array holding the attribute data.
	* @param {number} itemSize - The item size.
	* @param {boolean} [normalized=false] - Whether the data are normalized or not.
	*/
	constructor(array, itemSize, normalized) {
		super(new Uint32Array(array), itemSize, normalized);
	}
};
/**
* Convenient class that can be used when creating a `Float32` buffer attribute with
* a plain `Array` instance.
*
* @augments BufferAttribute
*/
var Float32BufferAttribute = class extends BufferAttribute {
	/**
	* Constructs a new buffer attribute.
	*
	* @param {(Array<number>|Float32Array)} array - The array holding the attribute data.
	* @param {number} itemSize - The item size.
	* @param {boolean} [normalized=false] - Whether the data are normalized or not.
	*/
	constructor(array, itemSize, normalized) {
		super(new Float32Array(array), itemSize, normalized);
	}
};
const _box$3 = /*@__PURE__*/ new Box3();
const _v1$3 = /*@__PURE__*/ new Vector3();
const _v2$2 = /*@__PURE__*/ new Vector3();
/**
* An analytical 3D sphere defined by a center and radius. This class is mainly
* used as a Bounding Sphere for 3D objects.
*/
var Sphere = class {
	/**
	* Constructs a new sphere.
	*
	* @param {Vector3} [center=(0,0,0)] - The center of the sphere
	* @param {number} [radius=-1] - The radius of the sphere.
	*/
	constructor(center = new Vector3(), radius = -1) {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isSphere = true;
		/**
		* The center of the sphere
		*
		* @type {Vector3}
		*/
		this.center = center;
		/**
		* The radius of the sphere.
		*
		* @type {number}
		*/
		this.radius = radius;
	}
	/**
	* Sets the sphere's components by copying the given values.
	*
	* @param {Vector3} center - The center.
	* @param {number} radius - The radius.
	* @return {Sphere} A reference to this sphere.
	*/
	set(center, radius) {
		this.center.copy(center);
		this.radius = radius;
		return this;
	}
	/**
	* Computes the minimum bounding sphere for list of points.
	* If the optional center point is given, it is used as the sphere's
	* center. Otherwise, the center of the axis-aligned bounding box
	* encompassing the points is calculated.
	*
	* @param {Array<Vector3>} points - A list of points in 3D space.
	* @param {Vector3} [optionalCenter] - The center of the sphere.
	* @return {Sphere} A reference to this sphere.
	*/
	setFromPoints(points, optionalCenter) {
		const center = this.center;
		if (optionalCenter !== void 0) center.copy(optionalCenter);
		else _box$3.setFromPoints(points).getCenter(center);
		let maxRadiusSq = 0;
		for (let i = 0, il = points.length; i < il; i++) maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
		this.radius = Math.sqrt(maxRadiusSq);
		return this;
	}
	/**
	* Copies the values of the given sphere to this instance.
	*
	* @param {Sphere} sphere - The sphere to copy.
	* @return {Sphere} A reference to this sphere.
	*/
	copy(sphere) {
		this.center.copy(sphere.center);
		this.radius = sphere.radius;
		return this;
	}
	/**
	* Returns `true` if the sphere is empty (the radius set to a negative number).
	*
	* Spheres with a radius of `0` contain only their center point and are not
	* considered to be empty.
	*
	* @return {boolean} Whether this sphere is empty or not.
	*/
	isEmpty() {
		return this.radius < 0;
	}
	/**
	* Makes this sphere empty which means in encloses a zero space in 3D.
	*
	* @return {Sphere} A reference to this sphere.
	*/
	makeEmpty() {
		this.center.set(0, 0, 0);
		this.radius = -1;
		return this;
	}
	/**
	* Returns `true` if this sphere contains the given point inclusive of
	* the surface of the sphere.
	*
	* @param {Vector3} point - The point to check.
	* @return {boolean} Whether this sphere contains the given point or not.
	*/
	containsPoint(point) {
		return point.distanceToSquared(this.center) <= this.radius * this.radius;
	}
	/**
	* Returns the closest distance from the boundary of the sphere to the
	* given point. If the sphere contains the point, the distance will
	* be negative.
	*
	* @param {Vector3} point - The point to compute the distance to.
	* @return {number} The distance to the point.
	*/
	distanceToPoint(point) {
		return point.distanceTo(this.center) - this.radius;
	}
	/**
	* Returns `true` if this sphere intersects with the given one.
	*
	* @param {Sphere} sphere - The sphere to test.
	* @return {boolean} Whether this sphere intersects with the given one or not.
	*/
	intersectsSphere(sphere) {
		const radiusSum = this.radius + sphere.radius;
		return sphere.center.distanceToSquared(this.center) <= radiusSum * radiusSum;
	}
	/**
	* Returns `true` if this sphere intersects with the given box.
	*
	* @param {Box3} box - The box to test.
	* @return {boolean} Whether this sphere intersects with the given box or not.
	*/
	intersectsBox(box) {
		return box.intersectsSphere(this);
	}
	/**
	* Returns `true` if this sphere intersects with the given plane.
	*
	* @param {Plane} plane - The plane to test.
	* @return {boolean} Whether this sphere intersects with the given plane or not.
	*/
	intersectsPlane(plane) {
		return Math.abs(plane.distanceToPoint(this.center)) <= this.radius;
	}
	/**
	* Clamps a point within the sphere. If the point is outside the sphere, it
	* will clamp it to the closest point on the edge of the sphere. Points
	* already inside the sphere will not be affected.
	*
	* @param {Vector3} point - The plane to clamp.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} The clamped point.
	*/
	clampPoint(point, target) {
		const deltaLengthSq = this.center.distanceToSquared(point);
		target.copy(point);
		if (deltaLengthSq > this.radius * this.radius) {
			target.sub(this.center).normalize();
			target.multiplyScalar(this.radius).add(this.center);
		}
		return target;
	}
	/**
	* Returns a bounding box that encloses this sphere.
	*
	* @param {Box3} target - The target box that is used to store the method's result.
	* @return {Box3} The bounding box that encloses this sphere.
	*/
	getBoundingBox(target) {
		if (this.isEmpty()) {
			target.makeEmpty();
			return target;
		}
		target.set(this.center, this.center);
		target.expandByScalar(this.radius);
		return target;
	}
	/**
	* Transforms this sphere with the given 4x4 transformation matrix.
	*
	* @param {Matrix4} matrix - The transformation matrix.
	* @return {Sphere} A reference to this sphere.
	*/
	applyMatrix4(matrix) {
		this.center.applyMatrix4(matrix);
		this.radius = this.radius * matrix.getMaxScaleOnAxis();
		return this;
	}
	/**
	* Translates the sphere's center by the given offset.
	*
	* @param {Vector3} offset - The offset.
	* @return {Sphere} A reference to this sphere.
	*/
	translate(offset) {
		this.center.add(offset);
		return this;
	}
	/**
	* Expands the boundaries of this sphere to include the given point.
	*
	* @param {Vector3} point - The point to include.
	* @return {Sphere} A reference to this sphere.
	*/
	expandByPoint(point) {
		if (this.isEmpty()) {
			this.center.copy(point);
			this.radius = 0;
			return this;
		}
		_v1$3.subVectors(point, this.center);
		const lengthSq = _v1$3.lengthSq();
		if (lengthSq > this.radius * this.radius) {
			const length = Math.sqrt(lengthSq);
			const delta = (length - this.radius) * .5;
			this.center.addScaledVector(_v1$3, delta / length);
			this.radius += delta;
		}
		return this;
	}
	/**
	* Expands this sphere to enclose both the original sphere and the given sphere.
	*
	* @param {Sphere} sphere - The sphere to include.
	* @return {Sphere} A reference to this sphere.
	*/
	union(sphere) {
		if (sphere.isEmpty()) return this;
		if (this.isEmpty()) {
			this.copy(sphere);
			return this;
		}
		if (this.center.equals(sphere.center) === true) this.radius = Math.max(this.radius, sphere.radius);
		else {
			_v2$2.subVectors(sphere.center, this.center).setLength(sphere.radius);
			this.expandByPoint(_v1$3.copy(sphere.center).add(_v2$2));
			this.expandByPoint(_v1$3.copy(sphere.center).sub(_v2$2));
		}
		return this;
	}
	/**
	* Returns `true` if this sphere is equal with the given one.
	*
	* @param {Sphere} sphere - The sphere to test for equality.
	* @return {boolean} Whether this bounding sphere is equal with the given one.
	*/
	equals(sphere) {
		return sphere.center.equals(this.center) && sphere.radius === this.radius;
	}
	/**
	* Returns a new sphere with copied values from this instance.
	*
	* @return {Sphere} A clone of this instance.
	*/
	clone() {
		return new this.constructor().copy(this);
	}
	/**
	* Returns a serialized structure of the bounding sphere.
	*
	* @return {Object} Serialized structure with fields representing the object state.
	*/
	toJSON() {
		return {
			radius: this.radius,
			center: this.center.toArray()
		};
	}
	/**
	* Returns a serialized structure of the bounding sphere.
	*
	* @param {Object} json - The serialized json to set the sphere from.
	* @return {Sphere} A reference to this bounding sphere.
	*/
	fromJSON(json) {
		this.radius = json.radius;
		this.center.fromArray(json.center);
		return this;
	}
};
let _id$1 = 0;
const _m1 = /*@__PURE__*/ new Matrix4();
const _obj = /*@__PURE__*/ new Object3D();
const _offset = /*@__PURE__*/ new Vector3();
const _box$2 = /*@__PURE__*/ new Box3();
const _boxMorphTargets = /*@__PURE__*/ new Box3();
const _vector$9 = /*@__PURE__*/ new Vector3();
/**
* A representation of mesh, line, or point geometry. Includes vertex
* positions, face indices, normals, colors, UVs, and custom attributes
* within buffers, reducing the cost of passing all this data to the GPU.
*
* ```js
* const geometry = new THREE.BufferGeometry();
* // create a simple square shape. We duplicate the top left and bottom right
* // vertices because each vertex needs to appear once per triangle.
* const vertices = new Float32Array( [
* 	-1.0, -1.0,  1.0, // v0
* 	 1.0, -1.0,  1.0, // v1
* 	 1.0,  1.0,  1.0, // v2
*
* 	 1.0,  1.0,  1.0, // v3
* 	-1.0,  1.0,  1.0, // v4
* 	-1.0, -1.0,  1.0  // v5
* ] );
* // itemSize = 3 because there are 3 values (components) per vertex
* geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
* const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
* const mesh = new THREE.Mesh( geometry, material );
* ```
*
* @augments EventDispatcher
*/
var BufferGeometry = class BufferGeometry extends EventDispatcher {
	/**
	* Constructs a new geometry.
	*/
	constructor() {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isBufferGeometry = true;
		/**
		* The ID of the geometry.
		*
		* @name BufferGeometry#id
		* @type {number}
		* @readonly
		*/
		Object.defineProperty(this, "id", { value: _id$1++ });
		/**
		* The UUID of the geometry.
		*
		* @type {string}
		* @readonly
		*/
		this.uuid = generateUUID();
		/**
		* The name of the geometry.
		*
		* @type {string}
		*/
		this.name = "";
		this.type = "BufferGeometry";
		/**
		* Allows for vertices to be re-used across multiple triangles; this is
		* called using "indexed triangles". Each triangle is associated with the
		* indices of three vertices. This attribute therefore stores the index of
		* each vertex for each triangular face. If this attribute is not set, the
		* renderer assumes that each three contiguous positions represent a single triangle.
		*
		* @type {?BufferAttribute}
		* @default null
		*/
		this.index = null;
		/**
		* A (storage) buffer attribute which was generated with a compute shader and
		* now defines indirect draw calls.
		*
		* Can only be used with {@link WebGPURenderer} and a WebGPU backend.
		*
		* @type {?BufferAttribute}
		* @default null
		*/
		this.indirect = null;
		/**
		* The offset, in bytes, into the indirect drawing buffer where the value data begins. If an array is provided, multiple indirect draw calls will be made for each offset.
		*
		* Can only be used with {@link WebGPURenderer} and a WebGPU backend.
		*
		* @type {number|Array<number>}
		* @default 0
		*/
		this.indirectOffset = 0;
		/**
		* This dictionary has as id the name of the attribute to be set and as value
		* the buffer attribute to set it to. Rather than accessing this property directly,
		* use `setAttribute()` and `getAttribute()` to access attributes of this geometry.
		*
		* @type {Object<string,(BufferAttribute|InterleavedBufferAttribute)>}
		*/
		this.attributes = {};
		/**
		* This dictionary holds the morph targets of the geometry.
		*
		* Note: Once the geometry has been rendered, the morph attribute data cannot
		* be changed. You will have to call `dispose()`, and create a new geometry instance.
		*
		* @type {Object}
		*/
		this.morphAttributes = {};
		/**
		* Used to control the morph target behavior; when set to `true`, the morph
		* target data is treated as relative offsets, rather than as absolute
		* positions/normals.
		*
		* @type {boolean}
		* @default false
		*/
		this.morphTargetsRelative = false;
		/**
		* Split the geometry into groups, each of which will be rendered in a
		* separate draw call. This allows an array of materials to be used with the geometry.
		*
		* Use `addGroup()` and `clearGroups()` to edit groups, rather than modifying this array directly.
		*
		* Every vertex and index must belong to exactly one group — groups must not share vertices or
		* indices, and must not leave vertices or indices unused.
		*
		* @type {Array<Object>}
		*/
		this.groups = [];
		/**
		* Bounding box for the geometry which can be calculated with `computeBoundingBox()`.
		*
		* @type {?Box3}
		* @default null
		*/
		this.boundingBox = null;
		/**
		* Bounding sphere for the geometry which can be calculated with `computeBoundingSphere()`.
		*
		* @type {?Sphere}
		* @default null
		*/
		this.boundingSphere = null;
		/**
		* Determines the part of the geometry to render. This should not be set directly,
		* instead use `setDrawRange()`.
		*
		* @type {{start:number,count:number}}
		*/
		this.drawRange = {
			start: 0,
			count: Infinity
		};
		/**
		* An object that can be used to store custom data about the geometry.
		* It should not hold references to functions as these will not be cloned.
		*
		* @type {Object}
		*/
		this.userData = {};
		/**
		* `true` when the geometry has been transformed since construction
		* (e.g. via {@link BufferGeometry#applyMatrix4}). Only relevant for
		* geometry generators (subclasses that populate `parameters`): when set,
		* {@link BufferGeometry#toJSON} omits `parameters` since they no longer
		* describe the geometry.
		*
		* @private
		* @type {boolean}
		* @default false
		*/
		this._transformed = false;
	}
	/**
	* Returns the index of this geometry.
	*
	* @return {?BufferAttribute} The index. Returns `null` if no index is defined.
	*/
	getIndex() {
		return this.index;
	}
	/**
	* Sets the given index to this geometry.
	*
	* @param {Array<number>|BufferAttribute} index - The index to set.
	* @return {BufferGeometry} A reference to this instance.
	*/
	setIndex(index) {
		if (Array.isArray(index)) this.index = new (arrayNeedsUint32(index) ? Uint32BufferAttribute : Uint16BufferAttribute)(index, 1);
		else this.index = index;
		return this;
	}
	/**
	* Sets the given indirect attribute to this geometry.
	*
	* @param {BufferAttribute} indirect - The attribute holding indirect draw calls.
	* @param {number|Array<number>} [indirectOffset=0] - The offset, in bytes, into the indirect drawing buffer where the value data begins. If an array is provided, multiple indirect draw calls will be made for each offset.
	* @return {BufferGeometry} A reference to this instance.
	*/
	setIndirect(indirect, indirectOffset = 0) {
		this.indirect = indirect;
		this.indirectOffset = indirectOffset;
		return this;
	}
	/**
	* Returns the indirect attribute of this geometry.
	*
	* @return {?BufferAttribute} The indirect attribute. Returns `null` if no indirect attribute is defined.
	*/
	getIndirect() {
		return this.indirect;
	}
	/**
	* Returns the buffer attribute for the given name.
	*
	* @param {string} name - The attribute name.
	* @return {BufferAttribute|InterleavedBufferAttribute|undefined} The buffer attribute.
	* Returns `undefined` if not attribute has been found.
	*/
	getAttribute(name) {
		return this.attributes[name];
	}
	/**
	* Sets the given attribute for the given name.
	*
	* @param {string} name - The attribute name.
	* @param {BufferAttribute|InterleavedBufferAttribute} attribute - The attribute to set.
	* @return {BufferGeometry} A reference to this instance.
	*/
	setAttribute(name, attribute) {
		this.attributes[name] = attribute;
		return this;
	}
	/**
	* Deletes the attribute for the given name.
	*
	* @param {string} name - The attribute name to delete.
	* @return {BufferGeometry} A reference to this instance.
	*/
	deleteAttribute(name) {
		delete this.attributes[name];
		return this;
	}
	/**
	* Returns `true` if this geometry has an attribute for the given name.
	*
	* @param {string} name - The attribute name.
	* @return {boolean} Whether this geometry has an attribute for the given name or not.
	*/
	hasAttribute(name) {
		return this.attributes[name] !== void 0;
	}
	/**
	* Adds a group to this geometry.
	*
	* @param {number} start - The first element in this draw call. That is the first
	* vertex for non-indexed geometry, otherwise the first triangle index.
	* @param {number} count - Specifies how many vertices (or indices) are part of this group.
	* @param {number} [materialIndex=0] - The material array index to use.
	*/
	addGroup(start, count, materialIndex = 0) {
		this.groups.push({
			start,
			count,
			materialIndex
		});
	}
	/**
	* Clears all groups.
	*/
	clearGroups() {
		this.groups = [];
	}
	/**
	* Sets the draw range for this geometry.
	*
	* @param {number} start - The first vertex for non-indexed geometry, otherwise the first triangle index.
	* @param {number} count - For non-indexed BufferGeometry, `count` is the number of vertices to render.
	* For indexed BufferGeometry, `count` is the number of indices to render.
	*/
	setDrawRange(start, count) {
		this.drawRange.start = start;
		this.drawRange.count = count;
	}
	/**
	* Applies the given 4x4 transformation matrix to the geometry.
	*
	* @param {Matrix4} matrix - The matrix to apply.
	* @return {BufferGeometry} A reference to this instance.
	*/
	applyMatrix4(matrix) {
		const position = this.attributes.position;
		if (position !== void 0) {
			position.applyMatrix4(matrix);
			position.needsUpdate = true;
		}
		const normal = this.attributes.normal;
		if (normal !== void 0) {
			const normalMatrix = new Matrix3().getNormalMatrix(matrix);
			normal.applyNormalMatrix(normalMatrix);
			normal.needsUpdate = true;
		}
		const tangent = this.attributes.tangent;
		if (tangent !== void 0) {
			tangent.transformDirection(matrix);
			tangent.needsUpdate = true;
		}
		if (this.boundingBox !== null) this.computeBoundingBox();
		if (this.boundingSphere !== null) this.computeBoundingSphere();
		this._transformed = true;
		return this;
	}
	/**
	* Applies the rotation represented by the Quaternion to the geometry.
	*
	* @param {Quaternion} q - The Quaternion to apply.
	* @return {BufferGeometry} A reference to this instance.
	*/
	applyQuaternion(q) {
		_m1.makeRotationFromQuaternion(q);
		this.applyMatrix4(_m1);
		return this;
	}
	/**
	* Rotates the geometry about the X axis. This is typically done as a one time
	* operation, and not during a loop. Use {@link Object3D#rotation} for typical
	* real-time mesh rotation.
	*
	* @param {number} angle - The angle in radians.
	* @return {BufferGeometry} A reference to this instance.
	*/
	rotateX(angle) {
		_m1.makeRotationX(angle);
		this.applyMatrix4(_m1);
		return this;
	}
	/**
	* Rotates the geometry about the Y axis. This is typically done as a one time
	* operation, and not during a loop. Use {@link Object3D#rotation} for typical
	* real-time mesh rotation.
	*
	* @param {number} angle - The angle in radians.
	* @return {BufferGeometry} A reference to this instance.
	*/
	rotateY(angle) {
		_m1.makeRotationY(angle);
		this.applyMatrix4(_m1);
		return this;
	}
	/**
	* Rotates the geometry about the Z axis. This is typically done as a one time
	* operation, and not during a loop. Use {@link Object3D#rotation} for typical
	* real-time mesh rotation.
	*
	* @param {number} angle - The angle in radians.
	* @return {BufferGeometry} A reference to this instance.
	*/
	rotateZ(angle) {
		_m1.makeRotationZ(angle);
		this.applyMatrix4(_m1);
		return this;
	}
	/**
	* Translates the geometry. This is typically done as a one time
	* operation, and not during a loop. Use {@link Object3D#position} for typical
	* real-time mesh rotation.
	*
	* @param {number} x - The x offset.
	* @param {number} y - The y offset.
	* @param {number} z - The z offset.
	* @return {BufferGeometry} A reference to this instance.
	*/
	translate(x, y, z) {
		_m1.makeTranslation(x, y, z);
		this.applyMatrix4(_m1);
		return this;
	}
	/**
	* Scales the geometry. This is typically done as a one time
	* operation, and not during a loop. Use {@link Object3D#scale} for typical
	* real-time mesh rotation.
	*
	* @param {number} x - The x scale.
	* @param {number} y - The y scale.
	* @param {number} z - The z scale.
	* @return {BufferGeometry} A reference to this instance.
	*/
	scale(x, y, z) {
		_m1.makeScale(x, y, z);
		this.applyMatrix4(_m1);
		return this;
	}
	/**
	* Rotates the geometry to face a point in 3D space. This is typically done as a one time
	* operation, and not during a loop. Use {@link Object3D#lookAt} for typical
	* real-time mesh rotation.
	*
	* @param {Vector3} vector - The target point.
	* @return {BufferGeometry} A reference to this instance.
	*/
	lookAt(vector) {
		_obj.lookAt(vector);
		_obj.updateMatrix();
		this.applyMatrix4(_obj.matrix);
		return this;
	}
	/**
	* Center the geometry based on its bounding box.
	*
	* @return {BufferGeometry} A reference to this instance.
	*/
	center() {
		this.computeBoundingBox();
		this.boundingBox.getCenter(_offset).negate();
		this.translate(_offset.x, _offset.y, _offset.z);
		return this;
	}
	/**
	* Defines a geometry by creating a `position` attribute based on the given array of points. The array
	* can hold 2D or 3D vectors. When using two-dimensional data, the `z` coordinate for all vertices is
	* set to `0`.
	*
	* If the method is used with an existing `position` attribute, the vertex data are overwritten with the
	* data from the array. The length of the array must match the vertex count.
	*
	* @param {Array<Vector2>|Array<Vector3>} points - The points.
	* @return {BufferGeometry} A reference to this instance.
	*/
	setFromPoints(points) {
		const positionAttribute = this.getAttribute("position");
		if (positionAttribute === void 0) {
			const position = [];
			for (let i = 0, l = points.length; i < l; i++) {
				const point = points[i];
				position.push(point.x, point.y, point.z || 0);
			}
			this.setAttribute("position", new Float32BufferAttribute(position, 3));
		} else {
			const l = Math.min(points.length, positionAttribute.count);
			for (let i = 0; i < l; i++) {
				const point = points[i];
				positionAttribute.setXYZ(i, point.x, point.y, point.z || 0);
			}
			if (points.length > positionAttribute.count) warn("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");
			positionAttribute.needsUpdate = true;
		}
		return this;
	}
	/**
	* Computes the bounding box of the geometry, and updates the `boundingBox` member.
	* The bounding box is not computed by the engine; it must be computed by your app.
	* You may need to recompute the bounding box if the geometry vertices are modified.
	*/
	computeBoundingBox() {
		if (this.boundingBox === null) this.boundingBox = new Box3();
		const position = this.attributes.position;
		const morphAttributesPosition = this.morphAttributes.position;
		if (position && position.isGLBufferAttribute) {
			error("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this);
			this.boundingBox.set(new Vector3(-Infinity, -Infinity, -Infinity), new Vector3(Infinity, Infinity, Infinity));
			return;
		}
		if (position !== void 0) {
			this.boundingBox.setFromBufferAttribute(position);
			if (morphAttributesPosition) for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
				const morphAttribute = morphAttributesPosition[i];
				_box$2.setFromBufferAttribute(morphAttribute);
				if (this.morphTargetsRelative) {
					_vector$9.addVectors(this.boundingBox.min, _box$2.min);
					this.boundingBox.expandByPoint(_vector$9);
					_vector$9.addVectors(this.boundingBox.max, _box$2.max);
					this.boundingBox.expandByPoint(_vector$9);
				} else {
					this.boundingBox.expandByPoint(_box$2.min);
					this.boundingBox.expandByPoint(_box$2.max);
				}
			}
		} else this.boundingBox.makeEmpty();
		if (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) error("BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The \"position\" attribute is likely to have NaN values.", this);
	}
	/**
	* Computes the bounding sphere of the geometry, and updates the `boundingSphere` member.
	* The engine automatically computes the bounding sphere when it is needed, e.g., for ray casting or view frustum culling.
	* You may need to recompute the bounding sphere if the geometry vertices are modified.
	*/
	computeBoundingSphere() {
		if (this.boundingSphere === null) this.boundingSphere = new Sphere();
		const position = this.attributes.position;
		const morphAttributesPosition = this.morphAttributes.position;
		if (position && position.isGLBufferAttribute) {
			error("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this);
			this.boundingSphere.set(new Vector3(), Infinity);
			return;
		}
		if (position) {
			const center = this.boundingSphere.center;
			_box$2.setFromBufferAttribute(position);
			if (morphAttributesPosition) for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
				const morphAttribute = morphAttributesPosition[i];
				_boxMorphTargets.setFromBufferAttribute(morphAttribute);
				if (this.morphTargetsRelative) {
					_vector$9.addVectors(_box$2.min, _boxMorphTargets.min);
					_box$2.expandByPoint(_vector$9);
					_vector$9.addVectors(_box$2.max, _boxMorphTargets.max);
					_box$2.expandByPoint(_vector$9);
				} else {
					_box$2.expandByPoint(_boxMorphTargets.min);
					_box$2.expandByPoint(_boxMorphTargets.max);
				}
			}
			_box$2.getCenter(center);
			let maxRadiusSq = 0;
			for (let i = 0, il = position.count; i < il; i++) {
				_vector$9.fromBufferAttribute(position, i);
				maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector$9));
			}
			if (morphAttributesPosition) for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
				const morphAttribute = morphAttributesPosition[i];
				const morphTargetsRelative = this.morphTargetsRelative;
				for (let j = 0, jl = morphAttribute.count; j < jl; j++) {
					_vector$9.fromBufferAttribute(morphAttribute, j);
					if (morphTargetsRelative) {
						_offset.fromBufferAttribute(position, j);
						_vector$9.add(_offset);
					}
					maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector$9));
				}
			}
			this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
			if (isNaN(this.boundingSphere.radius)) error("BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The \"position\" attribute is likely to have NaN values.", this);
		}
	}
	/**
	* Calculates and adds a tangent attribute to this geometry.
	*
	* The computation is only supported for indexed geometries and if position, normal, and uv attributes
	* are defined. When using a tangent space normal map, prefer the MikkTSpace algorithm provided by
	* {@link BufferGeometryUtils#computeMikkTSpaceTangents} instead.
	*/
	computeTangents() {
		const index = this.index;
		const attributes = this.attributes;
		if (index === null || attributes.position === void 0 || attributes.normal === void 0 || attributes.uv === void 0) {
			error("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
			return;
		}
		const positionAttribute = attributes.position;
		const normalAttribute = attributes.normal;
		const uvAttribute = attributes.uv;
		let tangentAttribute = this.getAttribute("tangent");
		if (tangentAttribute === void 0 || tangentAttribute.count !== positionAttribute.count) {
			tangentAttribute = new BufferAttribute(new Float32Array(4 * positionAttribute.count), 4);
			this.setAttribute("tangent", tangentAttribute);
		}
		const tan1 = [], tan2 = [];
		for (let i = 0; i < positionAttribute.count; i++) {
			tan1[i] = new Vector3();
			tan2[i] = new Vector3();
		}
		const vA = new Vector3(), vB = new Vector3(), vC = new Vector3(), uvA = new Vector2(), uvB = new Vector2(), uvC = new Vector2(), sdir = new Vector3(), tdir = new Vector3();
		function handleTriangle(a, b, c) {
			vA.fromBufferAttribute(positionAttribute, a);
			vB.fromBufferAttribute(positionAttribute, b);
			vC.fromBufferAttribute(positionAttribute, c);
			uvA.fromBufferAttribute(uvAttribute, a);
			uvB.fromBufferAttribute(uvAttribute, b);
			uvC.fromBufferAttribute(uvAttribute, c);
			vB.sub(vA);
			vC.sub(vA);
			uvB.sub(uvA);
			uvC.sub(uvA);
			const r = 1 / (uvB.x * uvC.y - uvC.x * uvB.y);
			if (!isFinite(r)) return;
			sdir.copy(vB).multiplyScalar(uvC.y).addScaledVector(vC, -uvB.y).multiplyScalar(r);
			tdir.copy(vC).multiplyScalar(uvB.x).addScaledVector(vB, -uvC.x).multiplyScalar(r);
			tan1[a].add(sdir);
			tan1[b].add(sdir);
			tan1[c].add(sdir);
			tan2[a].add(tdir);
			tan2[b].add(tdir);
			tan2[c].add(tdir);
		}
		let groups = this.groups;
		if (groups.length === 0) groups = [{
			start: 0,
			count: index.count
		}];
		for (let i = 0, il = groups.length; i < il; ++i) {
			const group = groups[i];
			const start = group.start;
			const count = group.count;
			for (let j = start, jl = start + count; j < jl; j += 3) handleTriangle(index.getX(j + 0), index.getX(j + 1), index.getX(j + 2));
		}
		const tmp = new Vector3(), tmp2 = new Vector3();
		const n = new Vector3(), n2 = new Vector3();
		function handleVertex(v) {
			n.fromBufferAttribute(normalAttribute, v);
			n2.copy(n);
			const t = tan1[v];
			tmp.copy(t);
			tmp.sub(n.multiplyScalar(n.dot(t))).normalize();
			tmp2.crossVectors(n2, t);
			const w = tmp2.dot(tan2[v]) < 0 ? -1 : 1;
			tangentAttribute.setXYZW(v, tmp.x, tmp.y, tmp.z, w);
		}
		for (let i = 0, il = groups.length; i < il; ++i) {
			const group = groups[i];
			const start = group.start;
			const count = group.count;
			for (let j = start, jl = start + count; j < jl; j += 3) {
				handleVertex(index.getX(j + 0));
				handleVertex(index.getX(j + 1));
				handleVertex(index.getX(j + 2));
			}
		}
		this._transformed = true;
	}
	/**
	* Computes vertex normals for the given vertex data. For indexed geometries, the method sets
	* each vertex normal to be the average of the face normals of the faces that share that vertex.
	* For non-indexed geometries, vertices are not shared, and the method sets each vertex normal
	* to be the same as the face normal.
	*/
	computeVertexNormals() {
		const index = this.index;
		const positionAttribute = this.getAttribute("position");
		if (positionAttribute !== void 0) {
			let normalAttribute = this.getAttribute("normal");
			if (normalAttribute === void 0 || normalAttribute.count !== positionAttribute.count) {
				normalAttribute = new BufferAttribute(new Float32Array(positionAttribute.count * 3), 3);
				this.setAttribute("normal", normalAttribute);
			} else for (let i = 0, il = normalAttribute.count; i < il; i++) normalAttribute.setXYZ(i, 0, 0, 0);
			const pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
			const nA = new Vector3(), nB = new Vector3(), nC = new Vector3();
			const cb = new Vector3(), ab = new Vector3();
			if (index) for (let i = 0, il = index.count; i < il; i += 3) {
				const vA = index.getX(i + 0);
				const vB = index.getX(i + 1);
				const vC = index.getX(i + 2);
				pA.fromBufferAttribute(positionAttribute, vA);
				pB.fromBufferAttribute(positionAttribute, vB);
				pC.fromBufferAttribute(positionAttribute, vC);
				cb.subVectors(pC, pB);
				ab.subVectors(pA, pB);
				cb.cross(ab);
				nA.fromBufferAttribute(normalAttribute, vA);
				nB.fromBufferAttribute(normalAttribute, vB);
				nC.fromBufferAttribute(normalAttribute, vC);
				nA.add(cb);
				nB.add(cb);
				nC.add(cb);
				normalAttribute.setXYZ(vA, nA.x, nA.y, nA.z);
				normalAttribute.setXYZ(vB, nB.x, nB.y, nB.z);
				normalAttribute.setXYZ(vC, nC.x, nC.y, nC.z);
			}
			else for (let i = 0, il = positionAttribute.count; i < il; i += 3) {
				pA.fromBufferAttribute(positionAttribute, i + 0);
				pB.fromBufferAttribute(positionAttribute, i + 1);
				pC.fromBufferAttribute(positionAttribute, i + 2);
				cb.subVectors(pC, pB);
				ab.subVectors(pA, pB);
				cb.cross(ab);
				normalAttribute.setXYZ(i + 0, cb.x, cb.y, cb.z);
				normalAttribute.setXYZ(i + 1, cb.x, cb.y, cb.z);
				normalAttribute.setXYZ(i + 2, cb.x, cb.y, cb.z);
			}
			this.normalizeNormals();
			normalAttribute.needsUpdate = true;
		}
	}
	/**
	* Ensures every normal vector in a geometry will have a magnitude of `1`. This will
	* correct lighting on the geometry surfaces.
	*/
	normalizeNormals() {
		const normals = this.attributes.normal;
		for (let i = 0, il = normals.count; i < il; i++) {
			_vector$9.fromBufferAttribute(normals, i);
			_vector$9.normalize();
			normals.setXYZ(i, _vector$9.x, _vector$9.y, _vector$9.z);
		}
	}
	/**
	* Return a new non-index version of this indexed geometry. If the geometry
	* is already non-indexed, the method is a NOOP.
	*
	* @return {BufferGeometry} The non-indexed version of this indexed geometry.
	*/
	toNonIndexed() {
		function convertBufferAttribute(attribute, indices) {
			const array = attribute.array;
			const itemSize = attribute.itemSize;
			const normalized = attribute.normalized;
			const array2 = new array.constructor(indices.length * itemSize);
			let index = 0, index2 = 0;
			for (let i = 0, l = indices.length; i < l; i++) {
				if (attribute.isInterleavedBufferAttribute) index = indices[i] * attribute.data.stride + attribute.offset;
				else index = indices[i] * itemSize;
				for (let j = 0; j < itemSize; j++) array2[index2++] = array[index++];
			}
			return new BufferAttribute(array2, itemSize, normalized);
		}
		if (this.index === null) {
			warn("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.");
			return this;
		}
		const geometry2 = new BufferGeometry();
		const indices = this.index.array;
		const attributes = this.attributes;
		for (const name in attributes) {
			const attribute = attributes[name];
			const newAttribute = convertBufferAttribute(attribute, indices);
			geometry2.setAttribute(name, newAttribute);
		}
		const morphAttributes = this.morphAttributes;
		for (const name in morphAttributes) {
			const morphArray = [];
			const morphAttribute = morphAttributes[name];
			for (let i = 0, il = morphAttribute.length; i < il; i++) {
				const attribute = morphAttribute[i];
				const newAttribute = convertBufferAttribute(attribute, indices);
				morphArray.push(newAttribute);
			}
			geometry2.morphAttributes[name] = morphArray;
		}
		geometry2.morphTargetsRelative = this.morphTargetsRelative;
		const groups = this.groups;
		for (let i = 0, l = groups.length; i < l; i++) {
			const group = groups[i];
			geometry2.addGroup(group.start, group.count, group.materialIndex);
		}
		return geometry2;
	}
	/**
	* Serializes the geometry into JSON.
	*
	* @return {Object} A JSON object representing the serialized geometry.
	*/
	toJSON() {
		const data = { metadata: {
			version: 4.7,
			type: "BufferGeometry",
			generator: "BufferGeometry.toJSON"
		} };
		data.uuid = this.uuid;
		data.type = this.parameters !== void 0 && this._transformed === true ? "BufferGeometry" : this.type;
		data.name = this.name;
		if (Object.keys(this.userData).length > 0) data.userData = this.userData;
		if (this.parameters !== void 0 && this._transformed !== true) {
			const parameters = this.parameters;
			for (const key in parameters) if (parameters[key] !== void 0) data[key] = parameters[key];
			return data;
		}
		data.data = { attributes: {} };
		const index = this.index;
		if (index !== null) data.data.index = {
			type: index.array.constructor.name,
			array: Array.prototype.slice.call(index.array)
		};
		const attributes = this.attributes;
		for (const key in attributes) {
			const attribute = attributes[key];
			data.data.attributes[key] = attribute.toJSON(data.data);
		}
		const morphAttributes = {};
		let hasMorphAttributes = false;
		for (const key in this.morphAttributes) {
			const attributeArray = this.morphAttributes[key];
			const array = [];
			for (let i = 0, il = attributeArray.length; i < il; i++) {
				const attribute = attributeArray[i];
				array.push(attribute.toJSON(data.data));
			}
			if (array.length > 0) {
				morphAttributes[key] = array;
				hasMorphAttributes = true;
			}
		}
		if (hasMorphAttributes) {
			data.data.morphAttributes = morphAttributes;
			data.data.morphTargetsRelative = this.morphTargetsRelative;
		}
		const groups = this.groups;
		if (groups.length > 0) data.data.groups = JSON.parse(JSON.stringify(groups));
		const boundingSphere = this.boundingSphere;
		if (boundingSphere !== null) data.data.boundingSphere = boundingSphere.toJSON();
		return data;
	}
	/**
	* Returns a new geometry with copied values from this instance.
	*
	* @return {BufferGeometry} A clone of this instance.
	*/
	clone() {
		return new this.constructor().copy(this);
	}
	/**
	* Copies the values of the given geometry to this instance.
	*
	* @param {BufferGeometry} source - The geometry to copy.
	* @return {BufferGeometry} A reference to this instance.
	*/
	copy(source) {
		this.index = null;
		this.attributes = {};
		this.morphAttributes = {};
		this.groups = [];
		this.boundingBox = null;
		this.boundingSphere = null;
		const data = {};
		this.name = source.name;
		const index = source.index;
		if (index !== null) this.setIndex(index.clone());
		const attributes = source.attributes;
		for (const name in attributes) {
			const attribute = attributes[name];
			this.setAttribute(name, attribute.clone(data));
		}
		const morphAttributes = source.morphAttributes;
		for (const name in morphAttributes) {
			const array = [];
			const morphAttribute = morphAttributes[name];
			for (let i = 0, l = morphAttribute.length; i < l; i++) array.push(morphAttribute[i].clone(data));
			this.morphAttributes[name] = array;
		}
		this.morphTargetsRelative = source.morphTargetsRelative;
		const groups = source.groups;
		for (let i = 0, l = groups.length; i < l; i++) {
			const group = groups[i];
			this.addGroup(group.start, group.count, group.materialIndex);
		}
		const boundingBox = source.boundingBox;
		if (boundingBox !== null) this.boundingBox = boundingBox.clone();
		const boundingSphere = source.boundingSphere;
		if (boundingSphere !== null) this.boundingSphere = boundingSphere.clone();
		this.drawRange.start = source.drawRange.start;
		this.drawRange.count = source.drawRange.count;
		this.userData = source.userData;
		this._transformed = source._transformed;
		return this;
	}
	/**
	* Frees the GPU-related resources allocated by this instance. Call this
	* method whenever this instance is no longer used in your app.
	*
	* @fires BufferGeometry#dispose
	*/
	dispose() {
		this.dispatchEvent({ type: "dispose" });
	}
};
/**
* "Interleaved" means that multiple attributes, possibly of different types,
* (e.g., position, normal, uv, color) are packed into a single array buffer.
*
* An introduction into interleaved arrays can be found here: [Interleaved array basics](https://blog.tojicode.com/2011/05/interleaved-array-basics.html)
*/
var InterleavedBuffer = class {
	/**
	* Constructs a new interleaved buffer.
	*
	* @param {TypedArray} array - A typed array with a shared buffer storing attribute data.
	* @param {number} stride - The number of typed-array elements per vertex.
	*/
	constructor(array, stride) {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isInterleavedBuffer = true;
		/**
		* A typed array with a shared buffer storing attribute data.
		*
		* @type {TypedArray}
		*/
		this.array = array;
		/**
		* The number of typed-array elements per vertex.
		*
		* @type {number}
		*/
		this.stride = stride;
		/**
		* The total number of elements in the array
		*
		* @type {number}
		* @readonly
		*/
		this.count = array !== void 0 ? array.length / stride : 0;
		/**
		* Defines the intended usage pattern of the data store for optimization purposes.
		*
		* Note: After the initial use of a buffer, its usage cannot be changed. Instead,
		* instantiate a new one and set the desired usage before the next render.
		*
		* @type {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)}
		* @default StaticDrawUsage
		*/
		this.usage = StaticDrawUsage;
		/**
		* This can be used to only update some components of stored vectors (for example, just the
		* component related to color). Use the `addUpdateRange()` function to add ranges to this array.
		*
		* @type {Array<Object>}
		*/
		this.updateRanges = [];
		/**
		* A version number, incremented every time the `needsUpdate` is set to `true`.
		*
		* @type {number}
		*/
		this.version = 0;
		/**
		* The UUID of the interleaved buffer.
		*
		* @type {string}
		* @readonly
		*/
		this.uuid = generateUUID();
	}
	/**
	* A callback function that is executed after the renderer has transferred the attribute array
	* data to the GPU.
	*/
	onUploadCallback() {}
	/**
	* Flag to indicate that this attribute has changed and should be re-sent to
	* the GPU. Set this to `true` when you modify the value of the array.
	*
	* @type {number}
	* @default false
	* @param {boolean} value
	*/
	set needsUpdate(value) {
		if (value === true) this.version++;
	}
	/**
	* Sets the usage of this interleaved buffer.
	*
	* @param {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)} value - The usage to set.
	* @return {InterleavedBuffer} A reference to this interleaved buffer.
	*/
	setUsage(value) {
		this.usage = value;
		return this;
	}
	/**
	* Adds a range of data in the data array to be updated on the GPU.
	*
	* @param {number} start - Position at which to start update.
	* @param {number} count - The number of components to update.
	*/
	addUpdateRange(start, count) {
		this.updateRanges.push({
			start,
			count
		});
	}
	/**
	* Clears the update ranges.
	*/
	clearUpdateRanges() {
		this.updateRanges.length = 0;
	}
	/**
	* Copies the values of the given interleaved buffer to this instance.
	*
	* @param {InterleavedBuffer} source - The interleaved buffer to copy.
	* @return {InterleavedBuffer} A reference to this instance.
	*/
	copy(source) {
		this.array = new source.array.constructor(source.array);
		this.count = source.count;
		this.stride = source.stride;
		this.usage = source.usage;
		return this;
	}
	/**
	* Copies a vector from the given interleaved buffer to this one. The start
	* and destination position in the attribute buffers are represented by the
	* given indices.
	*
	* @param {number} index1 - The destination index into this interleaved buffer.
	* @param {InterleavedBuffer} interleavedBuffer - The interleaved buffer to copy from.
	* @param {number} index2 - The source index into the given interleaved buffer.
	* @return {InterleavedBuffer} A reference to this instance.
	*/
	copyAt(index1, interleavedBuffer, index2) {
		index1 *= this.stride;
		index2 *= interleavedBuffer.stride;
		for (let i = 0, l = this.stride; i < l; i++) this.array[index1 + i] = interleavedBuffer.array[index2 + i];
		return this;
	}
	/**
	* Sets the given array data in the interleaved buffer.
	*
	* @param {(TypedArray|Array)} value - The array data to set.
	* @param {number} [offset=0] - The offset in this interleaved buffer's array.
	* @return {InterleavedBuffer} A reference to this instance.
	*/
	set(value, offset = 0) {
		this.array.set(value, offset);
		return this;
	}
	/**
	* Returns a new interleaved buffer with copied values from this instance.
	*
	* @param {Object} [data] - An object with shared array buffers that allows to retain shared structures.
	* @return {InterleavedBuffer} A clone of this instance.
	*/
	clone(data) {
		if (data.arrayBuffers === void 0) data.arrayBuffers = {};
		if (this.array.buffer._uuid === void 0) this.array.buffer._uuid = generateUUID();
		if (data.arrayBuffers[this.array.buffer._uuid] === void 0) data.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer;
		const array = new this.array.constructor(data.arrayBuffers[this.array.buffer._uuid]);
		const ib = new this.constructor(array, this.stride);
		ib.setUsage(this.usage);
		return ib;
	}
	/**
	* Sets the given callback function that is executed after the Renderer has transferred
	* the array data to the GPU. Can be used to perform clean-up operations after
	* the upload when data are not needed anymore on the CPU side.
	*
	* @param {Function} callback - The `onUpload()` callback.
	* @return {InterleavedBuffer} A reference to this instance.
	*/
	onUpload(callback) {
		this.onUploadCallback = callback;
		return this;
	}
	/**
	* Serializes the interleaved buffer into JSON.
	*
	* @param {Object} [data] - An optional value holding meta information about the serialization.
	* @return {Object} A JSON object representing the serialized interleaved buffer.
	*/
	toJSON(data) {
		if (data.arrayBuffers === void 0) data.arrayBuffers = {};
		if (this.array.buffer._uuid === void 0) this.array.buffer._uuid = generateUUID();
		if (data.arrayBuffers[this.array.buffer._uuid] === void 0) data.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer));
		const json = {
			uuid: this.uuid,
			buffer: this.array.buffer._uuid,
			type: this.array.constructor.name,
			stride: this.stride
		};
		json.usage = this.usage;
		return json;
	}
};
const _vector$8 = /*@__PURE__*/ new Vector3();
/**
* An alternative version of a buffer attribute with interleaved data. Interleaved
* attributes share a common interleaved data storage ({@link InterleavedBuffer}) and refer with
* different offsets into the buffer.
*/
var InterleavedBufferAttribute = class InterleavedBufferAttribute {
	/**
	* Constructs a new interleaved buffer attribute.
	*
	* @param {InterleavedBuffer} interleavedBuffer - The buffer holding the interleaved data.
	* @param {number} itemSize - The item size.
	* @param {number} offset - The attribute offset into the buffer.
	* @param {boolean} [normalized=false] - Whether the data are normalized or not.
	*/
	constructor(interleavedBuffer, itemSize, offset, normalized = false) {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isInterleavedBufferAttribute = true;
		/**
		* The name of the buffer attribute.
		*
		* @type {string}
		*/
		this.name = "";
		/**
		* The buffer holding the interleaved data.
		*
		* @type {InterleavedBuffer}
		*/
		this.data = interleavedBuffer;
		/**
		* The item size, see {@link BufferAttribute#itemSize}.
		*
		* @type {number}
		*/
		this.itemSize = itemSize;
		/**
		* The attribute offset into the buffer.
		*
		* @type {number}
		*/
		this.offset = offset;
		/**
		* Whether the data are normalized or not, see {@link BufferAttribute#normalized}
		*
		* @type {InterleavedBuffer}
		*/
		this.normalized = normalized;
	}
	/**
	* The item count of this buffer attribute.
	*
	* @type {number}
	* @readonly
	*/
	get count() {
		return this.data.count;
	}
	/**
	* The array holding the interleaved buffer attribute data.
	*
	* @type {TypedArray}
	*/
	get array() {
		return this.data.array;
	}
	/**
	* Flag to indicate that this attribute has changed and should be re-sent to
	* the GPU. Set this to `true` when you modify the value of the array.
	*
	* @type {number}
	* @default false
	* @param {boolean} value
	*/
	set needsUpdate(value) {
		this.data.needsUpdate = value;
	}
	/**
	* Applies the given 4x4 matrix to the given attribute. Only works with
	* item size `3`.
	*
	* @param {Matrix4} m - The matrix to apply.
	* @return {InterleavedBufferAttribute} A reference to this instance.
	*/
	applyMatrix4(m) {
		for (let i = 0, l = this.data.count; i < l; i++) {
			_vector$8.fromBufferAttribute(this, i);
			_vector$8.applyMatrix4(m);
			this.setXYZ(i, _vector$8.x, _vector$8.y, _vector$8.z);
		}
		return this;
	}
	/**
	* Applies the given 3x3 normal matrix to the given attribute. Only works with
	* item size `3`.
	*
	* @param {Matrix3} m - The normal matrix to apply.
	* @return {InterleavedBufferAttribute} A reference to this instance.
	*/
	applyNormalMatrix(m) {
		for (let i = 0, l = this.count; i < l; i++) {
			_vector$8.fromBufferAttribute(this, i);
			_vector$8.applyNormalMatrix(m);
			this.setXYZ(i, _vector$8.x, _vector$8.y, _vector$8.z);
		}
		return this;
	}
	/**
	* Applies the given 4x4 matrix to the given attribute. Only works with
	* item size `3` and with direction vectors.
	*
	* @param {Matrix4} m - The matrix to apply.
	* @return {InterleavedBufferAttribute} A reference to this instance.
	*/
	transformDirection(m) {
		for (let i = 0, l = this.count; i < l; i++) {
			_vector$8.fromBufferAttribute(this, i);
			_vector$8.transformDirection(m);
			this.setXYZ(i, _vector$8.x, _vector$8.y, _vector$8.z);
		}
		return this;
	}
	/**
	* Returns the given component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} component - The component index.
	* @return {number} The returned value.
	*/
	getComponent(index, component) {
		let value = this.array[index * this.data.stride + this.offset + component];
		if (this.normalized) value = denormalize(value, this.array);
		return value;
	}
	/**
	* Sets the given value to the given component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} component - The component index.
	* @param {number} value - The value to set.
	* @return {InterleavedBufferAttribute} A reference to this instance.
	*/
	setComponent(index, component, value) {
		if (this.normalized) value = normalize(value, this.array);
		this.data.array[index * this.data.stride + this.offset + component] = value;
		return this;
	}
	/**
	* Sets the x component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} x - The value to set.
	* @return {InterleavedBufferAttribute} A reference to this instance.
	*/
	setX(index, x) {
		if (this.normalized) x = normalize(x, this.array);
		this.data.array[index * this.data.stride + this.offset] = x;
		return this;
	}
	/**
	* Sets the y component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} y - The value to set.
	* @return {InterleavedBufferAttribute} A reference to this instance.
	*/
	setY(index, y) {
		if (this.normalized) y = normalize(y, this.array);
		this.data.array[index * this.data.stride + this.offset + 1] = y;
		return this;
	}
	/**
	* Sets the z component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} z - The value to set.
	* @return {InterleavedBufferAttribute} A reference to this instance.
	*/
	setZ(index, z) {
		if (this.normalized) z = normalize(z, this.array);
		this.data.array[index * this.data.stride + this.offset + 2] = z;
		return this;
	}
	/**
	* Sets the w component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} w - The value to set.
	* @return {InterleavedBufferAttribute} A reference to this instance.
	*/
	setW(index, w) {
		if (this.normalized) w = normalize(w, this.array);
		this.data.array[index * this.data.stride + this.offset + 3] = w;
		return this;
	}
	/**
	* Returns the x component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @return {number} The x component.
	*/
	getX(index) {
		let x = this.data.array[index * this.data.stride + this.offset];
		if (this.normalized) x = denormalize(x, this.array);
		return x;
	}
	/**
	* Returns the y component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @return {number} The y component.
	*/
	getY(index) {
		let y = this.data.array[index * this.data.stride + this.offset + 1];
		if (this.normalized) y = denormalize(y, this.array);
		return y;
	}
	/**
	* Returns the z component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @return {number} The z component.
	*/
	getZ(index) {
		let z = this.data.array[index * this.data.stride + this.offset + 2];
		if (this.normalized) z = denormalize(z, this.array);
		return z;
	}
	/**
	* Returns the w component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @return {number} The w component.
	*/
	getW(index) {
		let w = this.data.array[index * this.data.stride + this.offset + 3];
		if (this.normalized) w = denormalize(w, this.array);
		return w;
	}
	/**
	* Sets the x and y component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} x - The value for the x component to set.
	* @param {number} y - The value for the y component to set.
	* @return {InterleavedBufferAttribute} A reference to this instance.
	*/
	setXY(index, x, y) {
		index = index * this.data.stride + this.offset;
		if (this.normalized) {
			x = normalize(x, this.array);
			y = normalize(y, this.array);
		}
		this.data.array[index + 0] = x;
		this.data.array[index + 1] = y;
		return this;
	}
	/**
	* Sets the x, y and z component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} x - The value for the x component to set.
	* @param {number} y - The value for the y component to set.
	* @param {number} z - The value for the z component to set.
	* @return {InterleavedBufferAttribute} A reference to this instance.
	*/
	setXYZ(index, x, y, z) {
		index = index * this.data.stride + this.offset;
		if (this.normalized) {
			x = normalize(x, this.array);
			y = normalize(y, this.array);
			z = normalize(z, this.array);
		}
		this.data.array[index + 0] = x;
		this.data.array[index + 1] = y;
		this.data.array[index + 2] = z;
		return this;
	}
	/**
	* Sets the x, y, z and w component of the vector at the given index.
	*
	* @param {number} index - The index into the buffer attribute.
	* @param {number} x - The value for the x component to set.
	* @param {number} y - The value for the y component to set.
	* @param {number} z - The value for the z component to set.
	* @param {number} w - The value for the w component to set.
	* @return {InterleavedBufferAttribute} A reference to this instance.
	*/
	setXYZW(index, x, y, z, w) {
		index = index * this.data.stride + this.offset;
		if (this.normalized) {
			x = normalize(x, this.array);
			y = normalize(y, this.array);
			z = normalize(z, this.array);
			w = normalize(w, this.array);
		}
		this.data.array[index + 0] = x;
		this.data.array[index + 1] = y;
		this.data.array[index + 2] = z;
		this.data.array[index + 3] = w;
		return this;
	}
	/**
	* Returns a new buffer attribute with copied values from this instance.
	*
	* If no parameter is provided, cloning an interleaved buffer attribute will de-interleave buffer data.
	*
	* @param {Object} [data] - An object with interleaved buffers that allows to retain the interleaved property.
	* @return {BufferAttribute|InterleavedBufferAttribute} A clone of this instance.
	*/
	clone(data) {
		if (data === void 0) {
			log("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
			const array = [];
			for (let i = 0; i < this.count; i++) {
				const index = i * this.data.stride + this.offset;
				for (let j = 0; j < this.itemSize; j++) array.push(this.data.array[index + j]);
			}
			return new BufferAttribute(new this.array.constructor(array), this.itemSize, this.normalized);
		} else {
			if (data.interleavedBuffers === void 0) data.interleavedBuffers = {};
			if (data.interleavedBuffers[this.data.uuid] === void 0) data.interleavedBuffers[this.data.uuid] = this.data.clone(data);
			return new InterleavedBufferAttribute(data.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
		}
	}
	/**
	* Serializes the buffer attribute into JSON.
	*
	* If no parameter is provided, cloning an interleaved buffer attribute will de-interleave buffer data.
	*
	* @param {Object} [data] - An optional value holding meta information about the serialization.
	* @return {Object} A JSON object representing the serialized buffer attribute.
	*/
	toJSON(data) {
		if (data === void 0) {
			log("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
			const array = [];
			for (let i = 0; i < this.count; i++) {
				const index = i * this.data.stride + this.offset;
				for (let j = 0; j < this.itemSize; j++) array.push(this.data.array[index + j]);
			}
			return {
				itemSize: this.itemSize,
				type: this.array.constructor.name,
				array,
				normalized: this.normalized
			};
		} else {
			if (data.interleavedBuffers === void 0) data.interleavedBuffers = {};
			if (data.interleavedBuffers[this.data.uuid] === void 0) data.interleavedBuffers[this.data.uuid] = this.data.toJSON(data);
			return {
				isInterleavedBufferAttribute: true,
				itemSize: this.itemSize,
				data: this.data.uuid,
				offset: this.offset,
				normalized: this.normalized
			};
		}
	}
};
const _vector1 = /*@__PURE__*/ new Vector3();
const _vector2 = /*@__PURE__*/ new Vector3();
const _normalMatrix = /*@__PURE__*/ new Matrix3();
/**
* A two dimensional surface that extends infinitely in 3D space, represented
* in [Hessian normal form](https://mathworld.wolfram.com/HessianNormalForm.html)
* by a unit length normal vector and a constant.
*/
var Plane = class {
	/**
	* Constructs a new plane.
	*
	* @param {Vector3} [normal=(1,0,0)] - A unit length vector defining the normal of the plane.
	* @param {number} [constant=0] - The signed distance from the origin to the plane.
	*/
	constructor(normal = new Vector3(1, 0, 0), constant = 0) {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isPlane = true;
		/**
		* A unit length vector defining the normal of the plane.
		*
		* @type {Vector3}
		*/
		this.normal = normal;
		/**
		* The signed distance from the origin to the plane.
		*
		* @type {number}
		* @default 0
		*/
		this.constant = constant;
	}
	/**
	* Sets the plane components by copying the given values.
	*
	* @param {Vector3} normal - The normal.
	* @param {number} constant - The constant.
	* @return {Plane} A reference to this plane.
	*/
	set(normal, constant) {
		this.normal.copy(normal);
		this.constant = constant;
		return this;
	}
	/**
	* Sets the plane components by defining `x`, `y`, `z` as the
	* plane normal and `w` as the constant.
	*
	* @param {number} x - The value for the normal's x component.
	* @param {number} y - The value for the normal's y component.
	* @param {number} z - The value for the normal's z component.
	* @param {number} w - The constant value.
	* @return {Plane} A reference to this plane.
	*/
	setComponents(x, y, z, w) {
		this.normal.set(x, y, z);
		this.constant = w;
		return this;
	}
	/**
	* Sets the plane from the given normal and coplanar point (that is a point
	* that lies onto the plane).
	*
	* @param {Vector3} normal - The normal.
	* @param {Vector3} point - A coplanar point.
	* @return {Plane} A reference to this plane.
	*/
	setFromNormalAndCoplanarPoint(normal, point) {
		this.normal.copy(normal);
		this.constant = -point.dot(this.normal);
		return this;
	}
	/**
	* Sets the plane from three coplanar points. The winding order is
	* assumed to be counter-clockwise, and determines the direction of
	* the plane normal.
	*
	* @param {Vector3} a - The first coplanar point.
	* @param {Vector3} b - The second coplanar point.
	* @param {Vector3} c - The third coplanar point.
	* @return {Plane} A reference to this plane.
	*/
	setFromCoplanarPoints(a, b, c) {
		const normal = _vector1.subVectors(c, b).cross(_vector2.subVectors(a, b)).normalize();
		this.setFromNormalAndCoplanarPoint(normal, a);
		return this;
	}
	/**
	* Copies the values of the given plane to this instance.
	*
	* @param {Plane} plane - The plane to copy.
	* @return {Plane} A reference to this plane.
	*/
	copy(plane) {
		this.normal.copy(plane.normal);
		this.constant = plane.constant;
		return this;
	}
	/**
	* Normalizes the plane normal and adjusts the constant accordingly.
	*
	* @return {Plane} A reference to this plane.
	*/
	normalize() {
		const inverseNormalLength = 1 / this.normal.length();
		this.normal.multiplyScalar(inverseNormalLength);
		this.constant *= inverseNormalLength;
		return this;
	}
	/**
	* Negates both the plane normal and the constant.
	*
	* @return {Plane} A reference to this plane.
	*/
	negate() {
		this.constant *= -1;
		this.normal.negate();
		return this;
	}
	/**
	* Returns the signed distance from the given point to this plane.
	*
	* @param {Vector3} point - The point to compute the distance for.
	* @return {number} The signed distance.
	*/
	distanceToPoint(point) {
		return this.normal.dot(point) + this.constant;
	}
	/**
	* Returns the signed distance from the given sphere to this plane.
	*
	* @param {Sphere} sphere - The sphere to compute the distance for.
	* @return {number} The signed distance.
	*/
	distanceToSphere(sphere) {
		return this.distanceToPoint(sphere.center) - sphere.radius;
	}
	/**
	* Projects a the given point onto the plane.
	*
	* @param {Vector3} point - The point to project.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} The projected point on the plane.
	*/
	projectPoint(point, target) {
		return target.copy(point).addScaledVector(this.normal, -this.distanceToPoint(point));
	}
	/**
	* Returns the intersection point of the passed line and the plane. Returns
	* `null` if the line does not intersect. Returns the line's starting point if
	* the line is coplanar with the plane.
	*
	* @param {Line3} line - The line to compute the intersection for.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @param {boolean} [clampToLine=true] - Whether to clamp the intersection to the line segment.
	* @return {?Vector3} The intersection point. Returns `null` if no intersection is detected.
	*/
	intersectLine(line, target, clampToLine = true) {
		const direction = line.delta(_vector1);
		const denominator = this.normal.dot(direction);
		if (denominator === 0) {
			if (this.distanceToPoint(line.start) === 0) return target.copy(line.start);
			return null;
		}
		const t = -(line.start.dot(this.normal) + this.constant) / denominator;
		if (clampToLine === true && (t < 0 || t > 1)) return null;
		return target.copy(line.start).addScaledVector(direction, t);
	}
	/**
	* Returns `true` if the given line segment intersects with (passes through) the plane.
	*
	* @param {Line3} line - The line to test.
	* @return {boolean} Whether the given line segment intersects with the plane or not.
	*/
	intersectsLine(line) {
		const startSign = this.distanceToPoint(line.start);
		const endSign = this.distanceToPoint(line.end);
		return startSign < 0 && endSign > 0 || endSign < 0 && startSign > 0;
	}
	/**
	* Returns `true` if the given bounding box intersects with the plane.
	*
	* @param {Box3} box - The bounding box to test.
	* @return {boolean} Whether the given bounding box intersects with the plane or not.
	*/
	intersectsBox(box) {
		return box.intersectsPlane(this);
	}
	/**
	* Returns `true` if the given bounding sphere intersects with the plane.
	*
	* @param {Sphere} sphere - The bounding sphere to test.
	* @return {boolean} Whether the given bounding sphere intersects with the plane or not.
	*/
	intersectsSphere(sphere) {
		return sphere.intersectsPlane(this);
	}
	/**
	* Returns a coplanar vector to the plane, by calculating the
	* projection of the normal at the origin onto the plane.
	*
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} The coplanar point.
	*/
	coplanarPoint(target) {
		return target.copy(this.normal).multiplyScalar(-this.constant);
	}
	/**
	* Apply a 4x4 matrix to the plane. The matrix must be an affine, homogeneous transform.
	*
	* The optional normal matrix can be pre-computed like so:
	* ```js
	* const optionalNormalMatrix = new THREE.Matrix3().getNormalMatrix( matrix );
	* ```
	*
	* @param {Matrix4} matrix - The transformation matrix.
	* @param {Matrix4} [optionalNormalMatrix] - A pre-computed normal matrix.
	* @return {Plane} A reference to this plane.
	*/
	applyMatrix4(matrix, optionalNormalMatrix) {
		const normalMatrix = optionalNormalMatrix || _normalMatrix.getNormalMatrix(matrix);
		const referencePoint = this.coplanarPoint(_vector1).applyMatrix4(matrix);
		const normal = this.normal.applyMatrix3(normalMatrix).normalize();
		this.constant = -referencePoint.dot(normal);
		return this;
	}
	/**
	* Translates the plane by the distance defined by the given offset vector.
	* Note that this only affects the plane constant and will not affect the normal vector.
	*
	* @param {Vector3} offset - The offset vector.
	* @return {Plane} A reference to this plane.
	*/
	translate(offset) {
		this.constant -= offset.dot(this.normal);
		return this;
	}
	/**
	* Returns `true` if this plane is equal with the given one.
	*
	* @param {Plane} plane - The plane to test for equality.
	* @return {boolean} Whether this plane is equal with the given one.
	*/
	equals(plane) {
		return plane.normal.equals(this.normal) && plane.constant === this.constant;
	}
	/**
	* Returns a new plane with copied values from this instance.
	*
	* @return {Plane} A clone of this instance.
	*/
	clone() {
		return new this.constructor().copy(this);
	}
	/**
	* Returns a serialized structure of the plane.
	*
	* @return {Object} Serialized structure with fields representing the object state.
	*/
	toJSON() {
		return {
			normal: this.normal.toArray(),
			constant: this.constant
		};
	}
	/**
	* Sets the plane properties from the given JSON.
	*
	* @param {Object} json - The serialized json to set the plane from.
	* @return {Plane} A reference to this plane.
	*/
	fromJSON(json) {
		this.normal.fromArray(json.normal);
		this.constant = json.constant;
		return this;
	}
};
let _materialId = 0;
/**
* Abstract base class for materials.
*
* Materials define the appearance of renderable 3D objects.
*
* @abstract
* @augments EventDispatcher
*/
var Material = class extends EventDispatcher {
	/**
	* Constructs a new material.
	*/
	constructor() {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isMaterial = true;
		/**
		* The ID of the material.
		*
		* @name Material#id
		* @type {number}
		* @readonly
		*/
		Object.defineProperty(this, "id", { value: _materialId++ });
		/**
		* The UUID of the material.
		*
		* @type {string}
		* @readonly
		*/
		this.uuid = generateUUID();
		/**
		* The name of the material.
		*
		* @type {string}
		*/
		this.name = "";
		/**
		* The type property is used for detecting the object type
		* in context of serialization/deserialization.
		*
		* @type {string}
		* @readonly
		*/
		this.type = "Material";
		/**
		* Defines the blending type of the material.
		*
		* It must be set to `CustomBlending` if custom blending properties like
		* {@link Material#blendSrc}, {@link Material#blendDst} or {@link Material#blendEquation}
		* should have any effect.
		*
		* @type {(NoBlending|NormalBlending|AdditiveBlending|SubtractiveBlending|MultiplyBlending|CustomBlending)}
		* @default NormalBlending
		*/
		this.blending = 1;
		/**
		* Defines which side of faces will be rendered - front, back or both.
		*
		* @type {(FrontSide|BackSide|DoubleSide)}
		* @default FrontSide
		*/
		this.side = 0;
		/**
		* If set to `true`, vertex colors should be used.
		*
		* The engine supports RGB and RGBA vertex colors depending on whether a three (RGB) or
		* four (RGBA) component color buffer attribute is used.
		*
		* @type {boolean}
		* @default false
		*/
		this.vertexColors = false;
		/**
		* Defines how transparent the material is.
		* A value of `0.0` indicates fully transparent, `1.0` is fully opaque.
		*
		* If the {@link Material#transparent} is not set to `true`,
		* the material will remain fully opaque and this value will only affect its color.
		*
		* @type {number}
		* @default 1
		*/
		this.opacity = 1;
		/**
		* Defines whether this material is transparent. This has an effect on
		* rendering as transparent objects need special treatment and are rendered
		* after non-transparent objects.
		*
		* When set to true, the extent to which the material is transparent is
		* controlled by {@link Material#opacity}.
		*
		* @type {boolean}
		* @default false
		*/
		this.transparent = false;
		/**
		* Enables alpha hashed transparency, an alternative to {@link Material#transparent} or
		* {@link Material#alphaTest}. The material will not be rendered if opacity is lower than
		* a random threshold. Randomization introduces some grain or noise, but approximates alpha
		* blending without the associated problems of sorting. Using TAA can reduce the resulting noise.
		*
		* @type {boolean}
		* @default false
		*/
		this.alphaHash = false;
		/**
		* Defines the blending source factor.
		*
		* @type {(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
		* @default SrcAlphaFactor
		*/
		this.blendSrc = 204;
		/**
		* Defines the blending destination factor.
		*
		* @type {(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
		* @default OneMinusSrcAlphaFactor
		*/
		this.blendDst = 205;
		/**
		* Defines the blending equation.
		*
		* @type {(AddEquation|SubtractEquation|ReverseSubtractEquation|MinEquation|MaxEquation)}
		* @default AddEquation
		*/
		this.blendEquation = 100;
		/**
		* Defines the blending source alpha factor.
		*
		* @type {?(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
		* @default null
		*/
		this.blendSrcAlpha = null;
		/**
		* Defines the blending destination alpha factor.
		*
		* @type {?(ZeroFactor|OneFactor|SrcColorFactor|OneMinusSrcColorFactor|SrcAlphaFactor|OneMinusSrcAlphaFactor|DstAlphaFactor|OneMinusDstAlphaFactor|DstColorFactor|OneMinusDstColorFactor|SrcAlphaSaturateFactor|ConstantColorFactor|OneMinusConstantColorFactor|ConstantAlphaFactor|OneMinusConstantAlphaFactor)}
		* @default null
		*/
		this.blendDstAlpha = null;
		/**
		* Defines the blending equation of the alpha channel.
		*
		* @type {?(AddEquation|SubtractEquation|ReverseSubtractEquation|MinEquation|MaxEquation)}
		* @default null
		*/
		this.blendEquationAlpha = null;
		/**
		* Represents the RGB values of the constant blend color.
		*
		* This property has only an effect when using custom blending with `ConstantColor` or `OneMinusConstantColor`.
		*
		* @type {Color}
		* @default (0,0,0)
		*/
		this.blendColor = new Color(0, 0, 0);
		/**
		* Represents the alpha value of the constant blend color.
		*
		* This property has only an effect when using custom blending with `ConstantAlpha` or `OneMinusConstantAlpha`.
		*
		* @type {number}
		* @default 0
		*/
		this.blendAlpha = 0;
		/**
		* Defines the depth function.
		*
		* @type {(NeverDepth|AlwaysDepth|LessDepth|LessEqualDepth|EqualDepth|GreaterEqualDepth|GreaterDepth|NotEqualDepth)}
		* @default LessEqualDepth
		*/
		this.depthFunc = 3;
		/**
		* Whether to have depth test enabled when rendering this material.
		* When the depth test is disabled, the depth write will also be implicitly disabled.
		*
		* @type {boolean}
		* @default true
		*/
		this.depthTest = true;
		/**
		* Whether rendering this material has any effect on the depth buffer.
		*
		* When drawing 2D overlays it can be useful to disable the depth writing in
		* order to layer several things together without creating z-index artifacts.
		*
		* @type {boolean}
		* @default true
		*/
		this.depthWrite = true;
		/**
		* The bit mask to use when writing to the stencil buffer.
		*
		* @type {number}
		* @default 0xff
		*/
		this.stencilWriteMask = 255;
		/**
		* The stencil comparison function to use.
		*
		* @type {NeverStencilFunc|LessStencilFunc|EqualStencilFunc|LessEqualStencilFunc|GreaterStencilFunc|NotEqualStencilFunc|GreaterEqualStencilFunc|AlwaysStencilFunc}
		* @default AlwaysStencilFunc
		*/
		this.stencilFunc = 519;
		/**
		* The value to use when performing stencil comparisons or stencil operations.
		*
		* @type {number}
		* @default 0
		*/
		this.stencilRef = 0;
		/**
		* The bit mask to use when comparing against the stencil buffer.
		*
		* @type {number}
		* @default 0xff
		*/
		this.stencilFuncMask = 255;
		/**
		* Which stencil operation to perform when the comparison function returns `false`.
		*
		* @type {ZeroStencilOp|KeepStencilOp|ReplaceStencilOp|IncrementStencilOp|DecrementStencilOp|IncrementWrapStencilOp|DecrementWrapStencilOp|InvertStencilOp}
		* @default KeepStencilOp
		*/
		this.stencilFail = KeepStencilOp;
		/**
		* Which stencil operation to perform when the comparison function returns
		* `true` but the depth test fails.
		*
		* @type {ZeroStencilOp|KeepStencilOp|ReplaceStencilOp|IncrementStencilOp|DecrementStencilOp|IncrementWrapStencilOp|DecrementWrapStencilOp|InvertStencilOp}
		* @default KeepStencilOp
		*/
		this.stencilZFail = KeepStencilOp;
		/**
		* Which stencil operation to perform when the comparison function returns
		* `true` and the depth test passes.
		*
		* @type {ZeroStencilOp|KeepStencilOp|ReplaceStencilOp|IncrementStencilOp|DecrementStencilOp|IncrementWrapStencilOp|DecrementWrapStencilOp|InvertStencilOp}
		* @default KeepStencilOp
		*/
		this.stencilZPass = KeepStencilOp;
		/**
		* Whether stencil operations are performed against the stencil buffer. In
		* order to perform writes or comparisons against the stencil buffer this
		* value must be `true`.
		*
		* @type {boolean}
		* @default false
		*/
		this.stencilWrite = false;
		/**
		* User-defined clipping planes specified as THREE.Plane objects in world
		* space. These planes apply to the objects this material is attached to.
		* Points in space whose signed distance to the plane is negative are clipped
		* (not rendered). This requires {@link WebGLRenderer#localClippingEnabled} to
		* be `true`.
		*
		* @type {?Array<Plane>}
		* @default null
		*/
		this.clippingPlanes = null;
		/**
		* Changes the behavior of clipping planes so that only their intersection is
		* clipped, rather than their union.
		*
		* @type {boolean}
		* @default false
		*/
		this.clipIntersection = false;
		/**
		* Defines whether to clip shadows according to the clipping planes specified
		* on this material.
		*
		* @type {boolean}
		* @default false
		*/
		this.clipShadows = false;
		/**
		* Defines which side of faces cast shadows. If `null`, the side casting shadows
		* is determined as follows:
		*
		* - When {@link Material#side} is set to `FrontSide`, the back side cast shadows.
		* - When {@link Material#side} is set to `BackSide`, the front side cast shadows.
		* - When {@link Material#side} is set to `DoubleSide`, both sides cast shadows.
		*
		* @type {?(FrontSide|BackSide|DoubleSide)}
		* @default null
		*/
		this.shadowSide = null;
		/**
		* Whether to render the material's color.
		*
		* This can be used in conjunction with {@link Object3D#renderOder} to create invisible
		* objects that occlude other objects.
		*
		* @type {boolean}
		* @default true
		*/
		this.colorWrite = true;
		/**
		* Override the renderer's default precision for this material.
		*
		* @type {?('highp'|'mediump'|'lowp')}
		* @default null
		*/
		this.precision = null;
		/**
		* Whether to use polygon offset or not. When enabled, each fragment's depth value will
		* be offset after it is interpolated from the depth values of the appropriate vertices.
		* The offset is added before the depth test is performed and before the value is written
		* into the depth buffer.
		*
		* Can be useful for rendering hidden-line images, for applying decals to surfaces, and for
		* rendering solids with highlighted edges.
		*
		* @type {boolean}
		* @default false
		*/
		this.polygonOffset = false;
		/**
		* Specifies a scale factor that is used to create a variable depth offset for each polygon.
		*
		* @type {number}
		* @default 0
		*/
		this.polygonOffsetFactor = 0;
		/**
		* Is multiplied by an implementation-specific value to create a constant depth offset.
		*
		* @type {number}
		* @default 0
		*/
		this.polygonOffsetUnits = 0;
		/**
		* Whether to apply dithering to the color to remove the appearance of banding.
		*
		* @type {boolean}
		* @default false
		*/
		this.dithering = false;
		/**
		* Whether alpha to coverage should be enabled or not. Can only be used with MSAA-enabled contexts
		* (meaning when the renderer was created with *antialias* parameter set to `true`). Enabling this
		* will smooth aliasing on clip plane edges and alphaTest-clipped edges.
		*
		* @type {boolean}
		* @default false
		*/
		this.alphaToCoverage = false;
		/**
		* Whether to premultiply the alpha (transparency) value.
		*
		* @type {boolean}
		* @default false
		*/
		this.premultipliedAlpha = false;
		/**
		* Whether double-sided, transparent objects should be rendered with a single pass or not.
		*
		* The engine renders double-sided, transparent objects with two draw calls (back faces first,
		* then front faces) to mitigate transparency artifacts. There are scenarios however where this
		* approach produces no quality gains but still doubles draw calls e.g. when rendering flat
		* vegetation like grass sprites. In these cases, set the `forceSinglePass` flag to `true` to
		* disable the two pass rendering to avoid performance issues.
		*
		* @type {boolean}
		* @default false
		*/
		this.forceSinglePass = false;
		/**
		* Whether it's possible to override the material with {@link Scene#overrideMaterial} or not.
		*
		* @type {boolean}
		* @default true
		*/
		this.allowOverride = true;
		/**
		* Defines whether 3D objects using this material are visible.
		*
		* @type {boolean}
		* @default true
		*/
		this.visible = true;
		/**
		* Defines whether this material is tone mapped according to the renderer's tone mapping setting.
		*
		* It is ignored when rendering to a render target or using post processing or when using
		* `WebGPURenderer`. In all these cases, all materials are honored by tone mapping.
		*
		* @type {boolean}
		* @default true
		*/
		this.toneMapped = true;
		/**
		* An object that can be used to store custom data about the Material. It
		* should not hold references to functions as these will not be cloned.
		*
		* @type {Object}
		*/
		this.userData = {};
		/**
		* This starts at `0` and counts how many times {@link Material#needsUpdate} is set to `true`.
		*
		* @type {number}
		* @readonly
		* @default 0
		*/
		this.version = 0;
		this._alphaTest = 0;
	}
	/**
	* Sets the alpha value to be used when running an alpha test. The material
	* will not be rendered if the opacity is lower than this value.
	*
	* @type {number}
	* @readonly
	* @default 0
	*/
	get alphaTest() {
		return this._alphaTest;
	}
	set alphaTest(value) {
		if (this._alphaTest > 0 !== value > 0) this.version++;
		this._alphaTest = value;
	}
	/**
	* An optional callback that is executed immediately before the material is used to render a 3D object.
	*
	* This method can only be used when rendering with {@link WebGLRenderer}.
	*
	* @param {WebGLRenderer} renderer - The renderer.
	* @param {Scene} scene - The scene.
	* @param {Camera} camera - The camera that is used to render the scene.
	* @param {BufferGeometry} geometry - The 3D object's geometry.
	* @param {Object3D} object - The 3D object.
	* @param {Object} group - The geometry group data.
	*/
	onBeforeRender() {}
	/**
	* An optional callback that is executed immediately before the shader
	* program is compiled. This function is called with the shader source code
	* as a parameter. Useful for the modification of built-in materials.
	*
	* This method can only be used when rendering with {@link WebGLRenderer}. The
	* recommended approach when customizing materials is to use `WebGPURenderer` with the new
	* Node Material system and [TSL](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language).
	*
	* @param {{vertexShader:string,fragmentShader:string,uniforms:Object}} shaderobject - The object holds the uniforms and the vertex and fragment shader source.
	* @param {WebGLRenderer} renderer - A reference to the renderer.
	*/
	onBeforeCompile() {}
	/**
	* In case {@link Material#onBeforeCompile} is used, this callback can be used to identify
	* values of settings used in `onBeforeCompile()`, so three.js can reuse a cached
	* shader or recompile the shader for this material as needed.
	*
	* This method can only be used when rendering with {@link WebGLRenderer}.
	*
	* @return {string} The custom program cache key.
	*/
	customProgramCacheKey() {
		return this.onBeforeCompile.toString();
	}
	/**
	* This method can be used to set default values from parameter objects.
	* It is a generic implementation so it can be used with different types
	* of materials.
	*
	* @param {Object} [values] - The material values to set.
	*/
	setValues(values) {
		if (values === void 0) return;
		for (const key in values) {
			const newValue = values[key];
			if (newValue === void 0) {
				warn(`Material: parameter '${key}' has value of undefined.`);
				continue;
			}
			const currentValue = this[key];
			if (currentValue === void 0) {
				warn(`Material: '${key}' is not a property of THREE.${this.type}.`);
				continue;
			}
			if (currentValue && currentValue.isColor) currentValue.set(newValue);
			else if (currentValue && currentValue.isVector2 && newValue && newValue.isVector2 || currentValue && currentValue.isEuler && newValue && newValue.isEuler || currentValue && currentValue.isVector3 && newValue && newValue.isVector3) currentValue.copy(newValue);
			else this[key] = newValue;
		}
	}
	/**
	* Serializes the material into JSON.
	*
	* @param {?(Object|string)} meta - An optional value holding meta information about the serialization.
	* @return {Object} A JSON object representing the serialized material.
	* @see {@link ObjectLoader#parse}
	*/
	toJSON(meta) {
		const isRootObject = meta === void 0 || typeof meta === "string";
		if (isRootObject) meta = {
			textures: {},
			images: {}
		};
		const data = { metadata: {
			version: 4.7,
			type: "Material",
			generator: "Material.toJSON"
		} };
		data.uuid = this.uuid;
		data.type = this.type;
		data.blending = this.blending;
		data.side = this.side;
		data.shadowSide = this.shadowSide;
		data.vertexColors = this.vertexColors;
		data.opacity = this.opacity;
		data.transparent = this.transparent;
		data.blendSrc = this.blendSrc;
		data.blendDst = this.blendDst;
		data.blendEquation = this.blendEquation;
		data.blendSrcAlpha = this.blendSrcAlpha;
		data.blendDstAlpha = this.blendDstAlpha;
		data.blendEquationAlpha = this.blendEquationAlpha;
		data.blendColor = this.blendColor.getHex();
		data.blendAlpha = this.blendAlpha;
		data.depthFunc = this.depthFunc;
		data.depthTest = this.depthTest;
		data.depthWrite = this.depthWrite;
		data.colorWrite = this.colorWrite;
		data.clipIntersection = this.clipIntersection;
		data.clipShadows = this.clipShadows;
		data.stencilWriteMask = this.stencilWriteMask;
		data.stencilFunc = this.stencilFunc;
		data.stencilRef = this.stencilRef;
		data.stencilFuncMask = this.stencilFuncMask;
		data.stencilFail = this.stencilFail;
		data.stencilZFail = this.stencilZFail;
		data.stencilZPass = this.stencilZPass;
		data.stencilWrite = this.stencilWrite;
		data.polygonOffset = this.polygonOffset;
		data.polygonOffsetFactor = this.polygonOffsetFactor;
		data.polygonOffsetUnits = this.polygonOffsetUnits;
		data.dithering = this.dithering;
		data.alphaTest = this.alphaTest;
		data.alphaHash = this.alphaHash;
		data.alphaToCoverage = this.alphaToCoverage;
		data.premultipliedAlpha = this.premultipliedAlpha;
		data.forceSinglePass = this.forceSinglePass;
		data.allowOverride = this.allowOverride;
		data.visible = this.visible;
		data.toneMapped = this.toneMapped;
		data.name = this.name;
		if (this.color && this.color.isColor) data.color = this.color.getHex();
		if (this.roughness !== void 0) data.roughness = this.roughness;
		if (this.metalness !== void 0) data.metalness = this.metalness;
		if (this.sheen !== void 0) data.sheen = this.sheen;
		if (this.sheenColor && this.sheenColor.isColor) data.sheenColor = this.sheenColor.getHex();
		if (this.sheenRoughness !== void 0) data.sheenRoughness = this.sheenRoughness;
		if (this.emissive && this.emissive.isColor) data.emissive = this.emissive.getHex();
		if (this.emissiveIntensity !== void 0) data.emissiveIntensity = this.emissiveIntensity;
		if (this.specular && this.specular.isColor) data.specular = this.specular.getHex();
		if (this.specularIntensity !== void 0) data.specularIntensity = this.specularIntensity;
		if (this.specularColor && this.specularColor.isColor) data.specularColor = this.specularColor.getHex();
		if (this.shininess !== void 0) data.shininess = this.shininess;
		if (this.clearcoat !== void 0) data.clearcoat = this.clearcoat;
		if (this.clearcoatRoughness !== void 0) data.clearcoatRoughness = this.clearcoatRoughness;
		if (this.clearcoatMap && this.clearcoatMap.isTexture) data.clearcoatMap = this.clearcoatMap.toJSON(meta).uuid;
		if (this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture) data.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(meta).uuid;
		if (this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture) {
			data.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(meta).uuid;
			data.clearcoatNormalScale = this.clearcoatNormalScale.toArray();
		}
		if (this.sheenColorMap && this.sheenColorMap.isTexture) data.sheenColorMap = this.sheenColorMap.toJSON(meta).uuid;
		if (this.sheenRoughnessMap && this.sheenRoughnessMap.isTexture) data.sheenRoughnessMap = this.sheenRoughnessMap.toJSON(meta).uuid;
		if (this.dispersion !== void 0) data.dispersion = this.dispersion;
		if (this.retroreflectivity !== void 0) data.retroreflectivity = this.retroreflectivity;
		if (this.iridescence !== void 0) data.iridescence = this.iridescence;
		if (this.iridescenceIOR !== void 0) data.iridescenceIOR = this.iridescenceIOR;
		if (this.iridescenceThicknessRange !== void 0) data.iridescenceThicknessRange = this.iridescenceThicknessRange;
		if (this.iridescenceMap && this.iridescenceMap.isTexture) data.iridescenceMap = this.iridescenceMap.toJSON(meta).uuid;
		if (this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture) data.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(meta).uuid;
		if (this.anisotropy !== void 0) data.anisotropy = this.anisotropy;
		if (this.anisotropyRotation !== void 0) data.anisotropyRotation = this.anisotropyRotation;
		if (this.anisotropyMap && this.anisotropyMap.isTexture) data.anisotropyMap = this.anisotropyMap.toJSON(meta).uuid;
		if (this.map && this.map.isTexture) data.map = this.map.toJSON(meta).uuid;
		if (this.matcap && this.matcap.isTexture) data.matcap = this.matcap.toJSON(meta).uuid;
		if (this.alphaMap && this.alphaMap.isTexture) data.alphaMap = this.alphaMap.toJSON(meta).uuid;
		if (this.lightMap && this.lightMap.isTexture) {
			data.lightMap = this.lightMap.toJSON(meta).uuid;
			data.lightMapIntensity = this.lightMapIntensity;
		}
		if (this.aoMap && this.aoMap.isTexture) {
			data.aoMap = this.aoMap.toJSON(meta).uuid;
			data.aoMapIntensity = this.aoMapIntensity;
		}
		if (this.bumpMap && this.bumpMap.isTexture) {
			data.bumpMap = this.bumpMap.toJSON(meta).uuid;
			data.bumpScale = this.bumpScale;
		}
		if (this.normalMap && this.normalMap.isTexture) {
			data.normalMap = this.normalMap.toJSON(meta).uuid;
			data.normalMapType = this.normalMapType;
			data.normalScale = this.normalScale.toArray();
		}
		if (this.displacementMap && this.displacementMap.isTexture) {
			data.displacementMap = this.displacementMap.toJSON(meta).uuid;
			data.displacementScale = this.displacementScale;
			data.displacementBias = this.displacementBias;
		}
		if (this.roughnessMap && this.roughnessMap.isTexture) data.roughnessMap = this.roughnessMap.toJSON(meta).uuid;
		if (this.metalnessMap && this.metalnessMap.isTexture) data.metalnessMap = this.metalnessMap.toJSON(meta).uuid;
		if (this.emissiveMap && this.emissiveMap.isTexture) data.emissiveMap = this.emissiveMap.toJSON(meta).uuid;
		if (this.specularMap && this.specularMap.isTexture) data.specularMap = this.specularMap.toJSON(meta).uuid;
		if (this.specularIntensityMap && this.specularIntensityMap.isTexture) data.specularIntensityMap = this.specularIntensityMap.toJSON(meta).uuid;
		if (this.specularColorMap && this.specularColorMap.isTexture) data.specularColorMap = this.specularColorMap.toJSON(meta).uuid;
		if (this.envMap && this.envMap.isTexture) {
			data.envMap = this.envMap.toJSON(meta).uuid;
			if (this.combine !== void 0) data.combine = this.combine;
		}
		if (this.envMapRotation !== void 0) data.envMapRotation = this.envMapRotation.toArray();
		if (this.envMapIntensity !== void 0) data.envMapIntensity = this.envMapIntensity;
		if (this.reflectivity !== void 0) data.reflectivity = this.reflectivity;
		if (this.refractionRatio !== void 0) data.refractionRatio = this.refractionRatio;
		if (this.gradientMap && this.gradientMap.isTexture) data.gradientMap = this.gradientMap.toJSON(meta).uuid;
		if (this.transmission !== void 0) data.transmission = this.transmission;
		if (this.transmissionMap && this.transmissionMap.isTexture) data.transmissionMap = this.transmissionMap.toJSON(meta).uuid;
		if (this.thickness !== void 0) data.thickness = this.thickness;
		if (this.thicknessMap && this.thicknessMap.isTexture) data.thicknessMap = this.thicknessMap.toJSON(meta).uuid;
		if (this.attenuationDistance !== void 0) data.attenuationDistance = this.attenuationDistance;
		if (this.attenuationColor !== void 0) data.attenuationColor = this.attenuationColor.getHex();
		if (this.size !== void 0) data.size = this.size;
		if (this.sizeAttenuation !== void 0) data.sizeAttenuation = this.sizeAttenuation;
		if (Array.isArray(this.clippingPlanes) && this.clippingPlanes.length > 0) data.clippingPlanes = this.clippingPlanes.map((plane) => plane.toJSON());
		if (this.rotation !== void 0) data.rotation = this.rotation;
		if (this.depthPacking !== void 0) data.depthPacking = this.depthPacking;
		if (this.linewidth !== void 0) data.linewidth = this.linewidth;
		if (this.linecap !== void 0) data.linecap = this.linecap;
		if (this.linejoin !== void 0) data.linejoin = this.linejoin;
		if (this.dashSize !== void 0) data.dashSize = this.dashSize;
		if (this.gapSize !== void 0) data.gapSize = this.gapSize;
		if (this.scale !== void 0) data.scale = this.scale;
		if (this.wireframe !== void 0) data.wireframe = this.wireframe;
		if (this.wireframeLinewidth !== void 0) data.wireframeLinewidth = this.wireframeLinewidth;
		if (this.wireframeLinecap !== void 0) data.wireframeLinecap = this.wireframeLinecap;
		if (this.wireframeLinejoin !== void 0) data.wireframeLinejoin = this.wireframeLinejoin;
		if (this.flatShading !== void 0) data.flatShading = this.flatShading;
		if (this.fog !== void 0) data.fog = this.fog;
		if (Object.keys(this.userData).length > 0) data.userData = this.userData;
		function extractFromCache(cache) {
			const values = [];
			for (const key in cache) {
				const data = cache[key];
				delete data.metadata;
				values.push(data);
			}
			return values;
		}
		if (isRootObject) {
			const textures = extractFromCache(meta.textures);
			const images = extractFromCache(meta.images);
			if (textures.length > 0) data.textures = textures;
			if (images.length > 0) data.images = images;
		}
		return data;
	}
	/**
	* Deserializes the material from the given JSON.
	*
	* @param {Object} json - The JSON holding the serialized material.
	* @param {Object<string,Texture>} textures - A dictionary holding textures referenced by the material.
	* @return {Material} A reference to this material.
	*/
	fromJSON(json, textures) {
		if (json.uuid !== void 0) this.uuid = json.uuid;
		if (json.name !== void 0) this.name = json.name;
		if (json.color !== void 0 && this.color !== void 0) this.color.setHex(json.color);
		if (json.roughness !== void 0) this.roughness = json.roughness;
		if (json.metalness !== void 0) this.metalness = json.metalness;
		if (json.sheen !== void 0) this.sheen = json.sheen;
		if (json.sheenColor !== void 0) this.sheenColor = new Color().setHex(json.sheenColor);
		if (json.sheenRoughness !== void 0) this.sheenRoughness = json.sheenRoughness;
		if (json.emissive !== void 0 && this.emissive !== void 0) this.emissive.setHex(json.emissive);
		if (json.specular !== void 0 && this.specular !== void 0) this.specular.setHex(json.specular);
		if (json.specularIntensity !== void 0) this.specularIntensity = json.specularIntensity;
		if (json.specularColor !== void 0 && this.specularColor !== void 0) this.specularColor.setHex(json.specularColor);
		if (json.shininess !== void 0) this.shininess = json.shininess;
		if (json.clearcoat !== void 0) this.clearcoat = json.clearcoat;
		if (json.clearcoatRoughness !== void 0) this.clearcoatRoughness = json.clearcoatRoughness;
		if (json.dispersion !== void 0) this.dispersion = json.dispersion;
		if (json.retroreflectivity !== void 0) this.retroreflectivity = json.retroreflectivity;
		if (json.iridescence !== void 0) this.iridescence = json.iridescence;
		if (json.iridescenceIOR !== void 0) this.iridescenceIOR = json.iridescenceIOR;
		if (json.iridescenceThicknessRange !== void 0) this.iridescenceThicknessRange = json.iridescenceThicknessRange;
		if (json.transmission !== void 0) this.transmission = json.transmission;
		if (json.thickness !== void 0) this.thickness = json.thickness;
		if (json.attenuationDistance !== void 0) this.attenuationDistance = json.attenuationDistance;
		if (json.attenuationColor !== void 0 && this.attenuationColor !== void 0) this.attenuationColor.setHex(json.attenuationColor);
		if (json.anisotropy !== void 0) this.anisotropy = json.anisotropy;
		if (json.anisotropyRotation !== void 0) this.anisotropyRotation = json.anisotropyRotation;
		if (json.fog !== void 0) this.fog = json.fog;
		if (json.flatShading !== void 0) this.flatShading = json.flatShading;
		if (json.blending !== void 0) this.blending = json.blending;
		if (json.combine !== void 0) this.combine = json.combine;
		if (json.side !== void 0) this.side = json.side;
		if (json.shadowSide !== void 0) this.shadowSide = json.shadowSide;
		if (json.opacity !== void 0) this.opacity = json.opacity;
		if (json.transparent !== void 0) this.transparent = json.transparent;
		if (json.alphaTest !== void 0) this.alphaTest = json.alphaTest;
		if (json.alphaHash !== void 0) this.alphaHash = json.alphaHash;
		if (json.depthFunc !== void 0) this.depthFunc = json.depthFunc;
		if (json.depthTest !== void 0) this.depthTest = json.depthTest;
		if (json.depthWrite !== void 0) this.depthWrite = json.depthWrite;
		if (json.colorWrite !== void 0) this.colorWrite = json.colorWrite;
		if (json.clippingPlanes !== void 0) this.clippingPlanes = json.clippingPlanes.map((plane) => new Plane().fromJSON(plane));
		if (json.clipIntersection !== void 0) this.clipIntersection = json.clipIntersection;
		if (json.clipShadows !== void 0) this.clipShadows = json.clipShadows;
		if (json.depthPacking !== void 0) this.depthPacking = json.depthPacking;
		if (json.blendSrc !== void 0) this.blendSrc = json.blendSrc;
		if (json.blendDst !== void 0) this.blendDst = json.blendDst;
		if (json.blendEquation !== void 0) this.blendEquation = json.blendEquation;
		if (json.blendSrcAlpha !== void 0) this.blendSrcAlpha = json.blendSrcAlpha;
		if (json.blendDstAlpha !== void 0) this.blendDstAlpha = json.blendDstAlpha;
		if (json.blendEquationAlpha !== void 0) this.blendEquationAlpha = json.blendEquationAlpha;
		if (json.blendColor !== void 0 && this.blendColor !== void 0) this.blendColor.setHex(json.blendColor);
		if (json.blendAlpha !== void 0) this.blendAlpha = json.blendAlpha;
		if (json.stencilWriteMask !== void 0) this.stencilWriteMask = json.stencilWriteMask;
		if (json.stencilFunc !== void 0) this.stencilFunc = json.stencilFunc;
		if (json.stencilRef !== void 0) this.stencilRef = json.stencilRef;
		if (json.stencilFuncMask !== void 0) this.stencilFuncMask = json.stencilFuncMask;
		if (json.stencilFail !== void 0) this.stencilFail = json.stencilFail;
		if (json.stencilZFail !== void 0) this.stencilZFail = json.stencilZFail;
		if (json.stencilZPass !== void 0) this.stencilZPass = json.stencilZPass;
		if (json.stencilWrite !== void 0) this.stencilWrite = json.stencilWrite;
		if (json.wireframe !== void 0) this.wireframe = json.wireframe;
		if (json.wireframeLinewidth !== void 0) this.wireframeLinewidth = json.wireframeLinewidth;
		if (json.wireframeLinecap !== void 0) this.wireframeLinecap = json.wireframeLinecap;
		if (json.wireframeLinejoin !== void 0) this.wireframeLinejoin = json.wireframeLinejoin;
		if (json.rotation !== void 0) this.rotation = json.rotation;
		if (json.linewidth !== void 0) this.linewidth = json.linewidth;
		if (json.linecap !== void 0) this.linecap = json.linecap;
		if (json.linejoin !== void 0) this.linejoin = json.linejoin;
		if (json.dashSize !== void 0) this.dashSize = json.dashSize;
		if (json.gapSize !== void 0) this.gapSize = json.gapSize;
		if (json.scale !== void 0) this.scale = json.scale;
		if (json.polygonOffset !== void 0) this.polygonOffset = json.polygonOffset;
		if (json.polygonOffsetFactor !== void 0) this.polygonOffsetFactor = json.polygonOffsetFactor;
		if (json.polygonOffsetUnits !== void 0) this.polygonOffsetUnits = json.polygonOffsetUnits;
		if (json.dithering !== void 0) this.dithering = json.dithering;
		if (json.alphaToCoverage !== void 0) this.alphaToCoverage = json.alphaToCoverage;
		if (json.premultipliedAlpha !== void 0) this.premultipliedAlpha = json.premultipliedAlpha;
		if (json.forceSinglePass !== void 0) this.forceSinglePass = json.forceSinglePass;
		if (json.allowOverride !== void 0) this.allowOverride = json.allowOverride;
		if (json.visible !== void 0) this.visible = json.visible;
		if (json.toneMapped !== void 0) this.toneMapped = json.toneMapped;
		if (json.userData !== void 0) this.userData = json.userData;
		if (json.vertexColors !== void 0) {
			if (typeof json.vertexColors === "number") this.vertexColors = json.vertexColors > 0;
			else this.vertexColors = json.vertexColors;
		}
		if (json.size !== void 0) this.size = json.size;
		if (json.sizeAttenuation !== void 0) this.sizeAttenuation = json.sizeAttenuation;
		if (json.map !== void 0) this.map = textures[json.map] || null;
		if (json.matcap !== void 0) this.matcap = textures[json.matcap] || null;
		if (json.alphaMap !== void 0) this.alphaMap = textures[json.alphaMap] || null;
		if (json.bumpMap !== void 0) this.bumpMap = textures[json.bumpMap] || null;
		if (json.bumpScale !== void 0) this.bumpScale = json.bumpScale;
		if (json.normalMap !== void 0) this.normalMap = textures[json.normalMap] || null;
		if (json.normalMapType !== void 0) this.normalMapType = json.normalMapType;
		if (json.normalScale !== void 0) {
			let normalScale = json.normalScale;
			if (Array.isArray(normalScale) === false) normalScale = [normalScale, normalScale];
			this.normalScale = new Vector2().fromArray(normalScale);
		}
		if (json.displacementMap !== void 0) this.displacementMap = textures[json.displacementMap] || null;
		if (json.displacementScale !== void 0) this.displacementScale = json.displacementScale;
		if (json.displacementBias !== void 0) this.displacementBias = json.displacementBias;
		if (json.roughnessMap !== void 0) this.roughnessMap = textures[json.roughnessMap] || null;
		if (json.metalnessMap !== void 0) this.metalnessMap = textures[json.metalnessMap] || null;
		if (json.emissiveMap !== void 0) this.emissiveMap = textures[json.emissiveMap] || null;
		if (json.emissiveIntensity !== void 0) this.emissiveIntensity = json.emissiveIntensity;
		if (json.specularMap !== void 0) this.specularMap = textures[json.specularMap] || null;
		if (json.specularIntensityMap !== void 0) this.specularIntensityMap = textures[json.specularIntensityMap] || null;
		if (json.specularColorMap !== void 0) this.specularColorMap = textures[json.specularColorMap] || null;
		if (json.envMap !== void 0) this.envMap = textures[json.envMap] || null;
		if (json.envMapRotation !== void 0) this.envMapRotation.fromArray(json.envMapRotation);
		if (json.envMapIntensity !== void 0) this.envMapIntensity = json.envMapIntensity;
		if (json.reflectivity !== void 0) this.reflectivity = json.reflectivity;
		if (json.refractionRatio !== void 0) this.refractionRatio = json.refractionRatio;
		if (json.lightMap !== void 0) this.lightMap = textures[json.lightMap] || null;
		if (json.lightMapIntensity !== void 0) this.lightMapIntensity = json.lightMapIntensity;
		if (json.aoMap !== void 0) this.aoMap = textures[json.aoMap] || null;
		if (json.aoMapIntensity !== void 0) this.aoMapIntensity = json.aoMapIntensity;
		if (json.gradientMap !== void 0) this.gradientMap = textures[json.gradientMap] || null;
		if (json.clearcoatMap !== void 0) this.clearcoatMap = textures[json.clearcoatMap] || null;
		if (json.clearcoatRoughnessMap !== void 0) this.clearcoatRoughnessMap = textures[json.clearcoatRoughnessMap] || null;
		if (json.clearcoatNormalMap !== void 0) this.clearcoatNormalMap = textures[json.clearcoatNormalMap] || null;
		if (json.clearcoatNormalScale !== void 0) this.clearcoatNormalScale = new Vector2().fromArray(json.clearcoatNormalScale);
		if (json.iridescenceMap !== void 0) this.iridescenceMap = textures[json.iridescenceMap] || null;
		if (json.iridescenceThicknessMap !== void 0) this.iridescenceThicknessMap = textures[json.iridescenceThicknessMap] || null;
		if (json.transmissionMap !== void 0) this.transmissionMap = textures[json.transmissionMap] || null;
		if (json.thicknessMap !== void 0) this.thicknessMap = textures[json.thicknessMap] || null;
		if (json.anisotropyMap !== void 0) this.anisotropyMap = textures[json.anisotropyMap] || null;
		if (json.sheenColorMap !== void 0) this.sheenColorMap = textures[json.sheenColorMap] || null;
		if (json.sheenRoughnessMap !== void 0) this.sheenRoughnessMap = textures[json.sheenRoughnessMap] || null;
		return this;
	}
	/**
	* Returns a new material with copied values from this instance.
	*
	* @return {Material} A clone of this instance.
	*/
	clone() {
		return new this.constructor().copy(this);
	}
	/**
	* Copies the values of the given material to this instance.
	*
	* @param {Material} source - The material to copy.
	* @return {Material} A reference to this instance.
	*/
	copy(source) {
		this.name = source.name;
		this.blending = source.blending;
		this.side = source.side;
		this.vertexColors = source.vertexColors;
		this.opacity = source.opacity;
		this.transparent = source.transparent;
		this.blendSrc = source.blendSrc;
		this.blendDst = source.blendDst;
		this.blendEquation = source.blendEquation;
		this.blendSrcAlpha = source.blendSrcAlpha;
		this.blendDstAlpha = source.blendDstAlpha;
		this.blendEquationAlpha = source.blendEquationAlpha;
		this.blendColor.copy(source.blendColor);
		this.blendAlpha = source.blendAlpha;
		this.depthFunc = source.depthFunc;
		this.depthTest = source.depthTest;
		this.depthWrite = source.depthWrite;
		this.stencilWriteMask = source.stencilWriteMask;
		this.stencilFunc = source.stencilFunc;
		this.stencilRef = source.stencilRef;
		this.stencilFuncMask = source.stencilFuncMask;
		this.stencilFail = source.stencilFail;
		this.stencilZFail = source.stencilZFail;
		this.stencilZPass = source.stencilZPass;
		this.stencilWrite = source.stencilWrite;
		const srcPlanes = source.clippingPlanes;
		let dstPlanes = null;
		if (srcPlanes !== null) {
			const n = srcPlanes.length;
			dstPlanes = new Array(n);
			for (let i = 0; i !== n; ++i) dstPlanes[i] = srcPlanes[i].clone();
		}
		this.clippingPlanes = dstPlanes;
		this.clipIntersection = source.clipIntersection;
		this.clipShadows = source.clipShadows;
		this.shadowSide = source.shadowSide;
		this.colorWrite = source.colorWrite;
		this.precision = source.precision;
		this.polygonOffset = source.polygonOffset;
		this.polygonOffsetFactor = source.polygonOffsetFactor;
		this.polygonOffsetUnits = source.polygonOffsetUnits;
		this.dithering = source.dithering;
		this.alphaTest = source.alphaTest;
		this.alphaHash = source.alphaHash;
		this.alphaToCoverage = source.alphaToCoverage;
		this.premultipliedAlpha = source.premultipliedAlpha;
		this.forceSinglePass = source.forceSinglePass;
		this.allowOverride = source.allowOverride;
		this.visible = source.visible;
		this.toneMapped = source.toneMapped;
		this.userData = JSON.parse(JSON.stringify(source.userData));
		return this;
	}
	/**
	* Frees the GPU-related resources allocated by this instance. Call this
	* method whenever this instance is no longer used in your app.
	*
	* @fires Material#dispose
	*/
	dispose() {
		/**
		* Fires when the material has been disposed of.
		*
		* @event Material#dispose
		* @type {Object}
		*/
		this.dispatchEvent({ type: "dispose" });
	}
	/**
	* Setting this property to `true` indicates the engine the material
	* needs to be recompiled.
	*
	* @type {boolean}
	* @default false
	* @param {boolean} value
	*/
	set needsUpdate(value) {
		if (value === true) this.version++;
	}
};
const _vector$7 = /*@__PURE__*/ new Vector3();
const _segCenter = /*@__PURE__*/ new Vector3();
const _segDir = /*@__PURE__*/ new Vector3();
const _diff = /*@__PURE__*/ new Vector3();
/**
* A ray that emits from an origin in a certain direction. The class is used by
* {@link Raycaster} to assist with raycasting. Raycasting is used for
* mouse picking (working out what objects in the 3D space the mouse is over)
* amongst other things.
*/
var Ray = class {
	/**
	* Constructs a new ray.
	*
	* @param {Vector3} [origin=(0,0,0)] - The origin of the ray.
	* @param {Vector3} [direction=(0,0,-1)] - The (normalized) direction of the ray.
	*/
	constructor(origin = new Vector3(), direction = new Vector3(0, 0, -1)) {
		/**
		* The origin of the ray.
		*
		* @type {Vector3}
		*/
		this.origin = origin;
		/**
		* The (normalized) direction of the ray.
		*
		* @type {Vector3}
		*/
		this.direction = direction;
	}
	/**
	* Sets the ray's components by copying the given values.
	*
	* @param {Vector3} origin - The origin.
	* @param {Vector3} direction - The direction.
	* @return {Ray} A reference to this ray.
	*/
	set(origin, direction) {
		this.origin.copy(origin);
		this.direction.copy(direction);
		return this;
	}
	/**
	* Copies the values of the given ray to this instance.
	*
	* @param {Ray} ray - The ray to copy.
	* @return {Ray} A reference to this ray.
	*/
	copy(ray) {
		this.origin.copy(ray.origin);
		this.direction.copy(ray.direction);
		return this;
	}
	/**
	* Returns a vector that is located at a given distance along this ray.
	*
	* @param {number} t - The distance along the ray to retrieve a position for.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} A position on the ray.
	*/
	at(t, target) {
		return target.copy(this.origin).addScaledVector(this.direction, t);
	}
	/**
	* Adjusts the direction of the ray to point at the given vector in world space.
	*
	* @param {Vector3} v - The target position.
	* @return {Ray} A reference to this ray.
	*/
	lookAt(v) {
		this.direction.copy(v).sub(this.origin).normalize();
		return this;
	}
	/**
	* Shift the origin of this ray along its direction by the given distance.
	*
	* @param {number} t - The distance along the ray to interpolate.
	* @return {Ray} A reference to this ray.
	*/
	recast(t) {
		this.origin.copy(this.at(t, _vector$7));
		return this;
	}
	/**
	* Returns the point along this ray that is closest to the given point.
	*
	* @param {Vector3} point - A point in 3D space to get the closet location on the ray for.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {Vector3} The closest point on this ray.
	*/
	closestPointToPoint(point, target) {
		target.subVectors(point, this.origin);
		const directionDistance = target.dot(this.direction);
		if (directionDistance < 0) return target.copy(this.origin);
		return target.copy(this.origin).addScaledVector(this.direction, directionDistance);
	}
	/**
	* Returns the distance of the closest approach between this ray and the given point.
	*
	* @param {Vector3} point - A point in 3D space to compute the distance to.
	* @return {number} The distance.
	*/
	distanceToPoint(point) {
		return Math.sqrt(this.distanceSqToPoint(point));
	}
	/**
	* Returns the squared distance of the closest approach between this ray and the given point.
	*
	* @param {Vector3} point - A point in 3D space to compute the distance to.
	* @return {number} The squared distance.
	*/
	distanceSqToPoint(point) {
		const directionDistance = _vector$7.subVectors(point, this.origin).dot(this.direction);
		if (directionDistance < 0) return this.origin.distanceToSquared(point);
		_vector$7.copy(this.origin).addScaledVector(this.direction, directionDistance);
		return _vector$7.distanceToSquared(point);
	}
	/**
	* Returns the squared distance between this ray and the given line segment.
	*
	* @param {Vector3} v0 - The start point of the line segment.
	* @param {Vector3} v1 - The end point of the line segment.
	* @param {Vector3} [optionalPointOnRay] - When provided, it receives the point on this ray that is closest to the segment.
	* @param {Vector3} [optionalPointOnSegment] - When provided, it receives the point on the line segment that is closest to this ray.
	* @return {number} The squared distance.
	*/
	distanceSqToSegment(v0, v1, optionalPointOnRay, optionalPointOnSegment) {
		_segCenter.copy(v0).add(v1).multiplyScalar(.5);
		_segDir.copy(v1).sub(v0).normalize();
		_diff.copy(this.origin).sub(_segCenter);
		const segExtent = v0.distanceTo(v1) * .5;
		const a01 = -this.direction.dot(_segDir);
		const b0 = _diff.dot(this.direction);
		const b1 = -_diff.dot(_segDir);
		const c = _diff.lengthSq();
		const det = Math.abs(1 - a01 * a01);
		let s0, s1, sqrDist, extDet;
		if (det > 0) {
			s0 = a01 * b1 - b0;
			s1 = a01 * b0 - b1;
			extDet = segExtent * det;
			if (s0 >= 0) {
				if (s1 >= -extDet) {
					if (s1 <= extDet) {
						const invDet = 1 / det;
						s0 *= invDet;
						s1 *= invDet;
						sqrDist = s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c;
					} else {
						s1 = segExtent;
						s0 = Math.max(0, -(a01 * s1 + b0));
						sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
					}
				} else {
					s1 = -segExtent;
					s0 = Math.max(0, -(a01 * s1 + b0));
					sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
				}
			} else if (s1 <= -extDet) {
				s0 = Math.max(0, -(-a01 * segExtent + b0));
				s1 = s0 > 0 ? -segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
				sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
			} else if (s1 <= extDet) {
				s0 = 0;
				s1 = Math.min(Math.max(-segExtent, -b1), segExtent);
				sqrDist = s1 * (s1 + 2 * b1) + c;
			} else {
				s0 = Math.max(0, -(a01 * segExtent + b0));
				s1 = s0 > 0 ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
				sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
			}
		} else {
			s1 = a01 > 0 ? -segExtent : segExtent;
			s0 = Math.max(0, -(a01 * s1 + b0));
			sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
		}
		if (optionalPointOnRay) optionalPointOnRay.copy(this.origin).addScaledVector(this.direction, s0);
		if (optionalPointOnSegment) optionalPointOnSegment.copy(_segCenter).addScaledVector(_segDir, s1);
		return sqrDist;
	}
	/**
	* Intersects this ray with the given sphere, returning the intersection
	* point or `null` if there is no intersection.
	*
	* @param {Sphere} sphere - The sphere to intersect.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {?Vector3} The intersection point.
	*/
	intersectSphere(sphere, target) {
		if (sphere.radius < 0) return null;
		_vector$7.subVectors(sphere.center, this.origin);
		const tca = _vector$7.dot(this.direction);
		const d2 = _vector$7.dot(_vector$7) - tca * tca;
		const radius2 = sphere.radius * sphere.radius;
		if (d2 > radius2) return null;
		const thc = Math.sqrt(radius2 - d2);
		const t0 = tca - thc;
		const t1 = tca + thc;
		if (t1 < 0) return null;
		if (t0 < 0) return this.at(t1, target);
		return this.at(t0, target);
	}
	/**
	* Returns `true` if this ray intersects with the given sphere.
	*
	* @param {Sphere} sphere - The sphere to intersect.
	* @return {boolean} Whether this ray intersects with the given sphere or not.
	*/
	intersectsSphere(sphere) {
		if (sphere.radius < 0) return false;
		return this.distanceSqToPoint(sphere.center) <= sphere.radius * sphere.radius;
	}
	/**
	* Computes the distance from the ray's origin to the given plane. Returns `null` if the ray
	* does not intersect with the plane.
	*
	* @param {Plane} plane - The plane to compute the distance to.
	* @return {?number} Whether this ray intersects with the given sphere or not.
	*/
	distanceToPlane(plane) {
		const denominator = plane.normal.dot(this.direction);
		if (denominator === 0) {
			if (plane.distanceToPoint(this.origin) === 0) return 0;
			return null;
		}
		const t = -(this.origin.dot(plane.normal) + plane.constant) / denominator;
		return t >= 0 ? t : null;
	}
	/**
	* Intersects this ray with the given plane, returning the intersection
	* point or `null` if there is no intersection.
	*
	* @param {Plane} plane - The plane to intersect.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {?Vector3} The intersection point.
	*/
	intersectPlane(plane, target) {
		const t = this.distanceToPlane(plane);
		if (t === null) return null;
		return this.at(t, target);
	}
	/**
	* Returns `true` if this ray intersects with the given plane.
	*
	* @param {Plane} plane - The plane to intersect.
	* @return {boolean} Whether this ray intersects with the given plane or not.
	*/
	intersectsPlane(plane) {
		const distToPoint = plane.distanceToPoint(this.origin);
		if (distToPoint === 0) return true;
		if (plane.normal.dot(this.direction) * distToPoint < 0) return true;
		return false;
	}
	/**
	* Intersects this ray with the given bounding box, returning the intersection
	* point or `null` if there is no intersection.
	*
	* @param {Box3} box - The box to intersect.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {?Vector3} The intersection point.
	*/
	intersectBox(box, target) {
		let tmin, tmax, tymin, tymax, tzmin, tzmax;
		const invdirx = 1 / this.direction.x, invdiry = 1 / this.direction.y, invdirz = 1 / this.direction.z;
		const origin = this.origin;
		if (invdirx >= 0) {
			tmin = (box.min.x - origin.x) * invdirx;
			tmax = (box.max.x - origin.x) * invdirx;
		} else {
			tmin = (box.max.x - origin.x) * invdirx;
			tmax = (box.min.x - origin.x) * invdirx;
		}
		if (invdiry >= 0) {
			tymin = (box.min.y - origin.y) * invdiry;
			tymax = (box.max.y - origin.y) * invdiry;
		} else {
			tymin = (box.max.y - origin.y) * invdiry;
			tymax = (box.min.y - origin.y) * invdiry;
		}
		if (tmin > tymax || tymin > tmax) return null;
		if (tymin > tmin || isNaN(tmin)) tmin = tymin;
		if (tymax < tmax || isNaN(tmax)) tmax = tymax;
		if (invdirz >= 0) {
			tzmin = (box.min.z - origin.z) * invdirz;
			tzmax = (box.max.z - origin.z) * invdirz;
		} else {
			tzmin = (box.max.z - origin.z) * invdirz;
			tzmax = (box.min.z - origin.z) * invdirz;
		}
		if (tmin > tzmax || tzmin > tmax) return null;
		if (tzmin > tmin || tmin !== tmin) tmin = tzmin;
		if (tzmax < tmax || tmax !== tmax) tmax = tzmax;
		if (tmax < 0) return null;
		return this.at(tmin >= 0 ? tmin : tmax, target);
	}
	/**
	* Returns `true` if this ray intersects with the given box.
	*
	* @param {Box3} box - The box to intersect.
	* @return {boolean} Whether this ray intersects with the given box or not.
	*/
	intersectsBox(box) {
		return this.intersectBox(box, _vector$7) !== null;
	}
	/**
	* Intersects this ray with the given triangle, returning the intersection
	* point or `null` if there is no intersection.
	*
	* @param {Vector3} a - The first vertex of the triangle.
	* @param {Vector3} b - The second vertex of the triangle.
	* @param {Vector3} c - The third vertex of the triangle.
	* @param {boolean} backfaceCulling - Whether to use backface culling or not.
	* @param {Vector3} target - The target vector that is used to store the method's result.
	* @return {?Vector3} The intersection point.
	*/
	intersectTriangle(a, b, c, backfaceCulling, target) {
		const origin = this.origin;
		const direction = this.direction;
		const dx = direction.x;
		const dy = direction.y;
		const dz = direction.z;
		const aox = a.x - origin.x, aoy = a.y - origin.y, aoz = a.z - origin.z;
		const box = b.x - origin.x, boy = b.y - origin.y, boz = b.z - origin.z;
		const cox = c.x - origin.x, coy = c.y - origin.y, coz = c.z - origin.z;
		const adx = Math.abs(dx), ady = Math.abs(dy), adz = Math.abs(dz);
		let dkx, dky, dkz;
		let akx, aky, akz, bkx, bky, bkz, ckx, cky, ckz;
		if (adx >= ady && adx >= adz) {
			dkz = dx;
			akz = aox;
			bkz = box;
			ckz = cox;
			if (dx >= 0) {
				dkx = dy;
				dky = dz;
				akx = aoy;
				aky = aoz;
				bkx = boy;
				bky = boz;
				ckx = coy;
				cky = coz;
			} else {
				dkx = dz;
				dky = dy;
				akx = aoz;
				aky = aoy;
				bkx = boz;
				bky = boy;
				ckx = coz;
				cky = coy;
			}
		} else if (ady >= adz) {
			dkz = dy;
			akz = aoy;
			bkz = boy;
			ckz = coy;
			if (dy >= 0) {
				dkx = dz;
				dky = dx;
				akx = aoz;
				aky = aox;
				bkx = boz;
				bky = box;
				ckx = coz;
				cky = cox;
			} else {
				dkx = dx;
				dky = dz;
				akx = aox;
				aky = aoz;
				bkx = box;
				bky = boz;
				ckx = cox;
				cky = coz;
			}
		} else {
			dkz = dz;
			akz = aoz;
			bkz = boz;
			ckz = coz;
			if (dz >= 0) {
				dkx = dx;
				dky = dy;
				akx = aox;
				aky = aoy;
				bkx = box;
				bky = boy;
				ckx = cox;
				cky = coy;
			} else {
				dkx = dy;
				dky = dx;
				akx = aoy;
				aky = aox;
				bkx = boy;
				bky = box;
				ckx = coy;
				cky = cox;
			}
		}
		if (dkz === 0) return null;
		const sx = dkx / dkz, sy = dky / dkz, sz = 1 / dkz;
		const ax = akx - sx * akz, ay = aky - sy * akz;
		const bx = bkx - sx * bkz, by = bky - sy * bkz;
		const cx = ckx - sx * ckz, cy = cky - sy * ckz;
		const u = cx * by - cy * bx;
		const v = ax * cy - ay * cx;
		const w = bx * ay - by * ax;
		if (backfaceCulling) {
			if (u < 0 || v < 0 || w < 0) return null;
		} else if ((u < 0 || v < 0 || w < 0) && (u > 0 || v > 0 || w > 0)) return null;
		const det = u + v + w;
		if (det === 0) return null;
		const tScaled = sz * (u * akz + v * bkz + w * ckz);
		if (det > 0 ? tScaled < 0 : tScaled > 0) return null;
		return this.at(tScaled / det, target);
	}
	/**
	* Transforms this ray with the given 4x4 transformation matrix.
	*
	* @param {Matrix4} matrix4 - The transformation matrix.
	* @return {Ray} A reference to this ray.
	*/
	applyMatrix4(matrix4) {
		this.origin.applyMatrix4(matrix4);
		this.direction.transformDirection(matrix4);
		return this;
	}
	/**
	* Returns `true` if this ray is equal with the given one.
	*
	* @param {Ray} ray - The ray to test for equality.
	* @return {boolean} Whether this ray is equal with the given one.
	*/
	equals(ray) {
		return ray.origin.equals(this.origin) && ray.direction.equals(this.direction);
	}
	/**
	* Returns a new ray with copied values from this instance.
	*
	* @return {Ray} A clone of this instance.
	*/
	clone() {
		return new this.constructor().copy(this);
	}
};
/**
* A material for drawing geometries in a simple shaded (flat or wireframe) way.
*
* This material is not affected by lights.
*
* @augments Material
* @demo scenes/material-browser.html#MeshBasicMaterial
*/
var MeshBasicMaterial = class extends Material {
	/**
	* Constructs a new mesh basic material.
	*
	* @param {Object} [parameters] - An object with one or more properties
	* defining the material's appearance. Any property of the material
	* (including any property from inherited materials) can be passed
	* in here. Color values can be passed any type of value accepted
	* by {@link Color#set}.
	*/
	constructor(parameters) {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isMeshBasicMaterial = true;
		this.type = "MeshBasicMaterial";
		/**
		* Color of the material.
		*
		* @type {Color}
		* @default (1,1,1)
		*/
		this.color = new Color(16777215);
		/**
		* The color map. May optionally include an alpha channel, typically combined
		* with {@link Material#transparent} or {@link Material#alphaTest}. The texture map
		* color is modulated by the diffuse `color`.
		*
		* `map` represents color data, and the texture must be assigned a
		* {@link Texture#colorSpace}. Most `map` textures set
		* `texture.colorSpace = SRGBColorSpace`.
		*
		* @type {?Texture}
		* @default null
		*/
		this.map = null;
		/**
		* The light map. Requires a second set of UVs.
		*
		* `lightMap` represents pre-baked illuminance data, and the texture must be assigned
		* a {@link Texture#colorSpace}. Most `lightMap` textures set
		* `texture.colorSpace = LinearSRGBColorSpace` and use float-type formats
		* such as `.exr` or `.hdr`.
		*
		* @type {?Texture}
		* @default null
		*/
		this.lightMap = null;
		/**
		* Intensity of the baked light.
		*
		* @type {number}
		* @default 1
		*/
		this.lightMapIntensity = 1;
		/**
		* The red channel of this texture is used as the ambient occlusion map.
		* Requires a second set of UVs.
		*
		* `aoMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.aoMap = null;
		/**
		* Intensity of the ambient occlusion effect. Range is `[0,1]`, where `0`
		* disables ambient occlusion. Where intensity is `1` and the AO map's
		* red channel is also `1`, ambient light is fully occluded on a surface.
		*
		* @type {number}
		* @default 1
		*/
		this.aoMapIntensity = 1;
		/**
		* Specular map used by the material.
		*
		* `specularMap` represents color data, and the texture must be assigned a
		* {@link Texture#colorSpace}. Most `specularMap` textures set
		* `texture.colorSpace = SRGBColorSpace`.
		*
		* @type {?Texture}
		* @default null
		*/
		this.specularMap = null;
		/**
		* The alpha map is a grayscale texture that controls the opacity across the
		* surface (black: fully transparent; white: fully opaque).
		*
		* Only the color of the texture is used, ignoring the alpha channel if one
		* exists. For RGB and RGBA textures, the renderer will use the green channel
		* when sampling this texture due to the extra bit of precision provided for
		* green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and
		* luminance/alpha textures will also still work as expected.
		*
		* `alphaMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.alphaMap = null;
		/**
		* The environment map.
		*
		* `envMap` represents luminance data, and the texture must be assigned
		* a {@link Texture#colorSpace}. Most `envMap` textures set
		* `texture.colorSpace = LinearSRGBColorSpace` and use float-type formats
		* such as `.exr` or `.hdr`.
		*
		* @type {?Texture}
		* @default null
		*/
		this.envMap = null;
		/**
		* The rotation of the environment map in radians.
		*
		* @type {Euler}
		* @default (0,0,0)
		*/
		this.envMapRotation = new Euler();
		/**
		* How to combine the result of the surface's color with the environment map, if any.
		*
		* When set to `MixOperation`, the {@link MeshBasicMaterial#reflectivity} is used to
		* blend between the two colors.
		*
		* @type {(MultiplyOperation|MixOperation|AddOperation)}
		* @default MultiplyOperation
		*/
		this.combine = 0;
		/**
		* How much the environment map affects the surface.
		* The valid range is between `0` (no reflections) and `1` (full reflections).
		*
		* @type {number}
		* @default 1
		*/
		this.reflectivity = 1;
		/**
		* The index of refraction (IOR) of air (approximately 1) divided by the
		* index of refraction of the material. It is used with environment mapping
		* modes {@link CubeRefractionMapping} and {@link EquirectangularRefractionMapping}.
		* The refraction ratio should not exceed `1`.
		*
		* @type {number}
		* @default 0.98
		*/
		this.refractionRatio = .98;
		/**
		* Renders the geometry as a wireframe.
		*
		* @type {boolean}
		* @default false
		*/
		this.wireframe = false;
		/**
		* Controls the thickness of the wireframe.
		*
		* Can only be used with {@link SVGRenderer}.
		*
		* @type {number}
		* @default 1
		*/
		this.wireframeLinewidth = 1;
		/**
		* Defines appearance of wireframe ends.
		*
		* Can only be used with {@link SVGRenderer}.
		*
		* @type {('round'|'bevel'|'miter')}
		* @default 'round'
		*/
		this.wireframeLinecap = "round";
		/**
		* Defines appearance of wireframe joints.
		*
		* Can only be used with {@link SVGRenderer}.
		*
		* @type {('round'|'bevel'|'miter')}
		* @default 'round'
		*/
		this.wireframeLinejoin = "round";
		/**
		* Whether the material is affected by fog or not.
		*
		* @type {boolean}
		* @default true
		*/
		this.fog = true;
		this.setValues(parameters);
	}
	copy(source) {
		super.copy(source);
		this.color.copy(source.color);
		this.map = source.map;
		this.lightMap = source.lightMap;
		this.lightMapIntensity = source.lightMapIntensity;
		this.aoMap = source.aoMap;
		this.aoMapIntensity = source.aoMapIntensity;
		this.specularMap = source.specularMap;
		this.alphaMap = source.alphaMap;
		this.envMap = source.envMap;
		this.envMapRotation.copy(source.envMapRotation);
		this.combine = source.combine;
		this.reflectivity = source.reflectivity;
		this.refractionRatio = source.refractionRatio;
		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;
		this.fog = source.fog;
		return this;
	}
};
const _inverseMatrix$3 = /*@__PURE__*/ new Matrix4();
const _ray$3 = /*@__PURE__*/ new Ray();
const _sphere$6 = /*@__PURE__*/ new Sphere();
const _sphereHitAt = /*@__PURE__*/ new Vector3();
const _vA = /*@__PURE__*/ new Vector3();
const _vB = /*@__PURE__*/ new Vector3();
const _vC = /*@__PURE__*/ new Vector3();
const _tempA = /*@__PURE__*/ new Vector3();
const _morphA = /*@__PURE__*/ new Vector3();
const _intersectionPoint = /*@__PURE__*/ new Vector3();
const _intersectionPointWorld = /*@__PURE__*/ new Vector3();
/**
* Class representing triangular polygon mesh based objects.
*
* ```js
* const geometry = new THREE.BoxGeometry( 1, 1, 1 );
* const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
* const mesh = new THREE.Mesh( geometry, material );
* scene.add( mesh );
* ```
*
* @augments Object3D
*/
var Mesh = class extends Object3D {
	/**
	* Constructs a new mesh.
	*
	* @param {BufferGeometry} [geometry] - The mesh geometry.
	* @param {Material|Array<Material>} [material] - The mesh material.
	*/
	constructor(geometry = new BufferGeometry(), material = new MeshBasicMaterial()) {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isMesh = true;
		this.type = "Mesh";
		/**
		* The mesh geometry.
		*
		* @type {BufferGeometry}
		*/
		this.geometry = geometry;
		/**
		* The mesh material.
		*
		* @type {Material|Array<Material>}
		* @default MeshBasicMaterial
		*/
		this.material = material;
		/**
		* A dictionary representing the morph targets in the geometry. The key is the
		* morph targets name, the value its attribute index. This member is `undefined`
		* by default and only set when morph targets are detected in the geometry.
		*
		* @type {Object<string,number>|undefined}
		* @default undefined
		*/
		this.morphTargetDictionary = void 0;
		/**
		* An array of weights typically in the range `[0,1]` that specify how much of the morph
		* is applied. This member is `undefined` by default and only set when morph targets are
		* detected in the geometry.
		*
		* @type {Array<number>|undefined}
		* @default undefined
		*/
		this.morphTargetInfluences = void 0;
		/**
		* The number of instances of this mesh.
		* Can only be used with {@link WebGPURenderer}.
		*
		* @type {number}
		* @default 1
		*/
		this.count = 1;
		this.updateMorphTargets();
	}
	copy(source, recursive) {
		super.copy(source, recursive);
		if (source.morphTargetInfluences !== void 0) this.morphTargetInfluences = source.morphTargetInfluences.slice();
		if (source.morphTargetDictionary !== void 0) this.morphTargetDictionary = Object.assign({}, source.morphTargetDictionary);
		this.material = Array.isArray(source.material) ? source.material.slice() : source.material;
		this.geometry = source.geometry;
		return this;
	}
	/**
	* Sets the values of {@link Mesh#morphTargetDictionary} and {@link Mesh#morphTargetInfluences}
	* to make sure existing morph targets can influence this 3D object.
	*/
	updateMorphTargets() {
		const morphAttributes = this.geometry.morphAttributes;
		const keys = Object.keys(morphAttributes);
		if (keys.length > 0) {
			const morphAttribute = morphAttributes[keys[0]];
			if (morphAttribute !== void 0) {
				this.morphTargetInfluences = [];
				this.morphTargetDictionary = {};
				for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
					const name = morphAttribute[m].name || String(m);
					this.morphTargetInfluences.push(0);
					this.morphTargetDictionary[name] = m;
				}
			}
		}
	}
	/**
	* Returns the local-space position of the vertex at the given index, taking into
	* account the current animation state of both morph targets and skinning.
	*
	* @param {number} index - The vertex index.
	* @param {Vector3} target - The target object that is used to store the method's result.
	* @return {Vector3} The vertex position in local space.
	*/
	getVertexPosition(index, target) {
		const geometry = this.geometry;
		const position = geometry.attributes.position;
		const morphPosition = geometry.morphAttributes.position;
		const morphTargetsRelative = geometry.morphTargetsRelative;
		target.fromBufferAttribute(position, index);
		const morphInfluences = this.morphTargetInfluences;
		if (morphPosition && morphInfluences) {
			_morphA.set(0, 0, 0);
			for (let i = 0, il = morphPosition.length; i < il; i++) {
				const influence = morphInfluences[i];
				const morphAttribute = morphPosition[i];
				if (influence === 0) continue;
				_tempA.fromBufferAttribute(morphAttribute, index);
				if (morphTargetsRelative) _morphA.addScaledVector(_tempA, influence);
				else _morphA.addScaledVector(_tempA.sub(target), influence);
			}
			target.add(_morphA);
		}
		return target;
	}
	/**
	* Returns `true` if this mesh intersects the given frustum.
	*
	* @param {Frustum|FrustumArray} frustum - The frustum to test.
	* @return {boolean} Whether this mesh intersects the given frustum or not.
	*/
	intersectsFrustum(frustum) {
		return frustum.intersectsObject(this);
	}
	/**
	* Computes intersection points between a casted ray and this line.
	*
	* @param {Raycaster} raycaster - The raycaster.
	* @param {Array<Object>} intersects - The target array that holds the intersection points.
	*/
	raycast(raycaster, intersects) {
		const geometry = this.geometry;
		const material = this.material;
		const matrixWorld = this.matrixWorld;
		if (material === void 0) return;
		if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
		_sphere$6.copy(geometry.boundingSphere);
		_sphere$6.applyMatrix4(matrixWorld);
		_ray$3.copy(raycaster.ray).recast(raycaster.near);
		if (_sphere$6.containsPoint(_ray$3.origin) === false) {
			if (_ray$3.intersectSphere(_sphere$6, _sphereHitAt) === null) return;
			if (_ray$3.origin.distanceToSquared(_sphereHitAt) > (raycaster.far - raycaster.near) ** 2) return;
		}
		_inverseMatrix$3.copy(matrixWorld).invert();
		_ray$3.copy(raycaster.ray).applyMatrix4(_inverseMatrix$3);
		if (geometry.boundingBox !== null) {
			if (_ray$3.intersectsBox(geometry.boundingBox) === false) return;
		}
		this._computeIntersections(raycaster, intersects, _ray$3);
	}
	_computeIntersections(raycaster, intersects, rayLocalSpace) {
		let intersection;
		const geometry = this.geometry;
		const material = this.material;
		const index = geometry.index;
		const position = geometry.attributes.position;
		const uv = geometry.attributes.uv;
		const uv1 = geometry.attributes.uv1;
		const normal = geometry.attributes.normal;
		const groups = geometry.groups;
		const drawRange = geometry.drawRange;
		if (index !== null) {
			if (Array.isArray(material)) for (let i = 0, il = groups.length; i < il; i++) {
				const group = groups[i];
				const groupMaterial = material[group.materialIndex];
				const start = Math.max(group.start, drawRange.start);
				const end = Math.min(index.count, Math.min(group.start + group.count, drawRange.start + drawRange.count));
				for (let j = start, jl = end; j < jl; j += 3) {
					const a = index.getX(j);
					const b = index.getX(j + 1);
					const c = index.getX(j + 2);
					intersection = checkGeometryIntersection(this, groupMaterial, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c);
					if (intersection) {
						intersection.faceIndex = Math.floor(j / 3);
						intersection.face.materialIndex = group.materialIndex;
						intersects.push(intersection);
					}
				}
			}
			else {
				const start = Math.max(0, drawRange.start);
				const end = Math.min(index.count, drawRange.start + drawRange.count);
				for (let i = start, il = end; i < il; i += 3) {
					const a = index.getX(i);
					const b = index.getX(i + 1);
					const c = index.getX(i + 2);
					intersection = checkGeometryIntersection(this, material, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c);
					if (intersection) {
						intersection.faceIndex = Math.floor(i / 3);
						intersects.push(intersection);
					}
				}
			}
		} else if (position !== void 0) {
			if (Array.isArray(material)) for (let i = 0, il = groups.length; i < il; i++) {
				const group = groups[i];
				const groupMaterial = material[group.materialIndex];
				const start = Math.max(group.start, drawRange.start);
				const end = Math.min(position.count, Math.min(group.start + group.count, drawRange.start + drawRange.count));
				for (let j = start, jl = end; j < jl; j += 3) {
					const a = j;
					const b = j + 1;
					const c = j + 2;
					intersection = checkGeometryIntersection(this, groupMaterial, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c);
					if (intersection) {
						intersection.faceIndex = Math.floor(j / 3);
						intersection.face.materialIndex = group.materialIndex;
						intersects.push(intersection);
					}
				}
			}
			else {
				const start = Math.max(0, drawRange.start);
				const end = Math.min(position.count, drawRange.start + drawRange.count);
				for (let i = start, il = end; i < il; i += 3) {
					const a = i;
					const b = i + 1;
					const c = i + 2;
					intersection = checkGeometryIntersection(this, material, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c);
					if (intersection) {
						intersection.faceIndex = Math.floor(i / 3);
						intersects.push(intersection);
					}
				}
			}
		}
	}
};
function checkIntersection$1(object, material, raycaster, ray, pA, pB, pC, point) {
	let intersect;
	if (material.side === 1) intersect = ray.intersectTriangle(pC, pB, pA, true, point);
	else intersect = ray.intersectTriangle(pA, pB, pC, material.side === 0, point);
	if (intersect === null) return null;
	_intersectionPointWorld.copy(point);
	_intersectionPointWorld.applyMatrix4(object.matrixWorld);
	const distance = raycaster.ray.origin.distanceTo(_intersectionPointWorld);
	if (distance < raycaster.near || distance > raycaster.far) return null;
	return {
		distance,
		point: _intersectionPointWorld.clone(),
		object
	};
}
function checkGeometryIntersection(object, material, raycaster, ray, uv, uv1, normal, a, b, c) {
	object.getVertexPosition(a, _vA);
	object.getVertexPosition(b, _vB);
	object.getVertexPosition(c, _vC);
	const intersection = checkIntersection$1(object, material, raycaster, ray, _vA, _vB, _vC, _intersectionPoint);
	if (intersection) {
		const barycoord = new Vector3();
		Triangle.getBarycoord(_intersectionPoint, _vA, _vB, _vC, barycoord);
		if (uv) intersection.uv = Triangle.getInterpolatedAttribute(uv, a, b, c, barycoord, new Vector2());
		if (uv1) intersection.uv1 = Triangle.getInterpolatedAttribute(uv1, a, b, c, barycoord, new Vector2());
		if (normal) {
			intersection.normal = Triangle.getInterpolatedAttribute(normal, a, b, c, barycoord, new Vector3());
			if (intersection.normal.dot(ray.direction) > 0) intersection.normal.multiplyScalar(-1);
		}
		const face = {
			a,
			b,
			c,
			normal: new Vector3(),
			materialIndex: 0
		};
		Triangle.getNormal(_vA, _vB, _vC, face.normal);
		intersection.face = face;
		intersection.barycoord = barycoord;
	}
	return intersection;
}
const _baseVector = /*@__PURE__*/ new Vector4();
const _skinIndex = /*@__PURE__*/ new Vector4();
const _skinWeight = /*@__PURE__*/ new Vector4();
const _vector4 = /*@__PURE__*/ new Vector4();
const _matrix4 = /*@__PURE__*/ new Matrix4();
const _vertex = /*@__PURE__*/ new Vector3();
const _sphere$5 = /*@__PURE__*/ new Sphere();
const _inverseMatrix$2 = /*@__PURE__*/ new Matrix4();
const _ray$2 = /*@__PURE__*/ new Ray();
/**
* A mesh that has a {@link Skeleton} that can then be used to animate the
* vertices of the geometry with skinning/skeleton animation.
*
* Next to a valid skeleton, the skinned mesh requires skin indices and weights
* as buffer attributes in its geometry. These attribute define which bones affect a single
* vertex to a certain extend.
*
* Typically skinned meshes are not created manually but loaders like {@link GLTFLoader}
* or {@link FBXLoader } import respective models.
*
* @augments Mesh
* @demo scenes/bones-browser.html
*/
var SkinnedMesh = class extends Mesh {
	/**
	* Constructs a new skinned mesh.
	*
	* @param {BufferGeometry} [geometry] - The mesh geometry.
	* @param {Material|Array<Material>} [material] - The mesh material.
	*/
	constructor(geometry, material) {
		super(geometry, material);
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isSkinnedMesh = true;
		this.type = "SkinnedMesh";
		/**
		* `AttachedBindMode` means the skinned mesh shares the same world space as the skeleton.
		* This is not true when using `DetachedBindMode` which is useful when sharing a skeleton
		* across multiple skinned meshes.
		*
		* @type {(AttachedBindMode|DetachedBindMode)}
		* @default AttachedBindMode
		*/
		this.bindMode = AttachedBindMode;
		/**
		* The base matrix that is used for the bound bone transforms.
		*
		* @type {Matrix4}
		*/
		this.bindMatrix = new Matrix4();
		/**
		* The base matrix that is used for resetting the bound bone transforms.
		*
		* @type {Matrix4}
		*/
		this.bindMatrixInverse = new Matrix4();
		/**
		* The bounding box of the skinned mesh. Can be computed via {@link SkinnedMesh#computeBoundingBox}.
		*
		* @type {?Box3}
		* @default null
		*/
		this.boundingBox = null;
		/**
		* The bounding sphere of the skinned mesh. Can be computed via {@link SkinnedMesh#computeBoundingSphere}.
		*
		* @type {?Sphere}
		* @default null
		*/
		this.boundingSphere = null;
	}
	/**
	* Computes the bounding box of the skinned mesh, and updates {@link SkinnedMesh#boundingBox}.
	* The bounding box is not automatically computed by the engine; this method must be called by your app.
	* If the skinned mesh is animated, the bounding box should be recomputed per frame in order to reflect
	* the current animation state.
	*/
	computeBoundingBox() {
		const geometry = this.geometry;
		if (this.boundingBox === null) this.boundingBox = new Box3();
		this.boundingBox.makeEmpty();
		const positionAttribute = geometry.getAttribute("position");
		for (let i = 0; i < positionAttribute.count; i++) {
			this.getVertexPosition(i, _vertex);
			this.boundingBox.expandByPoint(_vertex);
		}
	}
	/**
	* Computes the bounding sphere of the skinned mesh, and updates {@link SkinnedMesh#boundingSphere}.
	* The bounding sphere is automatically computed by the engine once when it is needed, e.g., for ray casting
	* and view frustum culling. If the skinned mesh is animated, the bounding sphere should be recomputed
	* per frame in order to reflect the current animation state.
	*/
	computeBoundingSphere() {
		const geometry = this.geometry;
		if (this.boundingSphere === null) this.boundingSphere = new Sphere();
		this.boundingSphere.makeEmpty();
		const positionAttribute = geometry.getAttribute("position");
		for (let i = 0; i < positionAttribute.count; i++) {
			this.getVertexPosition(i, _vertex);
			this.boundingSphere.expandByPoint(_vertex);
		}
	}
	copy(source, recursive) {
		super.copy(source, recursive);
		this.bindMode = source.bindMode;
		this.bindMatrix.copy(source.bindMatrix);
		this.bindMatrixInverse.copy(source.bindMatrixInverse);
		this.skeleton = source.skeleton;
		if (source.boundingBox !== null) this.boundingBox = source.boundingBox.clone();
		if (source.boundingSphere !== null) this.boundingSphere = source.boundingSphere.clone();
		return this;
	}
	raycast(raycaster, intersects) {
		const material = this.material;
		const matrixWorld = this.matrixWorld;
		if (material === void 0) return;
		if (this.boundingSphere === null) this.computeBoundingSphere();
		_sphere$5.copy(this.boundingSphere);
		_sphere$5.applyMatrix4(matrixWorld);
		if (raycaster.ray.intersectsSphere(_sphere$5) === false) return;
		_inverseMatrix$2.copy(matrixWorld).invert();
		_ray$2.copy(raycaster.ray).applyMatrix4(_inverseMatrix$2);
		if (this.boundingBox !== null) {
			if (_ray$2.intersectsBox(this.boundingBox) === false) return;
		}
		this._computeIntersections(raycaster, intersects, _ray$2);
	}
	getVertexPosition(index, target) {
		super.getVertexPosition(index, target);
		this.applyBoneTransform(index, target);
		return target;
	}
	/**
	* Binds the given skeleton to the skinned mesh.
	*
	* @param {Skeleton} skeleton - The skeleton to bind.
	* @param {Matrix4} [bindMatrix] - The bind matrix. If no bind matrix is provided,
	* the skinned mesh's world matrix will be used instead.
	*/
	bind(skeleton, bindMatrix) {
		this.skeleton = skeleton;
		if (bindMatrix === void 0) {
			this.updateMatrixWorld(true);
			this.skeleton.calculateInverses();
			bindMatrix = this.matrixWorld;
		}
		this.bindMatrix.copy(bindMatrix);
		this.bindMatrixInverse.copy(bindMatrix).invert();
	}
	/**
	* This method sets the skinned mesh in the rest pose).
	*/
	pose() {
		this.skeleton.pose();
	}
	/**
	* Normalizes the skin weights which are defined as a buffer attribute
	* in the skinned mesh's geometry.
	*/
	normalizeSkinWeights() {
		const vector = new Vector4();
		const skinWeight = this.geometry.attributes.skinWeight;
		for (let i = 0, l = skinWeight.count; i < l; i++) {
			vector.fromBufferAttribute(skinWeight, i);
			const scale = 1 / vector.manhattanLength();
			if (scale !== Infinity) vector.multiplyScalar(scale);
			else vector.set(1, 0, 0, 0);
			skinWeight.setXYZW(i, vector.x, vector.y, vector.z, vector.w);
		}
	}
	updateMatrixWorld(force) {
		super.updateMatrixWorld(force);
		if (this.bindMode === "attached") this.bindMatrixInverse.copy(this.matrixWorld).invert();
		else if (this.bindMode === "detached") this.bindMatrixInverse.copy(this.bindMatrix).invert();
		else warn("SkinnedMesh: Unrecognized bindMode: " + this.bindMode);
	}
	/**
	* Applies the bone transform associated with the given index to the given
	* vector. Can be used to transform positions or direction vectors by providing
	* a Vector4 with 1 or 0 in the w component respectively. Returns the updated vector.
	*
	* @param {number} index - The vertex index.
	* @param {Vector3|Vector4} target - The target object that is used to store the method's result.
	* @return {Vector3|Vector4} The updated vertex attribute data.
	*/
	applyBoneTransform(index, target) {
		const skeleton = this.skeleton;
		const geometry = this.geometry;
		_skinIndex.fromBufferAttribute(geometry.attributes.skinIndex, index);
		_skinWeight.fromBufferAttribute(geometry.attributes.skinWeight, index);
		if (target.isVector4) {
			_baseVector.copy(target);
			target.set(0, 0, 0, 0);
		} else {
			_baseVector.set(...target, 1);
			target.set(0, 0, 0);
		}
		_baseVector.applyMatrix4(this.bindMatrix);
		for (let i = 0; i < 4; i++) {
			const weight = _skinWeight.getComponent(i);
			if (weight !== 0) {
				const boneIndex = _skinIndex.getComponent(i);
				_matrix4.multiplyMatrices(skeleton.bones[boneIndex].matrixWorld, skeleton.boneInverses[boneIndex]);
				target.addScaledVector(_vector4.copy(_baseVector).applyMatrix4(_matrix4), weight);
			}
		}
		if (target.isVector4) target.w = _baseVector.w;
		return target.applyMatrix4(this.bindMatrixInverse);
	}
};
/**
* A bone which is part of a {@link Skeleton}. The skeleton in turn is used by
* the {@link SkinnedMesh}.
*
* ```js
* const root = new THREE.Bone();
* const child = new THREE.Bone();
*
* root.add( child );
* child.position.y = 5;
* ```
*
* @augments Object3D
*/
var Bone = class extends Object3D {
	/**
	* Constructs a new bone.
	*/
	constructor() {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isBone = true;
		this.type = "Bone";
	}
};
/**
* Creates a texture directly from raw buffer data.
*
* The interpretation of the data depends on type and format: If the type is
* `UnsignedByteType`, a `Uint8Array` will be useful for addressing the
* texel data. If the format is `RGBAFormat`, data needs four values for
* one texel; Red, Green, Blue and Alpha (typically the opacity).
*
* @augments Texture
*/
var DataTexture = class extends Texture {
	/**
	* Constructs a new data texture.
	*
	* @param {?TypedArray} [data=null] - The buffer data.
	* @param {number} [width=1] - The width of the texture.
	* @param {number} [height=1] - The height of the texture.
	* @param {number} [format=RGBAFormat] - The texture format.
	* @param {number} [type=UnsignedByteType] - The texture type.
	* @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
	* @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	* @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	* @param {number} [magFilter=NearestFilter] - The mag filter value.
	* @param {number} [minFilter=NearestFilter] - The min filter value.
	* @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
	* @param {string} [colorSpace=NoColorSpace] - The color space.
	*/
	constructor(data = null, width = 1, height = 1, format, type, mapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, colorSpace) {
		super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace);
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isDataTexture = true;
		/**
		* The image definition of a data texture.
		*
		* @type {{data:TypedArray,width:number,height:number}}
		*/
		this.image = {
			data,
			width,
			height
		};
		/**
		* Whether to generate mipmaps (if possible) for a texture.
		*
		* Overwritten and set to `false` by default.
		*
		* @type {boolean}
		* @default false
		*/
		this.generateMipmaps = false;
		/**
		* If set to `true`, the texture is flipped along the vertical axis when
		* uploaded to the GPU.
		*
		* Overwritten and set to `false` by default.
		*
		* @type {boolean}
		* @default false
		*/
		this.flipY = false;
		/**
		* Specifies the alignment requirements for the start of each pixel row in memory.
		*
		* Overwritten and set to `1` by default.
		*
		* @type {boolean}
		* @default 1
		*/
		this.unpackAlignment = 1;
	}
};
const _offsetMatrix = /*@__PURE__*/ new Matrix4();
const _identityMatrix$1 = /*@__PURE__*/ new Matrix4();
/**
* Class for representing the armatures in `three.js`. The skeleton
* is defined by a hierarchy of bones.
*
* ```js
* const bones = [];
*
* const shoulder = new THREE.Bone();
* const elbow = new THREE.Bone();
* const hand = new THREE.Bone();
*
* shoulder.add( elbow );
* elbow.add( hand );
*
* bones.push( shoulder , elbow, hand);
*
* shoulder.position.y = -5;
* elbow.position.y = 0;
* hand.position.y = 5;
*
* const armSkeleton = new THREE.Skeleton( bones );
* ```
*/
var Skeleton = class Skeleton {
	/**
	* Constructs a new skeleton.
	*
	* @param {Array<Bone>} [bones] - An array of bones.
	* @param {Array<Matrix4>} [boneInverses] - An array of bone inverse matrices.
	* If not provided, these matrices will be computed automatically via {@link Skeleton#calculateInverses}.
	*/
	constructor(bones = [], boneInverses = []) {
		this.uuid = generateUUID();
		/**
		* An array of bones defining the skeleton.
		*
		* @type {Array<Bone>}
		*/
		this.bones = bones.slice(0);
		/**
		* An array of bone inverse matrices.
		*
		* @type {Array<Matrix4>}
		*/
		this.boneInverses = boneInverses;
		/**
		* An array buffer holding the bone data.
		* Input data for {@link Skeleton#boneTexture}.
		*
		* @type {?Float32Array}
		* @default null
		*/
		this.boneMatrices = null;
		/**
		* A texture holding the bone data for use
		* in the vertex shader.
		*
		* @type {?DataTexture}
		* @default null
		*/
		this.boneTexture = null;
		this.init();
	}
	/**
	* Initializes the skeleton. This method gets automatically called by the constructor
	* but depending on how the skeleton is created it might be necessary to call this method
	* manually.
	*/
	init() {
		const bones = this.bones;
		const boneInverses = this.boneInverses;
		this.boneMatrices = new Float32Array(bones.length * 16);
		if (boneInverses.length === 0) this.calculateInverses();
		else if (bones.length !== boneInverses.length) {
			warn("Skeleton: Number of inverse bone matrices does not match amount of bones.");
			this.boneInverses = [];
			for (let i = 0, il = this.bones.length; i < il; i++) this.boneInverses.push(new Matrix4());
		}
	}
	/**
	* Computes the bone inverse matrices. This method resets {@link Skeleton#boneInverses}
	* and fills it with new matrices.
	*/
	calculateInverses() {
		this.boneInverses.length = 0;
		for (let i = 0, il = this.bones.length; i < il; i++) {
			const inverse = new Matrix4();
			if (this.bones[i]) inverse.copy(this.bones[i].matrixWorld).invert();
			this.boneInverses.push(inverse);
		}
	}
	/**
	* Resets the skeleton to the base pose.
	*/
	pose() {
		for (let i = 0, il = this.bones.length; i < il; i++) {
			const bone = this.bones[i];
			if (bone) bone.matrixWorld.copy(this.boneInverses[i]).invert();
		}
		for (let i = 0, il = this.bones.length; i < il; i++) {
			const bone = this.bones[i];
			if (bone) {
				if (bone.parent && bone.parent.isBone) {
					bone.matrix.copy(bone.parent.matrixWorld).invert();
					bone.matrix.multiply(bone.matrixWorld);
				} else bone.matrix.copy(bone.matrixWorld);
				bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);
			}
		}
	}
	/**
	* Resets the skeleton to the base pose.
	*/
	update() {
		const bones = this.bones;
		const boneInverses = this.boneInverses;
		const boneMatrices = this.boneMatrices;
		const boneTexture = this.boneTexture;
		for (let i = 0, il = bones.length; i < il; i++) {
			const matrix = bones[i] ? bones[i].matrixWorld : _identityMatrix$1;
			_offsetMatrix.multiplyMatrices(matrix, boneInverses[i]);
			_offsetMatrix.toArray(boneMatrices, i * 16);
		}
		if (boneTexture !== null) boneTexture.needsUpdate = true;
	}
	/**
	* Returns a new skeleton with copied values from this instance.
	*
	* @return {Skeleton} A clone of this instance.
	*/
	clone() {
		return new Skeleton(this.bones, this.boneInverses);
	}
	/**
	* Computes a data texture for passing bone data to the vertex shader.
	*
	* @return {Skeleton} A reference of this instance.
	*/
	computeBoneTexture() {
		let size = Math.sqrt(this.bones.length * 4);
		size = Math.ceil(size / 4) * 4;
		size = Math.max(size, 4);
		const boneMatrices = new Float32Array(size * size * 4);
		boneMatrices.set(this.boneMatrices);
		const boneTexture = new DataTexture(boneMatrices, size, size, RGBAFormat, FloatType);
		boneTexture.needsUpdate = true;
		this.boneMatrices = boneMatrices;
		this.boneTexture = boneTexture;
		return this;
	}
	/**
	* Searches through the skeleton's bone array and returns the first with a
	* matching name.
	*
	* @param {string} name - The name of the bone.
	* @return {Bone|undefined} The found bone. `undefined` if no bone has been found.
	*/
	getBoneByName(name) {
		for (let i = 0, il = this.bones.length; i < il; i++) {
			const bone = this.bones[i];
			if (bone.name === name) return bone;
		}
	}
	/**
	* Frees the GPU-related resources allocated by this instance. Call this
	* method whenever this instance is no longer used in your app.
	*/
	dispose() {
		if (this.boneTexture !== null) {
			this.boneTexture.dispose();
			this.boneTexture = null;
		}
	}
	/**
	* Setups the skeleton by the given JSON and bones.
	*
	* @param {Object} json - The skeleton as serialized JSON.
	* @param {Object<string, Bone>} bones - An array of bones.
	* @return {Skeleton} A reference of this instance.
	*/
	fromJSON(json, bones) {
		this.uuid = json.uuid;
		for (let i = 0, l = json.bones.length; i < l; i++) {
			const uuid = json.bones[i];
			let bone = bones[uuid];
			if (bone === void 0) {
				warn("Skeleton: No bone found with UUID:", uuid);
				bone = new Bone();
			}
			this.bones.push(bone);
			this.boneInverses.push(new Matrix4().fromArray(json.boneInverses[i]));
		}
		this.init();
		return this;
	}
	/**
	* Serializes the skeleton into JSON.
	*
	* @return {Object} A JSON object representing the serialized skeleton.
	* @see {@link ObjectLoader#parse}
	*/
	toJSON() {
		const data = {
			metadata: {
				version: 4.7,
				type: "Skeleton",
				generator: "Skeleton.toJSON"
			},
			bones: [],
			boneInverses: []
		};
		data.uuid = this.uuid;
		const bones = this.bones;
		const boneInverses = this.boneInverses;
		for (let i = 0, l = bones.length; i < l; i++) {
			const bone = bones[i];
			data.bones.push(bone.uuid);
			const boneInverse = boneInverses[i];
			data.boneInverses.push(boneInverse.toArray());
		}
		return data;
	}
};
/**
* An instanced version of a buffer attribute.
*
* @augments BufferAttribute
*/
var InstancedBufferAttribute = class extends BufferAttribute {
	/**
	* Constructs a new instanced buffer attribute.
	*
	* @param {TypedArray} array - The array holding the attribute data.
	* @param {number} itemSize - The item size.
	* @param {boolean} [normalized=false] - Whether the data are normalized or not.
	* @param {number} [meshPerAttribute=1] - How often a value of this buffer attribute should be repeated.
	*/
	constructor(array, itemSize, normalized, meshPerAttribute = 1) {
		super(array, itemSize, normalized);
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isInstancedBufferAttribute = true;
		/**
		* Defines how often a value of this buffer attribute should be repeated. A
		* value of one means that each value of the instanced attribute is used for
		* a single instance. A value of two means that each value is used for two
		* consecutive instances (and so on).
		*
		* @type {number}
		* @default 1
		*/
		this.meshPerAttribute = meshPerAttribute;
	}
	copy(source) {
		super.copy(source);
		this.meshPerAttribute = source.meshPerAttribute;
		return this;
	}
	toJSON() {
		const data = super.toJSON();
		data.meshPerAttribute = this.meshPerAttribute;
		data.isInstancedBufferAttribute = true;
		return data;
	}
};
const _instanceLocalMatrix = /*@__PURE__*/ new Matrix4();
const _instanceWorldMatrix = /*@__PURE__*/ new Matrix4();
const _instanceIntersects = [];
const _box3 = /*@__PURE__*/ new Box3();
const _identity = /*@__PURE__*/ new Matrix4();
const _mesh$1 = /*@__PURE__*/ new Mesh();
const _sphere$4 = /*@__PURE__*/ new Sphere();
/**
* A special version of a mesh with instanced rendering support. Use
* this class if you have to render a large number of objects with the same
* geometry and material(s) but with different world transformations. The usage
* of 'InstancedMesh' will help you to reduce the number of draw calls and thus
* improve the overall rendering performance in your application.
*
* @augments Mesh
*/
var InstancedMesh = class extends Mesh {
	/**
	* Constructs a new instanced mesh.
	*
	* @param {BufferGeometry} [geometry] - The mesh geometry.
	* @param {Material|Array<Material>} [material] - The mesh material.
	* @param {number} count - The number of instances.
	*/
	constructor(geometry, material, count) {
		super(geometry, material);
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isInstancedMesh = true;
		/**
		* Represents the local transformation of all instances. You have to set its
		* {@link BufferAttribute#needsUpdate} flag to true if you modify instanced data
		* via {@link InstancedMesh#setMatrixAt}.
		*
		* @type {InstancedBufferAttribute}
		*/
		this.instanceMatrix = new InstancedBufferAttribute(new Float32Array(count * 16), 16);
		/**
		* Represents the color of all instances. You have to set its
		* {@link BufferAttribute#needsUpdate} flag to true if you modify instanced data
		* via {@link InstancedMesh#setColorAt}.
		*
		* @type {?InstancedBufferAttribute}
		* @default null
		*/
		this.instanceColor = null;
		/**
		* Represents the morph target weights of all instances. You have to set its
		* {@link Texture#needsUpdate} flag to true if you modify instanced data
		* via {@link InstancedMesh#setMorphAt}.
		*
		* @type {?DataTexture}
		* @default null
		*/
		this.morphTexture = null;
		/**
		* The number of instances.
		*
		* @type {number}
		*/
		this.count = count;
		/**
		* The bounding box of the instanced mesh. Can be computed via {@link InstancedMesh#computeBoundingBox}.
		*
		* @type {?Box3}
		* @default null
		*/
		this.boundingBox = null;
		/**
		* The bounding sphere of the instanced mesh. Can be computed via {@link InstancedMesh#computeBoundingSphere}.
		*
		* @type {?Sphere}
		* @default null
		*/
		this.boundingSphere = null;
		for (let i = 0; i < count; i++) this.setMatrixAt(i, _identity);
	}
	/**
	* Computes the bounding box of the instanced mesh, and updates {@link InstancedMesh#boundingBox}.
	* The bounding box is not automatically computed by the engine; this method must be called by your app.
	* You may need to recompute the bounding box if an instance is transformed via {@link InstancedMesh#setMatrixAt}.
	*/
	computeBoundingBox() {
		const geometry = this.geometry;
		const count = this.count;
		if (this.boundingBox === null) this.boundingBox = new Box3();
		if (geometry.boundingBox === null) geometry.computeBoundingBox();
		this.boundingBox.makeEmpty();
		for (let i = 0; i < count; i++) {
			this.getMatrixAt(i, _instanceLocalMatrix);
			_box3.copy(geometry.boundingBox).applyMatrix4(_instanceLocalMatrix);
			this.boundingBox.union(_box3);
		}
	}
	/**
	* Computes the bounding sphere of the instanced mesh, and updates {@link InstancedMesh#boundingSphere}
	* The engine automatically computes the bounding sphere when it is needed, e.g., for ray casting or view frustum culling.
	* You may need to recompute the bounding sphere if an instance is transformed via {@link InstancedMesh#setMatrixAt}.
	*/
	computeBoundingSphere() {
		const geometry = this.geometry;
		const count = this.count;
		if (this.boundingSphere === null) this.boundingSphere = new Sphere();
		if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
		this.boundingSphere.makeEmpty();
		for (let i = 0; i < count; i++) {
			this.getMatrixAt(i, _instanceLocalMatrix);
			_sphere$4.copy(geometry.boundingSphere).applyMatrix4(_instanceLocalMatrix);
			this.boundingSphere.union(_sphere$4);
		}
	}
	copy(source, recursive) {
		super.copy(source, recursive);
		this.instanceMatrix.copy(source.instanceMatrix);
		if (source.morphTexture !== null) this.morphTexture = source.morphTexture.clone();
		if (source.instanceColor !== null) this.instanceColor = source.instanceColor.clone();
		this.count = source.count;
		if (source.boundingBox !== null) this.boundingBox = source.boundingBox.clone();
		if (source.boundingSphere !== null) this.boundingSphere = source.boundingSphere.clone();
		return this;
	}
	/**
	* Gets the color of the defined instance.
	*
	* @param {number} index - The instance index.
	* @param {Color} color - The target object that is used to store the method's result.
	* @return {Color} A reference to the target color.
	*/
	getColorAt(index, color) {
		if (this.instanceColor === null) return color.setRGB(1, 1, 1);
		else return color.fromArray(this.instanceColor.array, index * 3);
	}
	/**
	* Gets the local transformation matrix of the defined instance.
	*
	* @param {number} index - The instance index.
	* @param {Matrix4} matrix - The target object that is used to store the method's result.
	* @return {Matrix4} A reference to the target matrix.
	*/
	getMatrixAt(index, matrix) {
		return matrix.fromArray(this.instanceMatrix.array, index * 16);
	}
	/**
	* Gets the morph target weights of the defined instance.
	*
	* @param {number} index - The instance index.
	* @param {Mesh} object - The target object that is used to store the method's result.
	*/
	getMorphAt(index, object) {
		const objectInfluences = object.morphTargetInfluences;
		const array = this.morphTexture.source.data.data;
		const dataIndex = index * (objectInfluences.length + 1) + 1;
		for (let i = 0; i < objectInfluences.length; i++) objectInfluences[i] = array[dataIndex + i];
	}
	raycast(raycaster, intersects) {
		const matrixWorld = this.matrixWorld;
		const raycastTimes = this.count;
		_mesh$1.geometry = this.geometry;
		_mesh$1.material = this.material;
		if (_mesh$1.material === void 0) return;
		if (this.boundingSphere === null) this.computeBoundingSphere();
		_sphere$4.copy(this.boundingSphere);
		_sphere$4.applyMatrix4(matrixWorld);
		if (raycaster.ray.intersectsSphere(_sphere$4) === false) return;
		for (let instanceId = 0; instanceId < raycastTimes; instanceId++) {
			this.getMatrixAt(instanceId, _instanceLocalMatrix);
			_instanceWorldMatrix.multiplyMatrices(matrixWorld, _instanceLocalMatrix);
			_mesh$1.matrixWorld = _instanceWorldMatrix;
			_mesh$1.raycast(raycaster, _instanceIntersects);
			for (let i = 0, l = _instanceIntersects.length; i < l; i++) {
				const intersect = _instanceIntersects[i];
				intersect.instanceId = instanceId;
				intersect.object = this;
				intersects.push(intersect);
			}
			_instanceIntersects.length = 0;
		}
	}
	/**
	* Sets the given color to the defined instance. Make sure you set the `needsUpdate` flag of
	* {@link InstancedMesh#instanceColor} to `true` after updating all the colors.
	*
	* @param {number} index - The instance index.
	* @param {Color} color - The instance color.
	* @return {InstancedMesh} A reference to this instanced mesh.
	*/
	setColorAt(index, color) {
		if (this.instanceColor === null) this.instanceColor = new InstancedBufferAttribute(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3);
		color.toArray(this.instanceColor.array, index * 3);
		return this;
	}
	/**
	* Sets the given local transformation matrix to the defined instance. Make sure you set the `needsUpdate` flag of
	* {@link InstancedMesh#instanceMatrix} to `true` after updating all the matrices.
	*
	* @param {number} index - The instance index.
	* @param {Matrix4} matrix - The local transformation.
	* @return {InstancedMesh} A reference to this instanced mesh.
	*/
	setMatrixAt(index, matrix) {
		matrix.toArray(this.instanceMatrix.array, index * 16);
		return this;
	}
	/**
	* Sets the morph target weights to the defined instance. Make sure you set the `needsUpdate` flag of
	* {@link InstancedMesh#morphTexture} to `true` after updating all the influences.
	*
	* @param {number} index - The instance index.
	* @param {Mesh} object -  A mesh which `morphTargetInfluences` property containing the morph target weights
	* of a single instance.
	* @return {InstancedMesh} A reference to this instanced mesh.
	*/
	setMorphAt(index, object) {
		const objectInfluences = object.morphTargetInfluences;
		const len = objectInfluences.length + 1;
		if (this.morphTexture === null) this.morphTexture = new DataTexture(new Float32Array(len * this.count), len, this.count, RedFormat, FloatType);
		const array = this.morphTexture.source.data.data;
		let morphInfluencesSum = 0;
		for (let i = 0; i < objectInfluences.length; i++) morphInfluencesSum += objectInfluences[i];
		const morphBaseInfluence = this.geometry.morphTargetsRelative ? 1 : 1 - morphInfluencesSum;
		const dataIndex = len * index;
		array[dataIndex] = morphBaseInfluence;
		array.set(objectInfluences, dataIndex + 1);
		return this;
	}
	updateMorphTargets() {}
	/**
	* Frees the GPU-related resources allocated by this instance. Call this
	* method whenever this instance is no longer used in your app.
	*/
	dispose() {
		super.dispose();
		if (this.morphTexture !== null) {
			this.morphTexture.dispose();
			this.morphTexture = null;
		}
	}
};
const _sphere$3 = /*@__PURE__*/ new Sphere();
const _defaultSpriteCenter = /*@__PURE__*/ new Vector2(.5, .5);
const _vector$6 = /*@__PURE__*/ new Vector3();
/**
* Frustums are used to determine what is inside the camera's field of view.
* They help speed up the rendering process - objects which lie outside a camera's
* frustum can safely be excluded from rendering.
*
* This class is mainly intended for use internally by a renderer.
*/
var Frustum = class {
	/**
	* Constructs a new frustum.
	*
	* @param {Plane} [p0] - The first plane that encloses the frustum.
	* @param {Plane} [p1] - The second plane that encloses the frustum.
	* @param {Plane} [p2] - The third plane that encloses the frustum.
	* @param {Plane} [p3] - The fourth plane that encloses the frustum.
	* @param {Plane} [p4] - The fifth plane that encloses the frustum.
	* @param {Plane} [p5] - The sixth plane that encloses the frustum.
	*/
	constructor(p0 = new Plane(), p1 = new Plane(), p2 = new Plane(), p3 = new Plane(), p4 = new Plane(), p5 = new Plane()) {
		/**
		* This array holds the planes that enclose the frustum.
		*
		* @type {Array<Plane>}
		*/
		this.planes = [
			p0,
			p1,
			p2,
			p3,
			p4,
			p5
		];
	}
	/**
	* Sets the frustum planes by copying the given planes.
	*
	* @param {Plane} [p0] - The first plane that encloses the frustum.
	* @param {Plane} [p1] - The second plane that encloses the frustum.
	* @param {Plane} [p2] - The third plane that encloses the frustum.
	* @param {Plane} [p3] - The fourth plane that encloses the frustum.
	* @param {Plane} [p4] - The fifth plane that encloses the frustum.
	* @param {Plane} [p5] - The sixth plane that encloses the frustum.
	* @return {Frustum} A reference to this frustum.
	*/
	set(p0, p1, p2, p3, p4, p5) {
		const planes = this.planes;
		planes[0].copy(p0);
		planes[1].copy(p1);
		planes[2].copy(p2);
		planes[3].copy(p3);
		planes[4].copy(p4);
		planes[5].copy(p5);
		return this;
	}
	/**
	* Copies the values of the given frustum to this instance.
	*
	* @param {Frustum} frustum - The frustum to copy.
	* @return {Frustum} A reference to this frustum.
	*/
	copy(frustum) {
		const planes = this.planes;
		for (let i = 0; i < 6; i++) planes[i].copy(frustum.planes[i]);
		return this;
	}
	/**
	* Sets the frustum planes from the given projection matrix.
	*
	* @param {Matrix4} m - The projection matrix.
	* @param {(WebGLCoordinateSystem|WebGPUCoordinateSystem)} coordinateSystem - The coordinate system.
	* @param {boolean} [reversedDepth=false] - Whether to use a reversed depth.
	* @return {Frustum} A reference to this frustum.
	*/
	setFromProjectionMatrix(m, coordinateSystem = WebGLCoordinateSystem, reversedDepth = false) {
		const planes = this.planes;
		const me = m.elements;
		const me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
		const me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
		const me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
		const me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];
		planes[0].setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12).normalize();
		planes[1].setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12).normalize();
		planes[2].setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13).normalize();
		planes[3].setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13).normalize();
		if (reversedDepth) {
			planes[4].setComponents(me2, me6, me10, me14).normalize();
			planes[5].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize();
		} else {
			planes[4].setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14).normalize();
			if (coordinateSystem === 2e3) planes[5].setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14).normalize();
			else if (coordinateSystem === 2001) planes[5].setComponents(me2, me6, me10, me14).normalize();
			else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + coordinateSystem);
		}
		return this;
	}
	/**
	* Returns `true` if the 3D object's bounding sphere is intersecting this frustum.
	*
	* Note that the 3D object must have a geometry so that the bounding sphere can be calculated.
	*
	* @param {Object3D} object - The 3D object to test.
	* @return {boolean} Whether the 3D object's bounding sphere is intersecting this frustum or not.
	*/
	intersectsObject(object) {
		if (object.boundingSphere !== void 0) {
			if (object.boundingSphere === null) object.computeBoundingSphere();
			_sphere$3.copy(object.boundingSphere).applyMatrix4(object.matrixWorld);
		} else {
			const geometry = object.geometry;
			if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
			_sphere$3.copy(geometry.boundingSphere).applyMatrix4(object.matrixWorld);
		}
		return this.intersectsSphere(_sphere$3);
	}
	/**
	* Returns `true` if the given sprite is intersecting this frustum.
	*
	* @param {Sprite} sprite - The sprite to test.
	* @return {boolean} Whether the sprite is intersecting this frustum or not.
	*/
	intersectsSprite(sprite) {
		_sphere$3.center.set(0, 0, 0);
		const offset = _defaultSpriteCenter.distanceTo(sprite.center);
		_sphere$3.radius = .7071067811865476 + offset;
		_sphere$3.applyMatrix4(sprite.matrixWorld);
		return this.intersectsSphere(_sphere$3);
	}
	/**
	* Returns `true` if the given bounding sphere is intersecting this frustum.
	*
	* This is a fast, conservative test that favors performance over precision. It can
	* report false positives for spheres that lie outside the frustum but are not separated
	* by a single frustum plane. It never reports false negatives, so it is safe for culling.
	*
	* @param {Sphere} sphere - The bounding sphere to test.
	* @return {boolean} Whether the bounding sphere is intersecting this frustum or not.
	*/
	intersectsSphere(sphere) {
		const planes = this.planes;
		const center = sphere.center;
		const negRadius = -sphere.radius;
		for (let i = 0; i < 6; i++) if (planes[i].distanceToPoint(center) < negRadius) return false;
		return true;
	}
	/**
	* Returns `true` if the given bounding box is intersecting this frustum.
	*
	* This is a fast, conservative test that favors performance over precision. It can
	* report false positives for large boxes that lie outside the frustum but are not
	* separated by a single frustum plane. It never reports false negatives, so it is
	* safe for culling.
	*
	* @param {Box3} box - The bounding box to test.
	* @return {boolean} Whether the bounding box is intersecting this frustum or not.
	*/
	intersectsBox(box) {
		const planes = this.planes;
		for (let i = 0; i < 6; i++) {
			const plane = planes[i];
			_vector$6.x = plane.normal.x > 0 ? box.max.x : box.min.x;
			_vector$6.y = plane.normal.y > 0 ? box.max.y : box.min.y;
			_vector$6.z = plane.normal.z > 0 ? box.max.z : box.min.z;
			if (plane.distanceToPoint(_vector$6) < 0) return false;
		}
		return true;
	}
	/**
	* Returns `true` if the given point lies within the frustum.
	*
	* @param {Vector3} point - The point to test.
	* @return {boolean} Whether the point lies within this frustum or not.
	*/
	containsPoint(point) {
		const planes = this.planes;
		for (let i = 0; i < 6; i++) if (planes[i].distanceToPoint(point) < 0) return false;
		return true;
	}
	/**
	* Returns a new frustum with copied values from this instance.
	*
	* @return {Frustum} A clone of this instance.
	*/
	clone() {
		return new this.constructor().copy(this);
	}
};
/**
* A material for rendering line primitives.
*
* Materials define the appearance of renderable 3D objects.
*
* ```js
* const material = new THREE.LineBasicMaterial( { color: 0xffffff } );
* ```
*
* @augments Material
*/
var LineBasicMaterial = class extends Material {
	/**
	* Constructs a new line basic material.
	*
	* @param {Object} [parameters] - An object with one or more properties
	* defining the material's appearance. Any property of the material
	* (including any property from inherited materials) can be passed
	* in here. Color values can be passed any type of value accepted
	* by {@link Color#set}.
	*/
	constructor(parameters) {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isLineBasicMaterial = true;
		this.type = "LineBasicMaterial";
		/**
		* Color of the material.
		*
		* @type {Color}
		* @default (1,1,1)
		*/
		this.color = new Color(16777215);
		/**
		* Sets the color of the lines using data from a texture. The texture map
		* color is modulated by the diffuse `color`.
		*
		* `map` represents color data, and the texture must be assigned a
		* {@link Texture#colorSpace}. Most `map` textures set
		* `texture.colorSpace = SRGBColorSpace`.
		*
		* @type {?Texture}
		* @default null
		*/
		this.map = null;
		/**
		* Controls line thickness or lines.
		*
		* Can only be used with {@link SVGRenderer}. WebGL and WebGPU
		* ignore this setting and always render line primitives with a
		* width of one pixel.
		*
		* @type {number}
		* @default 1
		*/
		this.linewidth = 1;
		/**
		* Defines appearance of line ends.
		*
		* Can only be used with {@link SVGRenderer}.
		*
		* @type {('butt'|'round'|'square')}
		* @default 'round'
		*/
		this.linecap = "round";
		/**
		* Defines appearance of line joints.
		*
		* Can only be used with {@link SVGRenderer}.
		*
		* @type {('round'|'bevel'|'miter')}
		* @default 'round'
		*/
		this.linejoin = "round";
		/**
		* Whether the material is affected by fog or not.
		*
		* @type {boolean}
		* @default true
		*/
		this.fog = true;
		this.setValues(parameters);
	}
	copy(source) {
		super.copy(source);
		this.color.copy(source.color);
		this.map = source.map;
		this.linewidth = source.linewidth;
		this.linecap = source.linecap;
		this.linejoin = source.linejoin;
		this.fog = source.fog;
		return this;
	}
};
const _vStart = /*@__PURE__*/ new Vector3();
const _vEnd = /*@__PURE__*/ new Vector3();
const _inverseMatrix$1 = /*@__PURE__*/ new Matrix4();
const _ray$1 = /*@__PURE__*/ new Ray();
const _sphere$1 = /*@__PURE__*/ new Sphere();
const _intersectPointOnRay = /*@__PURE__*/ new Vector3();
const _intersectPointOnSegment = /*@__PURE__*/ new Vector3();
/**
* A continuous line. The line are rendered by connecting consecutive
* vertices with straight lines.
*
* ```js
* const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
*
* const points = [];
* points.push( new THREE.Vector3( - 10, 0, 0 ) );
* points.push( new THREE.Vector3( 0, 10, 0 ) );
* points.push( new THREE.Vector3( 10, 0, 0 ) );
*
* const geometry = new THREE.BufferGeometry().setFromPoints( points );
*
* const line = new THREE.Line( geometry, material );
* scene.add( line );
* ```
*
* @augments Object3D
*/
var Line = class extends Object3D {
	/**
	* Constructs a new line.
	*
	* @param {BufferGeometry} [geometry] - The line geometry.
	* @param {Material|Array<Material>} [material] - The line material.
	*/
	constructor(geometry = new BufferGeometry(), material = new LineBasicMaterial()) {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isLine = true;
		this.type = "Line";
		/**
		* The line geometry.
		*
		* @type {BufferGeometry}
		*/
		this.geometry = geometry;
		/**
		* The line material.
		*
		* @type {Material|Array<Material>}
		* @default LineBasicMaterial
		*/
		this.material = material;
		/**
		* A dictionary representing the morph targets in the geometry. The key is the
		* morph targets name, the value its attribute index. This member is `undefined`
		* by default and only set when morph targets are detected in the geometry.
		*
		* @type {Object<string,number>|undefined}
		* @default undefined
		*/
		this.morphTargetDictionary = void 0;
		/**
		* An array of weights typically in the range `[0,1]` that specify how much of the morph
		* is applied. This member is `undefined` by default and only set when morph targets are
		* detected in the geometry.
		*
		* @type {Array<number>|undefined}
		* @default undefined
		*/
		this.morphTargetInfluences = void 0;
		this.updateMorphTargets();
	}
	copy(source, recursive) {
		super.copy(source, recursive);
		this.material = Array.isArray(source.material) ? source.material.slice() : source.material;
		this.geometry = source.geometry;
		return this;
	}
	/**
	* Computes an array of distance values which are necessary for rendering dashed lines.
	* For each vertex in the geometry, the method calculates the cumulative length from the
	* current point to the very beginning of the line.
	*
	* @return {Line} A reference to this line.
	*/
	computeLineDistances() {
		const geometry = this.geometry;
		if (geometry.index === null) {
			const positionAttribute = geometry.attributes.position;
			const lineDistances = [0];
			for (let i = 1, l = positionAttribute.count; i < l; i++) {
				_vStart.fromBufferAttribute(positionAttribute, i - 1);
				_vEnd.fromBufferAttribute(positionAttribute, i);
				lineDistances[i] = lineDistances[i - 1];
				lineDistances[i] += _vStart.distanceTo(_vEnd);
			}
			geometry.setAttribute("lineDistance", new Float32BufferAttribute(lineDistances, 1));
		} else warn("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
		return this;
	}
	/**
	* Returns `true` if this line intersects the given frustum.
	*
	* @param {Frustum|FrustumArray} frustum - The frustum to test.
	* @return {boolean} Whether this line intersects the given frustum or not.
	*/
	intersectsFrustum(frustum) {
		return frustum.intersectsObject(this);
	}
	/**
	* Computes intersection points between a casted ray and this line.
	*
	* @param {Raycaster} raycaster - The raycaster.
	* @param {Array<Object>} intersects - The target array that holds the intersection points.
	*/
	raycast(raycaster, intersects) {
		const geometry = this.geometry;
		const matrixWorld = this.matrixWorld;
		const threshold = raycaster.params.Line.threshold;
		const drawRange = geometry.drawRange;
		if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
		_sphere$1.copy(geometry.boundingSphere);
		_sphere$1.applyMatrix4(matrixWorld);
		_sphere$1.radius += threshold;
		if (raycaster.ray.intersectsSphere(_sphere$1) === false) return;
		_inverseMatrix$1.copy(matrixWorld).invert();
		_ray$1.copy(raycaster.ray).applyMatrix4(_inverseMatrix$1);
		const localThreshold = threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3);
		const localThresholdSq = localThreshold * localThreshold;
		const step = this.isLineSegments ? 2 : 1;
		const index = geometry.index;
		const positionAttribute = geometry.attributes.position;
		if (index !== null) {
			const start = Math.max(0, drawRange.start);
			const end = Math.min(index.count, drawRange.start + drawRange.count);
			for (let i = start, l = end - 1; i < l; i += step) {
				const a = index.getX(i);
				const b = index.getX(i + 1);
				const intersect = checkIntersection(this, raycaster, _ray$1, localThresholdSq, a, b, i);
				if (intersect) intersects.push(intersect);
			}
			if (this.isLineLoop) {
				const a = index.getX(end - 1);
				const b = index.getX(start);
				const intersect = checkIntersection(this, raycaster, _ray$1, localThresholdSq, a, b, end - 1);
				if (intersect) intersects.push(intersect);
			}
		} else {
			const start = Math.max(0, drawRange.start);
			const end = Math.min(positionAttribute.count, drawRange.start + drawRange.count);
			for (let i = start, l = end - 1; i < l; i += step) {
				const intersect = checkIntersection(this, raycaster, _ray$1, localThresholdSq, i, i + 1, i);
				if (intersect) intersects.push(intersect);
			}
			if (this.isLineLoop) {
				const intersect = checkIntersection(this, raycaster, _ray$1, localThresholdSq, end - 1, start, end - 1);
				if (intersect) intersects.push(intersect);
			}
		}
	}
	/**
	* Sets the values of {@link Line#morphTargetDictionary} and {@link Line#morphTargetInfluences}
	* to make sure existing morph targets can influence this 3D object.
	*/
	updateMorphTargets() {
		const morphAttributes = this.geometry.morphAttributes;
		const keys = Object.keys(morphAttributes);
		if (keys.length > 0) {
			const morphAttribute = morphAttributes[keys[0]];
			if (morphAttribute !== void 0) {
				this.morphTargetInfluences = [];
				this.morphTargetDictionary = {};
				for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
					const name = morphAttribute[m].name || String(m);
					this.morphTargetInfluences.push(0);
					this.morphTargetDictionary[name] = m;
				}
			}
		}
	}
};
function checkIntersection(object, raycaster, ray, thresholdSq, a, b, i) {
	const positionAttribute = object.geometry.attributes.position;
	_vStart.fromBufferAttribute(positionAttribute, a);
	_vEnd.fromBufferAttribute(positionAttribute, b);
	if (ray.distanceSqToSegment(_vStart, _vEnd, _intersectPointOnRay, _intersectPointOnSegment) > thresholdSq) return;
	_intersectPointOnRay.applyMatrix4(object.matrixWorld);
	const distance = raycaster.ray.origin.distanceTo(_intersectPointOnRay);
	if (distance < raycaster.near || distance > raycaster.far) return;
	return {
		distance,
		point: _intersectPointOnSegment.clone().applyMatrix4(object.matrixWorld),
		index: i,
		face: null,
		faceIndex: null,
		barycoord: null,
		object
	};
}
const _start = /*@__PURE__*/ new Vector3();
const _end = /*@__PURE__*/ new Vector3();
/**
* A series of lines drawn between pairs of vertices.
*
* @augments Line
*/
var LineSegments = class extends Line {
	/**
	* Constructs a new line segments.
	*
	* @param {BufferGeometry} [geometry] - The line geometry.
	* @param {Material|Array<Material>} [material] - The line material.
	*/
	constructor(geometry, material) {
		super(geometry, material);
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isLineSegments = true;
		this.type = "LineSegments";
	}
	computeLineDistances() {
		const geometry = this.geometry;
		if (geometry.index === null) {
			const positionAttribute = geometry.attributes.position;
			const lineDistances = [];
			for (let i = 0, l = positionAttribute.count; i < l; i += 2) {
				_start.fromBufferAttribute(positionAttribute, i);
				_end.fromBufferAttribute(positionAttribute, i + 1);
				lineDistances[i] = i === 0 ? 0 : lineDistances[i - 1];
				lineDistances[i + 1] = lineDistances[i] + _start.distanceTo(_end);
			}
			geometry.setAttribute("lineDistance", new Float32BufferAttribute(lineDistances, 1));
		} else warn("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
		return this;
	}
};
/**
* A continuous line. This is nearly the same as {@link Line} the only difference
* is that the last vertex is connected with the first vertex in order to close
* the line to form a loop.
*
* @augments Line
*/
var LineLoop = class extends Line {
	/**
	* Constructs a new line loop.
	*
	* @param {BufferGeometry} [geometry] - The line geometry.
	* @param {Material|Array<Material>} [material] - The line material.
	*/
	constructor(geometry, material) {
		super(geometry, material);
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isLineLoop = true;
		this.type = "LineLoop";
	}
};
/**
* A material for rendering point primitives.
*
* Materials define the appearance of renderable 3D objects.
*
* ```js
* const vertices = [];
*
* for ( let i = 0; i < 10000; i ++ ) {
* 	const x = THREE.MathUtils.randFloatSpread( 2000 );
* 	const y = THREE.MathUtils.randFloatSpread( 2000 );
* 	const z = THREE.MathUtils.randFloatSpread( 2000 );
*
* 	vertices.push( x, y, z );
* }
*
* const geometry = new THREE.BufferGeometry();
* geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
* const material = new THREE.PointsMaterial( { color: 0x888888 } );
* const points = new THREE.Points( geometry, material );
* scene.add( points );
* ```
*
* @augments Material
*/
var PointsMaterial = class extends Material {
	/**
	* Constructs a new points material.
	*
	* @param {Object} [parameters] - An object with one or more properties
	* defining the material's appearance. Any property of the material
	* (including any property from inherited materials) can be passed
	* in here. Color values can be passed any type of value accepted
	* by {@link Color#set}.
	*/
	constructor(parameters) {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isPointsMaterial = true;
		this.type = "PointsMaterial";
		/**
		* Color of the material.
		*
		* @type {Color}
		* @default (1,1,1)
		*/
		this.color = new Color(16777215);
		/**
		* The color map. May optionally include an alpha channel, typically combined
		* with {@link Material#transparent} or {@link Material#alphaTest}. The texture map
		* color is modulated by the diffuse `color`.
		*
		* `map` represents color data, and the texture must be assigned a
		* {@link Texture#colorSpace}. Most `map` textures set
		* `texture.colorSpace = SRGBColorSpace`.
		*
		* @type {?Texture}
		* @default null
		*/
		this.map = null;
		/**
		* The alpha map is a grayscale texture that controls the opacity across the
		* surface (black: fully transparent; white: fully opaque).
		*
		* Only the color of the texture is used, ignoring the alpha channel if one
		* exists. For RGB and RGBA textures, the renderer will use the green channel
		* when sampling this texture due to the extra bit of precision provided for
		* green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and
		* luminance/alpha textures will also still work as expected.
		*
		* `alphaMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.alphaMap = null;
		/**
		* Defines the size of the points in pixels.
		*
		* Might be capped if the value exceeds hardware dependent parameters like [gl.ALIASED_POINT_SIZE_RANGE](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getParamete).
		*
		* @type {number}
		* @default 1
		*/
		this.size = 1;
		/**
		* Specifies whether size of individual points is attenuated by the camera depth (perspective camera only).
		*
		* @type {boolean}
		* @default true
		*/
		this.sizeAttenuation = true;
		/**
		* Whether the material is affected by fog or not.
		*
		* @type {boolean}
		* @default true
		*/
		this.fog = true;
		this.setValues(parameters);
	}
	copy(source) {
		super.copy(source);
		this.color.copy(source.color);
		this.map = source.map;
		this.alphaMap = source.alphaMap;
		this.size = source.size;
		this.sizeAttenuation = source.sizeAttenuation;
		this.fog = source.fog;
		return this;
	}
};
const _inverseMatrix = /*@__PURE__*/ new Matrix4();
const _ray = /*@__PURE__*/ new Ray();
const _sphere = /*@__PURE__*/ new Sphere();
const _position$3 = /*@__PURE__*/ new Vector3();
/**
* A class for displaying points or point clouds.
*
* @augments Object3D
*/
var Points = class extends Object3D {
	/**
	* Constructs a new point cloud.
	*
	* @param {BufferGeometry} [geometry] - The points geometry.
	* @param {Material|Array<Material>} [material] - The points material.
	*/
	constructor(geometry = new BufferGeometry(), material = new PointsMaterial()) {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isPoints = true;
		this.type = "Points";
		/**
		* The points geometry.
		*
		* @type {BufferGeometry}
		*/
		this.geometry = geometry;
		/**
		* The line material.
		*
		* @type {Material|Array<Material>}
		* @default PointsMaterial
		*/
		this.material = material;
		/**
		* A dictionary representing the morph targets in the geometry. The key is the
		* morph targets name, the value its attribute index. This member is `undefined`
		* by default and only set when morph targets are detected in the geometry.
		*
		* @type {Object<string,number>|undefined}
		* @default undefined
		*/
		this.morphTargetDictionary = void 0;
		/**
		* An array of weights typically in the range `[0,1]` that specify how much of the morph
		* is applied. This member is `undefined` by default and only set when morph targets are
		* detected in the geometry.
		*
		* @type {Array<number>|undefined}
		* @default undefined
		*/
		this.morphTargetInfluences = void 0;
		this.updateMorphTargets();
	}
	copy(source, recursive) {
		super.copy(source, recursive);
		this.material = Array.isArray(source.material) ? source.material.slice() : source.material;
		this.geometry = source.geometry;
		return this;
	}
	/**
	* Returns `true` if this point cloud intersects the given frustum.
	*
	* @param {Frustum|FrustumArray} frustum - The frustum to test.
	* @return {boolean} Whether this point cloud intersects the given frustum or not.
	*/
	intersectsFrustum(frustum) {
		return frustum.intersectsObject(this);
	}
	/**
	* Computes intersection points between a casted ray and this point cloud.
	*
	* @param {Raycaster} raycaster - The raycaster.
	* @param {Array<Object>} intersects - The target array that holds the intersection points.
	*/
	raycast(raycaster, intersects) {
		const geometry = this.geometry;
		const matrixWorld = this.matrixWorld;
		const threshold = raycaster.params.Points.threshold;
		const drawRange = geometry.drawRange;
		if (geometry.boundingSphere === null) geometry.computeBoundingSphere();
		_sphere.copy(geometry.boundingSphere);
		_sphere.applyMatrix4(matrixWorld);
		_sphere.radius += threshold;
		if (raycaster.ray.intersectsSphere(_sphere) === false) return;
		_inverseMatrix.copy(matrixWorld).invert();
		_ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix);
		const localThreshold = threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3);
		const localThresholdSq = localThreshold * localThreshold;
		const index = geometry.index;
		const positionAttribute = geometry.attributes.position;
		if (index !== null) {
			const start = Math.max(0, drawRange.start);
			const end = Math.min(index.count, drawRange.start + drawRange.count);
			for (let i = start, il = end; i < il; i++) {
				const a = index.getX(i);
				_position$3.fromBufferAttribute(positionAttribute, a);
				testPoint(_position$3, a, localThresholdSq, matrixWorld, raycaster, intersects, this);
			}
		} else {
			const start = Math.max(0, drawRange.start);
			const end = Math.min(positionAttribute.count, drawRange.start + drawRange.count);
			for (let i = start, l = end; i < l; i++) {
				_position$3.fromBufferAttribute(positionAttribute, i);
				testPoint(_position$3, i, localThresholdSq, matrixWorld, raycaster, intersects, this);
			}
		}
	}
	/**
	* Sets the values of {@link Points#morphTargetDictionary} and {@link Points#morphTargetInfluences}
	* to make sure existing morph targets can influence this 3D object.
	*/
	updateMorphTargets() {
		const morphAttributes = this.geometry.morphAttributes;
		const keys = Object.keys(morphAttributes);
		if (keys.length > 0) {
			const morphAttribute = morphAttributes[keys[0]];
			if (morphAttribute !== void 0) {
				this.morphTargetInfluences = [];
				this.morphTargetDictionary = {};
				for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
					const name = morphAttribute[m].name || String(m);
					this.morphTargetInfluences.push(0);
					this.morphTargetDictionary[name] = m;
				}
			}
		}
	}
};
function testPoint(point, index, localThresholdSq, matrixWorld, raycaster, intersects, object) {
	const rayPointDistanceSq = _ray.distanceSqToPoint(point);
	if (rayPointDistanceSq < localThresholdSq) {
		const intersectPoint = new Vector3();
		_ray.closestPointToPoint(point, intersectPoint);
		intersectPoint.applyMatrix4(matrixWorld);
		const distance = raycaster.ray.origin.distanceTo(intersectPoint);
		if (distance < raycaster.near || distance > raycaster.far) return;
		intersects.push({
			distance,
			distanceToRay: Math.sqrt(rayPointDistanceSq),
			point: intersectPoint,
			index,
			face: null,
			faceIndex: null,
			barycoord: null,
			object
		});
	}
}
/**
* A standard physically based material, using Metallic-Roughness workflow.
*
* Physically based rendering (PBR) has recently become the standard in many
* 3D applications, such as [Unity](https://blogs.unity3d.com/2014/10/29/physically-based-shading-in-unity-5-a-primer/),
* [Unreal](https://docs.unrealengine.com/latest/INT/Engine/Rendering/Materials/PhysicallyBased/) and
* [3D Studio Max](http://area.autodesk.com/blogs/the-3ds-max-blog/what039s-new-for-rendering-in-3ds-max-2017).
*
* This approach differs from older approaches in that instead of using
* approximations for the way in which light interacts with a surface, a
* physically correct model is used. The idea is that, instead of tweaking
* materials to look good under specific lighting, a material can be created
* that will react 'correctly' under all lighting scenarios.
*
* In practice this gives a more accurate and realistic looking result than
* the {@link MeshLambertMaterial} or {@link MeshPhongMaterial}, at the cost of
* being somewhat more computationally expensive. `MeshStandardMaterial` uses per-fragment
* shading.
*
* Note that for best results you should always specify an environment map when using this material.
*
* For a non-technical introduction to the concept of PBR and how to set up a
* PBR material, check out these articles by the people at [marmoset](https://www.marmoset.co):
*
* - [Basic Theory of Physically Based Rendering](https://www.marmoset.co/posts/basic-theory-of-physically-based-rendering/)
* - [Physically Based Rendering and You Can Too](https://www.marmoset.co/posts/physically-based-rendering-and-you-can-too/)
*
* Technical details of the approach used in three.js (and most other PBR systems) can be found is this
* [paper from Disney](https://media.disneyanimation.com/uploads/production/publication_asset/48/asset/s2012_pbs_disney_brdf_notes_v3.pdf)
* (pdf), by Brent Burley.
*
* @augments Material
* @demo scenes/material-browser.html#MeshStandardMaterial
*/
var MeshStandardMaterial = class extends Material {
	/**
	* Constructs a new mesh standard material.
	*
	* @param {Object} [parameters] - An object with one or more properties
	* defining the material's appearance. Any property of the material
	* (including any property from inherited materials) can be passed
	* in here. Color values can be passed any type of value accepted
	* by {@link Color#set}.
	*/
	constructor(parameters) {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isMeshStandardMaterial = true;
		this.type = "MeshStandardMaterial";
		this.defines = { "STANDARD": "" };
		/**
		* Color of the material.
		*
		* @type {Color}
		* @default (1,1,1)
		*/
		this.color = new Color(16777215);
		/**
		* How rough the material appears. `0.0` means a smooth mirror reflection, `1.0`
		* means fully diffuse. If `roughnessMap` is also provided,
		* both values are multiplied.
		*
		* @type {number}
		* @default 1
		*/
		this.roughness = 1;
		/**
		* How much the material is like a metal. Non-metallic materials such as wood
		* or stone use `0.0`, metallic use `1.0`, with nothing (usually) in between.
		* A value between `0.0` and `1.0` could be used for a rusty metal look.
		* If `metalnessMap` is also provided, both values are multiplied.
		*
		* @type {number}
		* @default 0
		*/
		this.metalness = 0;
		/**
		* The color map. May optionally include an alpha channel, typically combined
		* with {@link Material#transparent} or {@link Material#alphaTest}. The texture map
		* color is modulated by the diffuse `color`.
		*
		* `map` represents color data, and the texture must be assigned a
		* {@link Texture#colorSpace}. Most `map` textures set
		* `texture.colorSpace = SRGBColorSpace`.
		*
		* @type {?Texture}
		* @default null
		*/
		this.map = null;
		/**
		* The light map. Requires a second set of UVs.
		*
		* `lightMap` represents pre-baked illuminance data, and the texture must be assigned
		* a {@link Texture#colorSpace}. Most `lightMap` textures set
		* `texture.colorSpace = LinearSRGBColorSpace` and use float-type formats
		* such as `.exr` or `.hdr`.
		*
		* @type {?Texture}
		* @default null
		*/
		this.lightMap = null;
		/**
		* Intensity of the baked light.
		*
		* @type {number}
		* @default 1
		*/
		this.lightMapIntensity = 1;
		/**
		* The red channel of this texture is used as the ambient occlusion map.
		* Requires a second set of UVs.
		*
		* `aoMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.aoMap = null;
		/**
		* Intensity of the ambient occlusion effect. Range is `[0,1]`, where `0`
		* disables ambient occlusion. Where intensity is `1` and the AO map's
		* red channel is also `1`, ambient light is fully occluded on a surface.
		*
		* @type {number}
		* @default 1
		*/
		this.aoMapIntensity = 1;
		/**
		* Emissive (light) color of the material, essentially a solid color
		* unaffected by other lighting.
		*
		* @type {Color}
		* @default (0,0,0)
		*/
		this.emissive = new Color(0);
		/**
		* Intensity of the emissive light. Modulates the emissive color.
		*
		* @type {number}
		* @default 1
		*/
		this.emissiveIntensity = 1;
		/**
		* Set emissive (glow) map. The emissive map color is modulated by the
		* emissive color and the emissive intensity. If you have an emissive map,
		* be sure to set the emissive color to something other than black.
		*
		* `emissiveMap` represents color data, and the texture must be assigned a
		* {@link Texture#colorSpace}. Most `emissiveMap` textures set
		* `texture.colorSpace = SRGBColorSpace`.
		*
		* @type {?Texture}
		* @default null
		*/
		this.emissiveMap = null;
		/**
		* The texture to create a bump map. The black and white values map to the
		* perceived depth in relation to the lights. Bump doesn't actually affect
		* the geometry of the object, only the lighting. If a normal map is defined
		* this will be ignored.
		*
		* `bumpMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.bumpMap = null;
		/**
		* How much the bump map affects the material. Typical range is `[0,1]`.
		*
		* @type {number}
		* @default 1
		*/
		this.bumpScale = 1;
		/**
		* The texture to create a normal map. The RGB values affect the surface
		* normal for each pixel fragment and change the way the color is lit. Normal
		* maps do not change the actual shape of the surface, only the lighting. In
		* case the material has a normal map authored using the left handed
		* convention, the `y` component of `normalScale` should be negated to compensate
		* for the different handedness.
		*
		* `normalMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.normalMap = null;
		/**
		* The type of normal map.
		*
		* @type {(TangentSpaceNormalMap|ObjectSpaceNormalMap)}
		* @default TangentSpaceNormalMap
		*/
		this.normalMapType = 0;
		/**
		* How much the normal map affects the material. Typical value range is `[0,1]`.
		*
		* @type {Vector2}
		* @default (1,1)
		*/
		this.normalScale = new Vector2(1, 1);
		/**
		* The displacement map affects the position of the mesh's vertices. Unlike
		* other maps which only affect the light and shade of the material the
		* displaced vertices can cast shadows, block other objects, and otherwise
		* act as real geometry. The displacement texture is an image where the value
		* of each pixel (white being the highest) is mapped against, and
		* repositions, the vertices of the mesh. For best results, pair a
		* displacement map with a matching normal map, since the renderer can
		* not recompute surface normals from the displaced vertices.
		*
		* `displacementMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.displacementMap = null;
		/**
		* How much the displacement map affects the mesh (where black is no
		* displacement, and white is maximum displacement). Without a displacement
		* map set, this value is not applied.
		*
		* @type {number}
		* @default 0
		*/
		this.displacementScale = 1;
		/**
		* The offset of the displacement map's values on the mesh's vertices.
		* The bias is added to the scaled sample of the displacement map.
		* Without a displacement map set, this value is not applied.
		*
		* @type {number}
		* @default 0
		*/
		this.displacementBias = 0;
		/**
		* The green channel of this texture is used to alter the roughness of the
		* material.
		*
		* `roughnessMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.roughnessMap = null;
		/**
		* The blue channel of this texture is used to alter the metalness of the
		* material.
		*
		* `metalnessMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.metalnessMap = null;
		/**
		* The alpha map is a grayscale texture that controls the opacity across the
		* surface (black: fully transparent; white: fully opaque).
		*
		* Only the color of the texture is used, ignoring the alpha channel if one
		* exists. For RGB and RGBA textures, the renderer will use the green channel
		* when sampling this texture due to the extra bit of precision provided for
		* green in DXT-compressed and uncompressed RGB 565 formats. Luminance-only and
		* luminance/alpha textures will also still work as expected.
		*
		* `alphaMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.alphaMap = null;
		/**
		* The environment map. To ensure a physically correct rendering, environment maps
		* are internally pre-processed with {@link PMREMGenerator}.
		*
		* `envMap` represents luminance data, and the texture must be assigned
		* a {@link Texture#colorSpace}. Most `envMap` textures set
		* `texture.colorSpace = LinearSRGBColorSpace` and use float-type formats
		* such as `.exr` or `.hdr`.
		*
		* @type {?Texture}
		* @default null
		*/
		this.envMap = null;
		/**
		* The rotation of the environment map in radians.
		*
		* @type {Euler}
		* @default (0,0,0)
		*/
		this.envMapRotation = new Euler();
		/**
		* Scales the effect of the environment map by multiplying its color.
		*
		* @type {number}
		* @default 1
		*/
		this.envMapIntensity = 1;
		/**
		* Renders the geometry as a wireframe.
		*
		* @type {boolean}
		* @default false
		*/
		this.wireframe = false;
		/**
		* Controls the thickness of the wireframe.
		*
		* Can only be used with {@link SVGRenderer}.
		*
		* @type {number}
		* @default 1
		*/
		this.wireframeLinewidth = 1;
		/**
		* Defines appearance of wireframe ends.
		*
		* Can only be used with {@link SVGRenderer}.
		*
		* @type {('round'|'bevel'|'miter')}
		* @default 'round'
		*/
		this.wireframeLinecap = "round";
		/**
		* Defines appearance of wireframe joints.
		*
		* Can only be used with {@link SVGRenderer}.
		*
		* @type {('round'|'bevel'|'miter')}
		* @default 'round'
		*/
		this.wireframeLinejoin = "round";
		/**
		* Whether the material is rendered with flat shading or not.
		*
		* @type {boolean}
		* @default false
		*/
		this.flatShading = false;
		/**
		* Whether the material is affected by fog or not.
		*
		* @type {boolean}
		* @default true
		*/
		this.fog = true;
		this.setValues(parameters);
	}
	copy(source) {
		super.copy(source);
		this.defines = { "STANDARD": "" };
		this.color.copy(source.color);
		this.roughness = source.roughness;
		this.metalness = source.metalness;
		this.map = source.map;
		this.lightMap = source.lightMap;
		this.lightMapIntensity = source.lightMapIntensity;
		this.aoMap = source.aoMap;
		this.aoMapIntensity = source.aoMapIntensity;
		this.emissive.copy(source.emissive);
		this.emissiveMap = source.emissiveMap;
		this.emissiveIntensity = source.emissiveIntensity;
		this.bumpMap = source.bumpMap;
		this.bumpScale = source.bumpScale;
		this.normalMap = source.normalMap;
		this.normalMapType = source.normalMapType;
		this.normalScale.copy(source.normalScale);
		this.displacementMap = source.displacementMap;
		this.displacementScale = source.displacementScale;
		this.displacementBias = source.displacementBias;
		this.roughnessMap = source.roughnessMap;
		this.metalnessMap = source.metalnessMap;
		this.alphaMap = source.alphaMap;
		this.envMap = source.envMap;
		this.envMapRotation.copy(source.envMapRotation);
		this.envMapIntensity = source.envMapIntensity;
		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;
		this.wireframeLinecap = source.wireframeLinecap;
		this.wireframeLinejoin = source.wireframeLinejoin;
		this.flatShading = source.flatShading;
		this.fog = source.fog;
		return this;
	}
};
/**
* An extension of the {@link MeshStandardMaterial}, providing more advanced
* physically-based rendering properties:
*
* - Anisotropy: Ability to represent the anisotropic property of materials
* as observable with brushed metals.
* - Clearcoat: Some materials — like car paints, carbon fiber, and wet surfaces — require
* a clear, reflective layer on top of another layer that may be irregular or rough.
* Clearcoat approximates this effect, without the need for a separate transparent surface.
* - Iridescence: Allows to render the effect where hue varies  depending on the viewing
* angle and illumination angle. This can be seen on soap bubbles, oil films, or on the
* wings of many insects.
* - Physically-based transparency: One limitation of {@link Material#opacity} is that highly
* transparent materials are less reflective. Physically-based transmission provides a more
* realistic option for thin, transparent surfaces like glass.
* - Advanced reflectivity: More flexible reflectivity for non-metallic materials.
* - Retroreflection: Redirects specular light back toward the light source for
* safety materials like road markings and reflective tape.
* - Sheen: Can be used for representing cloth and fabric materials.
*
* As a result of these complex shading features, `MeshPhysicalMaterial` has a
* higher performance cost, per pixel, than other three.js materials. Most
* effects are disabled by default, and add cost as they are enabled. For
* best results, always specify an environment map when using this material.
*
* @augments MeshStandardMaterial
* @demo scenes/material-browser.html#MeshPhysicalMaterial
*/
var MeshPhysicalMaterial = class extends MeshStandardMaterial {
	/**
	* Constructs a new mesh physical material.
	*
	* @param {Object} [parameters] - An object with one or more properties
	* defining the material's appearance. Any property of the material
	* (including any property from inherited materials) can be passed
	* in here. Color values can be passed any type of value accepted
	* by {@link Color#set}.
	*/
	constructor(parameters) {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isMeshPhysicalMaterial = true;
		this.defines = {
			"STANDARD": "",
			"PHYSICAL": ""
		};
		this.type = "MeshPhysicalMaterial";
		/**
		* The rotation of the anisotropy in tangent, bitangent space, measured in radians
		* counter-clockwise from the tangent. When `anisotropyMap` is present, this
		* property provides additional rotation to the vectors in the texture.
		*
		* @type {number}
		* @default 1
		*/
		this.anisotropyRotation = 0;
		/**
		* Red and green channels represent the anisotropy direction in `[-1, 1]` tangent,
		* bitangent space, to be rotated by `anisotropyRotation`. The blue channel
		* contains strength as `[0, 1]` to be multiplied by `anisotropy`.
		*
		* `anisotropyMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.anisotropyMap = null;
		/**
		* The red channel of this texture is multiplied against `clearcoat`,
		* for per-pixel control over a coating's intensity.
		*
		* `clearcoatMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.clearcoatMap = null;
		/**
		* Roughness of the clear coat layer, from `0.0` to `1.0`.
		*
		* @type {number}
		* @default 0
		*/
		this.clearcoatRoughness = 0;
		/**
		* The green channel of this texture is multiplied against
		* `clearcoatRoughness`, for per-pixel control over a coating's roughness.
		*
		* `clearcoatRoughnessMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.clearcoatRoughnessMap = null;
		/**
		* How much `clearcoatNormalMap` affects the clear coat layer, from
		* `(0,0)` to `(1,1)`.
		*
		* @type {Vector2}
		* @default (1,1)
		*/
		this.clearcoatNormalScale = new Vector2(1, 1);
		/**
		* Can be used to enable independent normals for the clear coat layer.
		*
		* `clearcoatNormalMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.clearcoatNormalMap = null;
		/**
		* Index-of-refraction for non-metallic materials, from `1.0` to `2.333`.
		*
		* @type {number}
		* @default 1.5
		*/
		this.ior = 1.5;
		/**
		* Degree of reflectivity, from `0.0` to `1.0`. Default is `0.5`, which
		* corresponds to an index-of-refraction of `1.5`.
		*
		* This models the reflectivity of non-metallic materials. It has no effect
		* when `metalness` is `1.0`
		*
		* @name MeshPhysicalMaterial#reflectivity
		* @type {number}
		* @default 0.5
		*/
		Object.defineProperty(this, "reflectivity", {
			get: function() {
				return clamp(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1);
			},
			set: function(reflectivity) {
				this.ior = (1 + .4 * reflectivity) / (1 - .4 * reflectivity);
			}
		});
		/**
		* The red channel of this texture is multiplied against `iridescence`, for per-pixel
		* control over iridescence.
		*
		* `iridescenceMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.iridescenceMap = null;
		/**
		* Strength of the iridescence RGB color shift effect, represented by an index-of-refraction.
		* Between `1.0` to `2.333`.
		*
		* @type {number}
		* @default 1.3
		*/
		this.iridescenceIOR = 1.3;
		/**
		*Array of exactly 2 elements, specifying minimum and maximum thickness of the iridescence layer.
		Thickness of iridescence layer has an equivalent effect of the one `thickness` has on `ior`.
		*
		* @type {Array<number,number>}
		* @default [100,400]
		*/
		this.iridescenceThicknessRange = [100, 400];
		/**
		* A texture that defines the thickness of the iridescence layer, stored in the green channel.
		* Minimum and maximum values of thickness are defined by `iridescenceThicknessRange` array:
		* - `0.0` in the green channel will result in thickness equal to first element of the array.
		* - `1.0` in the green channel will result in thickness equal to second element of the array.
		* - Values in-between will linearly interpolate between the elements of the array.
		*
		* `iridescenceThicknessMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.iridescenceThicknessMap = null;
		/**
		* The sheen tint.
		*
		* @type {Color}
		* @default (0,0,0)
		*/
		this.sheenColor = new Color(0);
		/**
		* The RGB channels of this texture are multiplied against  `sheenColor`, for per-pixel control
		* over sheen tint.
		*
		* `sheenColorMap` represents color data, and the texture must be assigned a
		* {@link Texture#colorSpace}. Most `sheenColorMap` textures set
		* `texture.colorSpace = SRGBColorSpace`.
		*
		* @type {?Texture}
		* @default null
		*/
		this.sheenColorMap = null;
		/**
		* Roughness of the sheen layer, from `0.0` to `1.0`.
		*
		* @type {number}
		* @default 1
		*/
		this.sheenRoughness = 1;
		/**
		* The alpha channel of this texture is multiplied against `sheenRoughness`, for per-pixel control
		* over sheen roughness.
		*
		* `sheenRoughnessMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.sheenRoughnessMap = null;
		/**
		* The red channel of this texture is multiplied against `transmission`, for per-pixel control over
		* optical transparency.
		*
		* `transmissionMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.transmissionMap = null;
		/**
		* The thickness of the volume beneath the surface. The value is given in the
		* coordinate space of the mesh. If the value is `0` the material is
		* thin-walled. Otherwise the material is a volume boundary.
		*
		* @type {number}
		* @default 0
		*/
		this.thickness = 0;
		/**
		* A texture that defines the thickness, stored in the green channel. This will
		* be multiplied by `thickness`.
		*
		* `thicknessMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.thicknessMap = null;
		/**
		* Density of the medium given as the average distance that light travels in
		* the medium before interacting with a particle. The value is given in world
		* space units, and must be greater than zero.
		*
		* @type {number}
		* @default Infinity
		*/
		this.attenuationDistance = Infinity;
		/**
		* The color that white light turns into due to absorption when reaching the
		* attenuation distance.
		*
		* @type {Color}
		* @default (1,1,1)
		*/
		this.attenuationColor = new Color(1, 1, 1);
		/**
		* A float that scales the amount of specular reflection for non-metals only.
		* When set to zero, the model is effectively Lambertian. From `0.0` to `1.0`.
		*
		* @type {number}
		* @default 1
		*/
		this.specularIntensity = 1;
		/**
		* The alpha channel of this texture is multiplied against `specularIntensity`,
		* for per-pixel control over specular intensity.
		*
		* `specularIntensityMap` represents non-color data. Any texture assigned must have
		* `texture.colorSpace = NoColorSpace` (default).
		*
		* @type {?Texture}
		* @default null
		*/
		this.specularIntensityMap = null;
		/**
		* Tints the specular reflection at normal incidence for non-metals only.
		*
		* @type {Color}
		* @default (1,1,1)
		*/
		this.specularColor = new Color(1, 1, 1);
		/**
		* The RGB channels of this texture are multiplied against `specularColor`,
		* for per-pixel control over specular color.
		*
		* `specularColorMap` represents color data, and the texture must be assigned a
		* {@link Texture#colorSpace}. Most `specularColorMap` textures set
		* `texture.colorSpace = SRGBColorSpace`.
		*
		* @type {?Texture}
		* @default null
		*/
		this.specularColorMap = null;
		this._anisotropy = 0;
		this._clearcoat = 0;
		this._dispersion = 0;
		this._iridescence = 0;
		this._retroreflectivity = 0;
		this._sheen = 0;
		this._transmission = 0;
		this.setValues(parameters);
	}
	/**
	* The anisotropy strength, from `0.0` to `1.0`.
	*
	* @type {number}
	* @default 0
	*/
	get anisotropy() {
		return this._anisotropy;
	}
	set anisotropy(value) {
		if (this._anisotropy > 0 !== value > 0) this.version++;
		this._anisotropy = value;
	}
	/**
	* Represents the intensity of the clear coat layer, from `0.0` to `1.0`. Use
	* clear coat related properties to enable multilayer materials that have a
	* thin translucent layer over the base layer.
	*
	* @type {number}
	* @default 0
	*/
	get clearcoat() {
		return this._clearcoat;
	}
	set clearcoat(value) {
		if (this._clearcoat > 0 !== value > 0) this.version++;
		this._clearcoat = value;
	}
	/**
	* The intensity of the iridescence layer, simulating RGB color shift based on the angle between
	* the surface and the viewer, from `0.0` to `1.0`.
	*
	* @type {number}
	* @default 0
	*/
	get iridescence() {
		return this._iridescence;
	}
	set iridescence(value) {
		if (this._iridescence > 0 !== value > 0) this.version++;
		this._iridescence = value;
	}
	/**
	* Defines the strength of the angular separation of colors (chromatic aberration) transmitting
	* through a relatively clear volume. Any value zero or larger is valid, the typical range of
	* realistic values is `[0, 1]`. This property can be only be used with transmissive objects.
	*
	* @type {number}
	* @default 0
	*/
	get dispersion() {
		return this._dispersion;
	}
	set dispersion(value) {
		if (this._dispersion > 0 !== value > 0) this.version++;
		this._dispersion = value;
	}
	/**
	* The strength of retroreflection, from `0.0` to `1.0`. A value of `1.0`
	* evaluates the material's microfacet reflection with the view direction
	* reflected about the surface normal, redirecting the specular lobe back
	* toward the light source.
	*
	* @type {number}
	* @default 0
	*/
	get retroreflectivity() {
		return this._retroreflectivity;
	}
	set retroreflectivity(value) {
		if (this._retroreflectivity > 0 !== value > 0) this.version++;
		this._retroreflectivity = value;
	}
	/**
	* The intensity of the sheen layer, from `0.0` to `1.0`.
	*
	* @type {number}
	* @default 0
	*/
	get sheen() {
		return this._sheen;
	}
	set sheen(value) {
		if (this._sheen > 0 !== value > 0) this.version++;
		this._sheen = value;
	}
	/**
	* Degree of transmission (or optical transparency), from `0.0` to `1.0`.
	*
	* Thin, transparent or semitransparent, plastic or glass materials remain
	* largely reflective even if they are fully transmissive. The transmission
	* property can be used to model these materials.
	*
	* When transmission is non-zero, `opacity` should be  set to `1`.
	*
	* @type {number}
	* @default 0
	*/
	get transmission() {
		return this._transmission;
	}
	set transmission(value) {
		if (this._transmission > 0 !== value > 0) this.version++;
		this._transmission = value;
	}
	copy(source) {
		super.copy(source);
		this.defines = {
			"STANDARD": "",
			"PHYSICAL": ""
		};
		this.anisotropy = source.anisotropy;
		this.anisotropyRotation = source.anisotropyRotation;
		this.anisotropyMap = source.anisotropyMap;
		this.clearcoat = source.clearcoat;
		this.clearcoatMap = source.clearcoatMap;
		this.clearcoatRoughness = source.clearcoatRoughness;
		this.clearcoatRoughnessMap = source.clearcoatRoughnessMap;
		this.clearcoatNormalMap = source.clearcoatNormalMap;
		this.clearcoatNormalScale.copy(source.clearcoatNormalScale);
		this.dispersion = source.dispersion;
		this.ior = source.ior;
		this.iridescence = source.iridescence;
		this.iridescenceMap = source.iridescenceMap;
		this.iridescenceIOR = source.iridescenceIOR;
		this.iridescenceThicknessRange = [...source.iridescenceThicknessRange];
		this.iridescenceThicknessMap = source.iridescenceThicknessMap;
		this.retroreflectivity = source.retroreflectivity;
		this.sheen = source.sheen;
		this.sheenColor.copy(source.sheenColor);
		this.sheenColorMap = source.sheenColorMap;
		this.sheenRoughness = source.sheenRoughness;
		this.sheenRoughnessMap = source.sheenRoughnessMap;
		this.transmission = source.transmission;
		this.transmissionMap = source.transmissionMap;
		this.thickness = source.thickness;
		this.thicknessMap = source.thicknessMap;
		this.attenuationDistance = source.attenuationDistance;
		this.attenuationColor.copy(source.attenuationColor);
		this.specularIntensity = source.specularIntensity;
		this.specularIntensityMap = source.specularIntensityMap;
		this.specularColor.copy(source.specularColor);
		this.specularColorMap = source.specularColorMap;
		return this;
	}
};
/**
* Converts an array to a specific type.
*
* @param {TypedArray|Array} array - The array to convert.
* @param {TypedArray.constructor} type - The constructor of a typed array that defines the new type.
* @return {TypedArray} The converted array.
*/
function convertArray(array, type) {
	if (!array || array.constructor === type) return array;
	if (typeof type.BYTES_PER_ELEMENT === "number") return new type(array);
	return Array.prototype.slice.call(array);
}
/**
* Returns `true` if the given keyframe track settings hold Bezier tangent data.
*
* @param {?Object} settings - The settings of a keyframe track.
* @return {boolean} Whether both tangent arrays are defined or not.
*/
function hasTangents(settings) {
	return settings !== void 0 && settings.inTangents !== void 0 && settings.outTangents !== void 0;
}
/**
* Returns an array by which times and values can be sorted.
*
* @param {Array<number>} times - The keyframe time values.
* @return {Array<number>} The array.
*/
function getKeyframeOrder(times) {
	function compareTime(i, j) {
		return times[i] - times[j];
	}
	const n = times.length;
	const result = new Array(n);
	for (let i = 0; i !== n; ++i) result[i] = i;
	result.sort(compareTime);
	return result;
}
/**
* Sorts the given array by the previously computed order via `getKeyframeOrder()`.
*
* @param {Array<number>} values - The values to sort.
* @param {number} stride - The stride.
* @param {Array<number>} order - The sort order.
* @return {Array<number>} The sorted values.
*/
function sortedArray(values, stride, order) {
	const nValues = values.length;
	const result = new values.constructor(nValues);
	for (let i = 0, dstOffset = 0; dstOffset !== nValues; ++i) {
		const srcOffset = order[i] * stride;
		for (let j = 0; j !== stride; ++j) result[dstOffset++] = values[srcOffset + j];
	}
	return result;
}
/**
* Used for parsing AOS keyframe formats.
*
* @param {Array<number>} jsonKeys - A list of JSON keyframes.
* @param {Array<number>} times - This array will be filled with keyframe times by this function.
* @param {Array<number>} values - This array will be filled with keyframe values by this function.
* @param {string} valuePropertyName - The name of the property to use.
*/
function flattenJSON(jsonKeys, times, values, valuePropertyName) {
	let i = 1, key = jsonKeys[0];
	while (key !== void 0 && key[valuePropertyName] === void 0) key = jsonKeys[i++];
	if (key === void 0) return;
	let value = key[valuePropertyName];
	if (value === void 0) return;
	if (Array.isArray(value)) do {
		value = key[valuePropertyName];
		if (value !== void 0) {
			times.push(key.time);
			values.push(...value);
		}
		key = jsonKeys[i++];
	} while (key !== void 0);
	else if (value.toArray !== void 0) do {
		value = key[valuePropertyName];
		if (value !== void 0) {
			times.push(key.time);
			value.toArray(values, values.length);
		}
		key = jsonKeys[i++];
	} while (key !== void 0);
	else do {
		value = key[valuePropertyName];
		if (value !== void 0) {
			times.push(key.time);
			values.push(value);
		}
		key = jsonKeys[i++];
	} while (key !== void 0);
}
/**
* Abstract base class of interpolants over parametric samples.
*
* The parameter domain is one dimensional, typically the time or a path
* along a curve defined by the data.
*
* The sample values can have any dimensionality and derived classes may
* apply special interpretations to the data.
*
* This class provides the interval seek in a Template Method, deferring
* the actual interpolation to derived classes.
*
* Time complexity is O(1) for linear access crossing at most two points
* and O(log N) for random access, where N is the number of positions.
*
* References: {@link http://www.oodesign.com/template-method-pattern.html}
*
* @abstract
*/
var Interpolant = class {
	/**
	* Constructs a new interpolant.
	*
	* @param {TypedArray} parameterPositions - The parameter positions hold the interpolation factors.
	* @param {TypedArray} sampleValues - The sample values.
	* @param {number} sampleSize - The sample size
	* @param {TypedArray} [resultBuffer] - The result buffer.
	*/
	constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
		/**
		* The parameter positions.
		*
		* @type {TypedArray}
		*/
		this.parameterPositions = parameterPositions;
		/**
		* A cache index.
		*
		* @private
		* @type {number}
		* @default 0
		*/
		this._cachedIndex = 0;
		/**
		* The result buffer.
		*
		* @type {TypedArray}
		*/
		this.resultBuffer = resultBuffer !== void 0 ? resultBuffer : new sampleValues.constructor(sampleSize);
		/**
		* The sample values.
		*
		* @type {TypedArray}
		*/
		this.sampleValues = sampleValues;
		/**
		* The value size.
		*
		* @type {TypedArray}
		*/
		this.valueSize = sampleSize;
		/**
		* The interpolation settings.
		*
		* @type {?Object}
		* @default null
		*/
		this.settings = null;
		/**
		* The default settings object.
		*
		* @type {Object}
		*/
		this.DefaultSettings_ = {};
	}
	/**
	* Evaluate the interpolant at position `t`.
	*
	* @param {number} t - The interpolation factor.
	* @return {TypedArray} The result buffer.
	*/
	evaluate(t) {
		const pp = this.parameterPositions;
		let i1 = this._cachedIndex, t1 = pp[i1], t0 = pp[i1 - 1];
		validate_interval: {
			seek: {
				let right;
				linear_scan: {
					forward_scan: if (!(t < t1)) {
						for (let giveUpAt = i1 + 2;;) {
							if (t1 === void 0) {
								if (t < t0) break forward_scan;
								i1 = pp.length;
								this._cachedIndex = i1;
								return this.copySampleValue_(i1 - 1);
							}
							if (i1 === giveUpAt) break;
							t0 = t1;
							t1 = pp[++i1];
							if (t < t1) break seek;
						}
						right = pp.length;
						break linear_scan;
					}
					if (!(t >= t0)) {
						const t1global = pp[1];
						if (t < t1global) {
							i1 = 2;
							t0 = t1global;
						}
						for (let giveUpAt = i1 - 2;;) {
							if (t0 === void 0) {
								this._cachedIndex = 0;
								return this.copySampleValue_(0);
							}
							if (i1 === giveUpAt) break;
							t1 = t0;
							t0 = pp[--i1 - 1];
							if (t >= t0) break seek;
						}
						right = i1;
						i1 = 0;
						break linear_scan;
					}
					break validate_interval;
				}
				while (i1 < right) {
					const mid = i1 + right >>> 1;
					if (t < pp[mid]) right = mid;
					else i1 = mid + 1;
				}
				t1 = pp[i1];
				t0 = pp[i1 - 1];
				if (t0 === void 0) {
					this._cachedIndex = 0;
					return this.copySampleValue_(0);
				}
				if (t1 === void 0) {
					i1 = pp.length;
					this._cachedIndex = i1;
					return this.copySampleValue_(i1 - 1);
				}
			}
			this._cachedIndex = i1;
			this.intervalChanged_(i1, t0, t1);
		}
		return this.interpolate_(i1, t0, t, t1);
	}
	/**
	* Returns the interpolation settings.
	*
	* @return {Object} The interpolation settings.
	*/
	getSettings_() {
		return this.settings || this.DefaultSettings_;
	}
	/**
	* Copies a sample value to the result buffer.
	*
	* @param {number} index - An index into the sample value buffer.
	* @return {TypedArray} The result buffer.
	*/
	copySampleValue_(index) {
		const result = this.resultBuffer, values = this.sampleValues, stride = this.valueSize, offset = index * stride;
		for (let i = 0; i !== stride; ++i) result[i] = values[offset + i];
		return result;
	}
	/**
	* Copies a sample value to the result buffer.
	*
	* @abstract
	* @param {number} i1 - An index into the sample value buffer.
	* @param {number} t0 - The previous interpolation factor.
	* @param {number} t - The current interpolation factor.
	* @param {number} t1 - The next interpolation factor.
	* @return {TypedArray} The result buffer.
	*/
	interpolate_() {
		throw new Error("THREE.Interpolant: Call to abstract method.");
	}
	/**
	* Optional method that is executed when the interval has changed.
	*
	* @param {number} i1 - An index into the sample value buffer.
	* @param {number} t0 - The previous interpolation factor.
	* @param {number} t - The current interpolation factor.
	*/
	intervalChanged_() {}
};
/**
* Fast and simple cubic spline interpolant.
*
* It was derived from a Hermitian construction setting the first derivative
* at each sample position to the linear slope between neighboring positions
* over their parameter interval.
*
* @augments Interpolant
*/
var CubicInterpolant = class extends Interpolant {
	/**
	* Constructs a new cubic interpolant.
	*
	* @param {TypedArray} parameterPositions - The parameter positions hold the interpolation factors.
	* @param {TypedArray} sampleValues - The sample values.
	* @param {number} sampleSize - The sample size
	* @param {TypedArray} [resultBuffer] - The result buffer.
	*/
	constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
		super(parameterPositions, sampleValues, sampleSize, resultBuffer);
		this._weightPrev = -0;
		this._offsetPrev = -0;
		this._weightNext = -0;
		this._offsetNext = -0;
		this.DefaultSettings_ = {
			endingStart: ZeroCurvatureEnding,
			endingEnd: ZeroCurvatureEnding
		};
	}
	intervalChanged_(i1, t0, t1) {
		const pp = this.parameterPositions;
		let iPrev = i1 - 2, iNext = i1 + 1, tPrev = pp[iPrev], tNext = pp[iNext];
		if (tPrev === void 0) switch (this.getSettings_().endingStart) {
			case ZeroSlopeEnding:
				iPrev = i1;
				tPrev = 2 * t0 - t1;
				break;
			case WrapAroundEnding:
				iPrev = pp.length - 2;
				tPrev = t0 + pp[iPrev] - pp[iPrev + 1];
				break;
			default:
				iPrev = i1;
				tPrev = t1;
		}
		if (tNext === void 0) switch (this.getSettings_().endingEnd) {
			case ZeroSlopeEnding:
				iNext = i1;
				tNext = 2 * t1 - t0;
				break;
			case WrapAroundEnding:
				iNext = 1;
				tNext = t1 + pp[1] - pp[0];
				break;
			default:
				iNext = i1 - 1;
				tNext = t0;
		}
		const halfDt = (t1 - t0) * .5, stride = this.valueSize;
		this._weightPrev = halfDt / (t0 - tPrev);
		this._weightNext = halfDt / (tNext - t1);
		this._offsetPrev = iPrev * stride;
		this._offsetNext = iNext * stride;
	}
	interpolate_(i1, t0, t, t1) {
		const result = this.resultBuffer, values = this.sampleValues, stride = this.valueSize, o1 = i1 * stride, o0 = o1 - stride, oP = this._offsetPrev, oN = this._offsetNext, wP = this._weightPrev, wN = this._weightNext, p = (t - t0) / (t1 - t0), pp = p * p, ppp = pp * p;
		const sP = -wP * ppp + 2 * wP * pp - wP * p;
		const s0 = (1 + wP) * ppp + (-1.5 - 2 * wP) * pp + (-.5 + wP) * p + 1;
		const s1 = (-1 - wN) * ppp + (1.5 + wN) * pp + .5 * p;
		const sN = wN * ppp - wN * pp;
		for (let i = 0; i !== stride; ++i) result[i] = sP * values[oP + i] + s0 * values[o0 + i] + s1 * values[o1 + i] + sN * values[oN + i];
		return result;
	}
};
/**
* A basic linear interpolant.
*
* @augments Interpolant
*/
var LinearInterpolant = class extends Interpolant {
	/**
	* Constructs a new linear interpolant.
	*
	* @param {TypedArray} parameterPositions - The parameter positions hold the interpolation factors.
	* @param {TypedArray} sampleValues - The sample values.
	* @param {number} sampleSize - The sample size
	* @param {TypedArray} [resultBuffer] - The result buffer.
	*/
	constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
		super(parameterPositions, sampleValues, sampleSize, resultBuffer);
	}
	interpolate_(i1, t0, t, t1) {
		const result = this.resultBuffer, values = this.sampleValues, stride = this.valueSize, offset1 = i1 * stride, offset0 = offset1 - stride, weight1 = (t - t0) / (t1 - t0), weight0 = 1 - weight1;
		for (let i = 0; i !== stride; ++i) result[i] = values[offset0 + i] * weight0 + values[offset1 + i] * weight1;
		return result;
	}
};
/**
* Interpolant that evaluates to the sample value at the position preceding
* the parameter.
*
* @augments Interpolant
*/
var DiscreteInterpolant = class extends Interpolant {
	/**
	* Constructs a new discrete interpolant.
	*
	* @param {TypedArray} parameterPositions - The parameter positions hold the interpolation factors.
	* @param {TypedArray} sampleValues - The sample values.
	* @param {number} sampleSize - The sample size
	* @param {TypedArray} [resultBuffer] - The result buffer.
	*/
	constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
		super(parameterPositions, sampleValues, sampleSize, resultBuffer);
	}
	interpolate_(i1) {
		return this.copySampleValue_(i1 - 1);
	}
};
/**
* A Bezier interpolant using cubic Bezier curves with 2D control points.
*
* This interpolant supports the COLLADA/Maya style of Bezier animation where
* each keyframe has explicit in/out tangent control points specified as
* 2D coordinates (time, value).
*
* Tangent data is read from `inTangents` and `outTangents` on the interpolant
* (populated by `KeyframeTrack.InterpolantFactoryMethodBezier`).
*
* For a track with N keyframes and stride S:
* - Each tangent array has N * S * 2 values
* - Layout: [k0_c0_time, k0_c0_value, k0_c1_time, k0_c1_value, ..., k0_cS_time, k0_cS_value,
*            k1_c0_time, k1_c0_value, ...]
*
* @augments Interpolant
*/
var BezierInterpolant = class extends Interpolant {
	interpolate_(i1, t0, t, t1) {
		const result = this.resultBuffer;
		const values = this.sampleValues;
		const stride = this.valueSize;
		const offset1 = i1 * stride;
		const offset0 = offset1 - stride;
		const inTangents = this.inTangents;
		const outTangents = this.outTangents;
		if (!inTangents || !outTangents) {
			const weight1 = (t - t0) / (t1 - t0);
			const weight0 = 1 - weight1;
			for (let i = 0; i !== stride; ++i) result[i] = values[offset0 + i] * weight0 + values[offset1 + i] * weight1;
			return result;
		}
		const tangentStride = stride * 2;
		const i0 = i1 - 1;
		for (let i = 0; i !== stride; ++i) {
			const v0 = values[offset0 + i];
			const v1 = values[offset1 + i];
			const outTangentOffset = i0 * tangentStride + i * 2;
			const c0x = outTangents[outTangentOffset];
			const c0y = outTangents[outTangentOffset + 1];
			const inTangentOffset = i1 * tangentStride + i * 2;
			const c1x = inTangents[inTangentOffset];
			const c1y = inTangents[inTangentOffset + 1];
			const s = solveBezierParameter(t, t0, c0x, c1x, t1);
			result[i] = cubicBezier(s, v0, c0y, c1y, v1);
		}
		return result;
	}
};
function cubicBezier(s, p0, p1, p2, p3) {
	const k = 1 - s;
	return k * k * k * p0 + 3 * k * k * s * p1 + 3 * k * s * s * p2 + s * s * s * p3;
}
function cubicBezierSlope(s, p0, p1, p2, p3) {
	const k = 1 - s;
	return 3 * k * k * (p1 - p0) + 6 * k * s * (p2 - p1) + 3 * s * s * (p3 - p2);
}
function solveBezierParameter(x, x0, x1, x2, x3) {
	let s = (x - x0) / (x3 - x0);
	for (let i = 0; i < 8; i++) {
		const error = cubicBezier(s, x0, x1, x2, x3) - x;
		if (Math.abs(error) < 1e-10) break;
		const slope = cubicBezierSlope(s, x0, x1, x2, x3);
		if (Math.abs(slope) < 1e-10) break;
		s = Math.max(0, Math.min(1, s - error / slope));
	}
	return s;
}
/**
* Represents a timed sequence of keyframes, which are composed of lists of
* times and related values, and which are used to animate a specific property
* of an object.
*/
var KeyframeTrack = class {
	/**
	* Constructs a new keyframe track.
	*
	* @param {string} name - The keyframe track's name.
	* @param {Array<number>} times - A list of keyframe times.
	* @param {Array<number|string|boolean>} values - A list of keyframe values.
	* @param {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth|InterpolateBezier)} [interpolation] - The interpolation type.
	*/
	constructor(name, times, values, interpolation) {
		if (name === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
		if (times === void 0 || times.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + name);
		/**
		* The track's name can refer to morph targets or bones or
		* possibly other values within an animated object. See {@link PropertyBinding#parseTrackName}
		* for the forms of strings that can be parsed for property binding.
		*
		* @type {string}
		*/
		this.name = name;
		/**
		* The keyframe times.
		*
		* @type {Float32Array}
		*/
		this.times = convertArray(times, this.TimeBufferType);
		/**
		* The keyframe values.
		*
		* @type {Float32Array}
		*/
		this.values = convertArray(values, this.ValueBufferType);
		this.setInterpolation(interpolation || this.DefaultInterpolation);
	}
	/**
	* Converts the keyframe track to JSON.
	*
	* @static
	* @param {KeyframeTrack} track - The keyframe track to serialize.
	* @return {Object} The serialized keyframe track as JSON.
	*/
	static toJSON(track) {
		const trackType = track.constructor;
		let json;
		if (trackType.toJSON !== this.toJSON) json = trackType.toJSON(track);
		else {
			json = {
				"name": track.name,
				"times": convertArray(track.times, Array),
				"values": convertArray(track.values, Array)
			};
			const interpolation = track.getInterpolation();
			if (interpolation !== track.DefaultInterpolation) json.interpolation = interpolation;
			if (hasTangents(track.settings)) json.settings = {
				inTangents: convertArray(track.settings.inTangents, Array),
				outTangents: convertArray(track.settings.outTangents, Array)
			};
		}
		json.type = track.ValueTypeName;
		return json;
	}
	/**
	* Factory method for creating a new discrete interpolant.
	*
	* @static
	* @param {TypedArray} [result] - The result buffer.
	* @return {DiscreteInterpolant} The new interpolant.
	*/
	InterpolantFactoryMethodDiscrete(result) {
		return new DiscreteInterpolant(this.times, this.values, this.getValueSize(), result);
	}
	/**
	* Factory method for creating a new linear interpolant.
	*
	* @static
	* @param {TypedArray} [result] - The result buffer.
	* @return {LinearInterpolant} The new interpolant.
	*/
	InterpolantFactoryMethodLinear(result) {
		return new LinearInterpolant(this.times, this.values, this.getValueSize(), result);
	}
	/**
	* Factory method for creating a new smooth interpolant.
	*
	* @static
	* @param {TypedArray} [result] - The result buffer.
	* @return {CubicInterpolant} The new interpolant.
	*/
	InterpolantFactoryMethodSmooth(result) {
		return new CubicInterpolant(this.times, this.values, this.getValueSize(), result);
	}
	/**
	* Factory method for creating a new Bezier interpolant.
	*
	* The Bezier interpolant requires tangent data to be set via the `settings` property
	* on the track before creating the interpolant. The settings should contain:
	* - `inTangents`: Float32Array with [time, value] pairs per keyframe per component
	* - `outTangents`: Float32Array with [time, value] pairs per keyframe per component
	*
	* @static
	* @param {TypedArray} [result] - The result buffer.
	* @return {BezierInterpolant} The new interpolant.
	*/
	InterpolantFactoryMethodBezier(result) {
		const interpolant = new BezierInterpolant(this.times, this.values, this.getValueSize(), result);
		if (this.settings) {
			interpolant.inTangents = this.settings.inTangents;
			interpolant.outTangents = this.settings.outTangents;
		}
		return interpolant;
	}
	/**
	* Defines the interpolation factor method for this keyframe track.
	*
	* @param {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth|InterpolateBezier)} interpolation - The interpolation type.
	* @return {KeyframeTrack} A reference to this keyframe track.
	*/
	setInterpolation(interpolation) {
		let factoryMethod;
		switch (interpolation) {
			case InterpolateDiscrete:
				factoryMethod = this.InterpolantFactoryMethodDiscrete;
				break;
			case InterpolateLinear:
				factoryMethod = this.InterpolantFactoryMethodLinear;
				break;
			case InterpolateSmooth:
				factoryMethod = this.InterpolantFactoryMethodSmooth;
				break;
			case InterpolateBezier: factoryMethod = this.InterpolantFactoryMethodBezier;
		}
		if (factoryMethod === void 0) {
			const message = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
			if (this.createInterpolant === void 0) {
				if (interpolation !== this.DefaultInterpolation) this.setInterpolation(this.DefaultInterpolation);
				else throw new Error(message);
			}
			warn("KeyframeTrack:", message);
			return this;
		}
		this.createInterpolant = factoryMethod;
		return this;
	}
	/**
	* Returns the current interpolation type.
	*
	* @return {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth|InterpolateBezier)} The interpolation type.
	*/
	getInterpolation() {
		switch (this.createInterpolant) {
			case this.InterpolantFactoryMethodDiscrete: return InterpolateDiscrete;
			case this.InterpolantFactoryMethodLinear: return InterpolateLinear;
			case this.InterpolantFactoryMethodSmooth: return InterpolateSmooth;
			case this.InterpolantFactoryMethodBezier: return InterpolateBezier;
		}
	}
	/**
	* Returns the value size.
	*
	* @return {number} The value size.
	*/
	getValueSize() {
		return this.values.length / this.times.length;
	}
	/**
	* Moves all keyframes either forward or backward in time.
	*
	* @param {number} timeOffset - The offset to move the time values.
	* @return {KeyframeTrack} A reference to this keyframe track.
	*/
	shift(timeOffset) {
		if (timeOffset !== 0) {
			const times = this.times;
			for (let i = 0, n = times.length; i !== n; ++i) times[i] += timeOffset;
		}
		return this;
	}
	/**
	* Scale all keyframe times by a factor (useful for frame - seconds conversions).
	*
	* @param {number} timeScale - The time scale.
	* @return {KeyframeTrack} A reference to this keyframe track.
	*/
	scale(timeScale) {
		if (timeScale !== 1) {
			const times = this.times;
			for (let i = 0, n = times.length; i !== n; ++i) times[i] *= timeScale;
			if (hasTangents(this.settings)) {
				scaleTangentTimes(this.settings.inTangents, timeScale);
				scaleTangentTimes(this.settings.outTangents, timeScale);
			}
		}
		return this;
	}
	/**
	* Removes keyframes before and after animation without changing any values within the defined time range.
	*
	* Note: The method does not shift around keys to the start of the track time, because for interpolated
	* keys this will change their values
	*
	* @param {number} startTime - The start time.
	* @param {number} endTime - The end time.
	* @return {KeyframeTrack} A reference to this keyframe track.
	*/
	trim(startTime, endTime) {
		const times = this.times, nKeys = times.length;
		let from = 0, to = nKeys - 1;
		while (from !== nKeys && times[from] < startTime) ++from;
		while (to !== -1 && times[to] > endTime) --to;
		++to;
		if (from !== 0 || to !== nKeys) {
			if (from >= to) {
				to = Math.max(to, 1);
				from = to - 1;
			}
			const stride = this.getValueSize();
			this.times = times.slice(from, to);
			this.values = this.values.slice(from * stride, to * stride);
		}
		return this;
	}
	/**
	* Performs minimal validation on the keyframe track. Returns `true` if the values
	* are valid.
	*
	* @return {boolean} Whether the keyframes are valid or not.
	*/
	validate() {
		let valid = true;
		const valueSize = this.getValueSize();
		if (valueSize - Math.floor(valueSize) !== 0) {
			error("KeyframeTrack: Invalid value size in track.", this);
			valid = false;
		}
		const times = this.times, values = this.values, nKeys = times.length;
		if (nKeys === 0) {
			error("KeyframeTrack: Track is empty.", this);
			valid = false;
		}
		let prevTime = null;
		for (let i = 0; i !== nKeys; i++) {
			const currTime = times[i];
			if (typeof currTime === "number" && isNaN(currTime)) {
				error("KeyframeTrack: Time is not a valid number.", this, i, currTime);
				valid = false;
				break;
			}
			if (prevTime !== null && prevTime > currTime) {
				error("KeyframeTrack: Out of order keys.", this, i, currTime, prevTime);
				valid = false;
				break;
			}
			prevTime = currTime;
		}
		if (values !== void 0) {
			if (isTypedArray(values)) for (let i = 0, n = values.length; i !== n; ++i) {
				const value = values[i];
				if (isNaN(value)) {
					error("KeyframeTrack: Value is not a valid number.", this, i, value);
					valid = false;
					break;
				}
			}
		}
		return valid;
	}
	/**
	* Optimizes this keyframe track by removing equivalent sequential keys (which are
	* common in morph target sequences).
	*
	* @return {KeyframeTrack} A reference to this keyframe track.
	*/
	optimize() {
		const times = this.times.slice(), values = this.values.slice(), stride = this.getValueSize(), smoothInterpolation = this.getInterpolation() === InterpolateSmooth, lastIndex = times.length - 1;
		let writeIndex = 1;
		for (let i = 1; i < lastIndex; ++i) {
			let keep = false;
			const time = times[i];
			if (time !== times[i + 1] && (i !== 1 || time !== times[0])) {
				if (!smoothInterpolation) {
					const offset = i * stride, offsetP = offset - stride, offsetN = offset + stride;
					for (let j = 0; j !== stride; ++j) {
						const value = values[offset + j];
						if (value !== values[offsetP + j] || value !== values[offsetN + j]) {
							keep = true;
							break;
						}
					}
				} else keep = true;
			}
			if (keep) {
				if (i !== writeIndex) {
					times[writeIndex] = times[i];
					const readOffset = i * stride, writeOffset = writeIndex * stride;
					for (let j = 0; j !== stride; ++j) values[writeOffset + j] = values[readOffset + j];
				}
				++writeIndex;
			}
		}
		if (lastIndex > 0) {
			times[writeIndex] = times[lastIndex];
			for (let readOffset = lastIndex * stride, writeOffset = writeIndex * stride, j = 0; j !== stride; ++j) values[writeOffset + j] = values[readOffset + j];
			++writeIndex;
		}
		if (writeIndex !== times.length) {
			this.times = times.slice(0, writeIndex);
			this.values = values.slice(0, writeIndex * stride);
		} else {
			this.times = times;
			this.values = values;
		}
		return this;
	}
	/**
	* Returns a new keyframe track with copied values from this instance.
	*
	* @return {KeyframeTrack} A clone of this instance.
	*/
	clone() {
		const times = this.times.slice();
		const values = this.values.slice();
		const TypedKeyframeTrack = this.constructor;
		const track = new TypedKeyframeTrack(this.name, times, values);
		track.createInterpolant = this.createInterpolant;
		if (hasTangents(this.settings)) track.settings = {
			inTangents: this.settings.inTangents.slice(),
			outTangents: this.settings.outTangents.slice()
		};
		return track;
	}
};
function scaleTangentTimes(tangents, timeScale) {
	for (let i = 0, n = tangents.length; i !== n; i += 2) tangents[i] *= timeScale;
}
/**
* The value type name.
*
* @type {string}
* @default ''
*/
KeyframeTrack.prototype.ValueTypeName = "";
/**
* The time buffer type of this keyframe track.
*
* @type {TypedArray|Array}
* @default Float32Array.constructor
*/
KeyframeTrack.prototype.TimeBufferType = Float32Array;
/**
* The value buffer type of this keyframe track.
*
* @type {TypedArray|Array}
* @default Float32Array.constructor
*/
KeyframeTrack.prototype.ValueBufferType = Float32Array;
/**
* The default interpolation type of this keyframe track.
*
* @type {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth|InterpolateBezier)}
* @default InterpolateLinear
*/
KeyframeTrack.prototype.DefaultInterpolation = InterpolateLinear;
/**
* A track for boolean keyframe values.
*
* @augments KeyframeTrack
*/
var BooleanKeyframeTrack = class extends KeyframeTrack {
	/**
	* Constructs a new boolean keyframe track.
	*
	* This keyframe track type has no `interpolation` parameter because the
	* interpolation is always discrete.
	*
	* @param {string} name - The keyframe track's name.
	* @param {Array<number>} times - A list of keyframe times.
	* @param {Array<boolean>} values - A list of keyframe values.
	*/
	constructor(name, times, values) {
		super(name, times, values);
	}
};
/**
* The value type name.
*
* @type {string}
* @default 'bool'
*/
BooleanKeyframeTrack.prototype.ValueTypeName = "bool";
/**
* The value buffer type of this keyframe track.
*
* @type {TypedArray|Array}
* @default Array.constructor
*/
BooleanKeyframeTrack.prototype.ValueBufferType = Array;
/**
* The default interpolation type of this keyframe track.
*
* @type {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)}
* @default InterpolateDiscrete
*/
BooleanKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
BooleanKeyframeTrack.prototype.InterpolantFactoryMethodLinear = void 0;
BooleanKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = void 0;
/**
* A track for color keyframe values.
*
* @augments KeyframeTrack
*/
var ColorKeyframeTrack = class extends KeyframeTrack {
	/**
	* Constructs a new color keyframe track.
	*
	* @param {string} name - The keyframe track's name.
	* @param {Array<number>} times - A list of keyframe times.
	* @param {Array<number>} values - A list of keyframe values.
	* @param {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)} [interpolation] - The interpolation type.
	*/
	constructor(name, times, values, interpolation) {
		super(name, times, values, interpolation);
	}
};
/**
* The value type name.
*
* @type {string}
* @default 'color'
*/
ColorKeyframeTrack.prototype.ValueTypeName = "color";
/**
* A track for numeric keyframe values.
*
* @augments KeyframeTrack
*/
var NumberKeyframeTrack = class extends KeyframeTrack {
	/**
	* Constructs a new number keyframe track.
	*
	* @param {string} name - The keyframe track's name.
	* @param {Array<number>} times - A list of keyframe times.
	* @param {Array<number>} values - A list of keyframe values.
	* @param {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)} [interpolation] - The interpolation type.
	*/
	constructor(name, times, values, interpolation) {
		super(name, times, values, interpolation);
	}
};
/**
* The value type name.
*
* @type {string}
* @default 'number'
*/
NumberKeyframeTrack.prototype.ValueTypeName = "number";
/**
* Spherical linear unit quaternion interpolant.
*
* @augments Interpolant
*/
var QuaternionLinearInterpolant = class extends Interpolant {
	/**
	* Constructs a new SLERP interpolant.
	*
	* @param {TypedArray} parameterPositions - The parameter positions hold the interpolation factors.
	* @param {TypedArray} sampleValues - The sample values.
	* @param {number} sampleSize - The sample size
	* @param {TypedArray} [resultBuffer] - The result buffer.
	*/
	constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
		super(parameterPositions, sampleValues, sampleSize, resultBuffer);
	}
	interpolate_(i1, t0, t, t1) {
		const result = this.resultBuffer, values = this.sampleValues, stride = this.valueSize, alpha = (t - t0) / (t1 - t0);
		let offset = i1 * stride;
		for (let end = offset + stride; offset !== end; offset += 4) Quaternion.slerpFlat(result, 0, values, offset - stride, values, offset, alpha);
		return result;
	}
};
/**
* A track for Quaternion keyframe values.
*
* @augments KeyframeTrack
*/
var QuaternionKeyframeTrack = class extends KeyframeTrack {
	/**
	* Constructs a new Quaternion keyframe track.
	*
	* @param {string} name - The keyframe track's name.
	* @param {Array<number>} times - A list of keyframe times.
	* @param {Array<number>} values - A list of keyframe values.
	* @param {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)} [interpolation] - The interpolation type.
	*/
	constructor(name, times, values, interpolation) {
		super(name, times, values, interpolation);
	}
	/**
	* Overwritten so the method returns Quaternion based interpolant.
	*
	* @static
	* @param {TypedArray} [result] - The result buffer.
	* @return {QuaternionLinearInterpolant} The new interpolant.
	*/
	InterpolantFactoryMethodLinear(result) {
		return new QuaternionLinearInterpolant(this.times, this.values, this.getValueSize(), result);
	}
};
/**
* The value type name.
*
* @type {string}
* @default 'quaternion'
*/
QuaternionKeyframeTrack.prototype.ValueTypeName = "quaternion";
QuaternionKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = void 0;
/**
* A track for string keyframe values.
*
* @augments KeyframeTrack
*/
var StringKeyframeTrack = class extends KeyframeTrack {
	/**
	* Constructs a new string keyframe track.
	*
	* This keyframe track type has no `interpolation` parameter because the
	* interpolation is always discrete.
	*
	* @param {string} name - The keyframe track's name.
	* @param {Array<number>} times - A list of keyframe times.
	* @param {Array<string>} values - A list of keyframe values.
	*/
	constructor(name, times, values) {
		super(name, times, values);
	}
};
/**
* The value type name.
*
* @type {string}
* @default 'string'
*/
StringKeyframeTrack.prototype.ValueTypeName = "string";
/**
* The value buffer type of this keyframe track.
*
* @type {TypedArray|Array}
* @default Array.constructor
*/
StringKeyframeTrack.prototype.ValueBufferType = Array;
/**
* The default interpolation type of this keyframe track.
*
* @type {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)}
* @default InterpolateDiscrete
*/
StringKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
StringKeyframeTrack.prototype.InterpolantFactoryMethodLinear = void 0;
StringKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = void 0;
/**
* A track for vector keyframe values.
*
* @augments KeyframeTrack
*/
var VectorKeyframeTrack = class extends KeyframeTrack {
	/**
	* Constructs a new vector keyframe track.
	*
	* @param {string} name - The keyframe track's name.
	* @param {Array<number>} times - A list of keyframe times.
	* @param {Array<number>} values - A list of keyframe values.
	* @param {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)} [interpolation] - The interpolation type.
	*/
	constructor(name, times, values, interpolation) {
		super(name, times, values, interpolation);
	}
};
/**
* The value type name.
*
* @type {string}
* @default 'vector'
*/
VectorKeyframeTrack.prototype.ValueTypeName = "vector";
/**
* A reusable set of keyframe tracks which represent an animation.
*/
var AnimationClip = class {
	/**
	* Constructs a new animation clip.
	*
	* Note: Instead of instantiating an AnimationClip directly with the constructor, you can
	* use the static interface of this class for creating clips. In most cases though, animation clips
	* will automatically be created by loaders when importing animated 3D assets.
	*
	* @param {string} [name=''] - The clip's name.
	* @param {number} [duration=-1] - The clip's duration in seconds. If a negative value is passed,
	* the duration will be calculated from the passed keyframes.
	* @param {Array<KeyframeTrack>} tracks - An array of keyframe tracks.
	* @param {(NormalAnimationBlendMode|AdditiveAnimationBlendMode)} [blendMode=NormalAnimationBlendMode] - Defines how the animation
	* is blended/combined when two or more animations are simultaneously played.
	*/
	constructor(name = "", duration = -1, tracks = [], blendMode = NormalAnimationBlendMode) {
		/**
		* The clip's name.
		*
		* @type {string}
		*/
		this.name = name;
		/**
		*  An array of keyframe tracks.
		*
		* @type {Array<KeyframeTrack>}
		*/
		this.tracks = tracks;
		/**
		* The clip's duration in seconds.
		*
		* @type {number}
		*/
		this.duration = duration;
		/**
		* Defines how the animation is blended/combined when two or more animations
		* are simultaneously played.
		*
		* @type {(NormalAnimationBlendMode|AdditiveAnimationBlendMode)}
		*/
		this.blendMode = blendMode;
		/**
		* The UUID of the animation clip.
		*
		* @type {string}
		* @readonly
		*/
		this.uuid = generateUUID();
		/**
		* An object that can be used to store custom data about the animation clip.
		* It should not hold references to functions as these will not be cloned.
		*
		* @type {Object}
		*/
		this.userData = {};
		if (this.duration < 0) this.resetDuration();
	}
	/**
	* Factory method for creating an animation clip from the given JSON.
	*
	* @static
	* @param {Object} json - The serialized animation clip.
	* @return {AnimationClip} The new animation clip.
	*/
	static parse(json) {
		const tracks = [], jsonTracks = json.tracks, frameTime = 1 / (json.fps || 1);
		for (let i = 0, n = jsonTracks.length; i !== n; ++i) tracks.push(parseKeyframeTrack(jsonTracks[i]).scale(frameTime));
		const clip = new this(json.name, json.duration, tracks, json.blendMode);
		clip.uuid = json.uuid;
		clip.userData = JSON.parse(json.userData || "{}");
		return clip;
	}
	/**
	* Serializes the given animation clip into JSON.
	*
	* @static
	* @param {AnimationClip} clip - The animation clip to serialize.
	* @return {Object} The JSON object.
	*/
	static toJSON(clip) {
		const tracks = [], clipTracks = clip.tracks;
		const json = {
			"name": clip.name,
			"duration": clip.duration,
			"tracks": tracks,
			"uuid": clip.uuid,
			"blendMode": clip.blendMode,
			"userData": JSON.stringify(clip.userData)
		};
		for (let i = 0, n = clipTracks.length; i !== n; ++i) tracks.push(KeyframeTrack.toJSON(clipTracks[i]));
		return json;
	}
	/**
	* Returns a new animation clip from the passed morph targets array of a
	* geometry, taking a name and the number of frames per second.
	*
	* Note: The fps parameter is required, but the animation speed can be
	* overridden via {@link AnimationAction#setDuration}.
	*
	* @static
	* @param {string} name - The name of the animation clip.
	* @param {Array<Object>} morphTargetSequence - A sequence of morph targets.
	* @param {number} fps - The Frames-Per-Second value.
	* @param {boolean} noLoop - Whether the clip should be no loop or not.
	* @return {AnimationClip} The new animation clip.
	*/
	static CreateFromMorphTargetSequence(name, morphTargetSequence, fps, noLoop) {
		const numMorphTargets = morphTargetSequence.length;
		const tracks = [];
		for (let i = 0; i < numMorphTargets; i++) {
			let times = [];
			let values = [];
			times.push((i + numMorphTargets - 1) % numMorphTargets, i, (i + 1) % numMorphTargets);
			values.push(0, 1, 0);
			const order = getKeyframeOrder(times);
			times = sortedArray(times, 1, order);
			values = sortedArray(values, 1, order);
			if (!noLoop && times[0] === 0) {
				times.push(numMorphTargets);
				values.push(values[0]);
			}
			tracks.push(new NumberKeyframeTrack(".morphTargetInfluences[" + morphTargetSequence[i].name + "]", times, values).scale(1 / fps));
		}
		return new this(name, -1, tracks);
	}
	/**
	* Searches for an animation clip by name, taking as its first parameter
	* either an array of clips, or a mesh or geometry that contains an
	* array named "animations" property.
	*
	* @static
	* @param {(Array<AnimationClip>|Object3D)} objectOrClipArray - The array or object to search through.
	* @param {string} name - The name to search for.
	* @return {?AnimationClip} The found animation clip. Returns `null` if no clip has been found.
	*/
	static findByName(objectOrClipArray, name) {
		let clipArray = objectOrClipArray;
		if (!Array.isArray(objectOrClipArray)) {
			const o = objectOrClipArray;
			clipArray = o.geometry && o.geometry.animations || o.animations;
		}
		for (let i = 0; i < clipArray.length; i++) if (clipArray[i].name === name) return clipArray[i];
		return null;
	}
	/**
	* Returns an array of new AnimationClips created from the morph target
	* sequences of a geometry, trying to sort morph target names into
	* animation-group-based patterns like "Walk_001, Walk_002, Run_001, Run_002...".
	*
	* See {@link MD2Loader#parse} as an example for how the method should be used.
	*
	* @static
	* @param {Array<Object>} morphTargets - A sequence of morph targets.
	* @param {number} fps - The Frames-Per-Second value.
	* @param {boolean} noLoop - Whether the clip should be no loop or not.
	* @return {Array<AnimationClip>} An array of new animation clips.
	*/
	static CreateClipsFromMorphTargetSequences(morphTargets, fps, noLoop) {
		const animationToMorphTargets = {};
		const pattern = /^([\w-]*?)([\d]+)$/;
		for (let i = 0, il = morphTargets.length; i < il; i++) {
			const morphTarget = morphTargets[i];
			const parts = morphTarget.name.match(pattern);
			if (parts && parts.length > 1) {
				const name = parts[1];
				let animationMorphTargets = animationToMorphTargets[name];
				if (!animationMorphTargets) animationToMorphTargets[name] = animationMorphTargets = [];
				animationMorphTargets.push(morphTarget);
			}
		}
		const clips = [];
		for (const name in animationToMorphTargets) clips.push(this.CreateFromMorphTargetSequence(name, animationToMorphTargets[name], fps, noLoop));
		return clips;
	}
	/**
	* Sets the duration of this clip to the duration of its longest keyframe track.
	*
	* @return {AnimationClip} A reference to this animation clip.
	*/
	resetDuration() {
		const tracks = this.tracks;
		let duration = 0;
		for (let i = 0, n = tracks.length; i !== n; ++i) {
			const track = this.tracks[i];
			duration = Math.max(duration, track.times[track.times.length - 1]);
		}
		this.duration = duration;
		return this;
	}
	/**
	* Trims all tracks to the clip's duration.
	*
	* @return {AnimationClip} A reference to this animation clip.
	*/
	trim() {
		for (let i = 0; i < this.tracks.length; i++) this.tracks[i].trim(0, this.duration);
		return this;
	}
	/**
	* Performs minimal validation on each track in the clip. Returns `true` if all
	* tracks are valid.
	*
	* @return {boolean} Whether the clip's keyframes are valid or not.
	*/
	validate() {
		let valid = true;
		for (let i = 0; i < this.tracks.length; i++) valid = valid && this.tracks[i].validate();
		return valid;
	}
	/**
	* Optimizes each track by removing equivalent sequential keys (which are
	* common in morph target sequences).
	*
	* @return {AnimationClip} A reference to this animation clip.
	*/
	optimize() {
		for (let i = 0; i < this.tracks.length; i++) this.tracks[i].optimize();
		return this;
	}
	/**
	* Returns a new animation clip with copied values from this instance.
	*
	* @return {AnimationClip} A clone of this instance.
	*/
	clone() {
		const tracks = [];
		for (let i = 0; i < this.tracks.length; i++) tracks.push(this.tracks[i].clone());
		const clip = new this.constructor(this.name, this.duration, tracks, this.blendMode);
		clip.userData = JSON.parse(JSON.stringify(this.userData));
		return clip;
	}
	/**
	* Serializes this animation clip into JSON.
	*
	* @return {Object} The JSON object.
	*/
	toJSON() {
		return this.constructor.toJSON(this);
	}
};
function getTrackTypeForValueTypeName(typeName) {
	switch (typeName.toLowerCase()) {
		case "scalar":
		case "double":
		case "float":
		case "number":
		case "integer": return NumberKeyframeTrack;
		case "vector":
		case "vector2":
		case "vector3":
		case "vector4": return VectorKeyframeTrack;
		case "color": return ColorKeyframeTrack;
		case "quaternion": return QuaternionKeyframeTrack;
		case "bool":
		case "boolean": return BooleanKeyframeTrack;
		case "string": return StringKeyframeTrack;
	}
	throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + typeName);
}
function parseKeyframeTrack(json) {
	if (json.type === void 0) throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
	const trackType = getTrackTypeForValueTypeName(json.type);
	if (json.times === void 0) {
		const times = [], values = [];
		flattenJSON(json.keys, times, values, "value");
		json.times = times;
		json.values = values;
	}
	let track;
	if (trackType.parse !== void 0) track = trackType.parse(json);
	else track = new trackType(json.name, json.times, json.values, json.interpolation);
	if (hasTangents(json.settings)) track.settings = {
		inTangents: convertArray(json.settings.inTangents, Float32Array),
		outTangents: convertArray(json.settings.outTangents, Float32Array)
	};
	return track;
}
/**
* @class
* @classdesc A simple caching system, used internally by {@link FileLoader}.
* To enable caching across all loaders that use {@link FileLoader}, add `THREE.Cache.enabled = true.` once in your app.
* @hideconstructor
*/
const Cache = {
	/**
	* Whether caching is enabled or not.
	*
	* @static
	* @type {boolean}
	* @default false
	*/
	enabled: false,
	/**
	* A dictionary that holds cached files.
	*
	* @static
	* @type {Object<string,Object>}
	*/
	files: {},
	/**
	* Adds a cache entry with a key to reference the file. If this key already
	* holds a file, it is overwritten.
	*
	* @static
	* @param {string} key - The key to reference the cached file.
	* @param {Object} file -  The file to be cached.
	*/
	add: function(key, file) {
		if (this.enabled === false) return;
		if (isBlobURL(key)) return;
		this.files[key] = file;
	},
	/**
	* Gets the cached value for the given key.
	*
	* @static
	* @param {string} key - The key to reference the cached file.
	* @return {Object|undefined} The cached file. If the key does not exist `undefined` is returned.
	*/
	get: function(key) {
		if (this.enabled === false) return;
		if (isBlobURL(key)) return;
		return this.files[key];
	},
	/**
	* Removes the cached file associated with the given key.
	*
	* @static
	* @param {string} key - The key to reference the cached file.
	*/
	remove: function(key) {
		delete this.files[key];
	},
	/**
	* Remove all values from the cache.
	*
	* @static
	*/
	clear: function() {
		this.files = {};
	}
};
/**
* Returns true if the given cache key contains the blob: scheme.
*
* @private
* @param {string} key - The cache key.
* @return {boolean} Whether the given cache key contains the blob: scheme or not.
*/
function isBlobURL(key) {
	try {
		const urlString = key.slice(key.indexOf(":") + 1);
		return new URL(urlString).protocol === "blob:";
	} catch (e) {
		return false;
	}
}
/**
* Handles and keeps track of loaded and pending data. A default global
* instance of this class is created and used by loaders if not supplied
* manually.
*
* In general that should be sufficient, however there are times when it can
* be useful to have separate loaders - for example if you want to show
* separate loading bars for objects and textures.
*
* ```js
* const manager = new THREE.LoadingManager();
* manager.onLoad = () => console.log( 'Loading complete!' );
*
* const loader1 = new OBJLoader( manager );
* const loader2 = new ColladaLoader( manager );
* ```
*/
var LoadingManager = class {
	/**
	* Constructs a new loading manager.
	*
	* @param {Function} [onLoad] - Executes when all items have been loaded.
	* @param {Function} [onProgress] - Executes when single items have been loaded.
	* @param {Function} [onError] - Executes when an error occurs.
	*/
	constructor(onLoad, onProgress, onError) {
		const scope = this;
		let isLoading = false;
		let itemsLoaded = 0;
		let itemsTotal = 0;
		let urlModifier = void 0;
		const handlers = [];
		/**
		* Executes when an item starts loading.
		*
		* @type {Function|undefined}
		* @default undefined
		*/
		this.onStart = void 0;
		/**
		* Executes when all items have been loaded.
		*
		* @type {Function|undefined}
		* @default undefined
		*/
		this.onLoad = onLoad;
		/**
		* Executes when single items have been loaded.
		*
		* @type {Function|undefined}
		* @default undefined
		*/
		this.onProgress = onProgress;
		/**
		* Executes when an error occurs.
		*
		* @type {Function|undefined}
		* @default undefined
		*/
		this.onError = onError;
		/**
		* Used for aborting ongoing requests in loaders using this manager.
		*
		* @private
		* @type {AbortController | null}
		*/
		this._abortController = null;
		/**
		* This should be called by any loader using the manager when the loader
		* starts loading an item.
		*
		* @param {string} url - The URL to load.
		*/
		this.itemStart = function(url) {
			itemsTotal++;
			if (isLoading === false) {
				if (scope.onStart !== void 0) scope.onStart(url, itemsLoaded, itemsTotal);
			}
			isLoading = true;
		};
		/**
		* This should be called by any loader using the manager when the loader
		* ended loading an item.
		*
		* @param {string} url - The URL of the loaded item.
		*/
		this.itemEnd = function(url) {
			itemsLoaded++;
			if (scope.onProgress !== void 0) scope.onProgress(url, itemsLoaded, itemsTotal);
			if (itemsLoaded === itemsTotal) {
				isLoading = false;
				if (scope.onLoad !== void 0) scope.onLoad();
			}
		};
		/**
		* This should be called by any loader using the manager when the loader
		* encounters an error when loading an item.
		*
		* @param {string} url - The URL of the item that produces an error.
		*/
		this.itemError = function(url) {
			if (scope.onError !== void 0) scope.onError(url);
		};
		/**
		* Given a URL, uses the URL modifier callback (if any) and returns a
		* resolved URL. If no URL modifier is set, returns the original URL.
		*
		* @param {string} url - The URL to load.
		* @return {string} The resolved URL.
		*/
		this.resolveURL = function(url) {
			url = url.normalize("NFC");
			if (urlModifier) return urlModifier(url);
			return url;
		};
		/**
		* If provided, the callback will be passed each resource URL before a
		* request is sent. The callback may return the original URL, or a new URL to
		* override loading behavior. This behavior can be used to load assets from
		* .ZIP files, drag-and-drop APIs, and Data URIs.
		*
		* ```js
		* const blobs = {'fish.gltf': blob1, 'diffuse.png': blob2, 'normal.png': blob3};
		*
		* const manager = new THREE.LoadingManager();
		*
		* // Initialize loading manager with URL callback.
		* const objectURLs = [];
		* manager.setURLModifier( ( url ) => {
		*
		* 	url = URL.createObjectURL( blobs[ url ] );
		* 	objectURLs.push( url );
		* 	return url;
		*
		* } );
		*
		* // Load as usual, then revoke the blob URLs.
		* const loader = new GLTFLoader( manager );
		* loader.load( 'fish.gltf', (gltf) => {
		*
		* 	scene.add( gltf.scene );
		* 	objectURLs.forEach( ( url ) => URL.revokeObjectURL( url ) );
		*
		* } );
		* ```
		*
		* @param {function(string):string} transform - URL modifier callback. Called with an URL and must return a resolved URL.
		* @return {LoadingManager} A reference to this loading manager.
		*/
		this.setURLModifier = function(transform) {
			urlModifier = transform;
			return this;
		};
		/**
		* Registers a loader with the given regular expression. Can be used to
		* define what loader should be used in order to load specific files. A
		* typical use case is to overwrite the default loader for textures.
		*
		* ```js
		* // add handler for TGA textures
		* manager.addHandler( /\.tga$/i, new TGALoader() );
		* ```
		*
		* @param {string} regex - A regular expression.
		* @param {Loader} loader - A loader that should handle matched cases.
		* @return {LoadingManager} A reference to this loading manager.
		*/
		this.addHandler = function(regex, loader) {
			handlers.push(regex, loader);
			return this;
		};
		/**
		* Removes the loader for the given regular expression.
		*
		* @param {string} regex - A regular expression.
		* @return {LoadingManager} A reference to this loading manager.
		*/
		this.removeHandler = function(regex) {
			const index = handlers.indexOf(regex);
			if (index !== -1) handlers.splice(index, 2);
			return this;
		};
		/**
		* Can be used to retrieve the registered loader for the given file path.
		*
		* @param {string} file - The file path.
		* @return {?Loader} The registered loader. Returns `null` if no loader was found.
		*/
		this.getHandler = function(file) {
			for (let i = 0, l = handlers.length; i < l; i += 2) {
				const regex = handlers[i];
				const loader = handlers[i + 1];
				if (regex.global) regex.lastIndex = 0;
				if (regex.test(file)) return loader;
			}
			return null;
		};
		/**
		* Can be used to abort ongoing loading requests in loaders using this manager.
		* The abort only works if the loaders implement {@link Loader#abort} and `AbortSignal.any()`
		* is supported in the browser.
		*
		* @return {LoadingManager} A reference to this loading manager.
		*/
		this.abort = function() {
			this.abortController.abort();
			this._abortController = null;
			return this;
		};
	}
	/**
	* Used for aborting ongoing requests in loaders using this manager.
	*
	* @type {AbortController}
	*/
	get abortController() {
		if (!this._abortController) this._abortController = new AbortController();
		return this._abortController;
	}
};
/**
* The global default loading manager.
*
* @constant
* @type {LoadingManager}
*/
const DefaultLoadingManager = /*@__PURE__*/ new LoadingManager();
/**
* Abstract base class for loaders.
*
* @abstract
*/
var Loader = class {
	/**
	* Constructs a new loader.
	*
	* @param {LoadingManager} [manager] - The loading manager.
	*/
	constructor(manager) {
		/**
		* The loading manager.
		*
		* @type {LoadingManager}
		* @default DefaultLoadingManager
		*/
		this.manager = manager !== void 0 ? manager : DefaultLoadingManager;
		/**
		* The crossOrigin string to implement CORS for loading the url from a
		* different domain that allows CORS.
		*
		* @type {string}
		* @default 'anonymous'
		*/
		this.crossOrigin = "anonymous";
		/**
		* Whether the XMLHttpRequest uses credentials.
		*
		* @type {boolean}
		* @default false
		*/
		this.withCredentials = false;
		/**
		* The base path from which the asset will be loaded.
		*
		* @type {string}
		*/
		this.path = "";
		/**
		* The base path from which additional resources like textures will be loaded.
		*
		* @type {string}
		*/
		this.resourcePath = "";
		/**
		* The [request header](https://developer.mozilla.org/en-US/docs/Glossary/Request_header)
		* used in HTTP request.
		*
		* @type {Object<string, any>}
		*/
		this.requestHeader = {};
		if (typeof __THREE_DEVTOOLS__ !== "undefined") __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
	}
	/**
	* This method needs to be implemented by all concrete loaders. It holds the
	* logic for loading assets from the backend.
	*
	* @abstract
	* @param {string} url - The path/URL of the file to be loaded.
	* @param {Function} onLoad - Executed when the loading process has been finished.
	* @param {onProgressCallback} [onProgress] - Executed while the loading is in progress.
	* @param {onErrorCallback} [onError] - Executed when errors occur.
	*/
	load() {}
	/**
	* A async version of {@link Loader#load}.
	*
	* @param {string} url - The path/URL of the file to be loaded.
	* @param {onProgressCallback} [onProgress] - Executed while the loading is in progress.
	* @return {Promise} A Promise that resolves when the asset has been loaded.
	*/
	loadAsync(url, onProgress) {
		const scope = this;
		return new Promise(function(resolve, reject) {
			scope.load(url, resolve, onProgress, reject);
		});
	}
	/**
	* This method needs to be implemented by all concrete loaders. It holds the
	* logic for parsing the asset into three.js entities.
	*
	* @abstract
	* @param {any} data - The data to parse.
	*/
	parse() {}
	/**
	* Sets the `crossOrigin` String to implement CORS for loading the URL
	* from a different domain that allows CORS.
	*
	* @param {string} crossOrigin - The `crossOrigin` value.
	* @return {Loader} A reference to this instance.
	*/
	setCrossOrigin(crossOrigin) {
		this.crossOrigin = crossOrigin;
		return this;
	}
	/**
	* Whether the XMLHttpRequest uses credentials such as cookies, authorization
	* headers or TLS client certificates, see [XMLHttpRequest.withCredentials](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials).
	*
	* Note: This setting has no effect if you are loading files locally or from the same domain.
	*
	* @param {boolean} value - The `withCredentials` value.
	* @return {Loader} A reference to this instance.
	*/
	setWithCredentials(value) {
		this.withCredentials = value;
		return this;
	}
	/**
	* Sets the base path for the asset.
	*
	* @param {string} path - The base path.
	* @return {Loader} A reference to this instance.
	*/
	setPath(path) {
		this.path = path;
		return this;
	}
	/**
	* Sets the base path for dependent resources like textures.
	*
	* @param {string} resourcePath - The resource path.
	* @return {Loader} A reference to this instance.
	*/
	setResourcePath(resourcePath) {
		this.resourcePath = resourcePath;
		return this;
	}
	/**
	* Sets the given request header.
	*
	* @param {Object} requestHeader - A [request header](https://developer.mozilla.org/en-US/docs/Glossary/Request_header)
	* for configuring the HTTP request.
	* @return {Loader} A reference to this instance.
	*/
	setRequestHeader(requestHeader) {
		this.requestHeader = requestHeader;
		return this;
	}
	/**
	* This method can be implemented in loaders for aborting ongoing requests.
	*
	* @abstract
	* @return {Loader} A reference to this instance.
	*/
	abort() {
		return this;
	}
};
/**
* Callback for onProgress in loaders.
*
* @callback onProgressCallback
* @param {ProgressEvent} event - An instance of `ProgressEvent` that represents the current loading status.
*/
/**
* Callback for onError in loaders.
*
* @callback onErrorCallback
* @param {Error} error - The error which occurred during the loading process.
*/
/**
* The default material name that is used by loaders
* when creating materials for loaded 3D objects.
*
* Note: Not all loaders might honor this setting.
*
* @static
* @type {string}
* @default '__DEFAULT'
*/
Loader.DEFAULT_MATERIAL_NAME = "__DEFAULT";
const loading = {};
var HttpError = class extends Error {
	constructor(message, response) {
		super(message);
		this.response = response;
	}
};
/**
* A low level class for loading resources with the Fetch API, used internally by
* most loaders. It can also be used directly to load any file type that does
* not have a loader.
*
* This loader supports caching. If you want to use it, add `THREE.Cache.enabled = true;`
* once to your application.
*
* ```js
* const loader = new THREE.FileLoader();
* const data = await loader.loadAsync( 'example.txt' );
* ```
*
* @augments Loader
*/
var FileLoader = class extends Loader {
	/**
	* Constructs a new file loader.
	*
	* @param {LoadingManager} [manager] - The loading manager.
	*/
	constructor(manager) {
		super(manager);
		/**
		* The expected mime type. Valid values can be found
		* [here](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#mimetype)
		*
		* @type {string}
		*/
		this.mimeType = "";
		/**
		* The expected response type.
		*
		* @type {('arraybuffer'|'blob'|'document'|'json'|'')}
		* @default ''
		*/
		this.responseType = "";
		/**
		* Used for aborting requests.
		*
		* @private
		* @type {AbortController}
		*/
		this._abortController = new AbortController();
	}
	/**
	* Starts loading from the given URL and pass the loaded response to the `onLoad()` callback.
	*
	* @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	* @param {function(any)} onLoad - Executed when the loading process has been finished.
	* @param {onProgressCallback} [onProgress] - Executed while the loading is in progress.
	* @param {onErrorCallback} [onError] - Executed when errors occur.
	*/
	load(url, onLoad, onProgress, onError) {
		if (url === void 0) url = "";
		if (this.path !== void 0) url = this.path + url;
		url = this.manager.resolveURL(url);
		const cached = Cache.get(`file:${url}`);
		if (cached !== void 0) {
			this.manager.itemStart(url);
			setTimeout(() => {
				if (onLoad) onLoad(cached);
				this.manager.itemEnd(url);
			}, 0);
			return;
		}
		if (loading[url] !== void 0) {
			loading[url].push({
				onLoad,
				onProgress,
				onError
			});
			return;
		}
		loading[url] = [];
		loading[url].push({
			onLoad,
			onProgress,
			onError
		});
		const req = new Request(url, {
			headers: new Headers(this.requestHeader),
			credentials: this.withCredentials ? "include" : "same-origin",
			signal: typeof AbortSignal.any === "function" ? AbortSignal.any([this._abortController.signal, this.manager.abortController.signal]) : this._abortController.signal
		});
		const mimeType = this.mimeType;
		const responseType = this.responseType;
		fetch(req).then((response) => {
			if (response.status === 200 || response.status === 0) {
				if (response.status === 0) warn("FileLoader: HTTP Status 0 received.");
				if (typeof ReadableStream === "undefined" || response.body === void 0 || response.body.getReader === void 0) return response;
				const callbacks = loading[url];
				const reader = response.body.getReader();
				const contentLength = response.headers.get("X-File-Size") || response.headers.get("Content-Length");
				const total = contentLength ? parseInt(contentLength) : 0;
				const lengthComputable = total !== 0;
				let loaded = 0;
				const stream = new ReadableStream({ start(controller) {
					readData();
					function readData() {
						reader.read().then(({ done, value }) => {
							if (done) controller.close();
							else {
								loaded += value.byteLength;
								const event = new ProgressEvent("progress", {
									lengthComputable,
									loaded,
									total
								});
								for (let i = 0, il = callbacks.length; i < il; i++) {
									const callback = callbacks[i];
									if (callback.onProgress) callback.onProgress(event);
								}
								controller.enqueue(value);
								readData();
							}
						}, (e) => {
							controller.error(e);
						});
					}
				} });
				return new Response(stream);
			} else throw new HttpError(`fetch for "${response.url}" responded with ${response.status}: ${response.statusText}`, response);
		}).then((response) => {
			switch (responseType) {
				case "arraybuffer": return response.arrayBuffer();
				case "blob": return response.blob();
				case "document": return response.text().then((text) => {
					return new DOMParser().parseFromString(text, mimeType);
				});
				case "json": return response.json();
				default: if (mimeType === "") return response.text();
				else {
					const exec = /charset="?([^;"\s]*)"?/i.exec(mimeType);
					const label = exec && exec[1] ? exec[1].toLowerCase() : void 0;
					const decoder = new TextDecoder(label);
					return response.arrayBuffer().then((ab) => decoder.decode(ab));
				}
			}
		}).then((data) => {
			Cache.add(`file:${url}`, data);
			const callbacks = loading[url];
			delete loading[url];
			for (let i = 0, il = callbacks.length; i < il; i++) {
				const callback = callbacks[i];
				if (callback.onLoad) callback.onLoad(data);
			}
		}).catch((err) => {
			const callbacks = loading[url];
			if (callbacks === void 0) {
				this.manager.itemError(url);
				throw err;
			}
			delete loading[url];
			for (let i = 0, il = callbacks.length; i < il; i++) {
				const callback = callbacks[i];
				if (callback.onError) callback.onError(err);
			}
			this.manager.itemError(url);
		}).finally(() => {
			this.manager.itemEnd(url);
		});
		this.manager.itemStart(url);
	}
	/**
	* Sets the expected response type.
	*
	* @param {('arraybuffer'|'blob'|'document'|'json'|'')} value - The response type.
	* @return {FileLoader} A reference to this file loader.
	*/
	setResponseType(value) {
		this.responseType = value;
		return this;
	}
	/**
	* Sets the expected mime type of the loaded file.
	*
	* @param {string} value - The mime type.
	* @return {FileLoader} A reference to this file loader.
	*/
	setMimeType(value) {
		this.mimeType = value;
		return this;
	}
	/**
	* Aborts ongoing fetch requests.
	*
	* @return {FileLoader} A reference to this instance.
	*/
	abort() {
		this._abortController.abort();
		this._abortController = new AbortController();
		return this;
	}
};
const _loading = /* @__PURE__ */ new WeakMap();
/**
* A loader for loading images. The class loads images with the HTML `Image` API.
*
* ```js
* const loader = new THREE.ImageLoader();
* const image = await loader.loadAsync( 'image.png' );
* ```
* Please note that `ImageLoader` has dropped support for progress
* events in `r84`. For an `ImageLoader` that supports progress events, see
* [this thread](https://github.com/mrdoob/three.js/issues/10439#issuecomment-275785639).
*
* @augments Loader
*/
var ImageLoader = class extends Loader {
	/**
	* Constructs a new image loader.
	*
	* @param {LoadingManager} [manager] - The loading manager.
	*/
	constructor(manager) {
		super(manager);
	}
	/**
	* Starts loading from the given URL and passes the loaded image
	* to the `onLoad()` callback. The method also returns a new `Image` object which can
	* directly be used for texture creation. If you do it this way, the texture
	* may pop up in your scene once the respective loading process is finished.
	*
	* @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	* @param {function(Image)} onLoad - Executed when the loading process has been finished.
	* @param {onProgressCallback} onProgress - Unsupported in this loader.
	* @param {onErrorCallback} onError - Executed when errors occur.
	* @return {Image} The image.
	*/
	load(url, onLoad, onProgress, onError) {
		if (this.path !== void 0) url = this.path + url;
		url = this.manager.resolveURL(url);
		const scope = this;
		const cached = Cache.get(`image:${url}`);
		if (cached !== void 0) {
			if (cached.complete === true) {
				scope.manager.itemStart(url);
				setTimeout(function() {
					if (onLoad) onLoad(cached);
					scope.manager.itemEnd(url);
				}, 0);
			} else {
				let arr = _loading.get(cached);
				if (arr === void 0) {
					arr = [];
					_loading.set(cached, arr);
				}
				arr.push({
					onLoad,
					onError
				});
			}
			return cached;
		}
		const image = createElementNS("img");
		function onImageLoad() {
			removeEventListeners();
			if (onLoad) onLoad(this);
			const callbacks = _loading.get(this) || [];
			for (let i = 0; i < callbacks.length; i++) {
				const callback = callbacks[i];
				if (callback.onLoad) callback.onLoad(this);
			}
			_loading.delete(this);
			scope.manager.itemEnd(url);
		}
		function onImageError(event) {
			removeEventListeners();
			if (onError) onError(event);
			Cache.remove(`image:${url}`);
			const callbacks = _loading.get(this) || [];
			for (let i = 0; i < callbacks.length; i++) {
				const callback = callbacks[i];
				if (callback.onError) callback.onError(event);
			}
			_loading.delete(this);
			scope.manager.itemError(url);
			scope.manager.itemEnd(url);
		}
		function removeEventListeners() {
			image.removeEventListener("load", onImageLoad, false);
			image.removeEventListener("error", onImageError, false);
		}
		image.addEventListener("load", onImageLoad, false);
		image.addEventListener("error", onImageError, false);
		if (url.slice(0, 5) !== "data:") {
			if (this.crossOrigin !== void 0) image.crossOrigin = this.crossOrigin;
		}
		Cache.add(`image:${url}`, image);
		scope.manager.itemStart(url);
		image.src = url;
		return image;
	}
};
/**
* Class for loading textures. Images are internally
* loaded via {@link ImageLoader}.
*
* ```js
* const loader = new THREE.TextureLoader();
* const texture = await loader.loadAsync( 'textures/land_ocean_ice_cloud_2048.jpg' );
*
* const material = new THREE.MeshBasicMaterial( { map:texture } );
* ```
* Please note that `TextureLoader` has dropped support for progress
* events in `r84`. For a `TextureLoader` that supports progress events, see
* [this thread](https://github.com/mrdoob/three.js/issues/10439#issuecomment-293260145).
*
* @augments Loader
*/
var TextureLoader = class extends Loader {
	/**
	* Constructs a new texture loader.
	*
	* @param {LoadingManager} [manager] - The loading manager.
	*/
	constructor(manager) {
		super(manager);
	}
	/**
	* Starts loading from the given URL and pass the fully loaded texture
	* to the `onLoad()` callback. The method also returns a new texture object which can
	* directly be used for material creation. If you do it this way, the texture
	* may pop up in your scene once the respective loading process is finished.
	*
	* @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	* @param {function(Texture)} onLoad - Executed when the loading process has been finished.
	* @param {onProgressCallback} onProgress - Unsupported in this loader.
	* @param {onErrorCallback} onError - Executed when errors occur.
	* @return {Texture} The texture.
	*/
	load(url, onLoad, onProgress, onError) {
		const texture = new Texture();
		const loader = new ImageLoader(this.manager);
		loader.setCrossOrigin(this.crossOrigin);
		loader.setPath(this.path);
		loader.load(url, function(image) {
			texture.image = image;
			texture.needsUpdate = true;
			if (onLoad !== void 0) onLoad(texture);
		}, onProgress, onError);
		return texture;
	}
};
/**
* Abstract base class for lights - all other light types inherit the
* properties and methods described here.
*
* @abstract
* @augments Object3D
*/
var Light = class extends Object3D {
	/**
	* Constructs a new light.
	*
	* @param {(number|Color|string)} [color=0xffffff] - The light's color.
	* @param {number} [intensity=1] - The light's strength/intensity.
	*/
	constructor(color, intensity = 1) {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isLight = true;
		this.type = "Light";
		/**
		* The light's color.
		*
		* @type {Color}
		*/
		this.color = new Color(color);
		/**
		* The light's intensity.
		*
		* @type {number}
		* @default 1
		*/
		this.intensity = intensity;
	}
	copy(source, recursive) {
		super.copy(source, recursive);
		this.color.copy(source.color);
		this.intensity = source.intensity;
		return this;
	}
	toJSON(meta) {
		const data = super.toJSON(meta);
		data.object.color = this.color.getHex();
		data.object.intensity = this.intensity;
		return data;
	}
};
const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _lightPositionWorld = /*@__PURE__*/ new Vector3();
const _lookTarget = /*@__PURE__*/ new Vector3();
/**
* Abstract base class for light shadow classes. These classes
* represent the shadow configuration for different light types.
*
* @abstract
*/
var LightShadow = class {
	/**
	* Constructs a new light shadow.
	*
	* @param {Camera} camera - The light's view of the world.
	*/
	constructor(camera) {
		/**
		* The light's view of the world.
		*
		* @type {Camera}
		*/
		this.camera = camera;
		/**
		* The intensity of the shadow. The default is `1`.
		* Valid values are in the range `[0, 1]`.
		*
		* @type {number}
		* @default 1
		*/
		this.intensity = 1;
		/**
		* Shadow map bias, how much to add or subtract from the normalized depth
		* when deciding whether a surface is in shadow.
		*
		* The default is `0`. Very tiny adjustments here (in the order of `0.0001`)
		* may help reduce artifacts in shadows.
		*
		* @type {number}
		* @default 0
		*/
		this.bias = 0;
		/**
		* A node version of `bias`. Only supported with `WebGPURenderer`.
		*
		* If a bias node is defined, `bias` has no effect.
		*
		* @type {?Node<float>}
		* @default null
		*/
		this.biasNode = null;
		/**
		* Defines how much the position used to query the shadow map is offset along
		* the object normal. The default is `0`. Increasing this value can be used to
		* reduce shadow acne especially in large scenes where light shines onto
		* geometry at a shallow angle. The cost is that shadows may appear distorted.
		*
		* @type {number}
		* @default 0
		*/
		this.normalBias = 0;
		/**
		* Setting this to values greater than 1 will blur the edges of the shadow.
		* High values will cause unwanted banding effects in the shadows - a greater
		* map size will allow for a higher value to be used here before these effects
		* become visible.
		*
		* The property has no effect when the shadow map type is `BasicShadowMap`.
		*
		* @type {number}
		* @default 1
		*/
		this.radius = 1;
		/**
		* The amount of samples to use when blurring a VSM shadow map.
		*
		* @type {number}
		* @default 8
		*/
		this.blurSamples = 8;
		/**
		* Defines the width and height of the shadow map. Higher values give better quality
		* shadows at the cost of computation time. Values must be powers of two.
		*
		* @type {Vector2}
		* @default (512,512)
		*/
		this.mapSize = new Vector2(512, 512);
		/**
		* The type of shadow texture. The default is `UnsignedByteType`.
		*
		* @type {number}
		* @default UnsignedByteType
		*/
		this.mapType = UnsignedByteType;
		/**
		* The depth map generated using the internal camera; a location beyond a
		* pixel's depth is in shadow. Computed internally during rendering.
		*
		* @type {?RenderTarget}
		* @default null
		*/
		this.map = null;
		/**
		* The distribution map generated using the internal camera; an occlusion is
		* calculated based on the distribution of depths. Computed internally during
		* rendering.
		*
		* @type {?RenderTarget}
		* @default null
		*/
		this.mapPass = null;
		/**
		* Model to shadow camera space, to compute location and depth in shadow map.
		* This is computed internally during rendering.
		*
		* @type {Matrix4}
		*/
		this.matrix = new Matrix4();
		/**
		* Enables automatic updates of the light's shadow. If you do not require dynamic
		* lighting / shadows, you may set this to `false`.
		*
		* @type {boolean}
		* @default true
		*/
		this.autoUpdate = true;
		/**
		* When set to `true`, shadow maps will be updated in the next `render` call.
		* If you have set {@link LightShadow#autoUpdate} to `false`, you will need to
		* set this property to `true` and then make a render call to update the light's shadow.
		*
		* @type {boolean}
		* @default false
		*/
		this.needsUpdate = false;
		this._frustum = new Frustum();
		this._frameExtents = new Vector2(1, 1);
		this._viewportCount = 1;
		this._viewports = [new Vector4(0, 0, 1, 1)];
	}
	/**
	* Used internally by the renderer to get the number of viewports that need
	* to be rendered for this shadow.
	*
	* @return {number} The viewport count.
	*/
	getViewportCount() {
		return this._viewportCount;
	}
	/**
	* Used internally by the renderer to get the camera that renders the given viewport.
	*
	* @param {number} [viewportIndex=0] - The viewport index.
	* @return {Camera} The shadow camera.
	*/
	getCamera() {
		return this.camera;
	}
	/**
	* Gets the shadow cameras frustum. Used internally by the renderer to cull objects.
	*
	* @return {Frustum} The shadow camera frustum.
	*/
	getFrustum() {
		return this._frustum;
	}
	/**
	* Update the matrices for the camera and shadow, used internally by the renderer.
	*
	* @param {Light} light - The light for which the shadow is being rendered.
	*/
	updateMatrices(light) {
		const shadowCamera = this.camera;
		_lightPositionWorld.setFromMatrixPosition(light.matrixWorld);
		shadowCamera.position.copy(_lightPositionWorld);
		_lookTarget.setFromMatrixPosition(light.target.matrixWorld);
		shadowCamera.lookAt(_lookTarget);
		shadowCamera.updateMatrixWorld();
		this._updateMatrix(shadowCamera, this.matrix, this._frustum);
	}
	/**
	* Updates a shadow projection matrix and its corresponding frustum.
	*
	* @private
	* @param {Camera} shadowCamera - The shadow camera.
	* @param {Matrix4} shadowMatrix - The target shadow matrix.
	* @param {Frustum} frustum - The target frustum.
	* @param {Vector4} [viewport] - The viewport within the shadow atlas.
	*/
	_updateMatrix(shadowCamera, shadowMatrix, frustum, viewport) {
		_projScreenMatrix.multiplyMatrices(shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse);
		frustum.setFromProjectionMatrix(_projScreenMatrix, shadowCamera.coordinateSystem, shadowCamera.reversedDepth);
		const frameExtents = this._frameExtents;
		const scaleX = viewport ? viewport.z / frameExtents.x : 1;
		const scaleY = viewport ? viewport.w / frameExtents.y : 1;
		const offsetX = viewport ? viewport.x / frameExtents.x : 0;
		const offsetY = viewport ? viewport.y / frameExtents.y : 0;
		if (shadowCamera.coordinateSystem === 2001 || shadowCamera.reversedDepth) shadowMatrix.set(.5 * scaleX, 0, 0, .5 * scaleX + offsetX, 0, .5 * scaleY, 0, .5 * scaleY + offsetY, 0, 0, 1, 0, 0, 0, 0, 1);
		else shadowMatrix.set(.5 * scaleX, 0, 0, .5 * scaleX + offsetX, 0, .5 * scaleY, 0, .5 * scaleY + offsetY, 0, 0, .5, .5, 0, 0, 0, 1);
		shadowMatrix.multiply(_projScreenMatrix);
	}
	/**
	* Returns a viewport definition for the given viewport index.
	*
	* @param {number} viewportIndex - The viewport index.
	* @return {Vector4} The viewport.
	*/
	getViewport(viewportIndex) {
		return this._viewports[viewportIndex];
	}
	/**
	* Returns the frame extends.
	*
	* @return {Vector2} The frame extends.
	*/
	getFrameExtents() {
		return this._frameExtents;
	}
	/**
	* Frees the GPU-related resources allocated by this instance. Call this
	* method whenever this instance is no longer used in your app.
	*/
	dispose() {
		if (this.map) this.map.dispose();
		if (this.mapPass) this.mapPass.dispose();
	}
	/**
	* Copies the values of the given light shadow instance to this instance.
	*
	* @param {LightShadow} source - The light shadow to copy.
	* @return {LightShadow} A reference to this light shadow instance.
	*/
	copy(source) {
		this.camera = source.camera.clone();
		this.intensity = source.intensity;
		this.bias = source.bias;
		this.radius = source.radius;
		this.autoUpdate = source.autoUpdate;
		this.needsUpdate = source.needsUpdate;
		this.normalBias = source.normalBias;
		this.blurSamples = source.blurSamples;
		this.mapSize.copy(source.mapSize);
		this.biasNode = source.biasNode;
		return this;
	}
	/**
	* Returns a new light shadow instance with copied values from this instance.
	*
	* @return {LightShadow} A clone of this instance.
	*/
	clone() {
		return new this.constructor().copy(this);
	}
	/**
	* Serializes the light shadow into JSON.
	*
	* @return {Object} A JSON object representing the serialized light shadow.
	* @see {@link ObjectLoader#parse}
	*/
	toJSON() {
		const object = {};
		object.intensity = this.intensity;
		object.bias = this.bias;
		object.normalBias = this.normalBias;
		object.radius = this.radius;
		object.blurSamples = this.blurSamples;
		object.mapSize = this.mapSize.toArray();
		object.camera = this.camera.toJSON(false).object;
		delete object.camera.matrix;
		return object;
	}
};
const _position$2 = /*@__PURE__*/ new Vector3();
const _quaternion$2 = /*@__PURE__*/ new Quaternion();
const _scale$2 = /*@__PURE__*/ new Vector3();
/**
* Abstract base class for cameras. This class should always be inherited
* when you build a new camera.
*
* @abstract
* @augments Object3D
*/
var Camera = class extends Object3D {
	/**
	* Constructs a new camera.
	*/
	constructor() {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isCamera = true;
		this.type = "Camera";
		/**
		* The inverse of the camera's world matrix.
		*
		* @type {Matrix4}
		*/
		this.matrixWorldInverse = new Matrix4();
		/**
		* The camera's projection matrix.
		*
		* @type {Matrix4}
		*/
		this.projectionMatrix = new Matrix4();
		/**
		* The inverse of the camera's projection matrix.
		*
		* @type {Matrix4}
		*/
		this.projectionMatrixInverse = new Matrix4();
		/**
		* The coordinate system in which the camera is used.
		*
		* @type {(WebGLCoordinateSystem|WebGPUCoordinateSystem)}
		*/
		this.coordinateSystem = WebGLCoordinateSystem;
		this._reversedDepth = false;
	}
	/**
	* The flag that indicates whether the camera uses a reversed depth buffer.
	*
	* @type {boolean}
	* @default false
	*/
	get reversedDepth() {
		return this._reversedDepth;
	}
	copy(source, recursive) {
		super.copy(source, recursive);
		this.matrixWorldInverse.copy(source.matrixWorldInverse);
		this.projectionMatrix.copy(source.projectionMatrix);
		this.projectionMatrixInverse.copy(source.projectionMatrixInverse);
		this.coordinateSystem = source.coordinateSystem;
		return this;
	}
	/**
	* Returns a vector representing the ("look") direction of the 3D object in world space.
	*
	* This method is overwritten since cameras have a different forward vector compared to other
	* 3D objects. A camera looks down its local, negative z-axis by default.
	*
	* @param {Vector3} target - The target vector the result is stored to.
	* @return {Vector3} The 3D object's direction in world space.
	*/
	getWorldDirection(target) {
		return super.getWorldDirection(target).negate();
	}
	updateMatrixWorld(force) {
		super.updateMatrixWorld(force);
		this.matrixWorld.decompose(_position$2, _quaternion$2, _scale$2);
		if (_scale$2.x === 1 && _scale$2.y === 1 && _scale$2.z === 1) this.matrixWorldInverse.copy(this.matrixWorld).invert();
		else this.matrixWorldInverse.compose(_position$2, _quaternion$2, _scale$2.set(1, 1, 1)).invert();
	}
	updateWorldMatrix(updateParents, updateChildren, force = false) {
		super.updateWorldMatrix(updateParents, updateChildren, force);
		this.matrixWorld.decompose(_position$2, _quaternion$2, _scale$2);
		if (_scale$2.x === 1 && _scale$2.y === 1 && _scale$2.z === 1) this.matrixWorldInverse.copy(this.matrixWorld).invert();
		else this.matrixWorldInverse.compose(_position$2, _quaternion$2, _scale$2.set(1, 1, 1)).invert();
	}
	clone() {
		return new this.constructor().copy(this);
	}
};
const _v3$1 = /*@__PURE__*/ new Vector3();
const _minTarget = /*@__PURE__*/ new Vector2();
const _maxTarget = /*@__PURE__*/ new Vector2();
/**
* Camera that uses [perspective projection](https://en.wikipedia.org/wiki/Perspective_(graphical)).
*
* This projection mode is designed to mimic the way the human eye sees. It
* is the most common projection mode used for rendering a 3D scene.
*
* ```js
* const camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
* scene.add( camera );
* ```
*
* @augments Camera
*/
var PerspectiveCamera = class extends Camera {
	/**
	* Constructs a new perspective camera.
	*
	* @param {number} [fov=50] - The vertical field of view.
	* @param {number} [aspect=1] - The aspect ratio.
	* @param {number} [near=0.1] - The camera's near plane.
	* @param {number} [far=2000] - The camera's far plane.
	*/
	constructor(fov = 50, aspect = 1, near = .1, far = 2e3) {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isPerspectiveCamera = true;
		this.type = "PerspectiveCamera";
		/**
		* The vertical field of view, from bottom to top of view,
		* in degrees.
		*
		* @type {number}
		* @default 50
		*/
		this.fov = fov;
		/**
		* The zoom factor of the camera.
		*
		* @type {number}
		* @default 1
		*/
		this.zoom = 1;
		/**
		* The camera's near plane. The valid range is greater than `0`
		* and less than the current value of {@link PerspectiveCamera#far}.
		*
		* Note that, unlike for the {@link OrthographicCamera}, `0` is <em>not</em> a
		* valid value for a perspective camera's near plane.
		*
		* @type {number}
		* @default 0.1
		*/
		this.near = near;
		/**
		* The camera's far plane. Must be greater than the
		* current value of {@link PerspectiveCamera#near}.
		*
		* @type {number}
		* @default 2000
		*/
		this.far = far;
		/**
		* Object distance used for stereoscopy and depth-of-field effects. This
		* parameter does not influence the projection matrix unless a
		* {@link StereoCamera} is being used.
		*
		* @type {number}
		* @default 10
		*/
		this.focus = 10;
		/**
		* The aspect ratio, usually the canvas width / canvas height.
		*
		* @type {number}
		* @default 1
		*/
		this.aspect = aspect;
		/**
		* Represents the frustum window specification. This property should not be edited
		* directly but via {@link PerspectiveCamera#setViewOffset} and {@link PerspectiveCamera#clearViewOffset}.
		*
		* @type {?Object}
		* @default null
		*/
		this.view = null;
		/**
		* Film size used for the larger axis. Default is `35` (millimeters). This
		* parameter does not influence the projection matrix unless {@link PerspectiveCamera#filmOffset}
		* is set to a nonzero value.
		*
		* @type {number}
		* @default 35
		*/
		this.filmGauge = 35;
		/**
		* Horizontal off-center offset in the same unit as {@link PerspectiveCamera#filmGauge}.
		*
		* @type {number}
		* @default 0
		*/
		this.filmOffset = 0;
		this.updateProjectionMatrix();
	}
	copy(source, recursive) {
		super.copy(source, recursive);
		this.fov = source.fov;
		this.zoom = source.zoom;
		this.near = source.near;
		this.far = source.far;
		this.focus = source.focus;
		this.aspect = source.aspect;
		this.view = source.view === null ? null : Object.assign({}, source.view);
		this.filmGauge = source.filmGauge;
		this.filmOffset = source.filmOffset;
		return this;
	}
	/**
	* Sets the FOV by focal length in respect to the current {@link PerspectiveCamera#filmGauge}.
	*
	* The default film gauge is 35, so that the focal length can be specified for
	* a 35mm (full frame) camera.
	*
	* @param {number} focalLength - Values for focal length and film gauge must have the same unit.
	*/
	setFocalLength(focalLength) {
		/** see {@link http://www.bobatkins.com/photography/technical/field_of_view.html} */
		const vExtentSlope = .5 * this.getFilmHeight() / focalLength;
		this.fov = RAD2DEG * 2 * Math.atan(vExtentSlope);
		this.updateProjectionMatrix();
	}
	/**
	* Returns the focal length from the current {@link PerspectiveCamera#fov} and
	* {@link PerspectiveCamera#filmGauge}.
	*
	* @return {number} The computed focal length.
	*/
	getFocalLength() {
		const vExtentSlope = Math.tan(DEG2RAD * .5 * this.fov);
		return .5 * this.getFilmHeight() / vExtentSlope;
	}
	/**
	* Returns the current vertical field of view angle in degrees considering {@link PerspectiveCamera#zoom}.
	*
	* @return {number} The effective FOV.
	*/
	getEffectiveFOV() {
		return RAD2DEG * 2 * Math.atan(Math.tan(DEG2RAD * .5 * this.fov) / this.zoom);
	}
	/**
	* Returns the width of the image on the film. If {@link PerspectiveCamera#aspect} is greater than or
	* equal to one (landscape format), the result equals {@link PerspectiveCamera#filmGauge}.
	*
	* @return {number} The film width.
	*/
	getFilmWidth() {
		return this.filmGauge * Math.min(this.aspect, 1);
	}
	/**
	* Returns the height of the image on the film. If {@link PerspectiveCamera#aspect} is greater than or
	* equal to one (landscape format), the result equals {@link PerspectiveCamera#filmGauge}.
	*
	* @return {number} The film width.
	*/
	getFilmHeight() {
		return this.filmGauge / Math.max(this.aspect, 1);
	}
	/**
	* Computes the 2D bounds of the camera's viewable rectangle at a given distance along the viewing direction.
	* Sets `minTarget` and `maxTarget` to the coordinates of the lower-left and upper-right corners of the view rectangle.
	*
	* @param {number} distance - The viewing distance.
	* @param {Vector2} minTarget - The lower-left corner of the view rectangle is written into this vector.
	* @param {Vector2} maxTarget - The upper-right corner of the view rectangle is written into this vector.
	*/
	getViewBounds(distance, minTarget, maxTarget) {
		_v3$1.set(-1, -1, .5).applyMatrix4(this.projectionMatrixInverse);
		minTarget.set(_v3$1.x, _v3$1.y).multiplyScalar(-distance / _v3$1.z);
		_v3$1.set(1, 1, .5).applyMatrix4(this.projectionMatrixInverse);
		maxTarget.set(_v3$1.x, _v3$1.y).multiplyScalar(-distance / _v3$1.z);
	}
	/**
	* Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
	*
	* @param {number} distance - The viewing distance.
	* @param {Vector2} target - The target vector that is used to store result where x is width and y is height.
	* @returns {Vector2} The view size.
	*/
	getViewSize(distance, target) {
		this.getViewBounds(distance, _minTarget, _maxTarget);
		return target.subVectors(_maxTarget, _minTarget);
	}
	/**
	* Sets an offset in a larger frustum. This is useful for multi-window or
	* multi-monitor/multi-machine setups.
	*
	* For example, if you have 3x2 monitors and each monitor is 1920x1080 and
	* the monitors are in grid like this
	*```
	*   +---+---+---+
	*   | A | B | C |
	*   +---+---+---+
	*   | D | E | F |
	*   +---+---+---+
	*```
	* then for each monitor you would call it like this:
	*```js
	* const w = 1920;
	* const h = 1080;
	* const fullWidth = w * 3;
	* const fullHeight = h * 2;
	*
	* // --A--
	* camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
	* // --B--
	* camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
	* // --C--
	* camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
	* // --D--
	* camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
	* // --E--
	* camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
	* // --F--
	* camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
	* ```
	*
	* Note there is no reason monitors have to be the same size or in a grid.
	*
	* @param {number} fullWidth - The full width of multiview setup.
	* @param {number} fullHeight - The full height of multiview setup.
	* @param {number} x - The horizontal offset of the subcamera.
	* @param {number} y - The vertical offset of the subcamera.
	* @param {number} width - The width of subcamera.
	* @param {number} height - The height of subcamera.
	*/
	setViewOffset(fullWidth, fullHeight, x, y, width, height) {
		this.aspect = fullWidth / fullHeight;
		if (this.view === null) this.view = {
			enabled: true,
			fullWidth: 1,
			fullHeight: 1,
			offsetX: 0,
			offsetY: 0,
			width: 1,
			height: 1
		};
		this.view.enabled = true;
		this.view.fullWidth = fullWidth;
		this.view.fullHeight = fullHeight;
		this.view.offsetX = x;
		this.view.offsetY = y;
		this.view.width = width;
		this.view.height = height;
		this.updateProjectionMatrix();
	}
	/**
	* Removes the view offset from the projection matrix.
	*/
	clearViewOffset() {
		if (this.view !== null) this.view.enabled = false;
		this.updateProjectionMatrix();
	}
	/**
	* Updates the camera's projection matrix. Must be called after any change of
	* camera properties.
	*/
	updateProjectionMatrix() {
		const near = this.near;
		let top = near * Math.tan(DEG2RAD * .5 * this.fov) / this.zoom;
		let height = 2 * top;
		let width = this.aspect * height;
		let left = -.5 * width;
		const view = this.view;
		if (this.view !== null && this.view.enabled) {
			const fullWidth = view.fullWidth, fullHeight = view.fullHeight;
			left += view.offsetX * width / fullWidth;
			top -= view.offsetY * height / fullHeight;
			width *= view.width / fullWidth;
			height *= view.height / fullHeight;
		}
		const skew = this.filmOffset;
		if (skew !== 0) left += near * skew / this.getFilmWidth();
		this.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far, this.coordinateSystem, this.reversedDepth);
		this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
	}
	toJSON(meta) {
		const data = super.toJSON(meta);
		data.object.fov = this.fov;
		data.object.zoom = this.zoom;
		data.object.near = this.near;
		data.object.far = this.far;
		data.object.focus = this.focus;
		data.object.aspect = this.aspect;
		if (this.view !== null) data.object.view = Object.assign({}, this.view);
		data.object.filmGauge = this.filmGauge;
		data.object.filmOffset = this.filmOffset;
		return data;
	}
};
/**
* Represents the shadow configuration of directional lights.
*
* @augments LightShadow
*/
var SpotLightShadow = class extends LightShadow {
	/**
	* Constructs a new spot light shadow.
	*/
	constructor() {
		super(new PerspectiveCamera(50, 1, .5, 500));
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isSpotLightShadow = true;
		/**
		* Used to focus the shadow camera. The camera's field of view is set as a
		* percentage of the spotlight's field-of-view. Range is `[0, 1]`.
		*
		* @type {number}
		* @default 1
		*/
		this.focus = 1;
		/**
		* Texture aspect ratio.
		*
		* @type {number}
		* @default 1
		*/
		this.aspect = 1;
	}
	updateMatrices(light) {
		const camera = this.camera;
		const fov = RAD2DEG * 2 * light.angle * this.focus;
		const aspect = this.mapSize.width / this.mapSize.height * this.aspect;
		const far = light.distance || camera.far;
		if (fov !== camera.fov || aspect !== camera.aspect || far !== camera.far) {
			camera.fov = fov;
			camera.aspect = aspect;
			camera.far = far;
			camera.updateProjectionMatrix();
		}
		super.updateMatrices(light);
	}
	copy(source) {
		super.copy(source);
		this.focus = source.focus;
		this.aspect = source.aspect;
		return this;
	}
	/**
	* Serializes the light shadow into JSON.
	*
	* @return {Object} A JSON object representing the serialized light shadow.
	* @see {@link ObjectLoader#parse}
	*/
	toJSON() {
		const object = super.toJSON();
		object.focus = this.focus;
		object.aspect = this.aspect;
		return object;
	}
};
/**
* This light gets emitted from a single point in one direction, along a cone
* that increases in size the further from the light it gets.
*
* This light can cast shadows - see the {@link SpotLightShadow} for details.
*
* ```js
* // white spotlight shining from the side, modulated by a texture
* const spotLight = new THREE.SpotLight( 0xffffff );
* spotLight.position.set( 100, 1000, 100 );
* spotLight.map = new THREE.TextureLoader().load( url );
*
* spotLight.castShadow = true;
* spotLight.shadow.mapSize.width = 1024;
* spotLight.shadow.mapSize.height = 1024;
* spotLight.shadow.camera.near = 500;
* spotLight.shadow.camera.far = 4000;
* spotLight.shadow.camera.fov = 30;s
* ```
*
* @augments Light
*/
var SpotLight = class extends Light {
	/**
	* Constructs a new spot light.
	*
	* @param {(number|Color|string)} [color=0xffffff] - The light's color.
	* @param {number} [intensity=1] - The light's strength/intensity measured in candela (cd).
	* @param {number} [distance=0] - Maximum range of the light. `0` means no limit.
	* @param {number} [angle=Math.PI/3] - Maximum angle of light dispersion from its direction whose upper bound is `Math.PI/2`.
	* @param {number} [penumbra=0] - Percent of the spotlight cone that is attenuated due to penumbra. Value range is `[0,1]`.
	* @param {number} [decay=2] - The amount the light dims along the distance of the light.
	*/
	constructor(color, intensity, distance = 0, angle = Math.PI / 3, penumbra = 0, decay = 2) {
		super(color, intensity);
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isSpotLight = true;
		this.type = "SpotLight";
		this.position.copy(Object3D.DEFAULT_UP);
		this.updateMatrix();
		/**
		* The spot light points from its position to the
		* target's position.
		*
		* For the target's position to be changed to anything other
		* than the default, it must be added to the scene.
		*
		* It is also possible to set the target to be another 3D object
		* in the scene. The light will now track the target object.
		*
		* @type {Object3D}
		*/
		this.target = new Object3D();
		/**
		* Maximum range of the light. `0` means no limit.
		*
		* @type {number}
		* @default 0
		*/
		this.distance = distance;
		/**
		* Maximum angle of light dispersion from its direction whose upper bound is `Math.PI/2`.
		*
		* @type {number}
		* @default Math.PI/3
		*/
		this.angle = angle;
		/**
		* Percent of the spotlight cone that is attenuated due to penumbra.
		* Value range is `[0,1]`.
		*
		* @type {number}
		* @default 0
		*/
		this.penumbra = penumbra;
		/**
		* The amount the light dims along the distance of the light. In context of
		* physically-correct rendering the default value should not be changed.
		*
		* @type {number}
		* @default 2
		*/
		this.decay = decay;
		/**
		* A texture used to modulate the color of the light. The spot light
		* color is mixed with the RGB value of this texture, with a ratio
		* corresponding to its alpha value. The cookie-like masking effect is
		* reproduced using pixel values (0, 0, 0, 1-cookie_value).
		*
		* *Warning*: This property is disabled if {@link Object3D#castShadow} is set to `false`.
		*
		* @type {?Texture}
		* @default null
		*/
		this.map = null;
		/**
		* This property holds the light's shadow configuration.
		*
		* @type {SpotLightShadow}
		*/
		this.shadow = new SpotLightShadow();
	}
	/**
	* The light's power. Power is the luminous power of the light measured in lumens (lm).
	*  Changing the power will also change the light's intensity.
	*
	* @type {number}
	*/
	get power() {
		return this.intensity * Math.PI;
	}
	set power(power) {
		this.intensity = power / Math.PI;
	}
	dispose() {
		super.dispose();
		this.shadow.dispose();
	}
	copy(source, recursive) {
		super.copy(source, recursive);
		this.distance = source.distance;
		this.angle = source.angle;
		this.penumbra = source.penumbra;
		this.decay = source.decay;
		this.target = source.target.clone();
		this.map = source.map;
		this.shadow = source.shadow.clone();
		return this;
	}
	toJSON(meta) {
		const data = super.toJSON(meta);
		data.object.distance = this.distance;
		data.object.angle = this.angle;
		data.object.decay = this.decay;
		data.object.penumbra = this.penumbra;
		data.object.target = this.target.uuid;
		if (this.map && this.map.isTexture) data.object.map = this.map.toJSON(meta).uuid;
		data.object.shadow = this.shadow.toJSON();
		return data;
	}
};
/**
* Represents the shadow configuration of point lights.
*
* @augments LightShadow
*/
var PointLightShadow = class extends LightShadow {
	/**
	* Constructs a new point light shadow.
	*/
	constructor() {
		super(new PerspectiveCamera(90, 1, .5, 500));
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isPointLightShadow = true;
	}
};
/**
* A light that gets emitted from a single point in all directions. A common
* use case for this is to replicate the light emitted from a bare
* lightbulb.
*
* This light can cast shadows - see the {@link PointLightShadow} for details.
*
* ```js
* const light = new THREE.PointLight( 0xff0000, 1, 100 );
* light.position.set( 50, 50, 50 );
* scene.add( light );
* ```
*
* @augments Light
*/
var PointLight = class extends Light {
	/**
	* Constructs a new point light.
	*
	* @param {(number|Color|string)} [color=0xffffff] - The light's color.
	* @param {number} [intensity=1] - The light's strength/intensity measured in candela (cd).
	* @param {number} [distance=0] - Maximum range of the light. `0` means no limit.
	* @param {number} [decay=2] - The amount the light dims along the distance of the light.
	*/
	constructor(color, intensity, distance = 0, decay = 2) {
		super(color, intensity);
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isPointLight = true;
		this.type = "PointLight";
		/**
		* When distance is zero, light will attenuate according to inverse-square
		* law to infinite distance. When distance is non-zero, light will attenuate
		* according to inverse-square law until near the distance cutoff, where it
		* will then attenuate quickly and smoothly to 0. Inherently, cutoffs are not
		* physically correct.
		*
		* @type {number}
		* @default 0
		*/
		this.distance = distance;
		/**
		* The amount the light dims along the distance of the light. In context of
		* physically-correct rendering the default value should not be changed.
		*
		* @type {number}
		* @default 2
		*/
		this.decay = decay;
		/**
		* This property holds the light's shadow configuration.
		*
		* @type {PointLightShadow}
		*/
		this.shadow = new PointLightShadow();
	}
	/**
	* The light's power. Power is the luminous power of the light measured in lumens (lm).
	* Changing the power will also change the light's intensity.
	*
	* @type {number}
	*/
	get power() {
		return this.intensity * 4 * Math.PI;
	}
	set power(power) {
		this.intensity = power / (4 * Math.PI);
	}
	dispose() {
		super.dispose();
		this.shadow.dispose();
	}
	copy(source, recursive) {
		super.copy(source, recursive);
		this.distance = source.distance;
		this.decay = source.decay;
		this.shadow = source.shadow.clone();
		return this;
	}
	toJSON(meta) {
		const data = super.toJSON(meta);
		data.object.distance = this.distance;
		data.object.decay = this.decay;
		data.object.shadow = this.shadow.toJSON();
		return data;
	}
};
/**
* Camera that uses [orthographic projection](https://en.wikipedia.org/wiki/Orthographic_projection).
*
* In this projection mode, an object's size in the rendered image stays
* constant regardless of its distance from the camera. This can be useful
* for rendering 2D scenes and UI elements, amongst other things.
*
* ```js
* const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
* scene.add( camera );
* ```
*
* @augments Camera
*/
var OrthographicCamera = class extends Camera {
	/**
	* Constructs a new orthographic camera.
	*
	* @param {number} [left=-1] - The left plane of the camera's frustum.
	* @param {number} [right=1] - The right plane of the camera's frustum.
	* @param {number} [top=1] - The top plane of the camera's frustum.
	* @param {number} [bottom=-1] - The bottom plane of the camera's frustum.
	* @param {number} [near=0.1] - The camera's near plane.
	* @param {number} [far=2000] - The camera's far plane.
	*/
	constructor(left = -1, right = 1, top = 1, bottom = -1, near = .1, far = 2e3) {
		super();
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isOrthographicCamera = true;
		this.type = "OrthographicCamera";
		/**
		* The zoom factor of the camera.
		*
		* @type {number}
		* @default 1
		*/
		this.zoom = 1;
		/**
		* Represents the frustum window specification. This property should not be edited
		* directly but via {@link PerspectiveCamera#setViewOffset} and {@link PerspectiveCamera#clearViewOffset}.
		*
		* @type {?Object}
		* @default null
		*/
		this.view = null;
		/**
		* The left plane of the camera's frustum.
		*
		* @type {number}
		* @default -1
		*/
		this.left = left;
		/**
		* The right plane of the camera's frustum.
		*
		* @type {number}
		* @default 1
		*/
		this.right = right;
		/**
		* The top plane of the camera's frustum.
		*
		* @type {number}
		* @default 1
		*/
		this.top = top;
		/**
		* The bottom plane of the camera's frustum.
		*
		* @type {number}
		* @default -1
		*/
		this.bottom = bottom;
		/**
		* The camera's near plane. The valid range is greater than `0`
		* and less than the current value of {@link OrthographicCamera#far}.
		*
		* Note that, unlike for the {@link PerspectiveCamera}, `0` is a
		* valid value for an orthographic camera's near plane.
		*
		* @type {number}
		* @default 0.1
		*/
		this.near = near;
		/**
		* The camera's far plane. Must be greater than the
		* current value of {@link OrthographicCamera#near}.
		*
		* @type {number}
		* @default 2000
		*/
		this.far = far;
		this.updateProjectionMatrix();
	}
	copy(source, recursive) {
		super.copy(source, recursive);
		this.left = source.left;
		this.right = source.right;
		this.top = source.top;
		this.bottom = source.bottom;
		this.near = source.near;
		this.far = source.far;
		this.zoom = source.zoom;
		this.view = source.view === null ? null : Object.assign({}, source.view);
		return this;
	}
	/**
	* Sets an offset in a larger frustum. This is useful for multi-window or
	* multi-monitor/multi-machine setups.
	*
	* @param {number} fullWidth - The full width of multiview setup.
	* @param {number} fullHeight - The full height of multiview setup.
	* @param {number} x - The horizontal offset of the subcamera.
	* @param {number} y - The vertical offset of the subcamera.
	* @param {number} width - The width of subcamera.
	* @param {number} height - The height of subcamera.
	* @see {@link PerspectiveCamera#setViewOffset}
	*/
	setViewOffset(fullWidth, fullHeight, x, y, width, height) {
		if (this.view === null) this.view = {
			enabled: true,
			fullWidth: 1,
			fullHeight: 1,
			offsetX: 0,
			offsetY: 0,
			width: 1,
			height: 1
		};
		this.view.enabled = true;
		this.view.fullWidth = fullWidth;
		this.view.fullHeight = fullHeight;
		this.view.offsetX = x;
		this.view.offsetY = y;
		this.view.width = width;
		this.view.height = height;
		this.updateProjectionMatrix();
	}
	/**
	* Removes the view offset from the projection matrix.
	*/
	clearViewOffset() {
		if (this.view !== null) this.view.enabled = false;
		this.updateProjectionMatrix();
	}
	/**
	* Updates the camera's projection matrix. Must be called after any change of
	* camera properties.
	*/
	updateProjectionMatrix() {
		const dx = (this.right - this.left) / (2 * this.zoom);
		const dy = (this.top - this.bottom) / (2 * this.zoom);
		const cx = (this.right + this.left) / 2;
		const cy = (this.top + this.bottom) / 2;
		let left = cx - dx;
		let right = cx + dx;
		let top = cy + dy;
		let bottom = cy - dy;
		if (this.view !== null && this.view.enabled) {
			const scaleW = (this.right - this.left) / this.view.fullWidth / this.zoom;
			const scaleH = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
			left += scaleW * this.view.offsetX;
			right = left + scaleW * this.view.width;
			top -= scaleH * this.view.offsetY;
			bottom = top - scaleH * this.view.height;
		}
		this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far, this.coordinateSystem, this.reversedDepth);
		this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
	}
	toJSON(meta) {
		const data = super.toJSON(meta);
		data.object.zoom = this.zoom;
		data.object.left = this.left;
		data.object.right = this.right;
		data.object.top = this.top;
		data.object.bottom = this.bottom;
		data.object.near = this.near;
		data.object.far = this.far;
		if (this.view !== null) data.object.view = Object.assign({}, this.view);
		return data;
	}
};
/**
* Represents the shadow configuration of directional lights.
*
* @augments LightShadow
*/
var DirectionalLightShadow = class extends LightShadow {
	/**
	* Constructs a new directional light shadow.
	*/
	constructor() {
		super(new OrthographicCamera(-5, 5, 5, -5, .5, 500));
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isDirectionalLightShadow = true;
	}
};
/**
* A light that gets emitted in a specific direction. This light will behave
* as though it is infinitely far away and the rays produced from it are all
* parallel. The common use case for this is to simulate daylight; the sun is
* far enough away that its position can be considered to be infinite, and
* all light rays coming from it are parallel.
*
* A common point of confusion for directional lights is that setting the
* rotation has no effect. This is because three.js's DirectionalLight is the
* equivalent to what is often called a 'Target Direct Light' in other
* applications.
*
* This means that its direction is calculated as pointing from the light's
* {@link Object3D#position} to the {@link DirectionalLight#target} position
* (as opposed to a 'Free Direct Light' that just has a rotation
* component).
*
* This light can cast shadows - see the {@link DirectionalLightShadow} for details.
*
* ```js
* // White directional light at half intensity shining from the top.
* const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
* scene.add( directionalLight );
* ```
*
* @augments Light
*/
var DirectionalLight = class extends Light {
	/**
	* Constructs a new directional light.
	*
	* @param {(number|Color|string)} [color=0xffffff] - The light's color.
	* @param {number} [intensity=1] - The light's strength/intensity.
	*/
	constructor(color, intensity) {
		super(color, intensity);
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isDirectionalLight = true;
		this.type = "DirectionalLight";
		this.position.copy(Object3D.DEFAULT_UP);
		this.updateMatrix();
		/**
		* The directional light points from its position to the
		* target's position.
		*
		* For the target's position to be changed to anything other
		* than the default, it must be added to the scene.
		*
		* It is also possible to set the target to be another 3D object
		* in the scene. The light will now track the target object.
		*
		* @type {Object3D}
		*/
		this.target = new Object3D();
		/**
		* This property holds the light's shadow configuration.
		*
		* @type {DirectionalLightShadow}
		*/
		this.shadow = new DirectionalLightShadow();
	}
	dispose() {
		super.dispose();
		this.shadow.dispose();
	}
	copy(source) {
		super.copy(source);
		this.target = source.target.clone();
		this.shadow = source.shadow.clone();
		return this;
	}
	toJSON(meta) {
		const data = super.toJSON(meta);
		data.object.shadow = this.shadow.toJSON();
		data.object.target = this.target.uuid;
		return data;
	}
};
/**
* A class with loader utility functions.
*/
var LoaderUtils = class {
	/**
	* Extracts the base URL from the given URL.
	*
	* @param {string} url -The URL to extract the base URL from.
	* @return {string} The extracted base URL.
	*/
	static extractUrlBase(url) {
		const index = url.lastIndexOf("/");
		if (index === -1) return "./";
		return url.slice(0, index + 1);
	}
	/**
	* Resolves relative URLs against the given path. Absolute paths, data urls,
	* and blob URLs will be returned as is. Invalid URLs will return an empty
	* string.
	*
	* @param {string} url -The URL to resolve.
	* @param {string} path - The base path for relative URLs to be resolved against.
	* @return {string} The resolved URL.
	*/
	static resolveURL(url, path) {
		if (typeof url !== "string" || url === "") return "";
		if (/^https?:\/\//i.test(path) && /^\//.test(url)) path = path.replace(/(^https?:\/\/[^\/]+).*/i, "$1");
		if (/^(https?:)?\/\//i.test(url)) return url;
		if (/^data:.*,.*$/i.test(url)) return url;
		if (/^blob:.*$/i.test(url)) return url;
		return path + url;
	}
};
const _errorMap = /* @__PURE__ */ new WeakMap();
/**
* A loader for loading images as an [ImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap).
* An `ImageBitmap` provides an asynchronous and resource efficient pathway to prepare
* textures for rendering.
*
* Note that {@link Texture#flipY} and {@link Texture#premultiplyAlpha} are ignored with image bitmaps.
* These options need to be configured via {@link ImageBitmapLoader#setOptions} prior to loading,
* unlike regular images which can be configured on the Texture to set these options on GPU upload instead.
*
* To match the default behaviour of {@link Texture}, the following options are needed:
*
* ```js
* { imageOrientation: 'flipY', premultiplyAlpha: 'none' }
* ```
*
* Also note that unlike {@link FileLoader}, this loader will only avoid multiple concurrent requests to the same URL if {@link Cache} is enabled.
*
* ```js
* const loader = new THREE.ImageBitmapLoader();
* loader.setOptions( { imageOrientation: 'flipY' } ); // set options if needed
* const imageBitmap = await loader.loadAsync( 'image.png' );
*
* const texture = new THREE.Texture( imageBitmap );
* texture.needsUpdate = true;
* ```
*
* @augments Loader
*/
var ImageBitmapLoader = class extends Loader {
	/**
	* Constructs a new image bitmap loader.
	*
	* @param {LoadingManager} [manager] - The loading manager.
	*/
	constructor(manager) {
		super(manager);
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		this.isImageBitmapLoader = true;
		if (typeof createImageBitmap === "undefined") warn("ImageBitmapLoader: createImageBitmap() not supported.");
		if (typeof fetch === "undefined") warn("ImageBitmapLoader: fetch() not supported.");
		/**
		* Represents the loader options.
		*
		* @type {Object}
		* @default {premultiplyAlpha:'none'}
		*/
		this.options = { premultiplyAlpha: "none" };
		/**
		* Used for aborting requests.
		*
		* @private
		* @type {AbortController}
		*/
		this._abortController = new AbortController();
	}
	/**
	* Sets the given loader options. The structure of the object must match the `options` parameter of
	* [createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap).
	*
	* Note: When caching is enabled, the cache key is based on the URL only. Loading the same URL with
	* different options will return the cached result of the first request.
	*
	* @param {Object} options - The loader options to set.
	* @return {ImageBitmapLoader} A reference to this image bitmap loader.
	*/
	setOptions(options) {
		this.options = options;
		return this;
	}
	/**
	* Starts loading from the given URL and pass the loaded image bitmap to the `onLoad()` callback.
	*
	* @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	* @param {function(ImageBitmap)} onLoad - Executed when the loading process has been finished.
	* @param {onProgressCallback} onProgress - Unsupported in this loader.
	* @param {onErrorCallback} onError - Executed when errors occur.
	*/
	load(url, onLoad, onProgress, onError) {
		if (url === void 0) url = "";
		if (this.path !== void 0) url = this.path + url;
		url = this.manager.resolveURL(url);
		const scope = this;
		const cached = Cache.get(`image-bitmap:${url}`);
		if (cached !== void 0) {
			scope.manager.itemStart(url);
			if (cached.then) {
				cached.then((imageBitmap) => {
					if (_errorMap.has(cached) === true) {
						if (onError) onError(_errorMap.get(cached));
						scope.manager.itemError(url);
						scope.manager.itemEnd(url);
					} else {
						if (onLoad) onLoad(imageBitmap);
						scope.manager.itemEnd(url);
					}
				});
				return;
			}
			setTimeout(function() {
				if (onLoad) onLoad(cached);
				scope.manager.itemEnd(url);
			}, 0);
			return;
		}
		const fetchOptions = {};
		fetchOptions.credentials = this.crossOrigin === "anonymous" ? "same-origin" : "include";
		fetchOptions.headers = this.requestHeader;
		fetchOptions.signal = typeof AbortSignal.any === "function" ? AbortSignal.any([this._abortController.signal, this.manager.abortController.signal]) : this._abortController.signal;
		const promise = fetch(url, fetchOptions).then(function(res) {
			return res.blob();
		}).then(function(blob) {
			return createImageBitmap(blob, Object.assign({}, scope.options, { colorSpaceConversion: "none" }));
		}).then(function(imageBitmap) {
			Cache.add(`image-bitmap:${url}`, imageBitmap);
			if (onLoad) onLoad(imageBitmap);
			scope.manager.itemEnd(url);
			return imageBitmap;
		}).catch(function(e) {
			if (onError) onError(e);
			_errorMap.set(promise, e);
			Cache.remove(`image-bitmap:${url}`);
			scope.manager.itemError(url);
			scope.manager.itemEnd(url);
		});
		Cache.add(`image-bitmap:${url}`, promise);
		scope.manager.itemStart(url);
	}
	/**
	* Aborts ongoing fetch requests.
	*
	* @return {ImageBitmapLoader} A reference to this instance.
	*/
	abort() {
		this._abortController.abort();
		this._abortController = new AbortController();
		return this;
	}
};
/**
* Buffered scene graph property that allows weighted accumulation; used internally.
*/
var PropertyMixer = class {
	/**
	* Constructs a new property mixer.
	*
	* @param {PropertyBinding} binding - The property binding.
	* @param {string} typeName - The keyframe track type name.
	* @param {number} valueSize - The keyframe track value size.
	*/
	constructor(binding, typeName, valueSize) {
		/**
		* The property binding.
		*
		* @type {PropertyBinding}
		*/
		this.binding = binding;
		/**
		* The keyframe track value size.
		*
		* @type {number}
		*/
		this.valueSize = valueSize;
		let mixFunction, mixFunctionAdditive, setIdentity;
		switch (typeName) {
			case "quaternion":
				mixFunction = this._slerp;
				mixFunctionAdditive = this._slerpAdditive;
				setIdentity = this._setAdditiveIdentityQuaternion;
				this.buffer = new Float64Array(valueSize * 6);
				this._workIndex = 5;
				break;
			case "string":
			case "bool":
				mixFunction = this._select;
				mixFunctionAdditive = this._select;
				setIdentity = this._setAdditiveIdentityOther;
				this.buffer = new Array(valueSize * 5);
				break;
			default:
				mixFunction = this._lerp;
				mixFunctionAdditive = this._lerpAdditive;
				setIdentity = this._setAdditiveIdentityNumeric;
				this.buffer = new Float64Array(valueSize * 5);
		}
		this._mixBufferRegion = mixFunction;
		this._mixBufferRegionAdditive = mixFunctionAdditive;
		this._setIdentity = setIdentity;
		this._origIndex = 3;
		this._addIndex = 4;
		/**
		* Accumulated weight of the property binding.
		*
		* @type {number}
		* @default 0
		*/
		this.cumulativeWeight = 0;
		/**
		* Accumulated additive weight of the property binding.
		*
		* @type {number}
		* @default 0
		*/
		this.cumulativeWeightAdditive = 0;
		/**
		* Number of active keyframe tracks currently using this property binding.
		*
		* @type {number}
		* @default 0
		*/
		this.useCount = 0;
		/**
		* Number of keyframe tracks referencing this property binding.
		*
		* @type {number}
		* @default 0
		*/
		this.referenceCount = 0;
	}
	/**
	* Accumulates data in the `incoming` region into `accu<i>`.
	*
	* @param {number} accuIndex - The accumulation index.
	* @param {number} weight - The weight.
	*/
	accumulate(accuIndex, weight) {
		const buffer = this.buffer, stride = this.valueSize, offset = accuIndex * stride + stride;
		let currentWeight = this.cumulativeWeight;
		if (currentWeight === 0) {
			for (let i = 0; i !== stride; ++i) buffer[offset + i] = buffer[i];
			currentWeight = weight;
		} else {
			currentWeight += weight;
			const mix = weight / currentWeight;
			this._mixBufferRegion(buffer, offset, 0, mix, stride);
		}
		this.cumulativeWeight = currentWeight;
	}
	/**
	* Accumulates data in the `incoming` region into `add`.
	*
	* @param {number} weight - The weight.
	*/
	accumulateAdditive(weight) {
		const buffer = this.buffer, stride = this.valueSize, offset = stride * this._addIndex;
		if (this.cumulativeWeightAdditive === 0) this._setIdentity();
		this._mixBufferRegionAdditive(buffer, offset, 0, weight, stride);
		this.cumulativeWeightAdditive += weight;
	}
	/**
	* Applies the state of `accu<i>` to the binding when accus differ.
	*
	* @param {number} accuIndex - The accumulation index.
	*/
	apply(accuIndex) {
		const stride = this.valueSize, buffer = this.buffer, offset = accuIndex * stride + stride, weight = this.cumulativeWeight, weightAdditive = this.cumulativeWeightAdditive, binding = this.binding;
		this.cumulativeWeight = 0;
		this.cumulativeWeightAdditive = 0;
		if (weight < 1) {
			const originalValueOffset = stride * this._origIndex;
			this._mixBufferRegion(buffer, offset, originalValueOffset, 1 - weight, stride);
		}
		if (weightAdditive > 0) this._mixBufferRegionAdditive(buffer, offset, this._addIndex * stride, 1, stride);
		for (let i = stride, e = stride + stride; i !== e; ++i) if (buffer[i] !== buffer[i + stride]) {
			binding.setValue(buffer, offset);
			break;
		}
	}
	/**
	* Remembers the state of the bound property and copy it to both accus.
	*/
	saveOriginalState() {
		const binding = this.binding;
		const buffer = this.buffer, stride = this.valueSize, originalValueOffset = stride * this._origIndex;
		binding.getValue(buffer, originalValueOffset);
		for (let i = stride, e = originalValueOffset; i !== e; ++i) buffer[i] = buffer[originalValueOffset + i % stride];
		this._setIdentity();
		this.cumulativeWeight = 0;
		this.cumulativeWeightAdditive = 0;
	}
	/**
	* Applies the state previously taken via {@link PropertyMixer#saveOriginalState} to the binding.
	*/
	restoreOriginalState() {
		const originalValueOffset = this.valueSize * 3;
		this.binding.setValue(this.buffer, originalValueOffset);
	}
	_setAdditiveIdentityNumeric() {
		const startIndex = this._addIndex * this.valueSize;
		const endIndex = startIndex + this.valueSize;
		for (let i = startIndex; i < endIndex; i++) this.buffer[i] = 0;
	}
	_setAdditiveIdentityQuaternion() {
		this._setAdditiveIdentityNumeric();
		this.buffer[this._addIndex * this.valueSize + 3] = 1;
	}
	_setAdditiveIdentityOther() {
		const startIndex = this._origIndex * this.valueSize;
		const targetIndex = this._addIndex * this.valueSize;
		for (let i = 0; i < this.valueSize; i++) this.buffer[targetIndex + i] = this.buffer[startIndex + i];
	}
	_select(buffer, dstOffset, srcOffset, t, stride) {
		if (t >= .5) for (let i = 0; i !== stride; ++i) buffer[dstOffset + i] = buffer[srcOffset + i];
	}
	_slerp(buffer, dstOffset, srcOffset, t) {
		Quaternion.slerpFlat(buffer, dstOffset, buffer, dstOffset, buffer, srcOffset, t);
	}
	_slerpAdditive(buffer, dstOffset, srcOffset, t, stride) {
		const workOffset = this._workIndex * stride;
		Quaternion.multiplyQuaternionsFlat(buffer, workOffset, buffer, dstOffset, buffer, srcOffset);
		Quaternion.slerpFlat(buffer, dstOffset, buffer, dstOffset, buffer, workOffset, t);
	}
	_lerp(buffer, dstOffset, srcOffset, t, stride) {
		const s = 1 - t;
		for (let i = 0; i !== stride; ++i) {
			const j = dstOffset + i;
			buffer[j] = buffer[j] * s + buffer[srcOffset + i] * t;
		}
	}
	_lerpAdditive(buffer, dstOffset, srcOffset, t, stride) {
		for (let i = 0; i !== stride; ++i) {
			const j = dstOffset + i;
			buffer[j] = buffer[j] + buffer[srcOffset + i] * t;
		}
	}
};
const _RESERVED_CHARS_RE = "\\[\\]\\.:\\/";
const _reservedRe = /* @__PURE__ */ new RegExp("[\\[\\]\\.:\\/]", "g");
const _wordChar = "[^\\[\\]\\.:\\/]";
const _wordCharOrDot = "[^" + _RESERVED_CHARS_RE.replace("\\.", "") + "]";
const _directoryRe = /*@__PURE__*/ /((?:WC+[\/:])*)/.source.replace("WC", _wordChar);
const _nodeRe = /*@__PURE__*/ /(WCOD+)?/.source.replace("WCOD", _wordCharOrDot);
const _objectRe = /*@__PURE__*/ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", _wordChar);
const _propertyRe = /*@__PURE__*/ /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", _wordChar);
const _trackRe = new RegExp("^" + _directoryRe + _nodeRe + _objectRe + _propertyRe + "$");
const _supportedObjectNames = [
	"material",
	"materials",
	"bones",
	"map"
];
var Composite = class {
	constructor(targetGroup, path, optionalParsedPath) {
		const parsedPath = optionalParsedPath || PropertyBinding.parseTrackName(path);
		this._targetGroup = targetGroup;
		this._bindings = targetGroup.subscribe_(path, parsedPath);
	}
	getValue(array, offset) {
		this.bind();
		const firstValidIndex = this._targetGroup.nCachedObjects_, binding = this._bindings[firstValidIndex];
		if (binding !== void 0) binding.getValue(array, offset);
	}
	setValue(array, offset) {
		const bindings = this._bindings;
		for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) bindings[i].setValue(array, offset);
	}
	bind() {
		const bindings = this._bindings;
		for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) bindings[i].bind();
	}
	unbind() {
		const bindings = this._bindings;
		for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) bindings[i].unbind();
	}
};
/**
* This holds a reference to a real property in the scene graph; used internally.
*/
var PropertyBinding = class PropertyBinding {
	/**
	* Constructs a new property binding.
	*
	* @param {Object} rootNode - The root node.
	* @param {string} path - The path.
	* @param {?Object} [parsedPath] - The parsed path.
	*/
	constructor(rootNode, path, parsedPath) {
		/**
		* The object path to the animated property.
		*
		* @type {string}
		*/
		this.path = path;
		/**
		* An object holding information about the path.
		*
		* @type {Object}
		*/
		this.parsedPath = parsedPath || PropertyBinding.parseTrackName(path);
		/**
		* The object owns the animated property.
		*
		* @type {?Object}
		*/
		this.node = PropertyBinding.findNode(rootNode, this.parsedPath.nodeName);
		/**
		* The root node.
		*
		* @type {Object3D|Skeleton}
		*/
		this.rootNode = rootNode;
		this.getValue = this._getValue_unbound;
		this.setValue = this._setValue_unbound;
	}
	/**
	* Factory method for creating a property binding from the given parameters.
	*
	* @static
	* @param {Object} root - The root node.
	* @param {string} path - The path.
	* @param {?Object} [parsedPath] - The parsed path.
	* @return {PropertyBinding|Composite} The created property binding or composite.
	*/
	static create(root, path, parsedPath) {
		if (!(root && root.isAnimationObjectGroup)) return new PropertyBinding(root, path, parsedPath);
		else return new PropertyBinding.Composite(root, path, parsedPath);
	}
	/**
	* Replaces spaces with underscores and removes unsupported characters from
	* node names, to ensure compatibility with parseTrackName().
	*
	* @param {string} name - Node name to be sanitized.
	* @return {string} The sanitized node name.
	*/
	static sanitizeNodeName(name) {
		return name.replace(/\s/g, "_").replace(_reservedRe, "");
	}
	/**
	* Parses the given track name (an object path to an animated property) and
	* returns an object with information about the path. Matches strings in the following forms:
	*
	* - nodeName.property
	* - nodeName.property[accessor]
	* - nodeName.material.property[accessor]
	* - uuid.property[accessor]
	* - uuid.objectName[objectIndex].propertyName[propertyIndex]
	* - parentName/nodeName.property
	* - parentName/parentName/nodeName.property[index]
	* - .bone[Armature.DEF_cog].position
	* - scene:helium_balloon_model:helium_balloon_model.position
	*
	* @static
	* @param {string} trackName - The track name to parse.
	* @return {Object} The parsed track name as an object.
	*/
	static parseTrackName(trackName) {
		const matches = _trackRe.exec(trackName);
		if (matches === null) throw new Error("THREE.PropertyBinding: Cannot parse trackName: " + trackName);
		const results = {
			nodeName: matches[2],
			objectName: matches[3],
			objectIndex: matches[4],
			propertyName: matches[5],
			propertyIndex: matches[6]
		};
		const lastDot = results.nodeName && results.nodeName.lastIndexOf(".");
		if (lastDot !== void 0 && lastDot !== -1) {
			const objectName = results.nodeName.substring(lastDot + 1);
			if (_supportedObjectNames.indexOf(objectName) !== -1) {
				results.nodeName = results.nodeName.substring(0, lastDot);
				results.objectName = objectName;
			}
		}
		if (results.propertyName === null || results.propertyName.length === 0) throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: " + trackName);
		return results;
	}
	/**
	* Searches for a node in the hierarchy of the given root object by the given
	* node name.
	*
	* @static
	* @param {Object} root - The root object.
	* @param {string|number} nodeName - The name of the node.
	* @return {?Object} The found node. Returns `null` if no object was found.
	*/
	static findNode(root, nodeName) {
		if (nodeName === void 0 || nodeName === "" || nodeName === "." || nodeName === -1 || nodeName === root.name || nodeName === root.uuid) return root;
		if (root.skeleton) {
			const bone = root.skeleton.getBoneByName(nodeName);
			if (bone !== void 0) return bone;
		}
		if (root.children) {
			const searchNodeSubtree = function(children) {
				for (let i = 0; i < children.length; i++) {
					const childNode = children[i];
					if (childNode.name === nodeName || childNode.uuid === nodeName) return childNode;
					const result = searchNodeSubtree(childNode.children);
					if (result) return result;
				}
				return null;
			};
			const subTreeNode = searchNodeSubtree(root.children);
			if (subTreeNode) return subTreeNode;
		}
		return null;
	}
	_getValue_unavailable() {}
	_setValue_unavailable() {}
	_getValue_direct(buffer, offset) {
		buffer[offset] = this.targetObject[this.propertyName];
	}
	_getValue_array(buffer, offset) {
		const source = this.resolvedProperty;
		for (let i = 0, n = source.length; i !== n; ++i) buffer[offset++] = source[i];
	}
	_getValue_arrayElement(buffer, offset) {
		buffer[offset] = this.resolvedProperty[this.propertyIndex];
	}
	_getValue_toArray(buffer, offset) {
		this.resolvedProperty.toArray(buffer, offset);
	}
	_setValue_direct(buffer, offset) {
		this.targetObject[this.propertyName] = buffer[offset];
	}
	_setValue_direct_setNeedsUpdate(buffer, offset) {
		this.targetObject[this.propertyName] = buffer[offset];
		this.targetObject.needsUpdate = true;
	}
	_setValue_direct_setMatrixWorldNeedsUpdate(buffer, offset) {
		this.targetObject[this.propertyName] = buffer[offset];
		this.targetObject.matrixWorldNeedsUpdate = true;
	}
	_setValue_array(buffer, offset) {
		const dest = this.resolvedProperty;
		for (let i = 0, n = dest.length; i !== n; ++i) dest[i] = buffer[offset++];
	}
	_setValue_array_setNeedsUpdate(buffer, offset) {
		const dest = this.resolvedProperty;
		for (let i = 0, n = dest.length; i !== n; ++i) dest[i] = buffer[offset++];
		this.targetObject.needsUpdate = true;
	}
	_setValue_array_setMatrixWorldNeedsUpdate(buffer, offset) {
		const dest = this.resolvedProperty;
		for (let i = 0, n = dest.length; i !== n; ++i) dest[i] = buffer[offset++];
		this.targetObject.matrixWorldNeedsUpdate = true;
	}
	_setValue_arrayElement(buffer, offset) {
		this.resolvedProperty[this.propertyIndex] = buffer[offset];
	}
	_setValue_arrayElement_setNeedsUpdate(buffer, offset) {
		this.resolvedProperty[this.propertyIndex] = buffer[offset];
		this.targetObject.needsUpdate = true;
	}
	_setValue_arrayElement_setMatrixWorldNeedsUpdate(buffer, offset) {
		this.resolvedProperty[this.propertyIndex] = buffer[offset];
		this.targetObject.matrixWorldNeedsUpdate = true;
	}
	_setValue_fromArray(buffer, offset) {
		this.resolvedProperty.fromArray(buffer, offset);
	}
	_setValue_fromArray_setNeedsUpdate(buffer, offset) {
		this.resolvedProperty.fromArray(buffer, offset);
		this.targetObject.needsUpdate = true;
	}
	_setValue_fromArray_setMatrixWorldNeedsUpdate(buffer, offset) {
		this.resolvedProperty.fromArray(buffer, offset);
		this.targetObject.matrixWorldNeedsUpdate = true;
	}
	_getValue_unbound(targetArray, offset) {
		this.bind();
		this.getValue(targetArray, offset);
	}
	_setValue_unbound(sourceArray, offset) {
		this.bind();
		this.setValue(sourceArray, offset);
	}
	/**
	* Creates a getter / setter pair for the property tracked by this binding.
	*/
	bind() {
		let targetObject = this.node;
		const parsedPath = this.parsedPath;
		const objectName = parsedPath.objectName;
		const propertyName = parsedPath.propertyName;
		let propertyIndex = parsedPath.propertyIndex;
		if (!targetObject) {
			targetObject = PropertyBinding.findNode(this.rootNode, parsedPath.nodeName);
			this.node = targetObject;
		}
		this.getValue = this._getValue_unavailable;
		this.setValue = this._setValue_unavailable;
		if (!targetObject) {
			warn("PropertyBinding: No target node found for track: " + this.path + ".");
			return;
		}
		if (objectName) {
			let objectIndex = parsedPath.objectIndex;
			switch (objectName) {
				case "materials":
					if (!targetObject.material) {
						error("PropertyBinding: Can not bind to material as node does not have a material.", this);
						return;
					}
					if (!targetObject.material.materials) {
						error("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
						return;
					}
					targetObject = targetObject.material.materials;
					break;
				case "bones":
					if (!targetObject.skeleton) {
						error("PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
						return;
					}
					targetObject = targetObject.skeleton.bones;
					for (let i = 0; i < targetObject.length; i++) if (targetObject[i].name === objectIndex) {
						objectIndex = i;
						break;
					}
					break;
				case "map":
					if ("map" in targetObject) {
						targetObject = targetObject.map;
						break;
					}
					if (!targetObject.material) {
						error("PropertyBinding: Can not bind to material as node does not have a material.", this);
						return;
					}
					if (!targetObject.material.map) {
						error("PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
						return;
					}
					targetObject = targetObject.material.map;
					break;
				default:
					if (targetObject[objectName] === void 0) {
						error("PropertyBinding: Can not bind to objectName of node undefined.", this);
						return;
					}
					targetObject = targetObject[objectName];
			}
			if (objectIndex !== void 0) {
				if (targetObject[objectIndex] === void 0) {
					error("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, targetObject);
					return;
				}
				targetObject = targetObject[objectIndex];
			}
		}
		const nodeProperty = targetObject[propertyName];
		if (nodeProperty === void 0) {
			const nodeName = parsedPath.nodeName;
			error("PropertyBinding: Trying to update property for track: " + nodeName + "." + propertyName + " but it wasn't found.", targetObject);
			return;
		}
		let versioning = this.Versioning.None;
		this.targetObject = targetObject;
		if (targetObject.isMaterial === true) versioning = this.Versioning.NeedsUpdate;
		else if (targetObject.isObject3D === true) versioning = this.Versioning.MatrixWorldNeedsUpdate;
		let bindingType = this.BindingType.Direct;
		if (propertyIndex !== void 0) {
			if (propertyName === "morphTargetInfluences") {
				if (!targetObject.geometry) {
					error("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
					return;
				}
				if (!targetObject.geometry.morphAttributes) {
					error("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
					return;
				}
				if (targetObject.morphTargetDictionary[propertyIndex] !== void 0) propertyIndex = targetObject.morphTargetDictionary[propertyIndex];
			}
			bindingType = this.BindingType.ArrayElement;
			this.resolvedProperty = nodeProperty;
			this.propertyIndex = propertyIndex;
		} else if (nodeProperty.fromArray !== void 0 && nodeProperty.toArray !== void 0) {
			bindingType = this.BindingType.HasFromToArray;
			this.resolvedProperty = nodeProperty;
		} else if (Array.isArray(nodeProperty)) {
			bindingType = this.BindingType.EntireArray;
			this.resolvedProperty = nodeProperty;
		} else this.propertyName = propertyName;
		this.getValue = this.GetterByBindingType[bindingType];
		this.setValue = this.SetterByBindingTypeAndVersioning[bindingType][versioning];
	}
	/**
	* Unbinds the property.
	*/
	unbind() {
		this.node = null;
		this.getValue = this._getValue_unbound;
		this.setValue = this._setValue_unbound;
	}
};
PropertyBinding.Composite = Composite;
PropertyBinding.prototype.BindingType = {
	Direct: 0,
	EntireArray: 1,
	ArrayElement: 2,
	HasFromToArray: 3
};
PropertyBinding.prototype.Versioning = {
	None: 0,
	NeedsUpdate: 1,
	MatrixWorldNeedsUpdate: 2
};
PropertyBinding.prototype.GetterByBindingType = [
	PropertyBinding.prototype._getValue_direct,
	PropertyBinding.prototype._getValue_array,
	PropertyBinding.prototype._getValue_arrayElement,
	PropertyBinding.prototype._getValue_toArray
];
PropertyBinding.prototype.SetterByBindingTypeAndVersioning = [
	[
		PropertyBinding.prototype._setValue_direct,
		PropertyBinding.prototype._setValue_direct_setNeedsUpdate,
		PropertyBinding.prototype._setValue_direct_setMatrixWorldNeedsUpdate
	],
	[
		PropertyBinding.prototype._setValue_array,
		PropertyBinding.prototype._setValue_array_setNeedsUpdate,
		PropertyBinding.prototype._setValue_array_setMatrixWorldNeedsUpdate
	],
	[
		PropertyBinding.prototype._setValue_arrayElement,
		PropertyBinding.prototype._setValue_arrayElement_setNeedsUpdate,
		PropertyBinding.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
	],
	[
		PropertyBinding.prototype._setValue_fromArray,
		PropertyBinding.prototype._setValue_fromArray_setNeedsUpdate,
		PropertyBinding.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
	]
];
/**
* An instance of `AnimationAction` schedules the playback of an animation which is
* stored in {@link AnimationClip}.
*/
var AnimationAction = class {
	/**
	* Constructs a new animation action.
	*
	* @param {AnimationMixer} mixer - The mixer that is controlled by this action.
	* @param {AnimationClip} clip - The animation clip that holds the actual keyframes.
	* @param {?Object3D} [localRoot=null] - The root object on which this action is performed.
	* @param {(NormalAnimationBlendMode|AdditiveAnimationBlendMode)} [blendMode] - The blend mode.
	*/
	constructor(mixer, clip, localRoot = null, blendMode = clip.blendMode) {
		this._mixer = mixer;
		this._clip = clip;
		this._localRoot = localRoot;
		/**
		* Defines how the animation is blended/combined when two or more animations
		* are simultaneously played.
		*
		* @type {(NormalAnimationBlendMode|AdditiveAnimationBlendMode)}
		*/
		this.blendMode = blendMode;
		const tracks = clip.tracks, nTracks = tracks.length, interpolants = new Array(nTracks);
		const interpolantSettings = {
			endingStart: ZeroCurvatureEnding,
			endingEnd: ZeroCurvatureEnding
		};
		for (let i = 0; i !== nTracks; ++i) {
			const interpolant = tracks[i].createInterpolant(null);
			interpolants[i] = interpolant;
			interpolant.settings = interpolantSettings;
		}
		this._interpolantSettings = interpolantSettings;
		this._interpolants = interpolants;
		this._propertyBindings = new Array(nTracks);
		this._cacheIndex = null;
		this._byClipCacheIndex = null;
		this._timeScaleInterpolant = null;
		this._restoreTimeScale = null;
		this._weightInterpolant = null;
		/**
		* The loop mode, set via {@link AnimationAction#setLoop}.
		*
		* @type {(LoopRepeat|LoopOnce|LoopPingPong)}
		* @default LoopRepeat
		*/
		this.loop = LoopRepeat;
		this._loopCount = -1;
		this._startTime = null;
		/**
		* The local time of this action (in seconds, starting with `0`).
		*
		* The value gets clamped or wrapped to `[0,clip.duration]` (according to the
		* loop state).
		*
		* @type {number}
		* @default Infinity
		*/
		this.time = 0;
		/**
		* Scaling factor for the {@link AnimationAction#time}. A value of `0` causes the
		* animation to pause. Negative values cause the animation to play backwards.
		*
		* @type {number}
		* @default 1
		*/
		this.timeScale = 1;
		this._effectiveTimeScale = 1;
		/**
		* The degree of influence of this action (in the interval `[0, 1]`). Values
		* between `0` (no impact) and `1` (full impact) can be used to blend between
		* several actions.
		*
		* @type {number}
		* @default 1
		*/
		this.weight = 1;
		this._effectiveWeight = 1;
		/**
		* The number of repetitions of the performed clip over the course of this action.
		* Can be set via {@link AnimationAction#setLoop}.
		*
		* Setting this number has no effect if {@link AnimationAction#loop} is set to
		* `THREE:LoopOnce`.
		*
		* @type {number}
		* @default Infinity
		*/
		this.repetitions = Infinity;
		/**
		* If set to `true`, the playback of the action is paused.
		*
		* @type {boolean}
		* @default false
		*/
		this.paused = false;
		/**
		* If set to `false`, the action is disabled so it has no impact.
		*
		* When the action is re-enabled, the animation continues from its current
		* time (setting `enabled` to `false` doesn't reset the action).
		*
		* @type {boolean}
		* @default true
		*/
		this.enabled = true;
		/**
		* If set to true the animation will automatically be paused on its last frame.
		*
		* If set to false, {@link AnimationAction#enabled} will automatically be switched
		* to `false` when the last loop of the action has finished, so that this action has
		* no further impact.
		*
		* Note: This member has no impact if the action is interrupted (it
		* has only an effect if its last loop has really finished).
		*
		* @type {boolean}
		* @default false
		*/
		this.clampWhenFinished = false;
		/**
		* Enables smooth interpolation without separate clips for start, loop and end.
		*
		* @type {boolean}
		* @default true
		*/
		this.zeroSlopeAtStart = true;
		/**
		* Enables smooth interpolation without separate clips for start, loop and end.
		*
		* @type {boolean}
		* @default true
		*/
		this.zeroSlopeAtEnd = true;
	}
	/**
	* Starts the playback of the animation.
	*
	* @return {AnimationAction} A reference to this animation action.
	*/
	play() {
		this._mixer._activateAction(this);
		return this;
	}
	/**
	* Stops the playback of the animation.
	*
	* @return {AnimationAction} A reference to this animation action.
	*/
	stop() {
		this._mixer._deactivateAction(this);
		return this.reset();
	}
	/**
	* Resets the playback of the animation.
	*
	* @return {AnimationAction} A reference to this animation action.
	*/
	reset() {
		this.paused = false;
		this.enabled = true;
		this.time = 0;
		this._loopCount = -1;
		this._startTime = null;
		return this.stopFading().stopWarping();
	}
	/**
	* Returns `true` if the animation is running.
	*
	* @return {boolean} Whether the animation is running or not.
	*/
	isRunning() {
		return this.enabled && !this.paused && this.timeScale !== 0 && this._startTime === null && this._mixer._isActiveAction(this);
	}
	/**
	* Returns `true` when {@link AnimationAction#play} has been called.
	*
	* @return {boolean} Whether the animation is scheduled or not.
	*/
	isScheduled() {
		return this._mixer._isActiveAction(this);
	}
	/**
	* Defines the time when the animation should start.
	*
	* @param {number} time - The start time in seconds.
	* @return {AnimationAction} A reference to this animation action.
	*/
	startAt(time) {
		this._startTime = time;
		return this;
	}
	/**
	* Configures the loop settings for this action.
	*
	* @param {(LoopRepeat|LoopOnce|LoopPingPong)} mode - The loop mode.
	* @param {number} repetitions - The number of repetitions.
	* @return {AnimationAction} A reference to this animation action.
	*/
	setLoop(mode, repetitions) {
		this.loop = mode;
		this.repetitions = repetitions;
		return this;
	}
	/**
	* Sets the effective weight of this action.
	*
	* An action has no effect and thus an effective weight of zero when the
	* action is disabled.
	*
	* @param {number} weight - The weight to set.
	* @return {AnimationAction} A reference to this animation action.
	*/
	setEffectiveWeight(weight) {
		this.weight = weight;
		this._effectiveWeight = this.enabled ? weight : 0;
		return this.stopFading();
	}
	/**
	* Returns the effective weight of this action.
	*
	* @return {number} The effective weight.
	*/
	getEffectiveWeight() {
		return this._effectiveWeight;
	}
	/**
	* Fades the animation in by increasing its weight gradually from `0` to `1`,
	* within the passed time interval.
	*
	* @param {number} duration - The duration of the fade.
	* @return {AnimationAction} A reference to this animation action.
	*/
	fadeIn(duration) {
		return this._scheduleFading(duration, 0, 1);
	}
	/**
	* Fades the animation out by decreasing its weight gradually from `1` to `0`,
	* within the passed time interval.
	*
	* @param {number} duration - The duration of the fade.
	* @return {AnimationAction} A reference to this animation action.
	*/
	fadeOut(duration) {
		return this._scheduleFading(duration, 1, 0);
	}
	/**
	* Causes this action to fade in and the given action to fade out,
	* within the passed time interval.
	*
	* @param {AnimationAction} fadeOutAction - The animation action to fade out.
	* @param {number} duration - The duration of the fade.
	* @param {boolean} [warp=false] - Whether warping should be used or not.
	* @return {AnimationAction} A reference to this animation action.
	*/
	crossFadeFrom(fadeOutAction, duration, warp = false) {
		fadeOutAction.fadeOut(duration);
		this.fadeIn(duration);
		if (warp === true) {
			const fadeInDuration = this._clip.duration, fadeOutDuration = fadeOutAction._clip.duration, startEndRatio = fadeOutDuration / fadeInDuration, endStartRatio = fadeInDuration / fadeOutDuration;
			fadeOutAction._restoreTimeScale = fadeOutAction.timeScale;
			this._restoreTimeScale = this.timeScale;
			fadeOutAction.warp(1, startEndRatio, duration);
			this.warp(endStartRatio, 1, duration);
		}
		return this;
	}
	/**
	* Causes this action to fade out and the given action to fade in,
	* within the passed time interval.
	*
	* @param {AnimationAction} fadeInAction - The animation action to fade in.
	* @param {number} duration - The duration of the fade.
	* @param {boolean} [warp=false] - Whether warping should be used or not.
	* @return {AnimationAction} A reference to this animation action.
	*/
	crossFadeTo(fadeInAction, duration, warp = false) {
		return fadeInAction.crossFadeFrom(this, duration, warp);
	}
	/**
	* Stops any fading which is applied to this action.
	*
	* @return {AnimationAction} A reference to this animation action.
	*/
	stopFading() {
		const weightInterpolant = this._weightInterpolant;
		if (weightInterpolant !== null) {
			this._weightInterpolant = null;
			this._mixer._takeBackControlInterpolant(weightInterpolant);
		}
		return this;
	}
	/**
	* Sets the effective time scale of this action.
	*
	* An action has no effect and thus an effective time scale of zero when the
	* action is paused.
	*
	* @param {number} timeScale - The time scale to set.
	* @return {AnimationAction} A reference to this animation action.
	*/
	setEffectiveTimeScale(timeScale) {
		this.timeScale = timeScale;
		this._effectiveTimeScale = this.paused ? 0 : timeScale;
		return this.stopWarping();
	}
	/**
	* Returns the effective time scale of this action.
	*
	* @return {number} The effective time scale.
	*/
	getEffectiveTimeScale() {
		return this._effectiveTimeScale;
	}
	/**
	* Sets the duration for a single loop of this action.
	*
	* @param {number} duration - The duration to set.
	* @return {AnimationAction} A reference to this animation action.
	*/
	setDuration(duration) {
		this.timeScale = this._clip.duration / duration;
		return this.stopWarping();
	}
	/**
	* Synchronizes this action with the passed other action.
	*
	* @param {AnimationAction} action - The action to sync with.
	* @return {AnimationAction} A reference to this animation action.
	*/
	syncWith(action) {
		this.time = action.time;
		this.timeScale = action.timeScale;
		return this.stopWarping();
	}
	/**
	* Decelerates this animation's speed to `0` within the passed time interval.
	*
	* @param {number} duration - The duration.
	* @return {AnimationAction} A reference to this animation action.
	*/
	halt(duration) {
		return this.warp(this._effectiveTimeScale, 0, duration);
	}
	/**
	* Changes the playback speed, within the passed time interval, by modifying
	* {@link AnimationAction#timeScale} gradually from `startTimeScale` to
	* `endTimeScale`.
	*
	* @param {number} startTimeScale - The start time scale.
	* @param {number} endTimeScale - The end time scale.
	* @param {number} duration - The duration.
	* @return {AnimationAction} A reference to this animation action.
	*/
	warp(startTimeScale, endTimeScale, duration) {
		const mixer = this._mixer, now = mixer.time, timeScale = this.timeScale;
		let interpolant = this._timeScaleInterpolant;
		if (interpolant === null) {
			interpolant = mixer._lendControlInterpolant();
			this._timeScaleInterpolant = interpolant;
		}
		const times = interpolant.parameterPositions, values = interpolant.sampleValues;
		times[0] = now;
		times[1] = now + duration;
		values[0] = startTimeScale / timeScale;
		values[1] = endTimeScale / timeScale;
		return this;
	}
	/**
	* Stops any scheduled warping which is applied to this action.
	*
	* @return {AnimationAction} A reference to this animation action.
	*/
	stopWarping() {
		const timeScaleInterpolant = this._timeScaleInterpolant;
		if (timeScaleInterpolant !== null) {
			this._timeScaleInterpolant = null;
			this._mixer._takeBackControlInterpolant(timeScaleInterpolant);
		}
		this._restoreTimeScale = null;
		return this;
	}
	/**
	* Returns the animation mixer of this animation action.
	*
	* @return {AnimationMixer} The animation mixer.
	*/
	getMixer() {
		return this._mixer;
	}
	/**
	* Returns the animation clip of this animation action.
	*
	* @return {AnimationClip} The animation clip.
	*/
	getClip() {
		return this._clip;
	}
	/**
	* Returns the root object of this animation action.
	*
	* @return {Object3D} The root object.
	*/
	getRoot() {
		return this._localRoot || this._mixer._root;
	}
	_update(time, deltaTime, timeDirection, accuIndex) {
		if (!this.enabled) {
			this._updateWeight(time);
			return;
		}
		const startTime = this._startTime;
		if (startTime !== null) {
			const timeRunning = (time - startTime) * timeDirection;
			if (timeRunning < 0 || timeDirection === 0) deltaTime = 0;
			else {
				this._startTime = null;
				deltaTime = timeDirection * timeRunning;
			}
		}
		deltaTime *= this._updateTimeScale(time);
		const clipTime = this._updateTime(deltaTime);
		const weight = this._updateWeight(time);
		if (weight > 0) {
			const interpolants = this._interpolants;
			const propertyMixers = this._propertyBindings;
			switch (this.blendMode) {
				case AdditiveAnimationBlendMode:
					for (let j = 0, m = interpolants.length; j !== m; ++j) {
						interpolants[j].evaluate(clipTime);
						propertyMixers[j].accumulateAdditive(weight);
					}
					break;
				case NormalAnimationBlendMode:
				default: for (let j = 0, m = interpolants.length; j !== m; ++j) {
					interpolants[j].evaluate(clipTime);
					propertyMixers[j].accumulate(accuIndex, weight);
				}
			}
		}
	}
	_updateWeight(time) {
		let weight = 0;
		if (this.enabled) {
			weight = this.weight;
			const interpolant = this._weightInterpolant;
			if (interpolant !== null) {
				const interpolantValue = interpolant.evaluate(time)[0];
				weight *= interpolantValue;
				if (time > interpolant.parameterPositions[1]) {
					this.stopFading();
					if (interpolantValue === 0) this.enabled = false;
				}
			}
		}
		this._effectiveWeight = weight;
		return weight;
	}
	_updateTimeScale(time) {
		let timeScale = 0;
		if (!this.paused) {
			timeScale = this.timeScale;
			const interpolant = this._timeScaleInterpolant;
			if (interpolant !== null) {
				const interpolantValue = interpolant.evaluate(time)[0];
				timeScale *= interpolantValue;
				if (time > interpolant.parameterPositions[1]) {
					if (timeScale === 0) this.paused = true;
					else {
						if (this._restoreTimeScale !== null) timeScale = this._restoreTimeScale;
						this.timeScale = timeScale;
					}
					this.stopWarping();
				}
			}
		}
		this._effectiveTimeScale = timeScale;
		return timeScale;
	}
	_updateTime(deltaTime) {
		const duration = this._clip.duration;
		const loop = this.loop;
		let time = this.time + deltaTime;
		let loopCount = this._loopCount;
		const pingPong = loop === LoopPingPong;
		if (deltaTime === 0) {
			if (loopCount === -1) return time;
			return pingPong && (loopCount & 1) === 1 ? duration - time : time;
		}
		if (loop === 2200) {
			if (loopCount === -1) {
				this._loopCount = 0;
				this._setEndings(true, true, false);
			}
			handle_stop: {
				if (time >= duration) time = duration;
				else if (time < 0) time = 0;
				else {
					this.time = time;
					break handle_stop;
				}
				if (this.clampWhenFinished) this.paused = true;
				else this.enabled = false;
				this.time = time;
				this._mixer.dispatchEvent({
					type: "finished",
					action: this,
					direction: deltaTime < 0 ? -1 : 1
				});
			}
		} else {
			if (loopCount === -1) {
				if (deltaTime >= 0) {
					loopCount = 0;
					this._setEndings(true, this.repetitions === 0, pingPong);
				} else this._setEndings(this.repetitions === 0, true, pingPong);
			}
			if (time >= duration || time < 0) {
				const loopDelta = Math.floor(time / duration);
				time -= duration * loopDelta;
				loopCount += Math.abs(loopDelta);
				const pending = this.repetitions - loopCount;
				if (pending <= 0) {
					if (this.clampWhenFinished) this.paused = true;
					else this.enabled = false;
					time = deltaTime > 0 ? duration : 0;
					this.time = time;
					this._mixer.dispatchEvent({
						type: "finished",
						action: this,
						direction: deltaTime > 0 ? 1 : -1
					});
				} else {
					if (pending === 1) {
						const atStart = deltaTime < 0;
						this._setEndings(atStart, !atStart, pingPong);
					} else this._setEndings(false, false, pingPong);
					this._loopCount = loopCount;
					this.time = time;
					this._mixer.dispatchEvent({
						type: "loop",
						action: this,
						loopDelta
					});
				}
			} else {
				this._loopCount = loopCount;
				this.time = time;
			}
			if (pingPong && (loopCount & 1) === 1) return duration - time;
		}
		return time;
	}
	_setEndings(atStart, atEnd, pingPong) {
		const settings = this._interpolantSettings;
		if (pingPong) {
			settings.endingStart = ZeroSlopeEnding;
			settings.endingEnd = ZeroSlopeEnding;
		} else {
			if (atStart) settings.endingStart = this.zeroSlopeAtStart ? ZeroSlopeEnding : ZeroCurvatureEnding;
			else settings.endingStart = WrapAroundEnding;
			if (atEnd) settings.endingEnd = this.zeroSlopeAtEnd ? ZeroSlopeEnding : ZeroCurvatureEnding;
			else settings.endingEnd = WrapAroundEnding;
		}
	}
	_scheduleFading(duration, weightNow, weightThen) {
		const mixer = this._mixer, now = mixer.time;
		let interpolant = this._weightInterpolant;
		if (interpolant === null) {
			interpolant = mixer._lendControlInterpolant();
			this._weightInterpolant = interpolant;
		}
		const times = interpolant.parameterPositions, values = interpolant.sampleValues;
		times[0] = now;
		values[0] = weightNow;
		times[1] = now + duration;
		values[1] = weightThen;
		return this;
	}
};
const _controlInterpolantsResultBuffer = /* @__PURE__ */ new Float32Array(1);
/**
* `AnimationMixer` is a player for animations on a particular object in
* the scene. When multiple objects in the scene are animated independently,
* one `AnimationMixer` may be used for each object.
*/
var AnimationMixer = class extends EventDispatcher {
	/**
	* Constructs a new animation mixer.
	*
	* @param {Object3D} root - The object whose animations shall be played by this mixer.
	*/
	constructor(root) {
		super();
		this._root = root;
		this._initMemoryManager();
		this._accuIndex = 0;
		/**
		* The global mixer time (in seconds; starting with `0` on the mixer's creation).
		*
		* @type {number}
		* @default 0
		*/
		this.time = 0;
		/**
		* A scaling factor for the global time.
		*
		* Note: Setting this member to `0` and later back to `1` is a
		* possibility to pause/unpause all actions that are controlled by this
		* mixer.
		*
		* @type {number}
		* @default 1
		*/
		this.timeScale = 1;
		if (typeof __THREE_DEVTOOLS__ !== "undefined") __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
	}
	_bindAction(action, prototypeAction) {
		const root = action._localRoot || this._root, tracks = action._clip.tracks, nTracks = tracks.length, bindings = action._propertyBindings, interpolants = action._interpolants, rootUuid = root.uuid, bindingsByRoot = this._bindingsByRootAndName;
		let bindingsByName = bindingsByRoot[rootUuid];
		if (bindingsByName === void 0) {
			bindingsByName = {};
			bindingsByRoot[rootUuid] = bindingsByName;
		}
		for (let i = 0; i !== nTracks; ++i) {
			const track = tracks[i], trackName = track.name;
			let binding = bindingsByName[trackName];
			if (binding !== void 0) {
				++binding.referenceCount;
				bindings[i] = binding;
			} else {
				binding = bindings[i];
				if (binding !== void 0) {
					if (binding._cacheIndex === null) {
						++binding.referenceCount;
						this._addInactiveBinding(binding, rootUuid, trackName);
					}
					continue;
				}
				const path = prototypeAction && prototypeAction._propertyBindings[i].binding.parsedPath;
				binding = new PropertyMixer(PropertyBinding.create(root, trackName, path), track.ValueTypeName, track.getValueSize());
				++binding.referenceCount;
				this._addInactiveBinding(binding, rootUuid, trackName);
				bindings[i] = binding;
			}
			interpolants[i].resultBuffer = binding.buffer;
		}
	}
	_activateAction(action) {
		if (!this._isActiveAction(action)) {
			if (action._cacheIndex === null) {
				const rootUuid = (action._localRoot || this._root).uuid, clipUuid = action._clip.uuid, actionsForClip = this._actionsByClip[clipUuid];
				this._bindAction(action, actionsForClip && actionsForClip.knownActions[0]);
				this._addInactiveAction(action, clipUuid, rootUuid);
			}
			const bindings = action._propertyBindings;
			for (let i = 0, n = bindings.length; i !== n; ++i) {
				const binding = bindings[i];
				if (binding.useCount++ === 0) {
					this._lendBinding(binding);
					binding.saveOriginalState();
				}
			}
			this._lendAction(action);
		}
	}
	_deactivateAction(action) {
		if (this._isActiveAction(action)) {
			const bindings = action._propertyBindings;
			for (let i = 0, n = bindings.length; i !== n; ++i) {
				const binding = bindings[i];
				if (--binding.useCount === 0) {
					binding.restoreOriginalState();
					this._takeBackBinding(binding);
				}
			}
			this._takeBackAction(action);
		}
	}
	_initMemoryManager() {
		this._actions = [];
		this._nActiveActions = 0;
		this._actionsByClip = {};
		this._bindings = [];
		this._nActiveBindings = 0;
		this._bindingsByRootAndName = {};
		this._controlInterpolants = [];
		this._nActiveControlInterpolants = 0;
		const scope = this;
		this.stats = {
			actions: {
				get total() {
					return scope._actions.length;
				},
				get inUse() {
					return scope._nActiveActions;
				}
			},
			bindings: {
				get total() {
					return scope._bindings.length;
				},
				get inUse() {
					return scope._nActiveBindings;
				}
			},
			controlInterpolants: {
				get total() {
					return scope._controlInterpolants.length;
				},
				get inUse() {
					return scope._nActiveControlInterpolants;
				}
			}
		};
	}
	_isActiveAction(action) {
		const index = action._cacheIndex;
		return index !== null && index < this._nActiveActions;
	}
	_addInactiveAction(action, clipUuid, rootUuid) {
		const actions = this._actions, actionsByClip = this._actionsByClip;
		let actionsForClip = actionsByClip[clipUuid];
		if (actionsForClip === void 0) {
			actionsForClip = {
				knownActions: [action],
				actionByRoot: {}
			};
			action._byClipCacheIndex = 0;
			actionsByClip[clipUuid] = actionsForClip;
		} else {
			const knownActions = actionsForClip.knownActions;
			action._byClipCacheIndex = knownActions.length;
			knownActions.push(action);
		}
		action._cacheIndex = actions.length;
		actions.push(action);
		actionsForClip.actionByRoot[rootUuid] = action;
	}
	_removeInactiveAction(action) {
		const actions = this._actions, lastInactiveAction = actions[actions.length - 1], cacheIndex = action._cacheIndex;
		lastInactiveAction._cacheIndex = cacheIndex;
		actions[cacheIndex] = lastInactiveAction;
		actions.pop();
		action._cacheIndex = null;
		const clipUuid = action._clip.uuid, actionsByClip = this._actionsByClip, actionsForClip = actionsByClip[clipUuid], knownActionsForClip = actionsForClip.knownActions, lastKnownAction = knownActionsForClip[knownActionsForClip.length - 1], byClipCacheIndex = action._byClipCacheIndex;
		lastKnownAction._byClipCacheIndex = byClipCacheIndex;
		knownActionsForClip[byClipCacheIndex] = lastKnownAction;
		knownActionsForClip.pop();
		action._byClipCacheIndex = null;
		const actionByRoot = actionsForClip.actionByRoot, rootUuid = (action._localRoot || this._root).uuid;
		delete actionByRoot[rootUuid];
		if (knownActionsForClip.length === 0) delete actionsByClip[clipUuid];
		this._removeInactiveBindingsForAction(action);
	}
	_removeInactiveBindingsForAction(action) {
		const bindings = action._propertyBindings;
		for (let i = 0, n = bindings.length; i !== n; ++i) {
			const binding = bindings[i];
			if (--binding.referenceCount === 0) this._removeInactiveBinding(binding);
		}
	}
	_lendAction(action) {
		const actions = this._actions, prevIndex = action._cacheIndex, lastActiveIndex = this._nActiveActions++, firstInactiveAction = actions[lastActiveIndex];
		action._cacheIndex = lastActiveIndex;
		actions[lastActiveIndex] = action;
		firstInactiveAction._cacheIndex = prevIndex;
		actions[prevIndex] = firstInactiveAction;
	}
	_takeBackAction(action) {
		const actions = this._actions, prevIndex = action._cacheIndex, firstInactiveIndex = --this._nActiveActions, lastActiveAction = actions[firstInactiveIndex];
		action._cacheIndex = firstInactiveIndex;
		actions[firstInactiveIndex] = action;
		lastActiveAction._cacheIndex = prevIndex;
		actions[prevIndex] = lastActiveAction;
	}
	_addInactiveBinding(binding, rootUuid, trackName) {
		const bindingsByRoot = this._bindingsByRootAndName, bindings = this._bindings;
		let bindingByName = bindingsByRoot[rootUuid];
		if (bindingByName === void 0) {
			bindingByName = {};
			bindingsByRoot[rootUuid] = bindingByName;
		}
		bindingByName[trackName] = binding;
		binding._cacheIndex = bindings.length;
		bindings.push(binding);
	}
	_removeInactiveBinding(binding) {
		const bindings = this._bindings, propBinding = binding.binding, rootUuid = propBinding.rootNode.uuid, trackName = propBinding.path, bindingsByRoot = this._bindingsByRootAndName, bindingByName = bindingsByRoot[rootUuid], lastInactiveBinding = bindings[bindings.length - 1], cacheIndex = binding._cacheIndex;
		lastInactiveBinding._cacheIndex = cacheIndex;
		bindings[cacheIndex] = lastInactiveBinding;
		bindings.pop();
		delete bindingByName[trackName];
		if (Object.keys(bindingByName).length === 0) delete bindingsByRoot[rootUuid];
	}
	_lendBinding(binding) {
		const bindings = this._bindings, prevIndex = binding._cacheIndex, lastActiveIndex = this._nActiveBindings++, firstInactiveBinding = bindings[lastActiveIndex];
		binding._cacheIndex = lastActiveIndex;
		bindings[lastActiveIndex] = binding;
		firstInactiveBinding._cacheIndex = prevIndex;
		bindings[prevIndex] = firstInactiveBinding;
	}
	_takeBackBinding(binding) {
		const bindings = this._bindings, prevIndex = binding._cacheIndex, firstInactiveIndex = --this._nActiveBindings, lastActiveBinding = bindings[firstInactiveIndex];
		binding._cacheIndex = firstInactiveIndex;
		bindings[firstInactiveIndex] = binding;
		lastActiveBinding._cacheIndex = prevIndex;
		bindings[prevIndex] = lastActiveBinding;
	}
	_lendControlInterpolant() {
		const interpolants = this._controlInterpolants, lastActiveIndex = this._nActiveControlInterpolants++;
		let interpolant = interpolants[lastActiveIndex];
		if (interpolant === void 0) {
			interpolant = new LinearInterpolant(/* @__PURE__ */ new Float32Array(2), /* @__PURE__ */ new Float32Array(2), 1, _controlInterpolantsResultBuffer);
			interpolant.__cacheIndex = lastActiveIndex;
			interpolants[lastActiveIndex] = interpolant;
		}
		return interpolant;
	}
	_takeBackControlInterpolant(interpolant) {
		const interpolants = this._controlInterpolants, prevIndex = interpolant.__cacheIndex, firstInactiveIndex = --this._nActiveControlInterpolants, lastActiveInterpolant = interpolants[firstInactiveIndex];
		interpolant.__cacheIndex = firstInactiveIndex;
		interpolants[firstInactiveIndex] = interpolant;
		lastActiveInterpolant.__cacheIndex = prevIndex;
		interpolants[prevIndex] = lastActiveInterpolant;
	}
	/**
	* Returns an instance of {@link AnimationAction} for the passed clip.
	*
	* If an action fitting the clip and root parameters doesn't yet exist, it
	* will be created by this method. Calling this method several times with the
	* same clip and root parameters always returns the same action.
	*
	* @param {AnimationClip|string} clip - An animation clip or alternatively the name of the animation clip.
	* @param {Object3D} [optionalRoot] - An alternative root object.
	* @param {(NormalAnimationBlendMode|AdditiveAnimationBlendMode)} [blendMode] - The blend mode.
	* @return {?AnimationAction} The animation action.
	*/
	clipAction(clip, optionalRoot, blendMode) {
		const root = optionalRoot || this._root, rootUuid = root.uuid;
		let clipObject = typeof clip === "string" ? AnimationClip.findByName(root, clip) : clip;
		const clipUuid = clipObject !== null ? clipObject.uuid : clip;
		const actionsForClip = this._actionsByClip[clipUuid];
		let prototypeAction = null;
		if (blendMode === void 0) {
			if (clipObject !== null) blendMode = clipObject.blendMode;
			else blendMode = NormalAnimationBlendMode;
		}
		if (actionsForClip !== void 0) {
			const existingAction = actionsForClip.actionByRoot[rootUuid];
			if (existingAction !== void 0 && existingAction.blendMode === blendMode) return existingAction;
			prototypeAction = actionsForClip.knownActions[0];
			if (clipObject === null) clipObject = prototypeAction._clip;
		}
		if (clipObject === null) return null;
		const newAction = new AnimationAction(this, clipObject, optionalRoot, blendMode);
		this._bindAction(newAction, prototypeAction);
		this._addInactiveAction(newAction, clipUuid, rootUuid);
		return newAction;
	}
	/**
	* Returns an existing animation action for the passed clip.
	*
	* @param {AnimationClip|string} clip - An animation clip or alternatively the name of the animation clip.
	* @param {Object3D} [optionalRoot] - An alternative root object.
	* @return {?AnimationAction} The animation action. Returns `null` if no action was found.
	*/
	existingAction(clip, optionalRoot) {
		const root = optionalRoot || this._root, rootUuid = root.uuid, clipObject = typeof clip === "string" ? AnimationClip.findByName(root, clip) : clip, clipUuid = clipObject ? clipObject.uuid : clip, actionsForClip = this._actionsByClip[clipUuid];
		if (actionsForClip !== void 0) return actionsForClip.actionByRoot[rootUuid] || null;
		return null;
	}
	/**
	* Deactivates all previously scheduled actions on this mixer.
	*
	* @return {AnimationMixer} A reference to this animation mixer.
	*/
	stopAllAction() {
		const actions = this._actions, nActions = this._nActiveActions;
		for (let i = nActions - 1; i >= 0; --i) actions[i].stop();
		return this;
	}
	/**
	* Advances the global mixer time and updates the animation.
	*
	* This is usually done in the render loop by passing the delta
	* time from {@link Clock} or {@link Timer}.
	*
	* @param {number} deltaTime - The delta time in seconds.
	* @return {AnimationMixer} A reference to this animation mixer.
	*/
	update(deltaTime) {
		deltaTime *= this.timeScale;
		const actions = this._actions, nActions = this._nActiveActions, time = this.time += deltaTime, timeDirection = Math.sign(deltaTime), accuIndex = this._accuIndex ^= 1;
		for (let i = 0; i !== nActions; ++i) actions[i]._update(time, deltaTime, timeDirection, accuIndex);
		const bindings = this._bindings, nBindings = this._nActiveBindings;
		for (let i = 0; i !== nBindings; ++i) bindings[i].apply(accuIndex);
		return this;
	}
	/**
	* Sets the global mixer to a specific time and updates the animation accordingly.
	*
	* This is useful when you need to jump to an exact time in an animation. The
	* input parameter will be scaled by {@link AnimationMixer#timeScale}
	*
	* @param {number} time - The time to set in seconds.
	* @return {AnimationMixer} A reference to this animation mixer.
	*/
	setTime(time) {
		this.time = 0;
		for (let i = 0; i < this._actions.length; i++) this._actions[i].time = 0;
		return this.update(time);
	}
	/**
	* Returns this mixer's root object.
	*
	* @return {Object3D} The mixer's root object.
	*/
	getRoot() {
		return this._root;
	}
	/**
	* Deallocates all memory resources for a clip. Before using this method make
	* sure to call {@link AnimationAction#stop} for all related actions.
	*
	* @param {AnimationClip} clip - The clip to uncache.
	*/
	uncacheClip(clip) {
		const actions = this._actions, clipUuid = clip.uuid, actionsByClip = this._actionsByClip, actionsForClip = actionsByClip[clipUuid];
		if (actionsForClip !== void 0) {
			const actionsToRemove = actionsForClip.knownActions;
			for (let i = 0, n = actionsToRemove.length; i !== n; ++i) {
				const action = actionsToRemove[i];
				this._deactivateAction(action);
				const cacheIndex = action._cacheIndex, lastInactiveAction = actions[actions.length - 1];
				action._cacheIndex = null;
				action._byClipCacheIndex = null;
				lastInactiveAction._cacheIndex = cacheIndex;
				actions[cacheIndex] = lastInactiveAction;
				actions.pop();
				this._removeInactiveBindingsForAction(action);
			}
			delete actionsByClip[clipUuid];
		}
	}
	/**
	* Deallocates all memory resources for a root object. Before using this
	* method make sure to call {@link AnimationAction#stop} for all related
	* actions or alternatively {@link AnimationMixer#stopAllAction} when the
	* mixer operates on a single root.
	*
	* @param {Object3D} root - The root object to uncache.
	*/
	uncacheRoot(root) {
		const rootUuid = root.uuid, actionsByClip = this._actionsByClip;
		for (const clipUuid in actionsByClip) {
			const action = actionsByClip[clipUuid].actionByRoot[rootUuid];
			if (action !== void 0) {
				this._deactivateAction(action);
				this._removeInactiveAction(action);
			}
		}
		const bindingByName = this._bindingsByRootAndName[rootUuid];
		if (bindingByName !== void 0) for (const trackName in bindingByName) {
			const binding = bindingByName[trackName];
			binding.restoreOriginalState();
			this._removeInactiveBinding(binding);
		}
	}
	/**
	* Deallocates all memory resources for an action. The action is identified by the
	* given clip and an optional root object. Before using this method make
	* sure to call {@link AnimationAction#stop} to deactivate the action.
	*
	* @param {AnimationClip|string} clip - An animation clip or alternatively the name of the animation clip.
	* @param {Object3D} [optionalRoot] - An alternative root object.
	*/
	uncacheAction(clip, optionalRoot) {
		const action = this.existingAction(clip, optionalRoot);
		if (action !== null) {
			this._deactivateAction(action);
			this._removeInactiveAction(action);
		}
	}
};
(class Matrix2 {
	static {
		/**
		* This flag can be used for type testing.
		*
		* @type {boolean}
		* @readonly
		* @default true
		*/
		Matrix2.prototype.isMatrix2 = true;
	}
	/**
	* Constructs a new 2x2 matrix. The arguments are supposed to be
	* in row-major order. If no arguments are provided, the constructor
	* initializes the matrix as an identity matrix.
	*
	* @param {number} [n11] - 1-1 matrix element.
	* @param {number} [n12] - 1-2 matrix element.
	* @param {number} [n21] - 2-1 matrix element.
	* @param {number} [n22] - 2-2 matrix element.
	*/
	constructor(n11, n12, n21, n22) {
		/**
		* A column-major list of matrix values.
		*
		* @type {Array<number>}
		*/
		this.elements = [
			1,
			0,
			0,
			1
		];
		if (n11 !== void 0) this.set(n11, n12, n21, n22);
	}
	/**
	* Sets this matrix to the 2x2 identity matrix.
	*
	* @return {Matrix2} A reference to this matrix.
	*/
	identity() {
		this.set(1, 0, 0, 1);
		return this;
	}
	/**
	* Sets the elements of the matrix from the given array.
	*
	* @param {Array<number>} array - The matrix elements in column-major order.
	* @param {number} [offset=0] - Index of the first element in the array.
	* @return {Matrix2} A reference to this matrix.
	*/
	fromArray(array, offset = 0) {
		for (let i = 0; i < 4; i++) this.elements[i] = array[i + offset];
		return this;
	}
	/**
	* Sets the elements of the matrix.The arguments are supposed to be
	* in row-major order.
	*
	* @param {number} n11 - 1-1 matrix element.
	* @param {number} n12 - 1-2 matrix element.
	* @param {number} n21 - 2-1 matrix element.
	* @param {number} n22 - 2-2 matrix element.
	* @return {Matrix2} A reference to this matrix.
	*/
	set(n11, n12, n21, n22) {
		const te = this.elements;
		te[0] = n11;
		te[2] = n12;
		te[1] = n21;
		te[3] = n22;
		return this;
	}
});
if (typeof __THREE_DEVTOOLS__ !== "undefined") __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: { revision: "186" } }));
if (typeof window !== "undefined") {
	if (window.__THREE__) warn("WARNING: Multiple instances of Three.js being imported.");
	else window.__THREE__ = "186";
}
//#endregion
//#region node_modules/three/examples/jsm/utils/BufferGeometryUtils.js
/**
* Converts the given geometry to the `TrianglesDrawMode` draw mode, which
* corresponds to the `gl.TRIANGLES` primitive in WebGL. The conversion only
* rewrites the index, so the geometry is modified in place and returned.
*
* @param {BufferGeometry} geometry - The geometry to convert.
* @param {number} drawMode - The current draw mode.
* @return {BufferGeometry} The converted geometry using `TrianglesDrawMode`.
*/
function toTrianglesDrawMode(geometry, drawMode) {
	if (drawMode === 0) {
		console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.");
		return geometry;
	}
	if (drawMode === 2 || drawMode === 1) {
		let index = geometry.getIndex();
		if (index === null) {
			const indices = [];
			const position = geometry.getAttribute("position");
			if (position !== void 0) {
				for (let i = 0; i < position.count; i++) indices.push(i);
				geometry.setIndex(indices);
				index = geometry.getIndex();
			} else {
				console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.");
				return geometry;
			}
		}
		const numberOfTriangles = index.count - 2;
		const newIndices = [];
		if (drawMode === 2) for (let i = 1; i <= numberOfTriangles; i++) {
			newIndices.push(index.getX(0));
			newIndices.push(index.getX(i));
			newIndices.push(index.getX(i + 1));
		}
		else for (let i = 0; i < numberOfTriangles; i++) if (i % 2 === 0) {
			newIndices.push(index.getX(i));
			newIndices.push(index.getX(i + 1));
			newIndices.push(index.getX(i + 2));
		} else {
			newIndices.push(index.getX(i + 2));
			newIndices.push(index.getX(i + 1));
			newIndices.push(index.getX(i));
		}
		if (newIndices.length / 3 !== numberOfTriangles) console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
		geometry.setIndex(newIndices);
		geometry.clearGroups();
		return geometry;
	} else {
		console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", drawMode);
		return geometry;
	}
}
//#endregion
//#region node_modules/three/examples/jsm/utils/SkeletonUtils.js
/**
* Clones the given 3D object and its descendants, ensuring that any `SkinnedMesh` instances are
* correctly associated with their bones. Bones are also cloned, and must be descendants of the
* object passed to this method. Other data, like geometries and materials, are reused by reference.
*
* @param {Object3D} source - The 3D object to clone.
* @return {Object3D} The cloned 3D object.
*/
function clone(source) {
	const sourceLookup = /* @__PURE__ */ new Map();
	const cloneLookup = /* @__PURE__ */ new Map();
	const clone = source.clone();
	parallelTraverse(source, clone, function(sourceNode, clonedNode) {
		sourceLookup.set(clonedNode, sourceNode);
		cloneLookup.set(sourceNode, clonedNode);
	});
	clone.traverse(function(node) {
		if (!node.isSkinnedMesh) return;
		const clonedMesh = node;
		const sourceMesh = sourceLookup.get(node);
		const sourceBones = sourceMesh.skeleton.bones;
		clonedMesh.skeleton = sourceMesh.skeleton.clone();
		clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);
		clonedMesh.skeleton.bones = sourceBones.map(function(bone) {
			return cloneLookup.get(bone);
		});
		clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
	});
	return clone;
}
function parallelTraverse(a, b, callback) {
	callback(a, b);
	for (let i = 0; i < a.children.length; i++) parallelTraverse(a.children[i], b.children[i], callback);
}
//#endregion
//#region node_modules/three/examples/jsm/loaders/GLTFLoader.js
/**
* A loader for the glTF 2.0 format.
*
* [glTF](https://www.khronos.org/gltf/) (GL Transmission Format) is an [open format specification]{@link https://github.com/KhronosGroup/glTF/tree/main/specification/2.0)
* for efficient delivery and loading of 3D content. Assets may be provided either in JSON (.gltf) or binary (.glb)
* format. External files store textures (.jpg, .png) and additional binary data (.bin). A glTF asset may deliver
* one or more scenes, including meshes, materials, textures, skins, skeletons, morph targets, animations, lights,
* and/or cameras.
*
* `GLTFLoader` uses {@link ImageBitmapLoader} whenever possible. Be advised that image bitmaps are not
* automatically GC-collected when they are no longer referenced, and they require special handling during
* the disposal process.
*
* `GLTFLoader` supports the following glTF 2.0 extensions:
* - KHR_draco_mesh_compression
* - KHR_lights_punctual
* - KHR_materials_anisotropy
* - KHR_materials_clearcoat
* - KHR_materials_dispersion
* - KHR_materials_emissive_strength
* - KHR_materials_ior
* - KHR_materials_specular
* - KHR_materials_transmission
* - KHR_materials_iridescence
* - KHR_materials_unlit
* - KHR_materials_volume
* - KHR_mesh_quantization
* - KHR_meshopt_compression
* - KHR_texture_basisu
* - KHR_texture_transform
* - EXT_materials_bump
* - EXT_meshopt_compression
* - EXT_mesh_gpu_instancing
* - EXT_texture_avif
* - EXT_texture_webp
*
* The following glTF 2.0 extensions are supported by separately registered plugins:
* - KHR_gaussian_splatting
* - [KHR_materials_variants](https://github.com/takahirox/three-gltf-extensions)
* - [MSFT_texture_dds](https://github.com/takahirox/three-gltf-extensions)
* - [KHR_animation_pointer](https://github.com/needle-tools/three-animation-pointer)
* - [NEEDLE_progressive](https://github.com/needle-tools/gltf-progressive)
*
* ```js
* const loader = new GLTFLoader();
*
* // Optional: Provide a DRACOLoader instance to decode compressed mesh data
* const dracoLoader = new DRACOLoader();
* dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
* loader.setDRACOLoader( dracoLoader );
*
* const gltf = await loader.loadAsync( 'models/gltf/duck/duck.gltf' );
* scene.add( gltf.scene );
* ```
*
* @augments Loader
* @three_import import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
*/
var GLTFLoader = class extends Loader {
	/**
	* Constructs a new glTF loader.
	*
	* @param {LoadingManager} [manager] - The loading manager.
	*/
	constructor(manager) {
		super(manager);
		this.dracoLoader = null;
		this.ktx2Loader = null;
		this.meshoptDecoder = null;
		this.pluginCallbacks = [];
		this.register(function(parser) {
			return new GLTFMaterialsClearcoatExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsDispersionExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFTextureBasisUExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFTextureWebPExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFTextureAVIFExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsSheenExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsTransmissionExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsVolumeExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsIorExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsEmissiveStrengthExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsSpecularExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsIridescenceExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsAnisotropyExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMaterialsBumpExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFLightsExtension(parser);
		});
		this.register(function(parser) {
			return new GLTFMeshoptCompression(parser, EXTENSIONS.EXT_MESHOPT_COMPRESSION);
		});
		this.register(function(parser) {
			return new GLTFMeshoptCompression(parser, EXTENSIONS.KHR_MESHOPT_COMPRESSION);
		});
		this.register(function(parser) {
			return new GLTFMeshGpuInstancing(parser);
		});
	}
	/**
	* Starts loading from the given URL and passes the loaded glTF asset
	* to the `onLoad()` callback.
	*
	* @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	* @param {function(GLTFLoader~LoadObject)} onLoad - Executed when the loading process has been finished.
	* @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	* @param {onErrorCallback} onError - Executed when errors occur.
	*/
	load(url, onLoad, onProgress, onError) {
		const scope = this;
		let resourcePath;
		if (this.resourcePath !== "") resourcePath = this.resourcePath;
		else if (this.path !== "") {
			const relativeUrl = LoaderUtils.extractUrlBase(url);
			resourcePath = LoaderUtils.resolveURL(relativeUrl, this.path);
		} else resourcePath = LoaderUtils.extractUrlBase(url);
		this.manager.itemStart(url);
		const _onError = function(e) {
			if (onError) onError(e);
			else console.error(e);
			scope.manager.itemError(url);
			scope.manager.itemEnd(url);
		};
		const loader = new FileLoader(this.manager);
		loader.setPath(this.path);
		loader.setResponseType("arraybuffer");
		loader.setRequestHeader(this.requestHeader);
		loader.setWithCredentials(this.withCredentials);
		loader.load(url, function(data) {
			try {
				scope.parse(data, resourcePath, function(gltf) {
					onLoad(gltf);
					scope.manager.itemEnd(url);
				}, _onError);
			} catch (e) {
				_onError(e);
			}
		}, onProgress, _onError);
	}
	/**
	* Sets the given Draco loader to this loader. Required for decoding assets
	* compressed with the `KHR_draco_mesh_compression` extension.
	*
	* @param {DRACOLoader} dracoLoader - The Draco loader to set.
	* @return {GLTFLoader} A reference to this loader.
	*/
	setDRACOLoader(dracoLoader) {
		this.dracoLoader = dracoLoader;
		return this;
	}
	/**
	* Sets the given KTX2 loader to this loader. Required for loading KTX2
	* compressed textures.
	*
	* @param {KTX2Loader} ktx2Loader - The KTX2 loader to set.
	* @return {GLTFLoader} A reference to this loader.
	*/
	setKTX2Loader(ktx2Loader) {
		this.ktx2Loader = ktx2Loader;
		return this;
	}
	/**
	* Sets the given meshopt decoder. Required for decoding assets
	* compressed with the `EXT_meshopt_compression` extension.
	*
	* @param {Object} meshoptDecoder - The meshopt decoder to set.
	* @return {GLTFLoader} A reference to this loader.
	*/
	setMeshoptDecoder(meshoptDecoder) {
		this.meshoptDecoder = meshoptDecoder;
		return this;
	}
	/**
	* Registers a plugin callback. This API is internally used to implement the various
	* glTF extensions but can also used by third-party code to add additional logic
	* to the loader.
	*
	* @param {function(parser:GLTFParser)} callback - The callback function to register.
	* @return {GLTFLoader} A reference to this loader.
	*/
	register(callback) {
		if (this.pluginCallbacks.indexOf(callback) === -1) this.pluginCallbacks.push(callback);
		return this;
	}
	/**
	* Unregisters a plugin callback.
	*
	* @param {Function} callback - The callback function to unregister.
	* @return {GLTFLoader} A reference to this loader.
	*/
	unregister(callback) {
		if (this.pluginCallbacks.indexOf(callback) !== -1) this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1);
		return this;
	}
	/**
	* Parses the given glTF data and returns the resulting group.
	*
	* @param {string|ArrayBuffer} data - The raw glTF data.
	* @param {string} path - The URL base path.
	* @param {function(GLTFLoader~LoadObject)} onLoad - Executed when the loading process has been finished.
	* @param {onErrorCallback} onError - Executed when errors occur.
	*/
	parse(data, path, onLoad, onError) {
		let json;
		const extensions = {};
		const plugins = {};
		const textDecoder = new TextDecoder();
		if (typeof data === "string") json = JSON.parse(data);
		else if (data instanceof ArrayBuffer) {
			if (textDecoder.decode(new Uint8Array(data, 0, 4)) === BINARY_EXTENSION_HEADER_MAGIC) {
				try {
					extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(data);
				} catch (error) {
					if (onError) onError(error);
					return;
				}
				json = JSON.parse(extensions[EXTENSIONS.KHR_BINARY_GLTF].content);
			} else json = JSON.parse(textDecoder.decode(data));
		} else json = data;
		if (json.asset === void 0 || json.asset.version[0] < 2) {
			if (onError) onError(/* @__PURE__ */ new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
			return;
		}
		const parser = new GLTFParser(json, {
			path: path || this.resourcePath || "",
			crossOrigin: this.crossOrigin,
			requestHeader: this.requestHeader,
			manager: this.manager,
			ktx2Loader: this.ktx2Loader,
			meshoptDecoder: this.meshoptDecoder
		});
		parser.fileLoader.setRequestHeader(this.requestHeader);
		for (let i = 0; i < this.pluginCallbacks.length; i++) {
			const plugin = this.pluginCallbacks[i](parser);
			if (!plugin.name) console.error("THREE.GLTFLoader: Invalid plugin found: missing name");
			plugins[plugin.name] = plugin;
			extensions[plugin.name] = true;
		}
		if (json.extensionsUsed) for (let i = 0; i < json.extensionsUsed.length; ++i) {
			const extensionName = json.extensionsUsed[i];
			const extensionsRequired = json.extensionsRequired || [];
			switch (extensionName) {
				case EXTENSIONS.KHR_MATERIALS_UNLIT:
					extensions[extensionName] = new GLTFMaterialsUnlitExtension();
					break;
				case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
					extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader);
					break;
				case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
					extensions[extensionName] = new GLTFTextureTransformExtension();
					break;
				case EXTENSIONS.KHR_MESH_QUANTIZATION:
					extensions[extensionName] = new GLTFMeshQuantizationExtension();
					break;
				default: if (extensionsRequired.indexOf(extensionName) >= 0 && plugins[extensionName] === void 0) console.warn("THREE.GLTFLoader: Unknown extension \"" + extensionName + "\".");
			}
		}
		parser.setExtensions(extensions);
		parser.setPlugins(plugins);
		parser.parse(onLoad, onError);
	}
	/**
	* Async version of {@link GLTFLoader#parse}.
	*
	* @async
	* @param {string|ArrayBuffer} data - The raw glTF data.
	* @param {string} path - The URL base path.
	* @return {Promise<GLTFLoader~LoadObject>} A Promise that resolves with the loaded glTF when the parsing has been finished.
	*/
	parseAsync(data, path) {
		const scope = this;
		return new Promise(function(resolve, reject) {
			scope.parse(data, path, resolve, reject);
		});
	}
};
function GLTFRegistry() {
	let objects = {};
	return {
		get: function(key) {
			return objects[key];
		},
		add: function(key, object) {
			objects[key] = object;
		},
		remove: function(key) {
			delete objects[key];
		},
		removeAll: function() {
			objects = {};
		}
	};
}
/********** EXTENSIONS ***********/
function getMaterialExtension(parser, materialIndex, extensionName) {
	const materialDef = parser.json.materials[materialIndex];
	if (materialDef.extensions && materialDef.extensions[extensionName]) return materialDef.extensions[extensionName];
	return null;
}
const EXTENSIONS = {
	KHR_BINARY_GLTF: "KHR_binary_glTF",
	KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
	KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
	KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
	KHR_MATERIALS_DISPERSION: "KHR_materials_dispersion",
	KHR_MATERIALS_IOR: "KHR_materials_ior",
	KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
	KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
	KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
	KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
	KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy",
	KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
	KHR_MATERIALS_VOLUME: "KHR_materials_volume",
	KHR_TEXTURE_BASISU: "KHR_texture_basisu",
	KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
	KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
	KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
	EXT_MATERIALS_BUMP: "EXT_materials_bump",
	EXT_TEXTURE_WEBP: "EXT_texture_webp",
	EXT_TEXTURE_AVIF: "EXT_texture_avif",
	EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
	KHR_MESHOPT_COMPRESSION: "KHR_meshopt_compression",
	EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
};
/**
* Punctual Lights Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
*
* @private
*/
var GLTFLightsExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;
		this.cache = {
			refs: {},
			uses: {}
		};
	}
	_markDefs() {
		const parser = this.parser;
		const nodeDefs = this.parser.json.nodes || [];
		for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
			const nodeDef = nodeDefs[nodeIndex];
			if (nodeDef.extensions && nodeDef.extensions[this.name] && nodeDef.extensions[this.name].light !== void 0) parser._addNodeRef(this.cache, nodeDef.extensions[this.name].light);
		}
	}
	_loadLight(lightIndex) {
		const parser = this.parser;
		const cacheKey = "light:" + lightIndex;
		let dependency = parser.cache.get(cacheKey);
		if (dependency) return dependency;
		const json = parser.json;
		const lightDef = ((json.extensions && json.extensions[this.name] || {}).lights || [])[lightIndex];
		let lightNode;
		const color = new Color(16777215);
		if (lightDef.color !== void 0) color.setRGB(lightDef.color[0], lightDef.color[1], lightDef.color[2], LinearSRGBColorSpace);
		const range = lightDef.range !== void 0 ? lightDef.range : 0;
		switch (lightDef.type) {
			case "directional":
				lightNode = new DirectionalLight(color);
				lightNode.target.position.set(0, 0, -1);
				lightNode.add(lightNode.target);
				break;
			case "point":
				lightNode = new PointLight(color);
				lightNode.distance = range;
				break;
			case "spot":
				lightNode = new SpotLight(color);
				lightNode.distance = range;
				lightDef.spot = lightDef.spot || {};
				lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== void 0 ? lightDef.spot.innerConeAngle : 0;
				lightDef.spot.outerConeAngle = lightDef.spot.outerConeAngle !== void 0 ? lightDef.spot.outerConeAngle : Math.PI / 4;
				lightNode.angle = lightDef.spot.outerConeAngle;
				lightNode.penumbra = 1 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
				lightNode.target.position.set(0, 0, -1);
				lightNode.add(lightNode.target);
				break;
			default: throw new Error("THREE.GLTFLoader: Unexpected light type: " + lightDef.type);
		}
		lightNode.position.set(0, 0, 0);
		assignExtrasToUserData(lightNode, lightDef);
		if (lightDef.intensity !== void 0) lightNode.intensity = lightDef.intensity;
		lightNode.name = parser.createUniqueName(lightDef.name || "light_" + lightIndex);
		dependency = Promise.resolve(lightNode);
		parser.cache.add(cacheKey, dependency);
		return dependency;
	}
	getDependency(type, index) {
		if (type !== "light") return;
		return this._loadLight(index);
	}
	createNodeAttachment(nodeIndex) {
		const self = this;
		const parser = this.parser;
		const nodeDef = parser.json.nodes[nodeIndex];
		const lightIndex = (nodeDef.extensions && nodeDef.extensions[this.name] || {}).light;
		if (lightIndex === void 0) return null;
		return this._loadLight(lightIndex).then(function(light) {
			return parser._getNodeRef(self.cache, lightIndex, light);
		});
	}
};
/**
* Unlit Materials Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
*
* @private
*/
var GLTFMaterialsUnlitExtension = class {
	constructor() {
		this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;
	}
	getMaterialType() {
		return MeshBasicMaterial;
	}
	extendParams(materialParams, materialDef, parser) {
		const pending = [];
		materialParams.color = new Color(1, 1, 1);
		materialParams.opacity = 1;
		const metallicRoughness = materialDef.pbrMetallicRoughness;
		if (metallicRoughness) {
			if (Array.isArray(metallicRoughness.baseColorFactor)) {
				const array = metallicRoughness.baseColorFactor;
				materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace);
				materialParams.opacity = array[3];
			}
			if (metallicRoughness.baseColorTexture !== void 0) pending.push(parser.assignTexture(materialParams, "map", metallicRoughness.baseColorTexture, SRGBColorSpace));
		}
		return Promise.all(pending);
	}
};
/**
* Materials Emissive Strength Extension
*
* Specification: https://github.com/KhronosGroup/glTF/blob/5768b3ce0ef32bc39cdf1bef10b948586635ead3/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md
*
* @private
*/
var GLTFMaterialsEmissiveStrengthExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		if (extension.emissiveStrength !== void 0) materialParams.emissiveIntensity = extension.emissiveStrength;
		return Promise.resolve();
	}
};
/**
* Clearcoat Materials Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
*
* @private
*/
var GLTFMaterialsClearcoatExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		if (extension.clearcoatFactor !== void 0) materialParams.clearcoat = extension.clearcoatFactor;
		if (extension.clearcoatTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "clearcoatMap", extension.clearcoatTexture));
		if (extension.clearcoatRoughnessFactor !== void 0) materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;
		if (extension.clearcoatRoughnessTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "clearcoatRoughnessMap", extension.clearcoatRoughnessTexture));
		if (extension.clearcoatNormalTexture !== void 0) {
			pending.push(this.parser.assignTexture(materialParams, "clearcoatNormalMap", extension.clearcoatNormalTexture));
			if (extension.clearcoatNormalTexture.scale !== void 0) {
				const scale = extension.clearcoatNormalTexture.scale;
				materialParams.clearcoatNormalScale = new Vector2(scale, scale);
			}
		}
		return Promise.all(pending);
	}
};
/**
* Materials dispersion Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_dispersion
*
* @private
*/
var GLTFMaterialsDispersionExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_DISPERSION;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		materialParams.dispersion = extension.dispersion !== void 0 ? extension.dispersion : 0;
		return Promise.resolve();
	}
};
/**
* Iridescence Materials Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
*
* @private
*/
var GLTFMaterialsIridescenceExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_IRIDESCENCE;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		if (extension.iridescenceFactor !== void 0) materialParams.iridescence = extension.iridescenceFactor;
		if (extension.iridescenceTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "iridescenceMap", extension.iridescenceTexture));
		if (extension.iridescenceIor !== void 0) materialParams.iridescenceIOR = extension.iridescenceIor;
		if (materialParams.iridescenceThicknessRange === void 0) materialParams.iridescenceThicknessRange = [100, 400];
		if (extension.iridescenceThicknessMinimum !== void 0) materialParams.iridescenceThicknessRange[0] = extension.iridescenceThicknessMinimum;
		if (extension.iridescenceThicknessMaximum !== void 0) materialParams.iridescenceThicknessRange[1] = extension.iridescenceThicknessMaximum;
		if (extension.iridescenceThicknessTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "iridescenceThicknessMap", extension.iridescenceThicknessTexture));
		return Promise.all(pending);
	}
};
/**
* Sheen Materials Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
*
* @private
*/
var GLTFMaterialsSheenExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_SHEEN;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		materialParams.sheenColor = new Color(0, 0, 0);
		materialParams.sheenRoughness = 0;
		materialParams.sheen = 1;
		if (extension.sheenColorFactor !== void 0) {
			const colorFactor = extension.sheenColorFactor;
			materialParams.sheenColor.setRGB(colorFactor[0], colorFactor[1], colorFactor[2], LinearSRGBColorSpace);
		}
		if (extension.sheenRoughnessFactor !== void 0) materialParams.sheenRoughness = extension.sheenRoughnessFactor;
		if (extension.sheenColorTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "sheenColorMap", extension.sheenColorTexture, SRGBColorSpace));
		if (extension.sheenRoughnessTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "sheenRoughnessMap", extension.sheenRoughnessTexture));
		return Promise.all(pending);
	}
};
/**
* Transmission Materials Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
* Draft: https://github.com/KhronosGroup/glTF/pull/1698
*
* @private
*/
var GLTFMaterialsTransmissionExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		if (extension.transmissionFactor !== void 0) materialParams.transmission = extension.transmissionFactor;
		if (extension.transmissionTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "transmissionMap", extension.transmissionTexture));
		return Promise.all(pending);
	}
};
/**
* Materials Volume Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
*
* @private
*/
var GLTFMaterialsVolumeExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_VOLUME;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		materialParams.thickness = extension.thicknessFactor !== void 0 ? extension.thicknessFactor : 0;
		if (extension.thicknessTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "thicknessMap", extension.thicknessTexture));
		materialParams.attenuationDistance = extension.attenuationDistance || Infinity;
		const colorArray = extension.attenuationColor || [
			1,
			1,
			1
		];
		materialParams.attenuationColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace);
		return Promise.all(pending);
	}
};
/**
* Materials ior Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
*
* @private
*/
var GLTFMaterialsIorExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_IOR;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		materialParams.ior = extension.ior !== void 0 ? extension.ior : 1.5;
		if (materialParams.ior === 0) materialParams.ior = 1e3;
		return Promise.resolve();
	}
};
/**
* Materials specular Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
*
* @private
*/
var GLTFMaterialsSpecularExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_SPECULAR;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		materialParams.specularIntensity = extension.specularFactor !== void 0 ? extension.specularFactor : 1;
		if (extension.specularTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "specularIntensityMap", extension.specularTexture));
		const colorArray = extension.specularColorFactor || [
			1,
			1,
			1
		];
		materialParams.specularColor = new Color().setRGB(colorArray[0], colorArray[1], colorArray[2], LinearSRGBColorSpace);
		if (extension.specularColorTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "specularColorMap", extension.specularColorTexture, SRGBColorSpace));
		return Promise.all(pending);
	}
};
/**
* Materials bump Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/EXT_materials_bump
*
* @private
*/
var GLTFMaterialsBumpExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.EXT_MATERIALS_BUMP;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		materialParams.bumpScale = extension.bumpFactor !== void 0 ? extension.bumpFactor : 1;
		if (extension.bumpTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "bumpMap", extension.bumpTexture));
		return Promise.all(pending);
	}
};
/**
* Materials anisotropy Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_anisotropy
*
* @private
*/
var GLTFMaterialsAnisotropyExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_MATERIALS_ANISOTROPY;
	}
	getMaterialType(materialIndex) {
		return getMaterialExtension(this.parser, materialIndex, this.name) !== null ? MeshPhysicalMaterial : null;
	}
	extendMaterialParams(materialIndex, materialParams) {
		const extension = getMaterialExtension(this.parser, materialIndex, this.name);
		if (extension === null) return Promise.resolve();
		const pending = [];
		if (extension.anisotropyStrength !== void 0) materialParams.anisotropy = extension.anisotropyStrength;
		if (extension.anisotropyRotation !== void 0) materialParams.anisotropyRotation = extension.anisotropyRotation;
		if (extension.anisotropyTexture !== void 0) pending.push(this.parser.assignTexture(materialParams, "anisotropyMap", extension.anisotropyTexture));
		return Promise.all(pending);
	}
};
/**
* BasisU Texture Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_basisu
*
* @private
*/
var GLTFTextureBasisUExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.KHR_TEXTURE_BASISU;
	}
	loadTexture(textureIndex) {
		const parser = this.parser;
		const json = parser.json;
		const textureDef = json.textures[textureIndex];
		if (!textureDef.extensions || !textureDef.extensions[this.name]) return null;
		const extension = textureDef.extensions[this.name];
		const loader = parser.options.ktx2Loader;
		if (!loader) {
			if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
			else return null;
		}
		return parser.loadTextureImage(textureIndex, extension.source, loader);
	}
};
/**
* WebP Texture Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_webp
*
* @private
*/
var GLTFTextureWebPExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.EXT_TEXTURE_WEBP;
	}
	loadTexture(textureIndex) {
		const name = this.name;
		const parser = this.parser;
		const json = parser.json;
		const textureDef = json.textures[textureIndex];
		if (!textureDef.extensions || !textureDef.extensions[name]) return null;
		const extension = textureDef.extensions[name];
		const source = json.images[extension.source];
		let loader = parser.textureLoader;
		if (source.uri) {
			const handler = parser.options.manager.getHandler(source.uri);
			if (handler !== null) loader = handler;
		}
		return parser.loadTextureImage(textureIndex, extension.source, loader);
	}
};
/**
* AVIF Texture Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_avif
*
* @private
*/
var GLTFTextureAVIFExtension = class {
	constructor(parser) {
		this.parser = parser;
		this.name = EXTENSIONS.EXT_TEXTURE_AVIF;
	}
	loadTexture(textureIndex) {
		const name = this.name;
		const parser = this.parser;
		const json = parser.json;
		const textureDef = json.textures[textureIndex];
		if (!textureDef.extensions || !textureDef.extensions[name]) return null;
		const extension = textureDef.extensions[name];
		const source = json.images[extension.source];
		let loader = parser.textureLoader;
		if (source.uri) {
			const handler = parser.options.manager.getHandler(source.uri);
			if (handler !== null) loader = handler;
		}
		return parser.loadTextureImage(textureIndex, extension.source, loader);
	}
};
/**
* meshopt BufferView Compression Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
*
* @private
*/
var GLTFMeshoptCompression = class {
	constructor(parser, name) {
		this.name = name;
		this.parser = parser;
	}
	loadBufferView(index) {
		const json = this.parser.json;
		const bufferView = json.bufferViews[index];
		if (bufferView.extensions && bufferView.extensions[this.name]) {
			const extensionDef = bufferView.extensions[this.name];
			const buffer = this.parser.getDependency("buffer", extensionDef.buffer);
			const decoder = this.parser.options.meshoptDecoder;
			if (!decoder || !decoder.supported) {
				if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
				else return null;
			}
			return buffer.then(function(res) {
				const byteOffset = extensionDef.byteOffset || 0;
				const byteLength = extensionDef.byteLength || 0;
				const count = extensionDef.count;
				const stride = extensionDef.byteStride;
				const source = new Uint8Array(res, byteOffset, byteLength);
				if (decoder.decodeGltfBufferAsync) return decoder.decodeGltfBufferAsync(count, stride, source, extensionDef.mode, extensionDef.filter).then(function(res) {
					return res.buffer;
				});
				else return decoder.ready.then(function() {
					const result = new ArrayBuffer(count * stride);
					decoder.decodeGltfBuffer(new Uint8Array(result), count, stride, source, extensionDef.mode, extensionDef.filter);
					return result;
				});
			});
		} else return null;
	}
};
/**
* GPU Instancing Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_mesh_gpu_instancing
*
* @private
*/
var GLTFMeshGpuInstancing = class {
	constructor(parser) {
		this.name = EXTENSIONS.EXT_MESH_GPU_INSTANCING;
		this.parser = parser;
	}
	createNodeMesh(nodeIndex) {
		const json = this.parser.json;
		const nodeDef = json.nodes[nodeIndex];
		if (!nodeDef.extensions || !nodeDef.extensions[this.name] || nodeDef.mesh === void 0) return null;
		const meshDef = json.meshes[nodeDef.mesh];
		for (const primitive of meshDef.primitives) if (primitive.mode !== WEBGL_CONSTANTS.TRIANGLES && primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_STRIP && primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_FAN && primitive.mode !== void 0) return null;
		const attributesDef = nodeDef.extensions[this.name].attributes;
		const pending = [];
		const attributes = {};
		for (const key in attributesDef) pending.push(this.parser.getDependency("accessor", attributesDef[key]).then((accessor) => {
			attributes[key] = accessor;
			return attributes[key];
		}));
		if (pending.length < 1) return null;
		pending.push(this.parser.createNodeMesh(nodeIndex));
		return Promise.all(pending).then((results) => {
			const nodeObject = results.pop();
			const meshes = nodeObject.isGroup ? nodeObject.children : [nodeObject];
			const count = results[0].count;
			const instancedMeshes = [];
			for (const mesh of meshes) {
				const m = new Matrix4();
				const p = new Vector3();
				const q = new Quaternion();
				const s = new Vector3(1, 1, 1);
				const instancedMesh = new InstancedMesh(mesh.geometry, mesh.material, count);
				for (let i = 0; i < count; i++) {
					if (attributes.TRANSLATION) p.fromBufferAttribute(attributes.TRANSLATION, i);
					if (attributes.ROTATION) q.fromBufferAttribute(attributes.ROTATION, i);
					if (attributes.SCALE) s.fromBufferAttribute(attributes.SCALE, i);
					instancedMesh.setMatrixAt(i, m.compose(p, q, s));
				}
				let instanceGeometry = null;
				for (const attributeName in attributes) if (attributeName === "_COLOR_0") {
					const attr = attributes[attributeName];
					instancedMesh.instanceColor = new InstancedBufferAttribute(attr.array, attr.itemSize, attr.normalized);
				} else if (attributeName !== "TRANSLATION" && attributeName !== "ROTATION" && attributeName !== "SCALE") {
					if (instanceGeometry === null) {
						const source = instancedMesh.geometry;
						instanceGeometry = new BufferGeometry();
						instanceGeometry.name = source.name;
						for (const name in source.attributes) instanceGeometry.setAttribute(name, source.attributes[name]);
						for (const name in source.morphAttributes) instanceGeometry.morphAttributes[name] = source.morphAttributes[name];
						if (source.index !== null) instanceGeometry.setIndex(source.index);
						instanceGeometry.morphTargetsRelative = source.morphTargetsRelative;
						for (const group of source.groups) instanceGeometry.addGroup(group.start, group.count, group.materialIndex);
						if (source.boundingBox !== null) instanceGeometry.boundingBox = source.boundingBox.clone();
						if (source.boundingSphere !== null) instanceGeometry.boundingSphere = source.boundingSphere.clone();
						instanceGeometry.drawRange.start = source.drawRange.start;
						instanceGeometry.drawRange.count = source.drawRange.count;
						instanceGeometry.userData = Object.assign({}, source.userData);
						instancedMesh.geometry = instanceGeometry;
					}
					const attr = attributes[attributeName];
					instanceGeometry.setAttribute(attributeName, new InstancedBufferAttribute(attr.array, attr.itemSize, attr.normalized));
				}
				Object3D.prototype.copy.call(instancedMesh, mesh);
				this.parser.assignFinalMaterial(instancedMesh);
				instancedMeshes.push(instancedMesh);
			}
			if (nodeObject.isGroup) {
				nodeObject.clear();
				nodeObject.add(...instancedMeshes);
				return nodeObject;
			}
			return instancedMeshes[0];
		});
	}
};
const BINARY_EXTENSION_HEADER_MAGIC = "glTF";
const BINARY_EXTENSION_HEADER_LENGTH = 12;
const BINARY_EXTENSION_CHUNK_TYPES = {
	JSON: 1313821514,
	BIN: 5130562
};
var GLTFBinaryExtension = class {
	constructor(data) {
		this.name = EXTENSIONS.KHR_BINARY_GLTF;
		this.content = null;
		this.body = null;
		const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);
		const textDecoder = new TextDecoder();
		this.header = {
			magic: textDecoder.decode(new Uint8Array(data.slice(0, 4))),
			version: headerView.getUint32(4, true),
			length: headerView.getUint32(8, true)
		};
		if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
		else if (this.header.version < 2) throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
		const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH;
		const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
		let chunkIndex = 0;
		while (chunkIndex < chunkContentsLength) {
			const chunkLength = chunkView.getUint32(chunkIndex, true);
			chunkIndex += 4;
			const chunkType = chunkView.getUint32(chunkIndex, true);
			chunkIndex += 4;
			if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
				const contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength);
				this.content = textDecoder.decode(contentArray);
			} else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
				const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
				this.body = data.slice(byteOffset, byteOffset + chunkLength);
			}
			chunkIndex += chunkLength;
		}
		if (this.content === null) throw new Error("THREE.GLTFLoader: JSON content not found.");
	}
};
/**
* DRACO Mesh Compression Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
*
* @private
*/
var GLTFDracoMeshCompressionExtension = class {
	constructor(json, dracoLoader) {
		if (!dracoLoader) throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
		this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
		this.json = json;
		this.dracoLoader = dracoLoader;
		this.dracoLoader.preload();
	}
	decodePrimitive(primitive, parser) {
		const json = this.json;
		const dracoLoader = this.dracoLoader;
		const bufferViewIndex = primitive.extensions[this.name].bufferView;
		const gltfAttributeMap = primitive.extensions[this.name].attributes;
		const threeAttributeMap = {};
		const attributeNormalizedMap = {};
		const attributeTypeMap = {};
		for (const attributeName in gltfAttributeMap) {
			const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
			threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName];
		}
		for (const attributeName in primitive.attributes) {
			const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase();
			if (gltfAttributeMap[attributeName] !== void 0) {
				const accessorDef = json.accessors[primitive.attributes[attributeName]];
				attributeTypeMap[threeAttributeName] = WEBGL_COMPONENT_TYPES[accessorDef.componentType].name;
				attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true;
			}
		}
		return parser.getDependency("bufferView", bufferViewIndex).then(function(bufferView) {
			return new Promise(function(resolve, reject) {
				dracoLoader.decodeDracoFile(bufferView, function(geometry) {
					for (const attributeName in geometry.attributes) {
						const attribute = geometry.attributes[attributeName];
						const normalized = attributeNormalizedMap[attributeName];
						if (normalized !== void 0) attribute.normalized = normalized;
					}
					resolve(geometry);
				}, threeAttributeMap, attributeTypeMap, LinearSRGBColorSpace, reject);
			});
		});
	}
};
/**
* Texture Transform Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
*
* @private
*/
var GLTFTextureTransformExtension = class {
	constructor() {
		this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;
	}
	extendTexture(texture, transform) {
		if ((transform.texCoord === void 0 || transform.texCoord === texture.channel) && transform.offset === void 0 && transform.rotation === void 0 && transform.scale === void 0) return texture;
		texture = texture.clone();
		if (transform.texCoord !== void 0) texture.channel = transform.texCoord;
		if (transform.offset !== void 0) texture.offset.fromArray(transform.offset);
		if (transform.rotation !== void 0) texture.rotation = transform.rotation;
		if (transform.scale !== void 0) texture.repeat.fromArray(transform.scale);
		if (transform.rotation !== void 0) {
			const c = Math.cos(texture.rotation);
			const s = Math.sin(texture.rotation);
			texture.matrix.set(texture.repeat.x * c, texture.repeat.y * s, texture.offset.x, -texture.repeat.x * s, texture.repeat.y * c, texture.offset.y, 0, 0, 1);
			texture.matrixAutoUpdate = false;
		}
		texture.needsUpdate = true;
		return texture;
	}
};
/**
* Mesh Quantization Extension
*
* Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization
*
* @private
*/
var GLTFMeshQuantizationExtension = class {
	constructor() {
		this.name = EXTENSIONS.KHR_MESH_QUANTIZATION;
	}
};
/********** INTERPOLATION ********/
var GLTFCubicSplineInterpolant = class extends Interpolant {
	constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
		super(parameterPositions, sampleValues, sampleSize, resultBuffer);
	}
	copySampleValue_(index) {
		const result = this.resultBuffer, values = this.sampleValues, valueSize = this.valueSize, offset = index * valueSize * 3 + valueSize;
		for (let i = 0; i !== valueSize; i++) result[i] = values[offset + i];
		return result;
	}
	interpolate_(i1, t0, t, t1) {
		const result = this.resultBuffer;
		const values = this.sampleValues;
		const stride = this.valueSize;
		const stride2 = stride * 2;
		const stride3 = stride * 3;
		const td = t1 - t0;
		const p = (t - t0) / td;
		const pp = p * p;
		const ppp = pp * p;
		const offset1 = i1 * stride3;
		const offset0 = offset1 - stride3;
		const s2 = -2 * ppp + 3 * pp;
		const s3 = ppp - pp;
		const s0 = 1 - s2;
		const s1 = s3 - pp + p;
		for (let i = 0; i !== stride; i++) {
			const p0 = values[offset0 + i + stride];
			const m0 = values[offset0 + i + stride2] * td;
			const p1 = values[offset1 + i + stride];
			const m1 = values[offset1 + i] * td;
			result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;
		}
		return result;
	}
};
const _quaternion = new Quaternion();
var GLTFCubicSplineQuaternionInterpolant = class extends GLTFCubicSplineInterpolant {
	interpolate_(i1, t0, t, t1) {
		const result = super.interpolate_(i1, t0, t, t1);
		_quaternion.fromArray(result).normalize().toArray(result);
		return result;
	}
};
/********** INTERNALS ************/
const WEBGL_CONSTANTS = {
	FLOAT: 5126,
	FLOAT_MAT3: 35675,
	FLOAT_MAT4: 35676,
	FLOAT_VEC2: 35664,
	FLOAT_VEC3: 35665,
	FLOAT_VEC4: 35666,
	LINEAR: 9729,
	REPEAT: 10497,
	SAMPLER_2D: 35678,
	POINTS: 0,
	LINES: 1,
	LINE_LOOP: 2,
	LINE_STRIP: 3,
	TRIANGLES: 4,
	TRIANGLE_STRIP: 5,
	TRIANGLE_FAN: 6,
	UNSIGNED_BYTE: 5121,
	UNSIGNED_SHORT: 5123
};
const WEBGL_COMPONENT_TYPES = {
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array
};
const WEBGL_FILTERS = {
	9728: NearestFilter,
	9729: LinearFilter,
	9984: NearestMipmapNearestFilter,
	9985: LinearMipmapNearestFilter,
	9986: NearestMipmapLinearFilter,
	9987: LinearMipmapLinearFilter
};
const WEBGL_WRAPPINGS = {
	33071: ClampToEdgeWrapping,
	33648: MirroredRepeatWrapping,
	10497: RepeatWrapping
};
const WEBGL_TYPE_SIZES = {
	"SCALAR": 1,
	"VEC2": 2,
	"VEC3": 3,
	"VEC4": 4,
	"MAT2": 4,
	"MAT3": 9,
	"MAT4": 16
};
const ATTRIBUTES = {
	POSITION: "position",
	NORMAL: "normal",
	TANGENT: "tangent",
	TEXCOORD_0: "uv",
	TEXCOORD_1: "uv1",
	TEXCOORD_2: "uv2",
	TEXCOORD_3: "uv3",
	COLOR_0: "color",
	WEIGHTS_0: "skinWeight",
	JOINTS_0: "skinIndex"
};
const PATH_PROPERTIES = {
	scale: "scale",
	translation: "position",
	rotation: "quaternion",
	weights: "morphTargetInfluences"
};
const INTERPOLATION = {
	CUBICSPLINE: void 0,
	LINEAR: InterpolateLinear,
	STEP: InterpolateDiscrete
};
const ALPHA_MODES = {
	OPAQUE: "OPAQUE",
	MASK: "MASK",
	BLEND: "BLEND"
};
/**
* Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
*
* @private
* @param {Object<string, Material>} cache
* @return {Material}
*/
function createDefaultMaterial(cache) {
	if (cache["DefaultMaterial"] === void 0) cache["DefaultMaterial"] = new MeshStandardMaterial({
		color: 16777215,
		emissive: 0,
		metalness: 1,
		roughness: 1,
		transparent: false,
		depthTest: true,
		side: 0
	});
	return cache["DefaultMaterial"];
}
function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {
	for (const name in objectDef.extensions) if (knownExtensions[name] === void 0) {
		object.userData.gltfExtensions = object.userData.gltfExtensions || {};
		object.userData.gltfExtensions[name] = objectDef.extensions[name];
	}
}
/**
*
* @private
* @param {Object3D|Material|BufferGeometry|Object|AnimationClip} object
* @param {GLTF.definition} gltfDef
*/
function assignExtrasToUserData(object, gltfDef) {
	if (gltfDef.extras !== void 0) {
		if (typeof gltfDef.extras === "object") Object.assign(object.userData, gltfDef.extras);
		else console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + gltfDef.extras);
	}
}
/**
* Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
*
* @private
* @param {BufferGeometry} geometry
* @param {Array<GLTF.Target>} targets
* @param {GLTFParser} parser
* @return {Promise<BufferGeometry>}
*/
function addMorphTargets(geometry, targets, parser) {
	let hasMorphPosition = false;
	let hasMorphNormal = false;
	let hasMorphColor = false;
	for (let i = 0, il = targets.length; i < il; i++) {
		const target = targets[i];
		if (target.POSITION !== void 0) hasMorphPosition = true;
		if (target.NORMAL !== void 0) hasMorphNormal = true;
		if (target.COLOR_0 !== void 0) hasMorphColor = true;
		if (hasMorphPosition && hasMorphNormal && hasMorphColor) break;
	}
	if (!hasMorphPosition && !hasMorphNormal && !hasMorphColor) return Promise.resolve(geometry);
	const pendingPositionAccessors = [];
	const pendingNormalAccessors = [];
	const pendingColorAccessors = [];
	for (let i = 0, il = targets.length; i < il; i++) {
		const target = targets[i];
		if (hasMorphPosition) {
			const pendingAccessor = target.POSITION !== void 0 ? parser.getDependency("accessor", target.POSITION) : geometry.attributes.position;
			pendingPositionAccessors.push(pendingAccessor);
		}
		if (hasMorphNormal) {
			const pendingAccessor = target.NORMAL !== void 0 ? parser.getDependency("accessor", target.NORMAL) : geometry.attributes.normal;
			pendingNormalAccessors.push(pendingAccessor);
		}
		if (hasMorphColor) {
			const pendingAccessor = target.COLOR_0 !== void 0 ? parser.getDependency("accessor", target.COLOR_0) : geometry.attributes.color;
			pendingColorAccessors.push(pendingAccessor);
		}
	}
	return Promise.all([
		Promise.all(pendingPositionAccessors),
		Promise.all(pendingNormalAccessors),
		Promise.all(pendingColorAccessors)
	]).then(function(accessors) {
		const morphPositions = accessors[0];
		const morphNormals = accessors[1];
		const morphColors = accessors[2];
		if (hasMorphPosition) geometry.morphAttributes.position = morphPositions;
		if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals;
		if (hasMorphColor) geometry.morphAttributes.color = morphColors;
		geometry.morphTargetsRelative = true;
		return geometry;
	});
}
/**
*
* @private
* @param {Mesh} mesh
* @param {GLTF.Mesh} meshDef
*/
function updateMorphTargets(mesh, meshDef) {
	mesh.updateMorphTargets();
	if (meshDef.weights !== void 0) for (let i = 0, il = meshDef.weights.length; i < il; i++) mesh.morphTargetInfluences[i] = meshDef.weights[i];
	if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
		const targetNames = meshDef.extras.targetNames;
		if (mesh.morphTargetInfluences.length === targetNames.length) {
			mesh.morphTargetDictionary = {};
			for (let i = 0, il = targetNames.length; i < il; i++) mesh.morphTargetDictionary[targetNames[i]] = i;
		} else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
	}
}
function createPrimitiveKey(primitiveDef) {
	let geometryKey;
	const dracoExtension = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];
	if (dracoExtension) geometryKey = "draco:" + dracoExtension.bufferView + ":" + dracoExtension.indices + ":" + createAttributesKey(dracoExtension.attributes);
	else geometryKey = primitiveDef.indices + ":" + createAttributesKey(primitiveDef.attributes) + ":" + primitiveDef.mode;
	if (primitiveDef.targets !== void 0) for (let i = 0, il = primitiveDef.targets.length; i < il; i++) geometryKey += ":" + createAttributesKey(primitiveDef.targets[i]);
	return geometryKey;
}
function createAttributesKey(attributes) {
	let attributesKey = "";
	const keys = Object.keys(attributes).sort();
	for (let i = 0, il = keys.length; i < il; i++) attributesKey += keys[i] + ":" + attributes[keys[i]] + ";";
	return attributesKey;
}
function getNormalizedComponentScale(constructor) {
	switch (constructor) {
		case Int8Array: return 1 / 127;
		case Uint8Array: return 1 / 255;
		case Int16Array: return 1 / 32767;
		case Uint16Array: return 1 / 65535;
		default: throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
	}
}
function getImageURIMimeType(uri) {
	if (uri.search(/\.jpe?g($|\?)/i) > 0 || uri.search(/^data\:image\/jpeg/) === 0) return "image/jpeg";
	if (uri.search(/\.webp($|\?)/i) > 0 || uri.search(/^data\:image\/webp/) === 0) return "image/webp";
	if (uri.search(/\.ktx2($|\?)/i) > 0 || uri.search(/^data\:image\/ktx2/) === 0) return "image/ktx2";
	return "image/png";
}
const _identityMatrix = new Matrix4();
var GLTFParser = class {
	constructor(json = {}, options = {}) {
		this.json = json;
		this.extensions = {};
		this.plugins = {};
		this.options = options;
		this.cache = new GLTFRegistry();
		this.associations = /* @__PURE__ */ new Map();
		this.primitiveCache = {};
		this.nodeCache = {};
		this.meshCache = {
			refs: {},
			uses: {}
		};
		this.cameraCache = {
			refs: {},
			uses: {}
		};
		this.lightCache = {
			refs: {},
			uses: {}
		};
		this.sourceCache = {};
		this.textureCache = {};
		this.nodeNamesUsed = {};
		let isSafari = false;
		let safariVersion = -1;
		let isFirefox = false;
		let firefoxVersion = -1;
		if (typeof navigator !== "undefined" && typeof navigator.userAgent !== "undefined") {
			const userAgent = navigator.userAgent;
			isSafari = /^((?!chrome|android).)*safari/i.test(userAgent) === true;
			const safariMatch = userAgent.match(/Version\/(\d+)/);
			safariVersion = isSafari && safariMatch ? parseInt(safariMatch[1], 10) : -1;
			isFirefox = userAgent.indexOf("Firefox") > -1;
			firefoxVersion = isFirefox ? userAgent.match(/Firefox\/([0-9]+)\./)[1] : -1;
		}
		if (typeof createImageBitmap === "undefined" || isSafari && safariVersion < 17 || isFirefox && firefoxVersion < 98) this.textureLoader = new TextureLoader(this.options.manager);
		else this.textureLoader = new ImageBitmapLoader(this.options.manager);
		this.textureLoader.setCrossOrigin(this.options.crossOrigin);
		this.textureLoader.setRequestHeader(this.options.requestHeader);
		this.fileLoader = new FileLoader(this.options.manager);
		this.fileLoader.setResponseType("arraybuffer");
		if (this.options.crossOrigin === "use-credentials") this.fileLoader.setWithCredentials(true);
	}
	setExtensions(extensions) {
		this.extensions = extensions;
	}
	setPlugins(plugins) {
		this.plugins = plugins;
	}
	parse(onLoad, onError) {
		const parser = this;
		const json = this.json;
		const extensions = this.extensions;
		this.cache.removeAll();
		this.nodeCache = {};
		this._invokeAll(function(ext) {
			return ext._markDefs && ext._markDefs();
		});
		Promise.all(this._invokeAll(function(ext) {
			return ext.beforeRoot && ext.beforeRoot();
		})).then(function() {
			return Promise.all([
				parser.getDependencies("scene"),
				parser.getDependencies("animation"),
				parser.getDependencies("camera")
			]);
		}).then(function(dependencies) {
			const result = {
				scene: dependencies[0][json.scene || 0],
				scenes: dependencies[0],
				animations: dependencies[1],
				cameras: dependencies[2],
				asset: json.asset,
				parser,
				userData: {}
			};
			addUnknownExtensionsToUserData(extensions, result, json);
			assignExtrasToUserData(result, json);
			return Promise.all(parser._invokeAll(function(ext) {
				return ext.afterRoot && ext.afterRoot(result);
			})).then(function() {
				for (const scene of result.scenes) scene.updateMatrixWorld();
				onLoad(result);
			});
		}).catch(onError);
	}
	/**
	* Marks the special nodes/meshes in json for efficient parse.
	*
	* @private
	*/
	_markDefs() {
		const nodeDefs = this.json.nodes || [];
		const skinDefs = this.json.skins || [];
		const meshDefs = this.json.meshes || [];
		for (let skinIndex = 0, skinLength = skinDefs.length; skinIndex < skinLength; skinIndex++) {
			const joints = skinDefs[skinIndex].joints;
			for (let i = 0, il = joints.length; i < il; i++) nodeDefs[joints[i]].isBone = true;
		}
		for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
			const nodeDef = nodeDefs[nodeIndex];
			if (nodeDef.mesh !== void 0) {
				this._addNodeRef(this.meshCache, nodeDef.mesh);
				if (nodeDef.skin !== void 0) meshDefs[nodeDef.mesh].isSkinnedMesh = true;
			}
			if (nodeDef.camera !== void 0) this._addNodeRef(this.cameraCache, nodeDef.camera);
		}
	}
	/**
	* Counts references to shared node / Object3D resources. These resources
	* can be reused, or "instantiated", at multiple nodes in the scene
	* hierarchy. Mesh, Camera, and Light instances are instantiated and must
	* be marked. Non-scenegraph resources (like Materials, Geometries, and
	* Textures) can be reused directly and are not marked here.
	*
	* Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
	*
	* @private
	* @param {Object} cache
	* @param {Object3D} index
	*/
	_addNodeRef(cache, index) {
		if (index === void 0) return;
		if (cache.refs[index] === void 0) cache.refs[index] = cache.uses[index] = 0;
		cache.refs[index]++;
	}
	/**
	* Returns a reference to a shared resource, cloning it if necessary.
	*
	* @private
	* @param {Object} cache
	* @param {number} index
	* @param {Object} object
	* @return {Object}
	*/
	_getNodeRef(cache, index, object) {
		if (cache.refs[index] <= 1) return object;
		const ref = object.clone();
		const updateMappings = (original, clone) => {
			const mappings = this.associations.get(original);
			if (mappings != null) this.associations.set(clone, mappings);
			for (const [i, child] of original.children.entries()) updateMappings(child, clone.children[i]);
		};
		updateMappings(object, ref);
		ref.name += "_instance_" + cache.uses[index]++;
		return ref;
	}
	_invokeOne(func) {
		const extensions = Object.values(this.plugins);
		extensions.push(this);
		for (let i = 0; i < extensions.length; i++) {
			const result = func(extensions[i]);
			if (result) return result;
		}
		return null;
	}
	_invokeAll(func) {
		const extensions = Object.values(this.plugins);
		extensions.unshift(this);
		const pending = [];
		for (let i = 0; i < extensions.length; i++) {
			const result = func(extensions[i]);
			if (result) pending.push(result);
		}
		return pending;
	}
	/**
	* Requests the specified dependency asynchronously, with caching.
	*
	* @private
	* @param {string} type
	* @param {number} index
	* @return {Promise<Object3D|Material|Texture|AnimationClip|ArrayBuffer|Object>}
	*/
	getDependency(type, index) {
		const cacheKey = type + ":" + index;
		let dependency = this.cache.get(cacheKey);
		if (!dependency) {
			switch (type) {
				case "scene":
					dependency = this.loadScene(index);
					break;
				case "node":
					dependency = this._invokeOne(function(ext) {
						return ext.loadNode && ext.loadNode(index);
					});
					break;
				case "mesh":
					dependency = this._invokeOne(function(ext) {
						return ext.loadMesh && ext.loadMesh(index);
					});
					break;
				case "accessor":
					dependency = this.loadAccessor(index);
					break;
				case "bufferView":
					dependency = this._invokeOne(function(ext) {
						return ext.loadBufferView && ext.loadBufferView(index);
					});
					break;
				case "buffer":
					dependency = this.loadBuffer(index);
					break;
				case "material":
					dependency = this._invokeOne(function(ext) {
						return ext.loadMaterial && ext.loadMaterial(index);
					});
					break;
				case "texture":
					dependency = this._invokeOne(function(ext) {
						return ext.loadTexture && ext.loadTexture(index);
					});
					break;
				case "skin":
					dependency = this.loadSkin(index);
					break;
				case "animation":
					dependency = this._invokeOne(function(ext) {
						return ext.loadAnimation && ext.loadAnimation(index);
					});
					break;
				case "camera":
					dependency = this.loadCamera(index);
					break;
				default:
					dependency = this._invokeOne(function(ext) {
						return ext != this && ext.getDependency && ext.getDependency(type, index);
					});
					if (!dependency) throw new Error("Unknown type: " + type);
			}
			this.cache.add(cacheKey, dependency);
		}
		return dependency;
	}
	/**
	* Requests all dependencies of the specified type asynchronously, with caching.
	*
	* @private
	* @param {string} type
	* @return {Promise<Array<Object>>}
	*/
	getDependencies(type) {
		let dependencies = this.cache.get(type);
		if (!dependencies) {
			const parser = this;
			const defs = this.json[type + (type === "mesh" ? "es" : "s")] || [];
			dependencies = Promise.all(defs.map(function(def, index) {
				return parser.getDependency(type, index);
			}));
			this.cache.add(type, dependencies);
		}
		return dependencies;
	}
	/**
	* Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
	*
	* @private
	* @param {number} bufferIndex
	* @return {Promise<ArrayBuffer>}
	*/
	loadBuffer(bufferIndex) {
		const bufferDef = this.json.buffers[bufferIndex];
		const loader = this.fileLoader;
		if (bufferDef.type && bufferDef.type !== "arraybuffer") throw new Error("THREE.GLTFLoader: " + bufferDef.type + " buffer type is not supported.");
		if (bufferDef.uri === void 0 && bufferIndex === 0) return Promise.resolve(this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body);
		const options = this.options;
		return new Promise(function(resolve, reject) {
			loader.load(LoaderUtils.resolveURL(bufferDef.uri, options.path), resolve, void 0, function() {
				reject(/* @__PURE__ */ new Error("THREE.GLTFLoader: Failed to load buffer \"" + bufferDef.uri + "\"."));
			});
		});
	}
	/**
	* Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
	*
	* @private
	* @param {number} bufferViewIndex
	* @return {Promise<ArrayBuffer>}
	*/
	loadBufferView(bufferViewIndex) {
		const bufferViewDef = this.json.bufferViews[bufferViewIndex];
		return this.getDependency("buffer", bufferViewDef.buffer).then(function(buffer) {
			const byteLength = bufferViewDef.byteLength || 0;
			const byteOffset = bufferViewDef.byteOffset || 0;
			return buffer.slice(byteOffset, byteOffset + byteLength);
		});
	}
	/**
	* Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
	*
	* @private
	* @param {number} accessorIndex
	* @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
	*/
	loadAccessor(accessorIndex) {
		const parser = this;
		const json = this.json;
		const accessorDef = this.json.accessors[accessorIndex];
		if (accessorDef.bufferView === void 0 && accessorDef.sparse === void 0) {
			const itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
			const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
			const normalized = accessorDef.normalized === true;
			const array = new TypedArray(accessorDef.count * itemSize);
			return Promise.resolve(new BufferAttribute(array, itemSize, normalized));
		}
		const pendingBufferViews = [];
		if (accessorDef.bufferView !== void 0) pendingBufferViews.push(this.getDependency("bufferView", accessorDef.bufferView));
		else pendingBufferViews.push(null);
		if (accessorDef.sparse !== void 0) {
			pendingBufferViews.push(this.getDependency("bufferView", accessorDef.sparse.indices.bufferView));
			pendingBufferViews.push(this.getDependency("bufferView", accessorDef.sparse.values.bufferView));
		}
		return Promise.all(pendingBufferViews).then(function(bufferViews) {
			const bufferView = bufferViews[0];
			const itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
			const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
			const elementBytes = TypedArray.BYTES_PER_ELEMENT;
			const itemBytes = elementBytes * itemSize;
			const byteOffset = accessorDef.byteOffset || 0;
			const byteStride = accessorDef.bufferView !== void 0 ? json.bufferViews[accessorDef.bufferView].byteStride : void 0;
			const normalized = accessorDef.normalized === true;
			let array, bufferAttribute;
			if (byteStride && byteStride !== itemBytes) {
				const ibSlice = Math.floor(byteOffset / byteStride);
				const ibCacheKey = "InterleavedBuffer:" + accessorDef.bufferView + ":" + accessorDef.componentType + ":" + ibSlice + ":" + accessorDef.count;
				let ib = parser.cache.get(ibCacheKey);
				if (!ib) {
					array = new TypedArray(bufferView, ibSlice * byteStride, accessorDef.count * byteStride / elementBytes);
					ib = new InterleavedBuffer(array, byteStride / elementBytes);
					parser.cache.add(ibCacheKey, ib);
				}
				bufferAttribute = new InterleavedBufferAttribute(ib, itemSize, byteOffset % byteStride / elementBytes, normalized);
			} else {
				if (bufferView === null) array = new TypedArray(accessorDef.count * itemSize);
				else array = new TypedArray(bufferView, byteOffset, accessorDef.count * itemSize);
				bufferAttribute = new BufferAttribute(array, itemSize, normalized);
			}
			if (accessorDef.sparse !== void 0) {
				const itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
				const TypedArrayIndices = WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType];
				const byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
				const byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;
				const sparseIndices = new TypedArrayIndices(bufferViews[1], byteOffsetIndices, accessorDef.sparse.count * itemSizeIndices);
				const sparseValues = new TypedArray(bufferViews[2], byteOffsetValues, accessorDef.sparse.count * itemSize);
				if (bufferView !== null) bufferAttribute = new BufferAttribute(bufferAttribute.array.slice(), bufferAttribute.itemSize, bufferAttribute.normalized);
				bufferAttribute.normalized = false;
				for (let i = 0, il = sparseIndices.length; i < il; i++) {
					const index = sparseIndices[i];
					bufferAttribute.setX(index, sparseValues[i * itemSize]);
					if (itemSize >= 2) bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
					if (itemSize >= 3) bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
					if (itemSize >= 4) bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
					if (itemSize >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
				}
				bufferAttribute.normalized = normalized;
			}
			return bufferAttribute;
		});
	}
	/**
	* Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
	*
	* @private
	* @param {number} textureIndex
	* @return {Promise<?Texture>}
	*/
	loadTexture(textureIndex) {
		const json = this.json;
		const options = this.options;
		const sourceIndex = json.textures[textureIndex].source;
		const sourceDef = json.images[sourceIndex];
		let loader = this.textureLoader;
		if (sourceDef.uri) {
			const handler = options.manager.getHandler(sourceDef.uri);
			if (handler !== null) loader = handler;
		}
		return this.loadTextureImage(textureIndex, sourceIndex, loader);
	}
	loadTextureImage(textureIndex, sourceIndex, loader) {
		const parser = this;
		const json = this.json;
		const textureDef = json.textures[textureIndex];
		const sourceDef = json.images[sourceIndex];
		const cacheKey = (sourceDef.uri || sourceDef.bufferView) + ":" + textureDef.sampler;
		if (this.textureCache[cacheKey]) return this.textureCache[cacheKey];
		const promise = this.loadImageSource(sourceIndex, loader).then(function(texture) {
			texture.flipY = false;
			texture.name = textureDef.name || sourceDef.name || "";
			if (texture.name === "" && typeof sourceDef.uri === "string" && sourceDef.uri.startsWith("data:image/") === false) texture.name = sourceDef.uri;
			const sampler = (json.samplers || {})[textureDef.sampler] || {};
			texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || 1006;
			texture.minFilter = WEBGL_FILTERS[sampler.minFilter] || 1008;
			texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || 1e3;
			texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || 1e3;
			texture.generateMipmaps = !texture.isCompressedTexture && texture.minFilter !== 1003 && texture.minFilter !== 1006;
			parser.associations.set(texture, { textures: textureIndex });
			return texture;
		}).catch(function() {
			return null;
		});
		this.textureCache[cacheKey] = promise;
		return promise;
	}
	loadImageSource(sourceIndex, loader) {
		const parser = this;
		const json = this.json;
		const options = this.options;
		if (this.sourceCache[sourceIndex] !== void 0) return this.sourceCache[sourceIndex].then((texture) => texture.clone());
		const sourceDef = json.images[sourceIndex];
		const URL = self.URL || self.webkitURL;
		let sourceURI = sourceDef.uri || "";
		let isObjectURL = false;
		if (sourceDef.bufferView !== void 0) sourceURI = parser.getDependency("bufferView", sourceDef.bufferView).then(function(bufferView) {
			isObjectURL = true;
			const blob = new Blob([bufferView], { type: sourceDef.mimeType });
			sourceURI = URL.createObjectURL(blob);
			return sourceURI;
		});
		else if (sourceDef.uri === void 0) throw new Error("THREE.GLTFLoader: Image " + sourceIndex + " is missing URI and bufferView");
		const promise = Promise.resolve(sourceURI).then(function(sourceURI) {
			return new Promise(function(resolve, reject) {
				let onLoad = resolve;
				if (loader.isImageBitmapLoader === true) onLoad = function(imageBitmap) {
					const texture = new Texture(imageBitmap);
					texture.needsUpdate = true;
					resolve(texture);
				};
				loader.load(LoaderUtils.resolveURL(sourceURI, options.path), onLoad, void 0, reject);
			});
		}).then(function(texture) {
			if (isObjectURL === true) URL.revokeObjectURL(sourceURI);
			assignExtrasToUserData(texture, sourceDef);
			texture.userData.mimeType = sourceDef.mimeType || getImageURIMimeType(sourceDef.uri);
			return texture;
		}).catch(function(error) {
			console.error("THREE.GLTFLoader: Couldn't load texture", sourceURI);
			throw error;
		});
		this.sourceCache[sourceIndex] = promise;
		return promise;
	}
	/**
	* Asynchronously assigns a texture to the given material parameters.
	*
	* @private
	* @param {Object} materialParams
	* @param {string} mapName
	* @param {Object} mapDef
	* @param {string} [colorSpace]
	* @return {Promise<Texture>}
	*/
	assignTexture(materialParams, mapName, mapDef, colorSpace) {
		const parser = this;
		return this.getDependency("texture", mapDef.index).then(function(texture) {
			if (!texture) return null;
			if (mapDef.texCoord !== void 0 && mapDef.texCoord > 0) {
				texture = texture.clone();
				texture.channel = mapDef.texCoord;
			}
			if (parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {
				const transform = mapDef.extensions !== void 0 ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM] : void 0;
				if (transform) {
					const gltfReference = parser.associations.get(texture);
					texture = parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM].extendTexture(texture, transform);
					parser.associations.set(texture, gltfReference);
				}
			}
			if (colorSpace !== void 0) texture.colorSpace = colorSpace;
			materialParams[mapName] = texture;
			return texture;
		});
	}
	/**
	* Assigns final material to a Mesh, Line, or Points instance. The instance
	* already has a material (generated from the glTF material options alone)
	* but reuse of the same glTF material may require multiple threejs materials
	* to accommodate different primitive types, defines, etc. New materials will
	* be created if necessary, and reused from a cache.
	*
	* @private
	* @param {Object3D} mesh Mesh, Line, or Points instance.
	*/
	assignFinalMaterial(mesh) {
		const geometry = mesh.geometry;
		let material = mesh.material;
		const useDerivativeTangents = geometry.attributes.tangent === void 0;
		const useVertexColors = geometry.attributes.color !== void 0;
		const useFlatShading = geometry.attributes.normal === void 0;
		if (mesh.isPoints) {
			const cacheKey = "PointsMaterial:" + material.uuid;
			let pointsMaterial = this.cache.get(cacheKey);
			if (!pointsMaterial) {
				pointsMaterial = new PointsMaterial();
				Material.prototype.copy.call(pointsMaterial, material);
				pointsMaterial.color.copy(material.color);
				pointsMaterial.map = material.map;
				pointsMaterial.sizeAttenuation = false;
				this.cache.add(cacheKey, pointsMaterial);
			}
			material = pointsMaterial;
		} else if (mesh.isLine) {
			const cacheKey = "LineBasicMaterial:" + material.uuid;
			let lineMaterial = this.cache.get(cacheKey);
			if (!lineMaterial) {
				lineMaterial = new LineBasicMaterial();
				Material.prototype.copy.call(lineMaterial, material);
				lineMaterial.color.copy(material.color);
				lineMaterial.map = material.map;
				this.cache.add(cacheKey, lineMaterial);
			}
			material = lineMaterial;
		}
		if (useDerivativeTangents || useVertexColors || useFlatShading) {
			let cacheKey = "ClonedMaterial:" + material.uuid + ":";
			if (useDerivativeTangents) cacheKey += "derivative-tangents:";
			if (useVertexColors) cacheKey += "vertex-colors:";
			if (useFlatShading) cacheKey += "flat-shading:";
			let cachedMaterial = this.cache.get(cacheKey);
			if (!cachedMaterial) {
				cachedMaterial = material.clone();
				if (useVertexColors) cachedMaterial.vertexColors = true;
				if (useFlatShading) cachedMaterial.flatShading = true;
				if (useDerivativeTangents) {
					if (cachedMaterial.normalScale) cachedMaterial.normalScale.y *= -1;
					if (cachedMaterial.clearcoatNormalScale) cachedMaterial.clearcoatNormalScale.y *= -1;
				}
				this.cache.add(cacheKey, cachedMaterial);
				this.associations.set(cachedMaterial, this.associations.get(material));
			}
			material = cachedMaterial;
		}
		mesh.material = material;
	}
	getMaterialType() {
		return MeshStandardMaterial;
	}
	/**
	* Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
	*
	* @private
	* @param {number} materialIndex
	* @return {Promise<Material>}
	*/
	loadMaterial(materialIndex) {
		const parser = this;
		const json = this.json;
		const extensions = this.extensions;
		const materialDef = json.materials[materialIndex];
		let materialType;
		const materialParams = {};
		const materialExtensions = materialDef.extensions || {};
		const pending = [];
		if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
			const kmuExtension = extensions[EXTENSIONS.KHR_MATERIALS_UNLIT];
			materialType = kmuExtension.getMaterialType();
			pending.push(kmuExtension.extendParams(materialParams, materialDef, parser));
		} else {
			const metallicRoughness = materialDef.pbrMetallicRoughness || {};
			materialParams.color = new Color(1, 1, 1);
			materialParams.opacity = 1;
			if (Array.isArray(metallicRoughness.baseColorFactor)) {
				const array = metallicRoughness.baseColorFactor;
				materialParams.color.setRGB(array[0], array[1], array[2], LinearSRGBColorSpace);
				materialParams.opacity = array[3];
			}
			if (metallicRoughness.baseColorTexture !== void 0) pending.push(parser.assignTexture(materialParams, "map", metallicRoughness.baseColorTexture, SRGBColorSpace));
			materialParams.metalness = metallicRoughness.metallicFactor !== void 0 ? metallicRoughness.metallicFactor : 1;
			materialParams.roughness = metallicRoughness.roughnessFactor !== void 0 ? metallicRoughness.roughnessFactor : 1;
			if (metallicRoughness.metallicRoughnessTexture !== void 0) {
				pending.push(parser.assignTexture(materialParams, "metalnessMap", metallicRoughness.metallicRoughnessTexture));
				pending.push(parser.assignTexture(materialParams, "roughnessMap", metallicRoughness.metallicRoughnessTexture));
			}
			materialType = this._invokeOne(function(ext) {
				return ext.getMaterialType && ext.getMaterialType(materialIndex);
			});
			pending.push(Promise.all(this._invokeAll(function(ext) {
				return ext.extendMaterialParams && ext.extendMaterialParams(materialIndex, materialParams);
			})));
		}
		if (materialDef.doubleSided === true) materialParams.side = 2;
		const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;
		if (alphaMode === ALPHA_MODES.BLEND) {
			materialParams.transparent = true;
			materialParams.depthWrite = false;
		} else {
			materialParams.transparent = false;
			if (alphaMode === ALPHA_MODES.MASK) materialParams.alphaTest = materialDef.alphaCutoff !== void 0 ? materialDef.alphaCutoff : .5;
		}
		if (materialDef.normalTexture !== void 0 && materialType !== MeshBasicMaterial) {
			pending.push(parser.assignTexture(materialParams, "normalMap", materialDef.normalTexture));
			materialParams.normalScale = new Vector2(1, 1);
			if (materialDef.normalTexture.scale !== void 0) {
				const scale = materialDef.normalTexture.scale;
				materialParams.normalScale.set(scale, scale);
			}
		}
		if (materialDef.occlusionTexture !== void 0 && materialType !== MeshBasicMaterial) {
			pending.push(parser.assignTexture(materialParams, "aoMap", materialDef.occlusionTexture));
			if (materialDef.occlusionTexture.strength !== void 0) materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;
		}
		if (materialDef.emissiveFactor !== void 0 && materialType !== MeshBasicMaterial) {
			const emissiveFactor = materialDef.emissiveFactor;
			materialParams.emissive = new Color().setRGB(emissiveFactor[0], emissiveFactor[1], emissiveFactor[2], LinearSRGBColorSpace);
		}
		if (materialDef.emissiveTexture !== void 0 && materialType !== MeshBasicMaterial) pending.push(parser.assignTexture(materialParams, "emissiveMap", materialDef.emissiveTexture, SRGBColorSpace));
		return Promise.all(pending).then(function() {
			const material = new materialType(materialParams);
			if (materialDef.name) material.name = materialDef.name;
			assignExtrasToUserData(material, materialDef);
			parser.associations.set(material, { materials: materialIndex });
			if (materialDef.extensions) addUnknownExtensionsToUserData(extensions, material, materialDef);
			return material;
		});
	}
	/**
	* When Object3D instances are targeted by animation, they need unique names.
	*
	* @private
	* @param {string} originalName
	* @return {string}
	*/
	createUniqueName(originalName) {
		const sanitizedName = PropertyBinding.sanitizeNodeName(originalName || "");
		if (sanitizedName in this.nodeNamesUsed) return sanitizedName + "_" + ++this.nodeNamesUsed[sanitizedName];
		else {
			this.nodeNamesUsed[sanitizedName] = 0;
			return sanitizedName;
		}
	}
	/**
	* Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
	*
	* Creates BufferGeometries from primitives.
	*
	* @private
	* @param {Array<GLTF.Primitive>} primitives
	* @return {Promise<Array<BufferGeometry>>}
	*/
	loadGeometries(primitives) {
		const parser = this;
		const extensions = this.extensions;
		const cache = this.primitiveCache;
		function createDracoPrimitive(primitive) {
			return extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(primitive, parser).then(function(geometry) {
				return addPrimitiveAttributes(geometry, primitive, parser);
			});
		}
		const pending = [];
		for (let i = 0, il = primitives.length; i < il; i++) {
			const primitive = primitives[i];
			const cacheKey = createPrimitiveKey(primitive);
			const cached = cache[cacheKey];
			if (cached) pending.push(cached.promise);
			else {
				let geometryPromise;
				if (primitive.extensions && primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]) geometryPromise = createDracoPrimitive(primitive);
				else geometryPromise = addPrimitiveAttributes(new BufferGeometry(), primitive, parser);
				if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) geometryPromise = geometryPromise.then((geometry) => toTrianglesDrawMode(geometry, 1));
				else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) geometryPromise = geometryPromise.then((geometry) => toTrianglesDrawMode(geometry, 2));
				cache[cacheKey] = {
					primitive,
					promise: geometryPromise
				};
				pending.push(geometryPromise);
			}
		}
		return Promise.all(pending);
	}
	/**
	* Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
	*
	* @private
	* @param {number} meshIndex
	* @return {Promise<Group|Mesh|SkinnedMesh|Line|Points>}
	*/
	loadMesh(meshIndex) {
		const parser = this;
		const json = this.json;
		const extensions = this.extensions;
		const meshDef = json.meshes[meshIndex];
		const primitives = meshDef.primitives;
		const pending = [];
		for (let i = 0, il = primitives.length; i < il; i++) {
			const material = primitives[i].material === void 0 ? createDefaultMaterial(this.cache) : this.getDependency("material", primitives[i].material);
			pending.push(material);
		}
		pending.push(parser.loadGeometries(primitives));
		return Promise.all(pending).then(async function(results) {
			const materials = results.slice(0, results.length - 1);
			const geometries = results[results.length - 1];
			const meshes = [];
			for (let i = 0, il = geometries.length; i < il; i++) {
				const geometry = geometries[i];
				const primitive = primitives[i];
				let mesh;
				const material = materials[i];
				if (primitive.mode === WEBGL_CONSTANTS.TRIANGLES || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP || primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN || primitive.mode === void 0) {
					const needsSkinning = meshDef.isSkinnedMesh === true;
					const hasSkinningAttributes = geometry.hasAttribute("skinIndex") && geometry.hasAttribute("skinWeight");
					if (needsSkinning && hasSkinningAttributes === false) console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled.");
					mesh = needsSkinning && hasSkinningAttributes ? new SkinnedMesh(geometry, material) : new Mesh(geometry, material);
					if (mesh.isSkinnedMesh === true) mesh.normalizeSkinWeights();
				} else if (primitive.mode === WEBGL_CONSTANTS.LINES) mesh = new LineSegments(geometry, material);
				else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) mesh = new Line(geometry, material);
				else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) mesh = new LineLoop(geometry, material);
				else if (primitive.mode === WEBGL_CONSTANTS.POINTS) mesh = new Points(geometry, material);
				else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + primitive.mode);
				if (Object.keys(mesh.geometry.morphAttributes).length > 0) updateMorphTargets(mesh, meshDef);
				mesh.name = parser.createUniqueName(meshDef.name || "mesh_" + meshIndex);
				assignExtrasToUserData(mesh, meshDef);
				if (primitive.extensions) addUnknownExtensionsToUserData(extensions, mesh, primitive);
				parser.assignFinalMaterial(mesh);
				meshes.push(mesh);
			}
			for (let i = 0, il = meshes.length; i < il; i++) parser.associations.set(meshes[i], {
				meshes: meshIndex,
				primitives: i
			});
			if (meshes.length === 1) {
				if (meshDef.extensions) addUnknownExtensionsToUserData(extensions, meshes[0], meshDef);
				return meshes[0];
			}
			const group = new Group();
			if (meshDef.extensions) addUnknownExtensionsToUserData(extensions, group, meshDef);
			parser.associations.set(group, { meshes: meshIndex });
			for (let i = 0, il = meshes.length; i < il; i++) group.add(meshes[i]);
			return group;
		});
	}
	/**
	* Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
	*
	* @private
	* @param {number} cameraIndex
	* @return {Promise<Camera>|undefined}
	*/
	loadCamera(cameraIndex) {
		let camera;
		const cameraDef = this.json.cameras[cameraIndex];
		const params = cameraDef[cameraDef.type];
		if (!params) {
			console.warn("THREE.GLTFLoader: Missing camera parameters.");
			return;
		}
		if (cameraDef.type === "perspective") camera = new PerspectiveCamera(MathUtils.radToDeg(params.yfov), params.aspectRatio || 1, params.znear || 1, params.zfar || 2e6);
		else if (cameraDef.type === "orthographic") camera = new OrthographicCamera(-params.xmag, params.xmag, params.ymag, -params.ymag, params.znear, params.zfar);
		if (cameraDef.name) camera.name = this.createUniqueName(cameraDef.name);
		assignExtrasToUserData(camera, cameraDef);
		return Promise.resolve(camera);
	}
	/**
	* Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
	*
	* @private
	* @param {number} skinIndex
	* @return {Promise<Skeleton>}
	*/
	loadSkin(skinIndex) {
		const skinDef = this.json.skins[skinIndex];
		const pending = [];
		for (let i = 0, il = skinDef.joints.length; i < il; i++) pending.push(this._loadNodeShallow(skinDef.joints[i]));
		if (skinDef.inverseBindMatrices !== void 0) pending.push(this.getDependency("accessor", skinDef.inverseBindMatrices));
		else pending.push(null);
		return Promise.all(pending).then(function(results) {
			const inverseBindMatrices = results.pop();
			const jointNodes = results;
			const bones = [];
			const boneInverses = [];
			for (let i = 0, il = jointNodes.length; i < il; i++) {
				const jointNode = jointNodes[i];
				if (jointNode) {
					bones.push(jointNode);
					const mat = new Matrix4();
					if (inverseBindMatrices !== null) mat.fromArray(inverseBindMatrices.array, i * 16);
					boneInverses.push(mat);
				} else console.warn("THREE.GLTFLoader: Joint \"%s\" could not be found.", skinDef.joints[i]);
			}
			return new Skeleton(bones, boneInverses);
		});
	}
	/**
	* Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
	*
	* @private
	* @param {number} animationIndex
	* @return {Promise<AnimationClip>}
	*/
	loadAnimation(animationIndex) {
		const json = this.json;
		const parser = this;
		const animationDef = json.animations[animationIndex];
		const animationName = animationDef.name ? animationDef.name : "animation_" + animationIndex;
		const pendingNodes = [];
		const pendingInputAccessors = [];
		const pendingOutputAccessors = [];
		const pendingSamplers = [];
		const pendingTargets = [];
		for (let i = 0, il = animationDef.channels.length; i < il; i++) {
			const channel = animationDef.channels[i];
			const sampler = animationDef.samplers[channel.sampler];
			const target = channel.target;
			const name = target.node;
			const input = animationDef.parameters !== void 0 ? animationDef.parameters[sampler.input] : sampler.input;
			const output = animationDef.parameters !== void 0 ? animationDef.parameters[sampler.output] : sampler.output;
			if (target.node === void 0) continue;
			pendingNodes.push(this.getDependency("node", name));
			pendingInputAccessors.push(this.getDependency("accessor", input));
			pendingOutputAccessors.push(this.getDependency("accessor", output));
			pendingSamplers.push(sampler);
			pendingTargets.push(target);
		}
		return Promise.all([
			Promise.all(pendingNodes),
			Promise.all(pendingInputAccessors),
			Promise.all(pendingOutputAccessors),
			Promise.all(pendingSamplers),
			Promise.all(pendingTargets)
		]).then(function(dependencies) {
			const nodes = dependencies[0];
			const inputAccessors = dependencies[1];
			const outputAccessors = dependencies[2];
			const samplers = dependencies[3];
			const targets = dependencies[4];
			const tracks = [];
			for (let i = 0, il = nodes.length; i < il; i++) {
				const node = nodes[i];
				const inputAccessor = inputAccessors[i];
				const outputAccessor = outputAccessors[i];
				const sampler = samplers[i];
				const target = targets[i];
				if (node === void 0) continue;
				if (node.updateMatrix) node.updateMatrix();
				const createdTracks = parser._createAnimationTracks(node, inputAccessor, outputAccessor, sampler, target);
				if (createdTracks) for (let k = 0; k < createdTracks.length; k++) tracks.push(createdTracks[k]);
			}
			const animation = new AnimationClip(animationName, void 0, tracks);
			assignExtrasToUserData(animation, animationDef);
			return animation;
		});
	}
	createNodeMesh(nodeIndex) {
		const json = this.json;
		const parser = this;
		const nodeDef = json.nodes[nodeIndex];
		if (nodeDef.mesh === void 0) return null;
		return parser.getDependency("mesh", nodeDef.mesh).then(function(mesh) {
			const node = parser._getNodeRef(parser.meshCache, nodeDef.mesh, mesh);
			if (nodeDef.weights !== void 0) node.traverse(function(o) {
				if (!o.isMesh) return;
				for (let i = 0, il = nodeDef.weights.length; i < il; i++) o.morphTargetInfluences[i] = nodeDef.weights[i];
			});
			return node;
		});
	}
	/**
	* Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
	*
	* @private
	* @param {number} nodeIndex
	* @return {Promise<Object3D>}
	*/
	loadNode(nodeIndex) {
		const json = this.json;
		const parser = this;
		const nodeDef = json.nodes[nodeIndex];
		const nodePending = parser._loadNodeShallow(nodeIndex);
		const childPending = [];
		const childrenDef = nodeDef.children || [];
		for (let i = 0, il = childrenDef.length; i < il; i++) childPending.push(parser.getDependency("node", childrenDef[i]));
		const skeletonPending = nodeDef.skin === void 0 ? Promise.resolve(null) : parser.getDependency("skin", nodeDef.skin);
		return Promise.all([
			nodePending,
			Promise.all(childPending),
			skeletonPending
		]).then(function(results) {
			const node = results[0];
			const children = results[1];
			const skeleton = results[2];
			if (skeleton !== null) node.traverse(function(mesh) {
				if (!mesh.isSkinnedMesh) return;
				mesh.bind(skeleton, _identityMatrix);
			});
			for (let i = 0, il = children.length; i < il; i++) node.add(children[i]);
			if (node.userData.pivot !== void 0 && children.length > 0) {
				const pivot = node.userData.pivot;
				const pivotChild = children[0];
				node.pivot = new Vector3().fromArray(pivot);
				node.position.x -= pivot[0];
				node.position.y -= pivot[1];
				node.position.z -= pivot[2];
				pivotChild.position.set(0, 0, 0);
				delete node.userData.pivot;
			}
			return node;
		});
	}
	_loadNodeShallow(nodeIndex) {
		const json = this.json;
		const extensions = this.extensions;
		const parser = this;
		if (this.nodeCache[nodeIndex] !== void 0) return this.nodeCache[nodeIndex];
		const nodeDef = json.nodes[nodeIndex];
		const nodeName = nodeDef.name ? parser.createUniqueName(nodeDef.name) : "";
		const pending = [];
		const meshPromise = parser._invokeOne(function(ext) {
			return ext.createNodeMesh && ext.createNodeMesh(nodeIndex);
		});
		if (meshPromise) pending.push(meshPromise);
		if (nodeDef.camera !== void 0) pending.push(parser.getDependency("camera", nodeDef.camera).then(function(camera) {
			return parser._getNodeRef(parser.cameraCache, nodeDef.camera, camera);
		}));
		parser._invokeAll(function(ext) {
			return ext.createNodeAttachment && ext.createNodeAttachment(nodeIndex);
		}).forEach(function(promise) {
			pending.push(promise);
		});
		this.nodeCache[nodeIndex] = Promise.all(pending).then(function(objects) {
			let node;
			if (nodeDef.isBone === true) node = new Bone();
			else if (objects.length > 1) node = new Group();
			else if (objects.length === 1) node = objects[0];
			else node = new Object3D();
			if (node !== objects[0]) for (let i = 0, il = objects.length; i < il; i++) node.add(objects[i]);
			if (nodeDef.name) {
				node.userData.name = nodeDef.name;
				node.name = nodeName;
			}
			assignExtrasToUserData(node, nodeDef);
			if (nodeDef.extensions) addUnknownExtensionsToUserData(extensions, node, nodeDef);
			if (nodeDef.matrix !== void 0) {
				const matrix = new Matrix4();
				matrix.fromArray(nodeDef.matrix);
				node.applyMatrix4(matrix);
			} else {
				if (nodeDef.translation !== void 0) node.position.fromArray(nodeDef.translation);
				if (nodeDef.rotation !== void 0) node.quaternion.fromArray(nodeDef.rotation);
				if (nodeDef.scale !== void 0) node.scale.fromArray(nodeDef.scale);
			}
			if (!parser.associations.has(node)) parser.associations.set(node, {});
			else if (nodeDef.mesh !== void 0 && parser.meshCache.refs[nodeDef.mesh] > 1) {
				const mapping = parser.associations.get(node);
				parser.associations.set(node, { ...mapping });
			}
			parser.associations.get(node).nodes = nodeIndex;
			return node;
		});
		return this.nodeCache[nodeIndex];
	}
	/**
	* Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
	*
	* @private
	* @param {number} sceneIndex
	* @return {Promise<Group>}
	*/
	loadScene(sceneIndex) {
		const extensions = this.extensions;
		const sceneDef = this.json.scenes[sceneIndex];
		const parser = this;
		const scene = new Group();
		if (sceneDef.name) scene.name = parser.createUniqueName(sceneDef.name);
		assignExtrasToUserData(scene, sceneDef);
		if (sceneDef.extensions) addUnknownExtensionsToUserData(extensions, scene, sceneDef);
		const nodeIds = sceneDef.nodes || [];
		const pending = [];
		for (let i = 0, il = nodeIds.length; i < il; i++) pending.push(parser.getDependency("node", nodeIds[i]));
		return Promise.all(pending).then(function(nodes) {
			for (let i = 0, il = nodes.length; i < il; i++) {
				const node = nodes[i];
				if (node.parent !== null) scene.add(clone(node));
				else scene.add(node);
			}
			const reduceAssociations = (node) => {
				const reducedAssociations = /* @__PURE__ */ new Map();
				for (const [key, value] of parser.associations) if (key instanceof Material || key instanceof Texture) reducedAssociations.set(key, value);
				node.traverse((node) => {
					const mappings = parser.associations.get(node);
					if (mappings != null) reducedAssociations.set(node, mappings);
				});
				return reducedAssociations;
			};
			parser.associations = reduceAssociations(scene);
			return scene;
		});
	}
	_createAnimationTracks(node, inputAccessor, outputAccessor, sampler, target) {
		const tracks = [];
		const targetName = node.name ? node.name : node.uuid;
		const targetNames = [];
		function collectMorphTargets(object) {
			if (object.morphTargetInfluences) targetNames.push(object.name ? object.name : object.uuid);
		}
		if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {
			collectMorphTargets(node);
			if (node.isGroup) node.children.forEach(collectMorphTargets);
		} else targetNames.push(targetName);
		let TypedKeyframeTrack;
		switch (PATH_PROPERTIES[target.path]) {
			case PATH_PROPERTIES.weights:
				TypedKeyframeTrack = NumberKeyframeTrack;
				break;
			case PATH_PROPERTIES.rotation:
				TypedKeyframeTrack = QuaternionKeyframeTrack;
				break;
			case PATH_PROPERTIES.translation:
			case PATH_PROPERTIES.scale:
				TypedKeyframeTrack = VectorKeyframeTrack;
				break;
			default: switch (outputAccessor.itemSize) {
				case 1:
					TypedKeyframeTrack = NumberKeyframeTrack;
					break;
				default: TypedKeyframeTrack = VectorKeyframeTrack;
			}
		}
		const interpolation = sampler.interpolation !== void 0 ? INTERPOLATION[sampler.interpolation] : InterpolateLinear;
		const outputArray = this._getArrayFromAccessor(outputAccessor);
		for (let j = 0, jl = targetNames.length; j < jl; j++) {
			const track = new TypedKeyframeTrack(targetNames[j] + "." + PATH_PROPERTIES[target.path], inputAccessor.array, outputArray, interpolation);
			if (sampler.interpolation === "CUBICSPLINE") this._createCubicSplineTrackInterpolant(track);
			tracks.push(track);
		}
		return tracks;
	}
	_getArrayFromAccessor(accessor) {
		let outputArray = accessor.array;
		if (accessor.normalized) {
			const scale = getNormalizedComponentScale(outputArray.constructor);
			const scaled = new Float32Array(outputArray.length);
			for (let j = 0, jl = outputArray.length; j < jl; j++) scaled[j] = outputArray[j] * scale;
			outputArray = scaled;
		}
		return outputArray;
	}
	_createCubicSplineTrackInterpolant(track) {
		track.createInterpolant = function InterpolantFactoryMethodGLTFCubicSpline(result) {
			return new (this instanceof QuaternionKeyframeTrack ? GLTFCubicSplineQuaternionInterpolant : GLTFCubicSplineInterpolant)(this.times, this.values, this.getValueSize() / 3, result);
		};
		track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;
	}
};
/**
*
* @private
* @param {BufferGeometry} geometry
* @param {GLTF.Primitive} primitiveDef
* @param {GLTFParser} parser
*/
function computeBounds(geometry, primitiveDef, parser) {
	const attributes = primitiveDef.attributes;
	const box = new Box3();
	if (attributes.POSITION !== void 0) {
		const accessor = parser.json.accessors[attributes.POSITION];
		const min = accessor.min;
		const max = accessor.max;
		if (min !== void 0 && max !== void 0) {
			box.set(new Vector3(min[0], min[1], min[2]), new Vector3(max[0], max[1], max[2]));
			if (accessor.normalized) {
				const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType]);
				box.min.multiplyScalar(boxScale);
				box.max.multiplyScalar(boxScale);
			}
		} else {
			console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
			return;
		}
	} else return;
	const targets = primitiveDef.targets;
	if (targets !== void 0) {
		const maxDisplacement = new Vector3();
		const vector = new Vector3();
		for (let i = 0, il = targets.length; i < il; i++) {
			const target = targets[i];
			if (target.POSITION !== void 0) {
				const accessor = parser.json.accessors[target.POSITION];
				const min = accessor.min;
				const max = accessor.max;
				if (min !== void 0 && max !== void 0) {
					vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])));
					vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])));
					vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])));
					if (accessor.normalized) {
						const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType]);
						vector.multiplyScalar(boxScale);
					}
					maxDisplacement.max(vector);
				} else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
			}
		}
		box.expandByVector(maxDisplacement);
	}
	geometry.boundingBox = box;
	const sphere = new Sphere();
	box.getCenter(sphere.center);
	sphere.radius = box.min.distanceTo(box.max) / 2;
	geometry.boundingSphere = sphere;
}
/**
*
* @private
* @param {BufferGeometry} geometry
* @param {GLTF.Primitive} primitiveDef
* @param {GLTFParser} parser
* @return {Promise<BufferGeometry>}
*/
function addPrimitiveAttributes(geometry, primitiveDef, parser) {
	const attributes = primitiveDef.attributes;
	const pending = [];
	function assignAttributeAccessor(accessorIndex, attributeName) {
		return parser.getDependency("accessor", accessorIndex).then(function(accessor) {
			geometry.setAttribute(attributeName, accessor);
		});
	}
	for (const gltfAttributeName in attributes) {
		const threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();
		if (threeAttributeName in geometry.attributes) continue;
		pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName));
	}
	if (primitiveDef.indices !== void 0 && !geometry.index) {
		const accessor = parser.getDependency("accessor", primitiveDef.indices).then(function(accessor) {
			geometry.setIndex(accessor);
		});
		pending.push(accessor);
	}
	if (ColorManagement.workingColorSpace !== "srgb-linear" && "COLOR_0" in attributes) console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ColorManagement.workingColorSpace}" not supported.`);
	assignExtrasToUserData(geometry, primitiveDef);
	computeBounds(geometry, primitiveDef, parser);
	return Promise.all(pending).then(function() {
		return primitiveDef.targets !== void 0 ? addMorphTargets(geometry, primitiveDef.targets, parser) : geometry;
	});
}
//#endregion
//#region src/badminton/entities/PlayerModel.ts
/** Public paths of the assets, served from public/models by Vite (Tahap 2.3). */
const BADMINTON_PLAYER_URL = "/models/badminton/players/BadmintonPlayer_Animated_2_10.glb";
/** Node names inside the GLB. */
const RIGHT_HAND_NODE = "RightHand";
const LEFT_HAND_NODE = "LeftHand";
const RACKET_NODE = "BadmintonRacket";
const FALLBACK_CLIP = "Idle";
/** One-shot strokes / serves: played once, then the model returns to Ready. */
const ONE_SHOT_CLIPS = /* @__PURE__ */ new Set([
	"ServeShort",
	"ServeLong",
	"ForehandClear",
	"BackhandClear",
	"Smash",
	"JumpSmash",
	"DropShot",
	"ForehandDrive",
	"BackhandDrive",
	"NetShot",
	"NetKill",
	"DefensiveBlock",
	"Lift"
]);
const REST_CLIP = "Ready";
/** One entry per GLB: every file is fetched at most once per page load. */
const assetPromises = /* @__PURE__ */ new Map();
const resolvedAssets = /* @__PURE__ */ new Map();
function loadAsset(url) {
	const cached = assetPromises.get(url);
	if (cached) return cached;
	const promise = new Promise((resolve, reject) => {
		new GLTFLoader().load(url, (gltf) => {
			resolvedAssets.set(url, {
				source: gltf.scene,
				clips: gltf.animations
			});
			resolve(resolvedAssets.get(url));
		}, void 0, (error) => reject(error));
	});
	assetPromises.set(url, promise);
	return promise;
}
/**
* Crossfade used when a swing takes over from the resting clip. Kept short so
* the swing reads as one clear motion instead of a slow blend into the stance.
*/
const SWING_FADE = .06;
/**
* Badminton player backed by a GLB from public/models: skinned mesh, 22 bones
* and a racket bound to the right hand.
*
* Two variants exist, each its own file and its own skeleton:
*   BADMINTON_PLAYER_URL      -> blue jersey
*   BADMINTON_PLAYER_RED_URL  -> red jersey
*
* Scope is deliberately narrow: loading, cloning, animation playback and node
* access. Gameplay, physics and hand tracking stay outside this class.
*/
var BadmintonPlayerModel = class BadmintonPlayerModel {
	url;
	group = new Group();
	mixer;
	actions = /* @__PURE__ */ new Map();
	current = null;
	currentName = null;
	swingActive = false;
	constructor(root, clips, url) {
		this.url = url;
		this.group.add(root);
		this.mixer = new AnimationMixer(root);
		for (const clip of clips) {
			const action = this.mixer.clipAction(clip);
			action.enabled = true;
			action.setLoop(LoopRepeat, Infinity);
			this.actions.set(clip.name, action);
		}
		root.traverse((object) => {
			if (object instanceof Mesh) {
				object.castShadow = true;
				object.receiveShadow = true;
			}
		});
	}
	/** Loads one GLB (once per url) and returns a player instance for it. */
	static async load(url = BADMINTON_PLAYER_URL) {
		const asset = await loadAsset(url);
		return new BadmintonPlayerModel(asset.source, asset.clips, url);
	}
	/**
	* Builds another player from this variant's already loaded asset. Uses
	* SkeletonUtils so bone bindings stay valid, and creates a separate
	* AnimationMixer for the new skeleton.
	*/
	createClone() {
		const asset = resolvedAssets.get(this.url);
		if (!asset) throw new Error(`${this.url} belum selesai dimuat`);
		const root = clone(asset.source);
		return new BadmintonPlayerModel(root, asset.clips, this.url);
	}
	/** Plays a resting clip by name, crossfading out whatever is running. */
	play(name) {
		const action = this.resolveAction(name);
		if (!action || action === this.current) return;
		if (this.current && this.current.isRunning()) this.current.fadeOut(SWING_FADE);
		action.reset();
		action.setLoop(LoopRepeat, Infinity);
		action.clampWhenFinished = false;
		action.setEffectiveWeight(1);
		action.play();
		this.current = action;
		this.currentName = name;
		this.swingActive = false;
	}
	/**
	* Plays a one-shot stroke / serve clip (e.g. ForehandClear, ServeLong, Smash).
	* It plays a single time and then returns to the resting clip, so Ready and
	* Idle are never left in a broken state.
	*/
	playSwing(name) {
		if (!ONE_SHOT_CLIPS.has(name)) {
			this.play(name);
			return false;
		}
		const action = this.resolveAction(name);
		if (!action || action === this.current) return false;
		if (this.current && this.current.isRunning()) this.current.fadeOut(SWING_FADE);
		action.reset();
		action.setLoop(LoopOnce, 1);
		action.clampWhenFinished = true;
		action.setEffectiveWeight(1);
		action.play();
		this.current = action;
		this.currentName = name;
		this.swingActive = true;
		return true;
	}
	/** Advances this player's animation. Call once per frame with delta time. */
	update(delta) {
		this.mixer.update(delta);
		if (this.swingActive && this.current) {
			const duration = this.current.getClip().duration;
			if (!this.current.isRunning() || this.current.time >= duration) {
				this.swingActive = false;
				this.play(REST_CLIP);
			}
		}
	}
	dispose() {
		this.mixer.stopAllAction();
		this.mixer.uncacheRoot(this.group);
	}
	getRightHand() {
		return this.group.getObjectByName(RIGHT_HAND_NODE) ?? null;
	}
	getLeftHand() {
		return this.group.getObjectByName(LEFT_HAND_NODE) ?? null;
	}
	getRacket() {
		return this.group.getObjectByName(RACKET_NODE) ?? null;
	}
	/** Duration of a clip in seconds, or 0 when the clip is not available. */
	clipDuration(clip) {
		return this.actions.get(clip)?.getClip().duration ?? 0;
	}
	hasClip(name) {
		return this.actions.has(name);
	}
	get clipNames() {
		return [...this.actions.keys()];
	}
	get playingClip() {
		return this.currentName;
	}
	/** Current one-shot action time, exposed for bounded badminton diagnostics. */
	get playingClipTime() {
		return this.current?.time ?? 0;
	}
	get playingClipTimeScale() {
		return this.current?.getEffectiveTimeScale() ?? 1;
	}
	/** Evaluate the current clip at an intermediate pose, then restore its live pose. */
	withCurrentClipAtTime(time, inspect) {
		const action = this.current;
		if (!action) return inspect();
		const liveTime = action.time;
		action.time = MathUtils.clamp(time, 0, action.getClip().duration);
		this.mixer.update(0);
		this.group.updateMatrixWorld(true);
		try {
			return inspect();
		} finally {
			action.time = liveTime;
			this.mixer.update(0);
			this.group.updateMatrixWorld(true);
		}
	}
	resolveAction(name) {
		return this.actions.get(name) ?? this.actions.get(FALLBACK_CLIP) ?? this.actions.values().next().value ?? null;
	}
};
//#endregion
//#region src/badminton/animation/AnimationController.ts
/**
* Prioritas tiap klip animasi. Semakin tinggi, semakin sulit diinterupsi.
*   0 - diri (Idle, Ready, DefensiveReady)
*   1 - gerakan (SplitStep, Walk, Shuffle, Lunge, Recovery, Jump, Landing)
*   2 - pukulan satu kali (Serve, Clear, Drive, Drop, Net, Block, Lift)
*   3 - serang kuat (Smash, JumpSmash)
*/
const CLIP_PRIORITY = {
	Idle: 0,
	Ready: 0,
	DefensiveReady: 0,
	SplitStep: 1,
	WalkForward: 1,
	WalkBackward: 1,
	ShuffleLeft: 1,
	ShuffleRight: 1,
	LungeForehand: 1,
	LungeBackhand: 1,
	Recovery: 1,
	Jump: 1,
	Landing: 1,
	ServeShort: 2,
	ServeLong: 2,
	ForehandClear: 2,
	BackhandClear: 2,
	DropShot: 2,
	ForehandDrive: 2,
	BackhandDrive: 2,
	NetShot: 2,
	NetKill: 2,
	DefensiveBlock: 2,
	Lift: 2,
	Smash: 3,
	JumpSmash: 3
};
/**
* Animation Controller untuk pemain badminton (Blue dan Red).
*
* Mengelola pemutaran 26 klip animasi di atas BadmintonPlayerModel dengan:
* - prioritas agar animasi penting tidak terpotong sembarangan,
* - crossfade antar klip,
* - auto-return ke Ready setelah one-shot selesai,
* - API modular untuk keyboard, AI, dan MediaPipe Hand Tracking (nantinya).
*
* Tidak menyentuh fisika, hit detection, movement, atau kamera.
*/
var BadmintonAnimationController = class {
	model;
	activeClip = null;
	activePriority = 0;
	isOneShot = false;
	constructor(model) {
		this.model = model;
	}
	/**
	* Memutar klip loop (Ready, Idle, gerakan). Tidak memotong one-shot yang
	* sedang berjalan. Loop dengan prioritas lebih tinggi dapat menggantikan
	* loop yang berjalan; prioritas sama diabaikan.
	*/
	playLoop(clip) {
		const prio = CLIP_PRIORITY[clip];
		if (this.isOneShot) return false;
		if (this.activeClip !== null && this.activePriority > prio) return false;
		this.model.play(clip);
		this.activeClip = clip;
		this.activePriority = prio;
		this.isOneShot = false;
		return true;
	}
	/**
	* Memutar klip one-shot (pukulan / serve). Setelah selesai, model otomatis
	* kembali ke Ready. Tidak memotong one-shot lain yang sedang berjalan.
	* Dapat memotong loop (Ready / Idle / gerakan).
	*/
	playOneShot(clip) {
		const prio = CLIP_PRIORITY[clip];
		if (this.isOneShot) return false;
		const started = this.model.playSwing(clip);
		if (started) {
			this.activeClip = clip;
			this.activePriority = prio;
			this.isOneShot = true;
		}
		return started;
	}
	/**
	* Majukan animasi satu frame. Panggil sekali per frame (terdapat di
	* BadmintonArena.update). Mendeteksi auto-return dari one-shot dan
	* sinkronisasi jika hit detection memutar one-shot langsung di model.
	*/
	update(delta) {
		this.model.update(delta);
		const clipName = this.model.playingClip;
		if (this.isOneShot && clipName === "Ready") {
			this.isOneShot = false;
			this.activeClip = "Ready";
			this.activePriority = 0;
			return;
		}
		if (!this.isOneShot && clipName !== null && clipName !== this.activeClip && CLIP_PRIORITY[clipName] !== void 0 && CLIP_PRIORITY[clipName] >= 2) {
			this.isOneShot = true;
			this.activeClip = clipName;
			this.activePriority = CLIP_PRIORITY[clipName];
		}
	}
	/** Kembali ke Ready segera, membatalkan apapun yang sedang berjalan. */
	stop() {
		this.model.play("Ready");
		this.activeClip = "Ready";
		this.activePriority = 0;
		this.isOneShot = false;
	}
	/** Klip yang sedang diputar, atau null jika belum ada. */
	get playingClip() {
		return this.activeClip;
	}
	get playingClipTime() {
		return this.model.playingClipTime;
	}
	get playingClipTimeScale() {
		return this.model.playingClipTimeScale;
	}
	withCurrentClipAtTime(time, inspect) {
		return this.model.withCurrentClipAtTime(time, inspect);
	}
	/** True saat klip one-shot sedang berjalan. */
	get isPlayingOneShot() {
		return this.isOneShot;
	}
	/** Prioritas klip saat ini. */
	get playingPriority() {
		return this.activePriority;
	}
	/** Durasi klip dalam detik, atau 0 jika klip tidak tersedia. */
	clipDuration(clip) {
		return this.model.clipDuration(clip);
	}
	/** True jika klip tersedia pada model. */
	hasClip(clip) {
		return this.model.hasClip(clip);
	}
	/** Daftar semua nama klip yang tersedia. */
	get clipNames() {
		return this.model.clipNames;
	}
};
//#endregion
//#region src/badminton/controllers/Movement.ts
/**
* Converts a local-space intent into a world-space direction.
*
* The player GLBs are authored with forward = -Z at rotation 0, so yaw 0
* already looks towards -Z. The mapping uses that character frame (-Z forward,
* +X right) instead of assuming a +Z forward model.
*/
function intentToWorld(intent, yaw) {
	const sin = Math.sin(yaw);
	const cos = Math.cos(yaw);
	return {
		x: -intent.z * sin + intent.x * cos,
		z: -intent.z * cos - intent.x * sin
	};
}
/** Normalises the intent so diagonals are not faster than single axes. */
function normaliseIntent(intent) {
	const length = Math.hypot(intent.x, intent.z);
	if (length <= 1 || length === 0) return intent;
	return {
		x: intent.x / length,
		z: intent.z / length
	};
}
/** Keeps a position inside the bounds, so nobody walks through the net. */
function clampToBounds(position, bounds) {
	position.x = Math.min(Math.max(position.x, bounds.minX), bounds.maxX);
	position.z = Math.min(Math.max(position.z, bounds.minZ), bounds.maxZ);
}
/**
* Applies a movement intent to an Object3D using delta time. This class knows
* nothing about keyboards, AI or the player model: it only moves and clamps.
*/
var BadmintonMovement = class {
	target;
	bounds;
	speed;
	movement = new Vector3();
	constructor(target, bounds, speed) {
		this.target = target;
		this.bounds = bounds;
		this.speed = speed;
	}
	setSpeed(speed) {
		this.speed = speed;
	}
	setBounds(bounds) {
		this.bounds = bounds;
	}
	apply(intent, delta) {
		const local = normaliseIntent(intent);
		if (local.x === 0 && local.z === 0) return;
		const world = intentToWorld(local, this.target.rotation.y);
		this.movement.set(world.x, 0, world.z).multiplyScalar(this.speed * delta);
		const position = this.target.position;
		position.add(this.movement);
		clampToBounds(position, this.bounds);
	}
};
//#endregion
//#region src/badminton/controllers/AIController.ts
/** Preset kesulitan. NORMAL adalah default Tahap 2.13. */
const AI_BALANCE = {
	easy: {
		reactionDelay: .38,
		predictionAccuracy: .8,
		movementSpeed: 2.5,
		interceptionError: .45,
		swingTimingError: .15,
		returnAccuracy: .65
	},
	normal: {
		reactionDelay: .1,
		predictionAccuracy: .97,
		movementSpeed: 3.25,
		interceptionError: .1,
		swingTimingError: .035,
		returnAccuracy: .9
	},
	hard: {
		reactionDelay: .14,
		predictionAccuracy: .96,
		movementSpeed: 3.4,
		interceptionError: .12,
		swingTimingError: .04,
		returnAccuracy: .93
	}
};
const IDLE_MIN = .5;
const IDLE_MAX = 1.1;
const MOVE_MIN = 1;
const MOVE_MAX = 2.2;
/** Prediksi lintasan: horizon maksimum (detik). */
const PREDICT_HORIZON = 2.5;
/** Dianggap sampai di titik target/home bila lebih dekat dari ini (meter). */
const ARRIVE_TOLERANCE = .25;
const HOME_TOLERANCE = .35;
/** Batas waktu maksimal mode recover sebelum kembali patroli. */
const RECOVER_MAX = 2.5;
/** Zona intersepsi: shuttle harus sudah melewati bidang net ke sisi Blue. */
const INTERCEPT_FRONT_Z = -.15;
/** Tinggi kontak yang dicoba, dari tinggi ke rendah (meter). */
const STRIKE_HEIGHTS = [
	1.45,
	1.25,
	1.05,
	.85,
	.65,
	.45
];
/** Margin minimum agar titik kontak tinggi dianggap masih dapat dikejar. */
const MIN_CONTACT_MARGIN = 0;
/** Batas tinggi shuttle yang masih bisa dipukul. */
const SWING_MIN_Y = .3;
const SWING_MAX_Y = 1.9;
/** Jarak horizontal maksimum raket ke shuttle saat mulai ayunan (meter). */
const SWING_REACH = .85;
/** Jeda antar percobaan swing agar tidak spam saat shuttle masih dekat. */
const SWING_RETRY_COOLDOWN = .9;
const SWING_BUSY_COOLDOWN = .35;
/** Radius patroli lateral di sekitar home, supaya AI tidak stray terlalu jauh. */
const PATROL_RADIUS = 1;
const PATROL_DEPTH_RADIUS = .55;
/**
* Perkiraan fraksi durasi klip saat permukaan raket melewati zona kontak.
* Diukur dari klip GLB yang ada; dipakai untuk memulai ayunan lebih awal.
*/
const CONTACT_FRACTION = {
	ForehandClear: .19,
	BackhandClear: .19,
	ForehandDrive: .26,
	BackhandDrive: .26,
	Lift: .23,
	DefensiveBlock: .21,
	NetShot: .22,
	DropShot: .22
};
/**
* Waktu (detik) sampai shuttle turun melewati ketinggian `height`.
* Hanya akar positif yang masih turun (vy < 0) yang dipakai.
*/
function descendingTime(y, vy, gravity, height) {
	const a = -.5 * gravity;
	const b = vy;
	const c = y - height;
	const disc = b * b - 4 * a * c;
	if (disc < 0) return null;
	const root = Math.sqrt(disc);
	const candidates = [(-b - root) / (2 * a), (-b + root) / (2 * a)].filter((t) => t > 0 && vy - gravity * t <= 0);
	if (candidates.length === 0) return null;
	return Math.min(...candidates);
}
/**
* Controller AI untuk pemain Blue.
*
* Tiga mode:
*   - patrol    : tidak ada ancaman; kembali ke sekitar home dan bergerak kecil.
*   - intercept : shuttle menuju Blue; bergerak ke titik kontak hasil prediksi.
*   - recover   : rally selesai / tidak ada ancaman; kembali ke home.
*
* Penerimaan servis memakai pipeline nyata: prediksi lintasan -> gerak ->
* pilih klip -> minta swing -> RacketHitDetection Blue menguji kontak mesh
* raket. Tidak ada pemindahan shuttlecock atau hit tanpa kontak.
*/
var BadmintonAIController = class {
	player;
	animationController;
	options;
	movement;
	bounds;
	balance;
	mode = "patrol";
	/** Sub-state patroli (perilaku lama, dipertahankan). */
	patrolState = "idle";
	timer = this.randomBetween(IDLE_MIN, IDLE_MAX);
	active = false;
	interceptTarget = new Vector3();
	interceptOffset = new Vector3();
	swingCooldown = 0;
	recoverTimer = 0;
	/** Status satu shuttle yang datang; error dibangkitkan sekali per shuttle. */
	threatActive = false;
	reactionRemaining = 0;
	predictionGravityScale = 1;
	swingTimingOffset = 0;
	erraticSwing = false;
	plannedStrikeHeight = 1;
	constructor(player, bounds, speed = 2.6, animationController, options = {}) {
		this.player = player;
		this.animationController = animationController;
		this.options = options;
		const preset = AI_BALANCE[options.difficulty ?? "normal"];
		this.balance = {
			...preset,
			...options.balance
		};
		if (options.difficulty === void 0 && options.balance?.movementSpeed === void 0) this.balance.movementSpeed = speed;
		this.movement = new BadmintonMovement(player, bounds, this.balance.movementSpeed);
		this.bounds = bounds;
	}
	enable() {
		this.active = true;
	}
	disable() {
		this.active = false;
	}
	update(delta) {
		if (!this.active) return;
		const intent = this.decideIntent(delta);
		this.movement.apply(intent, delta);
		this.updateAnimation(intent);
		this.updateSwingDecision(delta);
	}
	get currentState() {
		return this.mode;
	}
	/** Parameter balancing yang sedang dipakai (read-only untuk diagnosa). */
	get balanceParameters() {
		return this.balance;
	}
	/** Keputusan intent gerakan per frame berdasarkan status shuttlecock. */
	decideIntent(delta) {
		const shuttle = this.options.shuttle;
		if (!shuttle) return this.patrolIntent(delta);
		const phase = shuttle.getPhase();
		const v = shuttle.getVelocity();
		if (!(phase === "flying" && v.z < -.05)) {
			if (this.threatActive) this.endThreat();
			if (this.mode === "intercept") {
				this.setMode("recover");
				this.recoverTimer = RECOVER_MAX;
			}
			return this.mode === "recover" ? this.recoverIntent(delta) : this.patrolIntent(delta);
		}
		if (!this.threatActive) this.beginThreat();
		if (this.reactionRemaining > 0) {
			this.reactionRemaining = Math.max(0, this.reactionRemaining - delta);
			return {
				x: 0,
				z: 0
			};
		}
		if (this.planInterception()) {
			this.setMode("intercept");
			return this.moveToward(this.interceptTarget);
		}
		if (this.planLandingChase()) {
			this.setMode("intercept");
			return this.moveToward(this.interceptTarget);
		}
		if (this.mode === "intercept") {
			this.setMode("recover");
			this.recoverTimer = RECOVER_MAX;
		}
		return this.mode === "recover" ? this.recoverIntent(delta) : this.patrolIntent(delta);
	}
	/** Mulai satu ancaman baru: reaction delay dan galat persepsi per shuttle. */
	beginThreat() {
		this.threatActive = true;
		this.reactionRemaining = Math.max(0, this.balance.reactionDelay + this.randomBetween(-.04, .04));
		const angle = Math.random() * Math.PI * 2;
		const radius = Math.random() * this.balance.interceptionError;
		this.interceptOffset.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
		const gravityError = (1 - this.balance.predictionAccuracy) * .9;
		this.predictionGravityScale = 1 + this.randomBetween(-gravityError, gravityError);
		this.erraticSwing = Math.random() > this.balance.returnAccuracy;
		const extraTimingError = this.erraticSwing ? this.balance.swingTimingError * 1.4 : 0;
		this.swingTimingOffset = this.randomBetween(-this.balance.swingTimingError - extraTimingError, this.balance.swingTimingError + extraTimingError);
		this.plannedStrikeHeight = 1;
		console.info(`[BADMINTON-DIAG] AI: threat start, reaction=${this.reactionRemaining.toFixed(2)}s, offset=(${this.interceptOffset.x.toFixed(2)},${this.interceptOffset.z.toFixed(2)}), gravityScale=${this.predictionGravityScale.toFixed(3)}, timing=${this.swingTimingOffset.toFixed(2)}s, erratic=${this.erraticSwing}`);
	}
	endThreat() {
		this.threatActive = false;
		this.reactionRemaining = 0;
		this.interceptOffset.set(0, 0, 0);
	}
	/**
	* Pilih titik kontak yang realistis: shuttle turun melewati salah satu
	* ketinggian pukul, masih di sisi Blue, lalu hitung apakah AI bisa sampai
	* sebelum ayunan harus dimulai.
	*/
	planInterception() {
		const shuttle = this.options.shuttle;
		if (!shuttle) return false;
		const p = shuttle.getPosition();
		const v = shuttle.getVelocity();
		const gravity = shuttle.getGravity() * this.predictionGravityScale;
		const position = this.player.position;
		const speed = this.balance.movementSpeed;
		let chosen = null;
		let bestEffort = null;
		for (const height of STRIKE_HEIGHTS) {
			const time = descendingTime(p.y, v.y, gravity, height);
			if (time === null || time <= .02 || time > PREDICT_HORIZON) continue;
			const x = p.x + v.x * time;
			const z = p.z + v.z * time;
			if (z > INTERCEPT_FRONT_Z) continue;
			if (z < this.bounds.minZ - .6) continue;
			if (x < this.bounds.minX - .8 || x > this.bounds.maxX + .8) continue;
			const clip = this.pickSwingClip(height, x - position.x, z);
			const stance = this.getInterceptStance(x, z, clip);
			const distance = Math.hypot(stance.x - position.x, stance.z - position.z);
			const lead = this.swingLead(clip);
			const margin = time - Math.max(lead, Math.max(0, distance - .12) / speed);
			const candidate = {
				height,
				time,
				x,
				z,
				margin
			};
			if (margin >= MIN_CONTACT_MARGIN) {
				chosen = candidate;
				break;
			}
			if (!bestEffort || margin > bestEffort.margin) bestEffort = candidate;
		}
		const pick = chosen ?? bestEffort;
		if (!pick) return false;
		this.plannedStrikeHeight = pick.height;
		const targetX = MathUtils.clamp(pick.x + this.interceptOffset.x, this.bounds.minX, this.bounds.maxX);
		const targetZ = MathUtils.clamp(pick.z + this.interceptOffset.z, this.bounds.minZ, this.bounds.maxZ);
		const clip = this.pickSwingClip(pick.height, targetX - position.x, targetZ);
		this.interceptTarget.copy(this.getInterceptStance(targetX, targetZ, clip));
		return true;
	}
	/** Fallback: chase the predicted ground landing of the incoming shuttle. */
	planLandingChase() {
		const shuttle = this.options.shuttle;
		if (!shuttle) return false;
		const p = shuttle.getPosition();
		const v = shuttle.getVelocity();
		const gravity = shuttle.getGravity() * this.predictionGravityScale;
		const time = descendingTime(p.y, v.y, gravity, .15);
		if (time === null || time <= 0 || time > PREDICT_HORIZON) return false;
		const x = p.x + v.x * time;
		const z = p.z + v.z * time;
		if (z > INTERCEPT_FRONT_Z) return false;
		this.interceptTarget.set(MathUtils.clamp(x + this.interceptOffset.x, this.bounds.minX, this.bounds.maxX), 0, MathUtils.clamp(z + this.interceptOffset.z, this.bounds.minZ, this.bounds.maxZ));
		return true;
	}
	/** Body stance calibrated to the real racket sweep pose in the GLB. */
	getInterceptStance(x, z, _clip) {
		const side = x >= this.player.position.x ? 1 : -1;
		return new Vector3(MathUtils.clamp(x + side * .72, this.bounds.minX, this.bounds.maxX), 0, MathUtils.clamp(z - .47, this.bounds.minZ, this.bounds.maxZ));
	}
	/** Intent untuk bergerak ke titik dunia tertentu (nol bila sudah sampai). */
	moveToward(target) {
		const dx = target.x - this.player.position.x;
		const dz = target.z - this.player.position.z;
		const distance = Math.hypot(dx, dz);
		if (distance <= ARRIVE_TOLERANCE) return {
			x: 0,
			z: 0
		};
		const yaw = this.player.rotation.y;
		const sin = Math.sin(yaw);
		const cos = Math.cos(yaw);
		const wx = dx / distance;
		const wz = dz / distance;
		return {
			x: wx * cos - wz * sin,
			z: -wx * sin - wz * cos
		};
	}
	/** Kembali ke posisi home, lalu lanjut patroli. */
	recoverIntent(delta) {
		const home = this.options.home;
		if (!home) {
			this.setMode("patrol");
			this.resetPatrol();
			return {
				x: 0,
				z: 0
			};
		}
		this.recoverTimer -= delta;
		if (Math.hypot(home.x - this.player.position.x, home.z - this.player.position.z) <= HOME_TOLERANCE || this.recoverTimer <= 0) {
			this.setMode("patrol");
			this.resetPatrol();
			return {
				x: 0,
				z: 0
			};
		}
		return this.moveToward(home);
	}
	/** Patroli lama: jeda acak berganti arah kiri/kanan di sekitar home. */
	patrolIntent(delta) {
		const home = this.options.home;
		if (home) {
			const dx = this.player.position.x - home.x;
			const dz = this.player.position.z - home.z;
			if (Math.abs(dx) > PATROL_RADIUS || Math.abs(dz) > PATROL_DEPTH_RADIUS) return this.moveToward(home);
		}
		this.timer -= delta;
		if (this.timer <= 0) this.chooseNextPatrolState();
		return this.patrolCurrentIntent();
	}
	resetPatrol() {
		this.patrolState = "idle";
		this.timer = this.randomBetween(IDLE_MIN, IDLE_MAX);
	}
	setMode(mode) {
		if (this.mode === mode) return;
		this.mode = mode;
		console.info(`[BADMINTON-DIAG] AI: mode=${mode}, blue pos=(${this.player.position.x.toFixed(2)},${this.player.position.z.toFixed(2)})`);
	}
	/** Menentukan klip locomotion dari intent gerakan AI. Tidak mengganggu one-shot. */
	updateAnimation(intent) {
		if (!this.animationController) return;
		if (this.animationController.isPlayingOneShot) return;
		let clip;
		if (intent.x === 0 && intent.z === 0) {
			this.animationController.stop();
			return;
		}
		if (Math.abs(intent.x) >= Math.abs(intent.z)) clip = intent.x > 0 ? "ShuffleRight" : "ShuffleLeft";
		else clip = intent.z > 0 ? "WalkForward" : "WalkBackward";
		this.animationController.playLoop(clip);
	}
	/**
	* Keputusan swing Blue. Ayunan dimulai `lead` detik sebelum shuttle mencapai
	* titik kontak terpilih, sehingga permukaan raket punya waktu menyapu shuttle.
	* Kontak tetap harus lolos RacketHitDetection (mesh raket + satu hit/swing).
	*/
	updateSwingDecision(delta) {
		this.swingCooldown = Math.max(0, this.swingCooldown - delta);
		const shuttle = this.options.shuttle;
		const requestSwing = this.options.requestSwing;
		if (!shuttle || !requestSwing) return;
		if (!this.threatActive || this.reactionRemaining > 0) return;
		if (this.swingCooldown > 0) return;
		if (shuttle.getPhase() !== "flying") return;
		const p = shuttle.getPosition();
		const v = shuttle.getVelocity();
		if (v.z >= 0) return;
		let height = this.plannedStrikeHeight;
		if (height > p.y + .1) height = Math.max(SWING_MIN_Y, Math.min(SWING_MAX_Y, p.y));
		if (height < SWING_MIN_Y || height > SWING_MAX_Y) return;
		const gravity = shuttle.getGravity();
		const timeToContact = descendingTime(p.y, v.y, gravity, height);
		if (timeToContact === null) return;
		const contactX = p.x + v.x * timeToContact;
		const contactZ = p.z + v.z * timeToContact;
		if (contactZ > INTERCEPT_FRONT_Z) return;
		const dx = contactX - this.player.position.x;
		const dz = contactZ - this.player.position.z;
		const distance = Math.hypot(dx, dz);
		const preferredClip = this.pickSwingClip(height, dx, contactZ);
		const clip = this.erraticSwing ? this.pickDefensiveClip(dx, height) : preferredClip;
		const lead = this.swingLead(clip) + this.swingTimingOffset;
		if (timeToContact > lead) return;
		const approach = Math.max(0, lead) * this.balance.movementSpeed;
		if (distance > SWING_REACH + approach) return;
		if (requestSwing(clip)) {
			this.swingCooldown = SWING_RETRY_COOLDOWN;
			console.info(`[BADMINTON-DIAG] AI: swing ${clip} (${this.erraticSwing ? "defensive" : "normal"}), height=${height.toFixed(2)} contactIn=${timeToContact.toFixed(3)}s lead=${lead.toFixed(3)}s shuttle=(${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}) vel=(${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}) blue=(${this.player.position.x.toFixed(2)},${this.player.position.z.toFixed(2)})`);
		} else this.swingCooldown = SWING_BUSY_COOLDOWN;
	}
	/** Perkiraan waktu kontak raket untuk klip tertentu. */
	swingLead(clip) {
		const fraction = CONTACT_FRACTION[clip] ?? .22;
		const duration = this.animationController?.clipDuration(clip) ?? 1.3;
		return MathUtils.clamp(duration * fraction, .18, .5);
	}
	/**
	* Pilih klip pukulan sesuai situasi. Blue menghadap +Z sehingga tangan
	* kanan (forehand) berada di sisi -X dunia. Klip yang tidak ada pada GLB
	* dilewati; fallback terakhir ForehandClear.
	*/
	pickSwingClip(shuttleY, dx, shuttleZ) {
		const forehand = dx < 0;
		let candidates;
		if (shuttleZ > -1 && shuttleY < 1.2) candidates = forehand ? ["NetShot", "DefensiveBlock"] : ["DefensiveBlock", "BackhandDrive"];
		else if (shuttleY > 1.45) candidates = forehand ? ["ForehandClear", "BackhandClear"] : ["BackhandClear", "ForehandClear"];
		else if (shuttleY < .8) candidates = forehand ? [
			"Lift",
			"DefensiveBlock",
			"ForehandDrive"
		] : [
			"Lift",
			"DefensiveBlock",
			"BackhandDrive"
		];
		else candidates = forehand ? ["ForehandDrive", "ForehandClear"] : ["BackhandDrive", "BackhandClear"];
		for (const clip of candidates) if (!this.animationController || this.animationController.hasClip(clip)) return clip;
		return "ForehandClear";
	}
	/** Klip defensif/berisiko untuk pukulan yang tidak akurat. */
	pickDefensiveClip(dx, shuttleY) {
		const forehand = dx < 0;
		const candidates = shuttleY < .8 ? [
			"DefensiveBlock",
			"Lift",
			forehand ? "ForehandDrive" : "BackhandDrive"
		] : [
			"DefensiveBlock",
			forehand ? "BackhandDrive" : "ForehandDrive",
			"NetShot"
		];
		for (const clip of candidates) if (!this.animationController || this.animationController.hasClip(clip)) return clip;
		return "DefensiveBlock";
	}
	patrolCurrentIntent() {
		if (this.patrolState === "moveLeft") return {
			x: -1,
			z: 0
		};
		if (this.patrolState === "moveRight") return {
			x: 1,
			z: 0
		};
		return {
			x: 0,
			z: 0
		};
	}
	chooseNextPatrolState() {
		switch (this.patrolState) {
			case "idle":
				this.patrolState = Math.random() < .5 ? "moveLeft" : "moveRight";
				this.timer = this.randomBetween(MOVE_MIN, MOVE_MAX);
				break;
			case "moveLeft":
			case "moveRight": if (Math.random() < .35) {
				this.patrolState = "idle";
				this.timer = this.randomBetween(IDLE_MIN, IDLE_MAX);
			} else {
				this.patrolState = this.patrolState === "moveLeft" ? "moveRight" : "moveLeft";
				this.timer = this.randomBetween(MOVE_MIN, MOVE_MAX);
			}
		}
	}
	randomBetween(min, max) {
		return min + Math.random() * (max - min);
	}
	/** Kept for symmetry with the player controller. */
	get position() {
		return this.player.position;
	}
};
//#endregion
//#region src/badminton/physics/RacketSurfaceCollision.ts
/**
* Collision against the racket string bed and rim, stored in racket-root local
* space so their BVH remains valid while the hand and racket move together.
*/
var RacketSurfaceCollision = class {
	root;
	tree;
	localHeadCenter = new Vector3();
	bounds = new Box3();
	rootInverse = new Matrix4();
	relative = new Matrix4();
	a = new Vector3();
	b = new Vector3();
	c = new Vector3();
	localPoint = new Vector3();
	closest = new Vector3();
	closestWorld = new Vector3();
	closestLocal = new Vector3();
	previousSurfaceWorld = new Vector3();
	currentSurfaceWorld = new Vector3();
	worldShuttle = new Vector3();
	interpolated = new Matrix4();
	inverse = new Matrix4();
	previousPosition = new Vector3();
	currentPosition = new Vector3();
	previousRotation = new Quaternion();
	currentRotation = new Quaternion();
	previousScale = new Vector3();
	currentScale = new Vector3();
	interpolatedPosition = new Vector3();
	interpolatedRotation = new Quaternion();
	interpolatedScale = new Vector3();
	constructor(playerGroup) {
		const roots = [];
		playerGroup.traverse((object) => {
			if (object.name === "BadmintonRacket" && object.parent?.name === "RightHand") roots.push(object);
		});
		if (roots.length !== 1) throw new Error(`Expected one BadmintonRacket attached to RightHand; found ${roots.length}`);
		this.root = roots[0];
		this.root.updateMatrixWorld(true);
		const namedMeshes = /* @__PURE__ */ new Map();
		this.root.traverse((object) => {
			if (!object.visible || !object.isMesh) return;
			const mesh = object;
			if (mesh.name === "Object_4" || mesh.name === "Object_10") {
				const list = namedMeshes.get(mesh.name) ?? [];
				list.push(mesh);
				namedMeshes.set(mesh.name, list);
			}
		});
		let selected = ["Object_4", "Object_10"].flatMap((name) => namedMeshes.get(name) ?? []);
		if (selected.length !== 2 || new Set(selected.map((mesh) => mesh.name)).size !== 2) {
			selected = [];
			this.root.traverse((object) => {
				if (!object.visible || !object.isMesh) return;
				const mesh = object;
				if (this.isHeadSurface(mesh)) selected.push(mesh);
			});
		}
		if (selected.length === 0) throw new Error("No validated racket string-bed or frame surface mesh found");
		this.rootInverse.copy(this.root.matrixWorld).invert();
		const triangles = [];
		for (const mesh of selected) this.appendMeshTriangles(mesh, triangles);
		if (triangles.length < 2) throw new Error("Racket head surface has too few valid triangles");
		this.tree = this.buildBvh(triangles);
		this.tree.bounds.getCenter(this.localHeadCenter);
	}
	getHeadWorldCenter(target) {
		return target.copy(this.localHeadCenter).applyMatrix4(this.root.matrixWorld);
	}
	/** Closest exact triangle point for a bounded runtime diagnostic sample. */
	measureClosest(worldPoint, target, previousMatrix, delta = 0) {
		this.root.updateWorldMatrix(true, true);
		this.inverse.copy(this.root.matrixWorld).invert();
		this.localPoint.copy(worldPoint).applyMatrix4(this.inverse);
		const nearest = this.findNearest(this.tree, this.localPoint, Infinity);
		if (!nearest) {
			target.distance = Infinity;
			target.surfaceVelocity.set(0, 0, 0);
			return target;
		}
		target.point.copy(nearest.point).applyMatrix4(this.root.matrixWorld);
		target.distance = target.point.distanceTo(worldPoint);
		if (previousMatrix && delta > 0) {
			this.previousSurfaceWorld.copy(nearest.point).applyMatrix4(previousMatrix);
			target.surfaceVelocity.subVectors(target.point, this.previousSurfaceWorld).divideScalar(Math.max(delta, 1 / 240));
		} else target.surfaceVelocity.set(0, 0, 0);
		return target;
	}
	/**
	* Sweeps the complete head surface between two transforms while the shuttle
	* moves between its two world positions. The returned point is on a real
	* triangle, and distance is measured against the shuttle's physical radius.
	*/
	findSweptContact(previousMatrix, currentMatrix, previousShuttle, currentShuttle, delta, shuttleRadius, target) {
		previousMatrix.decompose(this.previousPosition, this.previousRotation, this.previousScale);
		currentMatrix.decompose(this.currentPosition, this.currentRotation, this.currentScale);
		const headRadius = this.tree.bounds.getBoundingSphere(SPHERE).radius;
		const rotationTravel = this.previousRotation.angleTo(this.currentRotation) * headRadius;
		const relativeTravel = previousShuttle.distanceTo(currentShuttle) + this.previousPosition.distanceTo(this.currentPosition) + rotationTravel;
		const sampleStep = Math.max(shuttleRadius * .5, .008);
		const steps = MathUtils.clamp(Math.ceil(relativeTravel / sampleStep), 1, 32);
		const maxWorldDistance = shuttleRadius;
		let bestDistanceSq = maxWorldDistance * maxWorldDistance;
		let found = false;
		for (let i = 0; i <= steps; i++) {
			const alpha = i / steps;
			this.interpolateMatrix(previousMatrix, currentMatrix, alpha, this.interpolated);
			this.inverse.copy(this.interpolated).invert();
			this.worldShuttle.lerpVectors(previousShuttle, currentShuttle, alpha);
			this.localPoint.copy(this.worldShuttle).applyMatrix4(this.inverse);
			const localScale = minAbsScale(this.interpolated);
			const localRadius = maxWorldDistance / Math.max(localScale, 1e-6);
			const nearest = this.findNearest(this.tree, this.localPoint, localRadius * localRadius);
			if (!nearest) continue;
			const worldScale = localScale;
			const worldDistanceSq = nearest.distanceSq * worldScale * worldScale;
			if (worldDistanceSq > bestDistanceSq) continue;
			bestDistanceSq = worldDistanceSq;
			this.closestWorld.copy(nearest.point).applyMatrix4(this.interpolated);
			target.point.copy(this.closestWorld);
			target.distance = Math.sqrt(worldDistanceSq);
			this.closestLocal.copy(nearest.point);
			found = true;
		}
		if (found) {
			this.previousSurfaceWorld.copy(this.closestLocal).applyMatrix4(previousMatrix);
			this.currentSurfaceWorld.copy(this.closestLocal).applyMatrix4(currentMatrix);
			target.surfaceVelocity.subVectors(this.currentSurfaceWorld, this.previousSurfaceWorld).divideScalar(Math.max(delta, 1 / 240));
		}
		return found ? target : null;
	}
	appendMeshTriangles(mesh, output) {
		const geometry = mesh.geometry;
		const position = geometry.getAttribute("position");
		if (!position || position.itemSize < 3) return;
		const index = geometry.getIndex();
		const count = index ? index.count : position.count;
		this.relative.multiplyMatrices(this.rootInverse, mesh.matrixWorld);
		for (let i = 0; i + 2 < count; i += 3) {
			const ia = index ? index.getX(i) : i;
			const ib = index ? index.getX(i + 1) : i + 1;
			const ic = index ? index.getX(i + 2) : i + 2;
			this.a.fromBufferAttribute(position, ia).applyMatrix4(this.relative);
			this.b.fromBufferAttribute(position, ib).applyMatrix4(this.relative);
			this.c.fromBufferAttribute(position, ic).applyMatrix4(this.relative);
			const ab = this.b.clone().sub(this.a);
			const ac = this.c.clone().sub(this.a);
			if (ab.cross(ac).lengthSq() < 1e-12) continue;
			const a = this.a.clone();
			const b = this.b.clone();
			const c = this.c.clone();
			const bounds = new Box3().setFromPoints([
				a,
				b,
				c
			]);
			output.push({
				a,
				b,
				c,
				bounds,
				center: bounds.getCenter(new Vector3())
			});
		}
	}
	isHeadSurface(mesh) {
		const geometry = mesh.geometry;
		if (!geometry.getAttribute("position")) return false;
		geometry.computeBoundingBox();
		if (!geometry.boundingBox) return false;
		this.relative.multiplyMatrices(this.rootInverse, mesh.matrixWorld);
		const dimensions = geometry.boundingBox.clone().applyMatrix4(this.relative).getSize(new Vector3()).toArray().sort((a, b) => a - b);
		return dimensions[0] <= .05 && dimensions[1] >= .16 && dimensions[2] >= .18 && dimensions[2] <= .36;
	}
	buildBvh(triangles) {
		const bounds = new Box3().makeEmpty();
		for (const triangle of triangles) bounds.union(triangle.bounds);
		if (triangles.length <= LEAF_TRIANGLE_COUNT) return {
			bounds,
			triangles
		};
		const size = bounds.getSize(SIZE);
		const axis = size.x >= size.y && size.x >= size.z ? "x" : size.y >= size.z ? "y" : "z";
		triangles.sort((a, b) => a.center[axis] - b.center[axis]);
		const middle = Math.floor(triangles.length / 2);
		return {
			bounds,
			left: this.buildBvh(triangles.slice(0, middle)),
			right: this.buildBvh(triangles.slice(middle))
		};
	}
	findNearest(node, point, maximumDistanceSq) {
		let bestDistanceSq = maximumDistanceSq;
		let bestPoint = null;
		const visit = (current) => {
			if (current.bounds.distanceToPoint(point) ** 2 > bestDistanceSq) return;
			if (current.triangles) {
				for (const item of current.triangles) {
					TRIANGLE.set(item.a, item.b, item.c).closestPointToPoint(point, this.closest);
					const distanceSq = this.closest.distanceToSquared(point);
					if (distanceSq <= bestDistanceSq) {
						bestDistanceSq = distanceSq;
						bestPoint = this.closest.clone();
					}
				}
				return;
			}
			const left = current.left;
			const right = current.right;
			if (!left || !right) return;
			if (left.bounds.distanceToPoint(point) <= right.bounds.distanceToPoint(point)) {
				visit(left);
				visit(right);
			} else {
				visit(right);
				visit(left);
			}
		};
		visit(node);
		return bestPoint ? {
			point: bestPoint,
			distanceSq: bestDistanceSq
		} : null;
	}
	interpolateMatrix(from, to, alpha, target) {
		from.decompose(this.previousPosition, this.previousRotation, this.previousScale);
		to.decompose(this.currentPosition, this.currentRotation, this.currentScale);
		this.interpolatedPosition.lerpVectors(this.previousPosition, this.currentPosition, alpha);
		this.interpolatedRotation.copy(this.previousRotation).slerp(this.currentRotation, alpha);
		this.interpolatedScale.lerpVectors(this.previousScale, this.currentScale, alpha);
		target.compose(this.interpolatedPosition, this.interpolatedRotation, this.interpolatedScale);
	}
};
const LEAF_TRIANGLE_COUNT = 8;
const TRIANGLE = new Triangle();
const SPHERE = new Sphere();
const SIZE = new Vector3();
function minAbsScale(matrix) {
	matrix.decompose(UNUSED_POSITION, UNUSED_ROTATION, UNUSED_SCALE);
	return Math.min(Math.abs(UNUSED_SCALE.x), Math.abs(UNUSED_SCALE.y), Math.abs(UNUSED_SCALE.z));
}
const UNUSED_POSITION = new Vector3();
const UNUSED_ROTATION = new Quaternion();
const UNUSED_SCALE = new Vector3();
//#endregion
//#region src/badminton/physics/RacketHitDetection.ts
/** Model-local forward axis of the GLB (forward = -Z at yaw 0). */
const MODEL_FORWARD = new Vector3(0, 0, -1);
const DEFAULTS = {
	shuttleRadius: .035,
	contactWindow: [.1, .85],
	minRacketSpeed: .5,
	powerScale: 1.15,
	minHitSpeed: 4.5,
	maxHitSpeed: 14,
	forwardBias: .45,
	minRise: .3,
	defaultSwing: "ForehandClear"
};
/**
* Racket hit detection for the human player.
*
* Sweeps the racket's actual string bed and rim triangles between frames. The
* shuttle can only be struck when its physical radius overlaps a real surface
* triangle inside the active swing window. One swing can only produce one hit.
*
* It knows nothing about physics, the shuttlecock visual or the keyboard: it
* receives a shuttlecock position and returns hit information.
*/
var BadmintonRacketHitDetection = class {
	player;
	animationController;
	options;
	surface;
	/** Reused scratch objects, so the per-frame path allocates nothing. */
	head = new Vector3();
	previousHead = new Vector3();
	headVelocity = new Vector3();
	contactPoint = new Vector3();
	outgoing = new Vector3();
	forward = new Vector3();
	awayFromBody = new Vector3();
	previousRacketMatrix = new Matrix4();
	currentRacketMatrix = new Matrix4();
	swingSampleMatrix = new Matrix4();
	sweepFromMatrix = new Matrix4();
	sweepToMatrix = new Matrix4();
	previousShuttlecock = new Vector3();
	swingSampleShuttlecock = new Vector3();
	sweepFromShuttlecock = new Vector3();
	surfaceContact = {
		point: new Vector3(),
		distance: Infinity,
		surfaceVelocity: new Vector3()
	};
	diagnosticSurfaceContact = {
		point: new Vector3(),
		distance: Infinity,
		surfaceVelocity: new Vector3()
	};
	diagnosticMinimumShuttle = new Vector3();
	diagnosticMinimumSurface = new Vector3();
	hasPreviousFrame = false;
	swingActive = false;
	swingElapsed = 0;
	swingDuration = 0;
	settle = 0;
	hasContact = false;
	/** Klip yang sebenarnya sedang diayun (dari animation controller). */
	currentSwingClip = null;
	diagnosticSwingBucket = -1;
	previousClipTime = 0;
	constructor(player, options = {}, animationController) {
		this.player = player;
		this.animationController = animationController;
		this.options = {
			...DEFAULTS,
			...options
		};
		this.surface = new RacketSurfaceCollision(player.group);
		player.group.updateMatrixWorld(true);
		this.currentRacketMatrix.copy(this.surface.root.matrixWorld);
		this.previousRacketMatrix.copy(this.currentRacketMatrix);
		this.surface.getHeadWorldCenter(this.previousHead);
		this.head.copy(this.previousHead);
	}
	/** The racket head node in use, exposed for debugging. */
	get racketNode() {
		return this.surface.root;
	}
	get isSwinging() {
		return this.swingActive && this.swingElapsed < this.swingDuration;
	}
	get hasHitThisSwing() {
		return this.hasContact;
	}
	/** Contact radius actually in use, in metres. */
	get reach() {
		return this.options.shuttleRadius;
	}
	/** Starts a swing clip. False when the clip is missing or already playing. */
	requestSwing(clip = this.options.defaultSwing) {
		if (this.animationController) {
			if (!this.animationController.playOneShot(clip)) return false;
		} else if (!this.player.playSwing(clip)) return false;
		this.currentSwingClip = clip;
		this.previousClipTime = this.player.playingClipTime;
		const duration = this.player.clipDuration(clip);
		this.swingDuration = duration > 0 ? duration : 1.3;
		this.swingElapsed = 0;
		this.swingActive = true;
		this.settle = SETTLE_TIME;
		this.hasContact = false;
		this.diagnosticSwingBucket = -1;
		this.player.group.updateMatrixWorld(true);
		this.currentRacketMatrix.copy(this.surface.root.matrixWorld);
		this.previousRacketMatrix.copy(this.currentRacketMatrix);
		this.surface.getHeadWorldCenter(this.previousHead);
		this.head.copy(this.previousHead);
		this.headVelocity.set(0, 0, 0);
		this.hasPreviousFrame = true;
		console.info(`[BADMINTON-DIAG] requestSwing: clip=${clip} actionTime=${this.player.playingClipTime.toFixed(3)}s duration=${this.swingDuration.toFixed(3)}s`);
		return true;
	}
	/**
	* Advances the swing timer and tests contact.
	* @returns hit information on contact, otherwise null.
	*/
	update(delta, shuttlecockPosition) {
		this.player.group.updateMatrixWorld(true);
		this.currentRacketMatrix.copy(this.surface.root.matrixWorld);
		this.surface.getHeadWorldCenter(this.head);
		if (!this.hasPreviousFrame) {
			this.previousHead.copy(this.head);
			this.previousRacketMatrix.copy(this.currentRacketMatrix);
			this.previousShuttlecock.copy(shuttlecockPosition);
			this.hasPreviousFrame = true;
			if (this.settle > 0) this.settle = Math.max(0, this.settle - delta);
			return null;
		}
		const step = Math.max(delta, MIN_STEP);
		this.headVelocity.subVectors(this.head, this.previousHead).divideScalar(step);
		if (this.swingActive) {
			this.swingElapsed += delta;
			const diagnosticBucket = Math.floor(this.swingElapsed / .08);
			if (this.currentSwingClip === "ForehandClear" && this.swingElapsed <= Math.min(this.swingDuration, .95) && diagnosticBucket !== this.diagnosticSwingBucket) {
				this.diagnosticSwingBucket = diagnosticBucket;
				this.surface.measureClosest(shuttlecockPosition, this.surfaceContact);
				console.info(`[BADMINTON-DIAG] forehandSurfaceSample swing=${this.swingElapsed.toFixed(3)}s clip=${this.player.playingClip}@${this.player.playingClipTime.toFixed(3)}s oneShot=${this.animationController?.isPlayingOneShot} progress=${(this.swingElapsed / this.swingDuration).toFixed(3)} distance=${this.surfaceContact.distance.toFixed(4)}m speed=${this.headVelocity.length().toFixed(2)}m/s shuttle=${shuttlecockPosition.toArray().map((v) => v.toFixed(3)).join(",")} closest=${this.surfaceContact.point.toArray().map((v) => v.toFixed(3)).join(",")}`);
			}
			if (this.swingElapsed >= this.swingDuration) {
				this.swingActive = false;
				this.hasContact = false;
			}
		}
		let sweepStartFraction = 0;
		if (this.settle > 0) {
			sweepStartFraction = Math.min(1, this.settle / Math.max(delta, MIN_STEP));
			this.settle = Math.max(0, this.settle - delta);
		}
		if (sweepStartFraction < 1 && this.isContactWindowOpen()) {
			let contact = null;
			if (sweepStartFraction === 0 && this.headVelocity.lengthSq() >= this.options.minRacketSpeed ** 2) contact = this.surface.findSweptContact(this.previousRacketMatrix, this.currentRacketMatrix, this.previousShuttlecock, shuttlecockPosition, delta, this.options.shuttleRadius, this.surfaceContact);
			if (!contact && this.player.playingClip === this.currentSwingClip) {
				const clipTime = this.player.playingClipTime;
				const sampleStartTime = MathUtils.lerp(this.previousClipTime, clipTime, sweepStartFraction);
				const clipDelta = Math.max(0, clipTime - sampleStartTime);
				const sampleCount = MathUtils.clamp(Math.ceil(clipDelta * 120), 1, 64);
				let sampleMinimumDistance = Infinity;
				let sampleMinimumTime = sampleStartTime;
				const startPose = () => {
					this.player.group.updateMatrixWorld(true);
					this.sweepFromMatrix.copy(this.surface.root.matrixWorld);
					this.sweepFromShuttlecock.lerpVectors(this.previousShuttlecock, shuttlecockPosition, sweepStartFraction);
				};
				if (sweepStartFraction > 0) {
					if (this.animationController) this.animationController.withCurrentClipAtTime(sampleStartTime, startPose);
					else this.player.withCurrentClipAtTime(sampleStartTime, startPose);
				} else {
					this.sweepFromMatrix.copy(this.previousRacketMatrix);
					this.sweepFromShuttlecock.copy(this.previousShuttlecock);
				}
				for (let i = 1; i <= sampleCount && !contact; i++) {
					const fraction = MathUtils.lerp(sweepStartFraction, 1, i / sampleCount);
					const sampleTime = MathUtils.lerp(this.previousClipTime, clipTime, fraction);
					const progress = sampleTime / this.swingDuration;
					if (progress < this.options.contactWindow[0] || progress > this.options.contactWindow[1]) continue;
					const sample = () => {
						this.player.group.updateMatrixWorld(true);
						this.swingSampleMatrix.copy(this.surface.root.matrixWorld);
						this.swingSampleShuttlecock.lerpVectors(this.previousShuttlecock, shuttlecockPosition, fraction);
						this.surface.measureClosest(this.swingSampleShuttlecock, this.diagnosticSurfaceContact, this.sweepFromMatrix, Math.max(delta / sampleCount, MIN_STEP));
						if (this.currentSwingClip === "ForehandClear" && sampleTime >= .29 && sampleTime <= .37) console.info(`[BADMINTON-DIAG] forehandContactSample clip=${sampleTime.toFixed(3)}s distance=${this.diagnosticSurfaceContact.distance.toFixed(4)}m shuttle=${this.swingSampleShuttlecock.toArray().map((v) => v.toFixed(3)).join(",")} closest=${this.diagnosticSurfaceContact.point.toArray().map((v) => v.toFixed(3)).join(",")}`);
						if (this.diagnosticSurfaceContact.distance < sampleMinimumDistance) {
							sampleMinimumDistance = this.diagnosticSurfaceContact.distance;
							sampleMinimumTime = sampleTime;
							this.diagnosticMinimumShuttle.copy(this.swingSampleShuttlecock);
							this.diagnosticMinimumSurface.copy(this.diagnosticSurfaceContact.point);
						}
						return this.surface.findSweptContact(this.sweepFromMatrix, this.swingSampleMatrix, this.sweepFromShuttlecock, this.swingSampleShuttlecock, Math.max(delta / sampleCount, MIN_STEP), this.options.shuttleRadius, this.surfaceContact);
					};
					const candidate = this.animationController ? this.animationController.withCurrentClipAtTime(sampleTime, sample) : this.player.withCurrentClipAtTime(sampleTime, sample);
					if (!candidate) {
						const inspectExactPose = () => {
							this.player.group.updateMatrixWorld(true);
							this.surface.measureClosest(this.swingSampleShuttlecock, this.surfaceContact, this.sweepFromMatrix, Math.max(delta / sampleCount, MIN_STEP));
						};
						if (this.animationController) this.animationController.withCurrentClipAtTime(sampleTime, inspectExactPose);
						else this.player.withCurrentClipAtTime(sampleTime, inspectExactPose);
					}
					const exactContact = !candidate && this.surfaceContact.distance <= this.options.shuttleRadius && this.surfaceContact.surfaceVelocity.lengthSq() >= this.options.minRacketSpeed ** 2;
					if (candidate && candidate.surfaceVelocity.lengthSq() >= this.options.minRacketSpeed ** 2) contact = candidate;
					else if (exactContact) contact = this.surfaceContact;
					this.sweepFromMatrix.copy(this.swingSampleMatrix);
					this.sweepFromShuttlecock.copy(this.swingSampleShuttlecock);
				}
				if (this.currentSwingClip === "ForehandClear") console.info(`[BADMINTON-DIAG] forehandSweepMinimum swing=${this.swingElapsed.toFixed(3)}s clip=${sampleMinimumTime.toFixed(3)}s distance=${sampleMinimumDistance.toFixed(4)}m shuttle=${this.diagnosticMinimumShuttle.toArray().map((v) => v.toFixed(3)).join(",")} closest=${this.diagnosticMinimumSurface.toArray().map((v) => v.toFixed(3)).join(",")}`);
			}
			if (contact) {
				this.contactPoint.copy(contact.point);
				this.headVelocity.copy(contact.surfaceVelocity);
				this.hasContact = true;
				const hit = this.buildHit(contact.distance);
				this.advancePreviousFrame(shuttlecockPosition);
				return hit;
			}
		}
		this.advancePreviousFrame(shuttlecockPosition);
		if (this.player.playingClip === this.currentSwingClip) this.previousClipTime = this.player.playingClipTime;
		return null;
	}
	resetSwing() {
		this.swingActive = false;
		this.swingElapsed = 0;
		this.hasContact = false;
		this.currentSwingClip = null;
	}
	canHit() {
		if (!this.isSwinging || this.hasContact) return false;
		if (this.headVelocity.lengthSq() < this.options.minRacketSpeed ** 2) return false;
		return this.isContactWindowOpen();
	}
	isContactWindowOpen() {
		if (!this.isSwinging || this.hasContact) return false;
		const [start, end] = this.options.contactWindow;
		const progress = this.swingElapsed / this.swingDuration;
		return progress >= start && progress <= end;
	}
	buildHit(surfaceDistance) {
		const { powerScale, minHitSpeed, maxHitSpeed, forwardBias, minRise } = this.options;
		this.forward.copy(MODEL_FORWARD).applyQuaternion(this.player.group.quaternion).normalize();
		this.awayFromBody.subVectors(this.contactPoint, this.player.group.position);
		this.awayFromBody.y = 0;
		if (this.awayFromBody.lengthSq() > 1e-6) this.awayFromBody.normalize();
		this.outgoing.copy(this.headVelocity);
		if (this.outgoing.lengthSq() < 1e-6) this.outgoing.copy(this.forward);
		this.outgoing.normalize();
		this.outgoing.lerp(this.forward, forwardBias).normalize();
		if (this.outgoing.y < minRise) this.outgoing.y = minRise;
		this.outgoing.normalize();
		this.contactPoint.addScaledVector(this.awayFromBody, CONTACT_OFFSET);
		const speed = MathUtils.clamp(this.headVelocity.length() * powerScale, minHitSpeed, maxHitSpeed);
		const velocity = this.outgoing.multiplyScalar(speed);
		return {
			point: this.contactPoint.clone(),
			surfaceDistance,
			velocity: velocity.clone(),
			speed,
			clip: this.currentSwingClip ?? this.options.defaultSwing
		};
	}
	advancePreviousFrame(shuttlecockPosition) {
		this.previousHead.copy(this.head);
		this.previousRacketMatrix.copy(this.currentRacketMatrix);
		this.previousShuttlecock.copy(shuttlecockPosition);
	}
};
const MIN_STEP = 1 / 240;
const CONTACT_OFFSET = .02;
const SETTLE_TIME = .08;
//#endregion
//#region src/badminton/physics/ShuttlecockPhysics.ts
/** Court is 6.10 (X) by 13.40 (Z); a small margin keeps it inside the lines. */
const DEFAULT_BOUNDS = {
	minX: -3.05,
	maxX: 3.05,
	minZ: -6.7,
	maxZ: 6.7
};
/**
* Basic shuttlecock flight: velocity, gravity and a reset when it lands or
* leaves the court. No racket collision, no net collision, no scoring.
*
* Integration is analytic for constant acceleration, so the result does not
* depend on the frame rate: the same launch travels the same path at 30, 60
* or 144 fps.
*/
var BadmintonShuttlecockPhysics = class {
	position = new Vector3();
	velocity = new Vector3();
	gravityVector = new Vector3();
	gravity;
	groundY;
	groundThreshold;
	bounds;
	resetPoint;
	resetDelay;
	resetTimer = 0;
	/** [BADMINTON-DIAG] Sementara: waktu sampling terakhir untuk log resetTimer. */
	_diagLastSampleTime = 0;
	phase = "idle";
	constructor(options = {}) {
		this.gravity = options.gravity ?? 9.81;
		this.groundY = options.groundY ?? 0;
		this.groundThreshold = options.groundThreshold ?? .05;
		this.bounds = options.bounds ?? DEFAULT_BOUNDS;
		this.resetPoint = (options.resetPoint ?? new Vector3(0, 1.5, 3.5)).clone();
		this.resetDelay = options.resetDelay ?? 1.2;
		this.gravityVector.set(0, -this.gravity, 0);
		this.position.copy(this.resetPoint);
	}
	launch(position, velocity) {
		console.info(`[BADMINTON-DIAG] physics.launch: pos=(${position.x.toFixed(2)},${position.y.toFixed(2)},${position.z.toFixed(2)}) vel=(${velocity.x.toFixed(2)},${velocity.y.toFixed(2)},${velocity.z.toFixed(2)})`);
		this.position.copy(position);
		this.velocity.copy(velocity);
		this.resetTimer = 0;
		this.phase = "flying";
	}
	/** Stops the flight and parks the shuttlecock at its reset point. */
	reset(position, velocity) {
		console.info(`[BADMINTON-DIAG] physics.reset: before phase=${this.phase} pos=(${this.position.x.toFixed(2)},${this.position.y.toFixed(2)},${this.position.z.toFixed(2)}) resetTimer=${this.resetTimer.toFixed(2)}`);
		this.position.copy(position ?? this.resetPoint);
		this.velocity.copy(velocity ?? ZERO);
		this.resetTimer = 0;
		this.phase = "idle";
		console.info(`[BADMINTON-DIAG] physics.reset: after phase=${this.phase} pos=(${this.position.x.toFixed(2)},${this.position.y.toFixed(2)},${this.position.z.toFixed(2)}) isReadyToLaunch=${this.isReadyToLaunch()}`);
	}
	stop() {
		console.info(`[BADMINTON-DIAG] physics.stop: phase ${this.phase} -> resetting, pos=(${this.position.x.toFixed(2)},${this.position.y.toFixed(2)},${this.position.z.toFixed(2)}) vel=(${this.velocity.x.toFixed(2)},${this.velocity.y.toFixed(2)},${this.velocity.z.toFixed(2)}) resetDelay=${this.resetDelay}`);
		this.velocity.set(0, 0, 0);
		this.phase = "resetting";
		this.resetTimer = this.resetDelay;
	}
	/** Advances the flight and reports what happened this frame. */
	update(delta) {
		if (this.phase !== "flying") {
			if (this.phase === "resetting") {
				this.resetTimer -= Math.min(Math.max(delta, 0), MAX_STEP);
				const now = Date.now();
				if (now - this._diagLastSampleTime >= 500) {
					this._diagLastSampleTime = now;
					console.info(`[BADMINTON-DIAG] physics.resetTimer: phase=${this.phase} resetTimer=${this.resetTimer.toFixed(2)} pos=(${this.position.x.toFixed(2)},${this.position.y.toFixed(2)},${this.position.z.toFixed(2)}) isReadyToLaunch=${this.isReadyToLaunch()}`);
				}
				if (this.resetTimer <= 0) this.reset();
			}
			return "flying";
		}
		let remaining = Math.max(delta, 0);
		while (remaining > 0) {
			const step = Math.min(remaining, MAX_STEP);
			this.position.addScaledVector(this.velocity, step);
			this.position.addScaledVector(this.gravityVector, .5 * step * step);
			this.velocity.addScaledVector(this.gravityVector, step);
			if (this.position.y <= this.groundY + this.groundThreshold) {
				this.position.y = this.groundY + this.groundThreshold;
				this.stop();
				return "landed";
			}
			if (this.isOutOfBounds()) {
				this.stop();
				return "outOfBounds";
			}
			remaining -= step;
		}
		return "flying";
	}
	isOutOfBounds() {
		const { minX, maxX, minZ, maxZ } = this.bounds;
		return this.position.x < minX || this.position.x > maxX || this.position.z < minZ || this.position.z > maxZ;
	}
	setBounds(bounds) {
		this.bounds = bounds;
	}
	getPosition() {
		return this.position;
	}
	getVelocity() {
		return this.velocity;
	}
	getGravity() {
		return this.gravity;
	}
	isActive() {
		return this.phase === "flying";
	}
	getPhase() {
		return this.phase;
	}
	/** True once the reset delay elapsed and the arena may launch again. */
	isReadyToLaunch() {
		return this.phase === "idle";
	}
};
const MAX_STEP = .1;
const ZERO = new Vector3();
//#endregion
//#region src/badminton/entities/RacketPro.ts
/** Public path of the pro racket asset (Tahap 2.6B), served by Vite. */
const BADMINTON_RACKET_PRO_URL = "/models/badminton/equipment/BadmintonRacket_Pro_Ready.glb";
/**
* Cache loader: GLB raket Pro hanya di-fetch satu kali per halaman walau
* dipakai dua pemain. Geometri & material di-share dari sumber cache;
* instance pemain TIDAK boleh dispose resource bersama ini.
*/
let racketProPromise = null;
function loadRacketPro() {
	if (racketProPromise) return racketProPromise;
	racketProPromise = new Promise((resolve, reject) => {
		new GLTFLoader().load(BADMINTON_RACKET_PRO_URL, (gltf) => {
			const source = gltf.scene;
			const root = source.getObjectByName("BadmintonRacket");
			const frame = source.getObjectByName("RacketFrame");
			if (!root || !frame) {
				const err = /* @__PURE__ */ new Error(`BadmintonRacket/RacketFrame tidak ditemukan di ${BADMINTON_RACKET_PRO_URL}`);
				console.error(`[BADMINTON-DIAG] racketPro: cache loader GAGAL validasi node — ${err.message}`);
				racketProPromise = null;
				reject(err);
				return;
			}
			console.info(`[BADMINTON-DIAG] racketPro: cache loader sukses url=${BADMINTON_RACKET_PRO_URL} (satu kali per halaman), root="BadmintonRacket", node "RacketFrame" valid`);
			resolve(source);
		}, void 0, (error) => {
			console.error(`[BADMINTON-DIAG] racketPro: GAGAL memuat GLB url=${BADMINTON_RACKET_PRO_URL} — raket bawaan pemain dipertahankan`, error);
			racketProPromise = null;
			reject(error);
		});
	});
	return racketProPromise;
}
const FAIL = (reason) => ({
	ok: false,
	reason,
	frameWorld: null
});
/**
* Mengganti raket bawaan satu pemain dengan klon Racket Pro.
*
* Urutan aman (audit Tahap 2.6A):
*  1. clone + validasi model BARU lebih dulu — bila gagal, raket lama utuh.
*  2. simpan transform lokal raket lama (runtime aktual, bukan angka laporan).
*  3. lepas sub-tree lama, pasang root baru sebagai child RightHand dengan
*     transform lokal lama -> world pos RacketFrame identik dengan sebelumnya.
*  4. bila pemasangan melempar error, raket lama dikembalikan.
*
* Aman terhadap animasi: tidak ada track animasi pada node raket lama
* (audit 2.6A), jadi melepasnya tidak memengaruhi skeleton/klip.
* Geometri lama TIDAK di-dispose (asset pemain tetap ter-cache utuh).
*/
function attachRacketProToPlayer(label, playerGroup, racketSource) {
	const rightHand = playerGroup.getObjectByName("RightHand");
	if (!rightHand) {
		console.error(`[BADMINTON-DIAG] racketPro[${label}]: GAGAL — node "RightHand" tidak ditemukan`);
		return FAIL("RightHand tidak ditemukan");
	}
	const oldRacket = playerGroup.getObjectByName("BadmintonRacket");
	if (!oldRacket) {
		console.error(`[BADMINTON-DIAG] racketPro[${label}]: GAGAL — raket bawaan "BadmintonRacket" tidak ditemukan`);
		return FAIL("raket bawaan tidak ditemukan");
	}
	const newRoot = racketSource.clone();
	newRoot.name = "BadmintonRacket";
	const newFrame = newRoot.getObjectByName("RacketFrame");
	if (!newFrame) {
		console.error(`[BADMINTON-DIAG] racketPro[${label}]: GAGAL — klon tanpa node "RacketFrame", raket bawaan dipertahankan`);
		return FAIL("klon tanpa RacketFrame");
	}
	let frameCount = 0;
	newRoot.traverse((o) => {
		if (o.name === "RacketFrame") frameCount++;
	});
	if (frameCount !== 1) {
		console.error(`[BADMINTON-DIAG] racketPro[${label}]: GAGAL — klon punya ${frameCount} node "RacketFrame", raket bawaan dipertahankan`);
		return FAIL(`klon punya ${frameCount} RacketFrame`);
	}
	const oldPos = oldRacket.position.clone();
	const oldQuat = oldRacket.quaternion.clone();
	const oldScale = oldRacket.scale.clone();
	(oldRacket.parent ?? rightHand).remove(oldRacket);
	try {
		newRoot.position.copy(oldPos);
		newRoot.quaternion.copy(oldQuat);
		newRoot.scale.copy(oldScale);
		rightHand.add(newRoot);
	} catch (error) {
		rightHand.add(oldRacket);
		oldRacket.position.copy(oldPos);
		oldRacket.quaternion.copy(oldQuat);
		oldRacket.scale.copy(oldScale);
		console.error(`[BADMINTON-DIAG] racketPro[${label}]: GAGAL saat pemasangan, raket bawaan dipulihkan`, error);
		return FAIL("pemasangan gagal, raket lama dipulihkan");
	}
	let rootCount = 0;
	let frameInPlayer = 0;
	let oldMeshLeft = 0;
	playerGroup.traverse((o) => {
		if (o.name === "BadmintonRacket") rootCount++;
		if (o.name === "RacketFrame") frameInPlayer++;
		if (o.name === "RacketStrings" || o.name === "RacketShaft" || o.name === "RacketHandle" || o.name === "RacketGrip") oldMeshLeft++;
	});
	if (rootCount !== 1 || frameInPlayer !== 1 || oldMeshLeft !== 0) console.error(`[BADMINTON-DIAG] racketPro[${label}]: hierarki tidak bersih — BadmintonRacket=${rootCount}, RacketFrame=${frameInPlayer}, mesh lama tersisa=${oldMeshLeft}`);
	playerGroup.updateMatrixWorld(true);
	const frameWorld = newFrame.getWorldPosition(new Vector3());
	const deg = (q) => {
		const e = new Euler().setFromQuaternion(q);
		return `(${(e.x * 180 / Math.PI).toFixed(1)},${(e.y * 180 / Math.PI).toFixed(1)},${(e.z * 180 / Math.PI).toFixed(1)})deg`;
	};
	console.info(`[BADMINTON-DIAG] racketPro[${label}]: SUKSES — root="BadmintonRacket" child dari "RightHand", RacketFrame=1 node, raket lama terlepas (mesh lama tersisa=${oldMeshLeft}), transform lokal pos=(${oldPos.x.toFixed(4)},${oldPos.y.toFixed(4)},${oldPos.z.toFixed(4)}) rot=${deg(oldQuat)} scale=(${oldScale.x.toFixed(2)},${oldScale.y.toFixed(2)},${oldScale.z.toFixed(2)}), world RacketFrame=(${frameWorld.x.toFixed(4)},${frameWorld.y.toFixed(4)},${frameWorld.z.toFixed(4)})`);
	return {
		ok: true,
		reason: "",
		frameWorld
	};
}
//#endregion
//#region .tmp-2_13a-sim.mjs
DefaultLoadingManager.setURLModifier((url) => `http://yasports.local${url}`);
const originalFetch = globalThis.fetch;
globalThis.ProgressEvent ??= class ProgressEvent extends Event {
	constructor(type, init = {}) {
		super(type);
		Object.assign(this, init);
	}
};
globalThis.fetch = async (input, init) => {
	const url = input instanceof Request ? input.url : String(input);
	if (url.startsWith("http://yasports.local/models/")) {
		const file = path.join(process.cwd(), "public", new URL(url).pathname.slice(1).replaceAll("/", path.sep));
		return new Response(await fs.readFile(file), {
			status: 200,
			headers: { "content-type": "model/gltf-binary" }
		});
	}
	return originalFetch(input, init);
};
const oldRandom = Math.random;
let seed = 8506;
Math.random = () => {
	seed = 1664525 * seed + 1013904223 >>> 0;
	return seed / 4294967296;
};
const logs = [];
const originalInfo = console.info;
console.info = (...args) => {
	logs.push(args.join(" "));
};
try {
	const blue = await BadmintonPlayerModel.load(BADMINTON_PLAYER_URL);
	blue.group.position.set(-.9, 0, -4.6);
	blue.group.rotation.y = Math.PI;
	const racket = await loadRacketPro();
	attachRacketProToPlayer("blue", blue.group, racket);
	const animation = new BadmintonAnimationController(blue);
	animation.playLoop("Ready");
	originalInfo(JSON.stringify({
		clips: blue.clipNames,
		liftDuration: blue.clipDuration("Lift"),
		hasLift: blue.hasClip("Lift"),
		actionGroups: blue.clipNames.map((n) => ({
			n,
			sameAsReady: blue.actions.get(n) === blue.actions.get("Ready")
		}))
	}));
	const nativePlayOneShot = animation.playOneShot.bind(animation);
	animation.playOneShot = (clip) => {
		const before = {
			active: animation.playingClip,
			model: blue.playingClip,
			oneShot: animation.isPlayingOneShot,
			same: blue.current === blue.actions.get(clip)
		};
		const result = nativePlayOneShot(clip);
		logs.push(`DEBUG playOneShot clip=${clip} before=${JSON.stringify(before)} result=${result} after=${animation.playingClip}/${blue.playingClip}/${animation.isPlayingOneShot}`);
		return result;
	};
	const hitDetection = new BadmintonRacketHitDetection(blue, {}, animation);
	const bounds = {
		minX: -2.7,
		maxX: 2.7,
		minZ: -6.35,
		maxZ: -.45
	};
	const shuttle = new BadmintonShuttlecockPhysics({
		bounds: {
			minX: -3.05,
			maxX: 3.05,
			minZ: -6.7,
			maxZ: 6.7
		},
		resetPoint: new Vector3(0, 1, 4)
	});
	const requests = [];
	let currentElapsed = 0;
	const ai = new BadmintonAIController(blue.group, bounds, void 0, animation, {
		shuttle,
		home: new Vector3(0, 0, -3.2),
		difficulty: "normal",
		balance: {
			reactionDelay: .05,
			predictionAccuracy: 1,
			movementSpeed: 4.8,
			interceptionError: 0,
			swingTimingError: 0,
			returnAccuracy: 1
		},
		requestSwing: (clip) => {
			const ok = hitDetection.requestSwing(clip);
			requests.push({
				clip,
				ok,
				animation: animation.playingClip,
				modelClip: blue.playingClip,
				sameAction: blue.current === blue.actions.get(clip),
				oneShot: animation.isPlayingOneShot,
				elapsed: currentElapsed
			});
			return ok;
		}
	});
	ai.enable();
	const starts = [{
		name: "captured-home-high-strike",
		p: [
			.777,
			1.302,
			4.221
		],
		v: [
			.76,
			3.34,
			-7.47
		]
	}];
	const results = [];
	const descendingTime = (y, vy, gravity, height) => {
		const a = -.5 * gravity, b = vy, c = y - height;
		const disc = b * b - 4 * a * c;
		if (disc < 0) return null;
		const root = Math.sqrt(disc);
		const t = [(-b - root) / (2 * a), (-b + root) / (2 * a)].filter((t) => t > 0).sort((a, b) => a - b)[0];
		if (t === void 0 || vy - gravity * t > 0) return null;
		return t;
	};
	const nativePlanInterception = ai.planInterception.bind(ai);
	ai.planInterception = () => {
		const ok = nativePlanInterception();
		if (ok) {
			const p = shuttle.getPosition(), v = shuttle.getVelocity();
			const t = descendingTime(p.y, v.y, shuttle.getGravity(), ai.plannedStrikeHeight);
			if (t !== null) ai.interceptTarget.set(MathUtils.clamp(p.x + v.x * t + .72, bounds.minX, bounds.maxX), 0, MathUtils.clamp(p.z + v.z * t - .47, bounds.minZ, bounds.maxZ));
		}
		return ok;
	};
	for (const scenario of starts) {
		shuttle.reset();
		for (let i = 0; i < 65; i++) {
			animation.update(1 / 60);
			ai.update(1 / 60);
		}
		blue.group.position.set(0, 0, -3.2);
		blue.group.rotation.y = Math.PI;
		hitDetection.resetSwing();
		animation.stop();
		logs.length = 0;
		shuttle.reset();
		shuttle.launch(new Vector3(...scenario.p), new Vector3(...scenario.v));
		let minimum = Infinity, minAt = null, firstIntercept = null, lastPos = null, hit = null;
		let elapsed = 0, traceAt = 0;
		const trace = [];
		for (let frame = 0; frame < 180 && shuttle.getPhase() === "flying"; frame++) {
			const dt = 1 / 60;
			animation.update(dt);
			ai.update(dt);
			shuttle.update(dt);
			const result = hitDetection.update(dt, shuttle.getPosition());
			elapsed += dt;
			currentElapsed = elapsed;
			if (elapsed >= traceAt && elapsed > .3 && shuttle.getPhase() === "flying") {
				traceAt += .1;
				const p = shuttle.getPosition(), v = shuttle.getVelocity();
				let h = ai.plannedStrikeHeight;
				if (h > p.y + .1) h = Math.max(.3, Math.min(1.9, p.y));
				const tContact = descendingTime(p.y, v.y, shuttle.getGravity(), h);
				const cx = tContact === null ? null : p.x + v.x * tContact;
				const cz = tContact === null ? null : p.z + v.z * tContact;
				const clip = cx === null ? null : ai.pickSwingClip(h, cx - blue.group.position.x, cz);
				const lead = clip === null ? null : ai.swingLead(clip) + ai.swingTimingOffset;
				const distance = cx === null ? null : Math.hypot(cx - blue.group.position.x, cz - blue.group.position.z);
				trace.push({
					elapsed: +elapsed.toFixed(3),
					shuttle: p.toArray().map((n) => +n.toFixed(2)),
					vel: v.toArray().map((n) => +n.toFixed(2)),
					planned: +ai.plannedStrikeHeight.toFixed(2),
					actualHeight: +h.toFixed(2),
					tContact: tContact === null ? null : +tContact.toFixed(3),
					distance: distance === null ? null : +distance.toFixed(2),
					reachWithApproach: lead === null ? null : +(.85 + Math.max(0, lead) * 3.25).toFixed(2),
					lead: lead === null ? null : +lead.toFixed(3),
					clip,
					blue: blue.group.position.toArray().map((n) => +n.toFixed(2)),
					mode: ai.currentState
				});
			}
			if (ai.currentState === "intercept" && !firstIntercept) firstIntercept = {
				elapsed,
				pos: blue.group.position.toArray(),
				clip: animation.playingClip
			};
			if (animation.isPlayingOneShot || hitDetection.isSwinging) {
				blue.group.updateMatrixWorld(true);
				const contact = {
					point: new Vector3(),
					distance: 0,
					surfaceVelocity: new Vector3()
				};
				hitDetection.surface.measureClosest(shuttle.getPosition(), contact);
				if (contact.distance < minimum) {
					minimum = contact.distance;
					minAt = {
						elapsed,
						shuttle: shuttle.getPosition().toArray(),
						blue: blue.group.position.toArray(),
						closest: contact.point.toArray(),
						head: hitDetection.surface.getHeadWorldCenter(new Vector3()).toArray(),
						clip: animation.playingClip
					};
				}
			}
			if (result) {
				hit = {
					elapsed,
					clip: result.clip,
					distance: result.surfaceDistance,
					point: result.point.toArray(),
					velocity: result.velocity.toArray()
				};
				shuttle.launch(shuttle.getPosition(), result.velocity);
			}
			lastPos = blue.group.position.toArray();
		}
		results.push({
			name: scenario.name,
			firstIntercept,
			lastBluePos: lastPos,
			minimumDuringSwing: minimum,
			minAt,
			hit,
			requests: [...requests],
			trace: results.length === 0 ? trace : [],
			aiLogs: logs.filter((line) => line.includes("AI:") || line.includes("requestSwing:") || line.includes("DEBUG"))
		});
		requests.length = 0;
	}
	originalInfo(JSON.stringify(results.map((r) => ({
		name: r.name,
		firstIntercept: r.firstIntercept,
		lastBluePos: r.lastBluePos,
		minimumDuringSwing: r.minimumDuringSwing,
		minAt: r.minAt,
		hit: r.hit,
		requests: r.requests,
		swings: r.aiLogs.filter((s) => s.includes("AI: swing"))
	})), null, 2));
} finally {
	console.info = originalInfo;
	Math.random = oldRandom;
	globalThis.fetch = originalFetch;
}
//#endregion
export {};
