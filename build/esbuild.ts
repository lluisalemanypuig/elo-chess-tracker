import * as esbuild from 'esbuild-wasm';

await esbuild.initialize({});

let files_to_bundle = [
	'login.js',
	'home.js',
	'users_new.js',
	'users_edit.js',
	'users_ranking.js',
	'users_password_change.js',
	'challenges.js',
	'games_list.js',
	'games_create.js',
	'graph_display.js'
];

for (let file of files_to_bundle) {
	console.log(`Bundling 'js/${file}'...`);
	await esbuild.build({
		entryPoints: ['js/' + file],
		bundle: true,
		outfile: 'js/bdl__' + file,
		format: 'esm',
		minify: true
	});
}

console.log('Bundling complete.');
