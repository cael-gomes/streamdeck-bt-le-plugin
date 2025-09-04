import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import path from "node:path";
import url from "node:url";
import json from '@rollup/plugin-json';
import fs from "node:fs";
const isWatching = !!process.env.ROLLUP_WATCH;
const sdPlugin = "com.cael-gomes.bt-controller.sdPlugin";

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
	input: "src/plugin.ts",
	output: {
		file: `${sdPlugin}/bin/plugin.js`,
		format: "cjs",
		sourcemap: true,
		sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
			return url.pathToFileURL(path.resolve(path.dirname(sourcemapPath), relativeSourcePath)).href;
		},
		inlineDynamicImports: true
	},
	external: [
		"@stoprocent/noble",
		"node-gyp-build"
	],
	plugins: [
		{
			name: "watch-externals",
			buildStart: function () {
				this.addWatchFile(`${sdPlugin}/manifest.json`);
			},
		},
		typescript({
			mapRoot: isWatching ? "./" : undefined,
			module: "ESNext",
			tsconfig: false,
			compilerOptions: {
				module: "ESNext",
				target: "ES2022",
				moduleResolution: "node",
				esModuleInterop: true,
				allowSyntheticDefaultImports: true,
				experimentalDecorators: false
			}
		}),
		nodeResolve({
			browser: false,
			exportConditions: ["node"],
			preferBuiltins: true
		}),
		commonjs({
			transformMixedEsModules: true,
			requireReturnsDefault: 'auto'
		}),
		json(),
		// !isWatching && terser()
		{
			name: "copy-node-modules",
			async writeBundle() {
				// Create node_modules directory in plugin
				const targetDir = path.join(sdPlugin, "node_modules");
				
				// Remove existing node_modules in plugin directory
				if (fs.existsSync(targetDir)) {
					fs.rmSync(targetDir, { recursive: true, force: true });
				}
				
				// Copy node_modules
				console.log("Copying node_modules to plugin directory...");
				fs.cpSync("node_modules", targetDir, { recursive: true });
				console.log("✓ node_modules copied successfully");
			}
		}
	]
};

export default config;
