import 'tinymce/tinymce.js';

const latoRegEx = /font-family: lato/i;

tinymce.PluginManager.add('d2l-fullpage', function(editor) {

	// specifically pull in 0.5.0 containing Lato font
	const fontsUrl = 'https://s.brightspace.com/lib/fonts/0.5.0/fonts.css';

	editor.on('GetContent', (e) => {

		if (!latoRegEx.test(e.content)) return;

		const editorDocument = new DOMParser().parseFromString(e.content, 'text/html');
		if (!editorDocument.head.querySelector(`link[href="${fontsUrl}"]`)) {
			const elem = editorDocument.createElement('link');
			elem.rel = 'stylesheet';
			elem.href = fontsUrl;
			editorDocument.head.appendChild(elem);
			e.content = editorDocument.documentElement.outerHTML;
		}

	});

});
