const helper = require('./visual-diff-helpers');
const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('d2l-htmleditor', () => {

	const visualDiff = new VisualDiff('htmleditor', __dirname);

	let browser, page;

	const viewport = { width: 800, height: 2000, deviceScaleFactor: 2 };

	before(async() => {
		browser = await puppeteer.launch();
		page = await visualDiff.createPage(browser, { viewport: viewport });
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
			await helper.reset(page, '#disabled');
			await helper.reset(page, '#skeleton');
		});

		it('normal', async function() {
			const rect = await visualDiff.getRect(page, '#full');
			await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
		});

		it('disabled', async function() {
			const rect = await visualDiff.getRect(page, '#disabled');
			await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
		});

		it('skeleton', async function() {
			const rect = await visualDiff.getRect(page, '#skeleton');
			await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
		});

		it('fullscreen', async function() {
			await page.setViewport({ width: 1000, height: 800, deviceScaleFactor: 2 });
			await page.$eval('#full', (elem) => {
				tinymce.EditorManager.get(elem._editorId).execCommand('d2l-fullscreen');
			});
			await page.hover('body');
			await visualDiff.screenshotAndCompare(page, this.test.fullTitle());
			await page.setViewport(viewport);
		});

	});

});
