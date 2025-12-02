import * as esbuild from 'esbuild-wasm';

await esbuild.initialize({});

let files_to_bundle = [
	'client_login.js',
	'client_home.js',
	'client_users_new.js',
	'client_users_edit.js',
	'client_users_ranking.js',
	'client_users_password_change.js',
	'client_challenges.js',
	'client_games_list.js',
	'client_games_create.js',
	'client_graph_display.js'
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
