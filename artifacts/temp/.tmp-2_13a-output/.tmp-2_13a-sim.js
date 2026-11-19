import { A as Group, At as Points, B as InterpolateDiscrete, Bt as RepeatWrapping, Dt as PerspectiveCamera, E as FileLoader, Et as OrthographicCamera, F as InstancedMesh, Ft as QuaternionKeyframeTrack, Gt as Sphere, I as InterleavedBuffer, J as Line, Kt as SpotLight, L as InterleavedBufferAttribute, Mt as PropertyBinding, P as InstancedBufferAttribute, Pt as Quaternion, Q as LinearFilter, Qt as Triangle, R as Interpolant, S as DirectionalLight, St as NearestMipmapNearestFilter, Tt as Object3D, Ut as Skeleton, V as InterpolateLinear, Vt as SRGBColorSpace, Wt as SkinnedMesh, X as LineLoop, Xt as TextureLoader, Y as LineBasicMaterial, Yt as Texture, Z as LineSegments, _ as ColorManagement, _t as MeshPhysicalMaterial, an as VectorKeyframeTrack, at as LoaderUtils, bt as NearestFilter, d as BufferGeometry, dt as MathUtils, et as LinearMipmapLinearFilter, gt as MeshBasicMaterial, h as Color, ht as Mesh, i as AnimationMixer, it as Loader, j as ImageBitmapLoader, jt as PointsMaterial, kt as PointLight, l as Box3, lt as LoopRepeat, m as ClampToEdgeWrapping, mt as Matrix4, nn as Vector2, nt as LinearSRGBColorSpace, r as AnimationClip, rn as Vector3, s as Bone, st as LoopOnce, tt as LinearMipmapNearestFilter, u as BufferAttribute, ut as Material, vt as MeshStandardMaterial, w as Euler, wt as NumberKeyframeTrack, xt as NearestMipmapLinearFilter, yt as MirroredRepeatWrapping } from "./three.module-BgdiK9C_.js";
import fs from "node:fs/promises";
import path from "node:path";
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
const MIN_CONTACT_MARGIN = .08;
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
	const candidates = [(-b - root) / (2 * a), (-b + root) / (2 * a)].filter((t) => t > 0);
	if (candidates.length === 0) return null;
	const t = Math.min(...candidates);
	if (vy - gravity * t > 0) return null;
	return t;
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
			const targetX = MathUtils.clamp(x, this.bounds.minX, this.bounds.maxX);
			const targetZ = MathUtils.clamp(z, this.bounds.minZ, this.bounds.maxZ);
			const distance = Math.hypot(targetX - position.x, targetZ - position.z);
			const lead = this.swingLead(this.pickSwingClip(height, x - position.x, z));
			const movementTimeRequired = Math.max(0, distance - SWING_REACH) / speed;
			const margin = Math.max(0, time - lead) - movementTimeRequired;
			const candidate = {
				height,
				time,
				x: targetX,
				z: targetZ,
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
		const dx = targetX - position.x;
		const dz = targetZ - position.z;
		const distance = Math.hypot(dx, dz);
		const scale = distance > 0 ? (distance - Math.min(SWING_REACH * .65, distance)) / distance : 0;
		this.interceptTarget.set(position.x + dx * scale, 0, position.z + dz * scale);
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
		if (p.z > INTERCEPT_FRONT_Z) return;
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
const THREE = await import("./three.module-B9Wvf3Lr.js");
THREE.DefaultLoadingManager.setURLModifier((url) => `http://yasports.local${url}`);
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
Math.random = () => .5;
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
		hasLift: blue.hasClip("Lift")
	}));
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
		resetPoint: new THREE.Vector3(0, 1, 4)
	});
	const requests = [];
	let currentElapsed = 0;
	const ai = new BadmintonAIController(blue.group, bounds, void 0, animation, {
		shuttle,
		home: new THREE.Vector3(0, 0, -3.2),
		difficulty: "normal",
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
	const starts = [
		{
			name: "captured-official-launch",
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
		},
		{
			name: "prior-runtime-official-launch",
			p: [
				.53,
				1.17,
				4.3
			],
			v: [
				.88,
				4.41,
				-6.5
			]
		},
		{
			name: "left-diagonal-official-launch",
			p: [
				-.777,
				1.302,
				4.221
			],
			v: [
				2.4,
				3.34,
				-7.47
			]
		}
	];
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
	for (const scenario of starts) {
		blue.group.position.set(-.9, 0, -4.6);
		blue.group.rotation.y = Math.PI;
		hitDetection.resetSwing();
		logs.length = 0;
		shuttle.reset();
		shuttle.launch(new THREE.Vector3(...scenario.p), new THREE.Vector3(...scenario.v));
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
					point: new THREE.Vector3(),
					distance: 0,
					surfaceVelocity: new THREE.Vector3()
				};
				hitDetection.surface.measureClosest(shuttle.getPosition(), contact);
				if (contact.distance < minimum) {
					minimum = contact.distance;
					minAt = {
						elapsed,
						shuttle: shuttle.getPosition().toArray(),
						blue: blue.group.position.toArray(),
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
			aiLogs: logs.filter((line) => line.includes("AI:") || line.includes("requestSwing:"))
		});
		requests.length = 0;
	}
	originalInfo(JSON.stringify(results, null, 2));
} finally {
	console.info = originalInfo;
	Math.random = oldRandom;
	globalThis.fetch = originalFetch;
}
//#endregion
export {};
