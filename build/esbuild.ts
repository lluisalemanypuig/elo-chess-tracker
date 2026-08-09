import * as esbuild from 'esbuild-wasm';

await esbuild.initialize({});

let filesToBundle = [
	'login.js',
	'home.js',
	'users-new.js',
	'users-edit.js',
	'users-ranking.js',
	'users-password-change.js',
	'challenges.js',
	'games-list.js',
	'games-create.js',
	'graph-display.js'
];

for (let file of filesToBundle) {
	console.log(`Bundling 'js/${file}'...`);
	await esbuild.build({
		entryPoints: ['js/' + file],
		bundle: true,
		outfile: 'js/bdl--' + file,
		format: 'esm',
		minify: true
	});
}

console.log('Bundling complete.');
