import 'tinymce/tinymce.js';

tinymce.PluginManager.add('d2l-fullpage', function(editor) {

	if (!editor.settings.fullpage_default_font_family.toLowerCase().includes('lato')) return;

	const fontsUrl = 'https://s.brightspace.com/lib/fonts/0.5.0/fonts.css';

	editor.on('SetContent', () => {

		const editorDocument = new DOMParser().parseFromString(editor.getContent(), 'text/html');

		if (!editorDocument.head.querySelector(`link[href="${fontsUrl}"]`)) {
			const elem = editorDocument.createElement('link');
			elem.rel = 'stylesheet';
			elem.href = fontsUrl;
			editorDocument.head.appendChild(elem);
			editor.setContent(editorDocument.documentElement.outerHTML);
		}

	});

});
