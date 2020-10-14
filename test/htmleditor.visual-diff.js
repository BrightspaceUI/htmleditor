const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('d2l-htmleditor', () => {

	const visualDiff = new VisualDiff('htmleditor', __dirname);

	let browser, page;

	before(async() => {
		browser = await puppeteer.launch();
		page = await visualDiff.createPage(browser);
		await page.goto(`${visualDiff.getBaseUrl()}/test/htmleditor.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	});

	beforeEach(async() => {
		await visualDiff.resetFocus(page);
	});

	after(async() => await browser.close());

	describe('full', () => {

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

});
