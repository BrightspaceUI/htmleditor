module.exports = {
	async reset(page, selector) {
		await page.$eval(selector, (elem) => {
			// If the editor is fullscreen, toggle fullscreen off
			if (elem.classList.contains('tox-fullscreen')) {
				tinymce.EditorManager.get(elem._editorId).execCommand('mceFullScreen');
			}
		});
	}
};
