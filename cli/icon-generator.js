const chalk = require('chalk'),
	fs = require('fs'),
	path = require('path');

const iconsPath = path.join(__dirname, '../icons');
const outputPath = path.join(__dirname, '../generated');

function getSvgs() {
	return fs.readdirSync(iconsPath)
		.filter(file => {
			return (path.extname(file) === '.svg');
		}).map(file => {
			return file.substr(0, file.length - 4);
		});
}

function createIconsExport(svgs) {
	if (!fs.existsSync(outputPath)) {
		fs.mkdirSync(outputPath);
	}

	const destPath = path.join(outputPath, 'icons.js');

	const icons = {};
	svgs.forEach(name => {
		const data = fs.readFileSync(path.join(iconsPath, `${name}.svg`));
		icons[name] = data.toString('utf8')
			.replace(/\n/g, '')
			.replace(/fill="#494c4e"/g, 'fill-rule="nonzero"');
	});

	const output = `// auto-generated
export const icons = ${JSON.stringify(icons)};\n
export function addIcons(editor) {
	Object.keys(icons).forEach(key => editor.ui.registry.addIcon(key, icons[key]));
}`;

	fs.writeFileSync(destPath, output);

}

function generate() {

	console.log(chalk.yellow('Generating icons...'));

	const svgs = getSvgs();

	createIconsExport(svgs);

	console.log(chalk.green('icons export generated.\n'));
}

try {
	generate();
	process.exit(0);
} catch (err) {
	console.error(chalk.red(err));
	process.exit(1);
}
