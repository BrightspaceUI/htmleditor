import 'tinymce/tinymce.js';

const latoRegEx = /font-family: lato/i;

tinymce.PluginManager.add('d2l-fullpage', function(editor) {

	/* caution: do not remove the specific check for lato or this URL, because user
	authored content may require it as long as we support Lato in the editor, and
	removing Lato from the editor means disruptive change when editing existing content */

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
