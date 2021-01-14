const helper = require('./visual-diff-helpers');
const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('d2l-htmleditor', () => {

	const visualDiff = new VisualDiff('htmleditor', __dirname);

	let browser, page;

	before(async() => {
		browser = await puppeteer.launch({ args: ['--no-sandbox'] });
		page = await visualDiff.createPage(browser);
		await page.goto(`${visualDiff.getBaseUrl()}/test/htmleditor.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	});

	beforeEach(async() => {
		await visualDiff.resetFocus(page);
	});

	after(async() => await browser.close());

	describe('full', () => {

		afterEach(async() => {
			await helper.reset(page, '#full');
		});

		it('normal', async function() {
			const rect = await visualDiff.getRect(page, '#full');
			await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
		});

		it('fullscreen', async function() {
			await page.$eval('#full', (elem) => {
				tinymce.EditorManager.get(elem._editorId).execCommand('mceFullScreen');
			});
			await page.hover('body');
			await visualDiff.screenshotAndCompare(page, this.test.fullTitle());
		});

	});

	describe('skeleton', () => {

		afterEach(async() => {
			await helper.reset(page, '#skeleton');
		});

		it('normal', async function() {
			const rect = await visualDiff.getRect(page, '#skeleton');
			await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
		});

	});

});
