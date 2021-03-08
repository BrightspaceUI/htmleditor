
tinymce.PluginManager.add('d2l-fullscreen', function(editor) {

	let state = false;

	editor.addQueryStateHandler('d2l-fullscreen', () => {
		return state;
	});

	editor.addCommand('d2l-fullscreen', () => {
		state = !state;
		editor.getElement().getRootNode().host._fullscreen = state;
	});

});
