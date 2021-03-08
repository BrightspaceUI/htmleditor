import { cmds } from '../commands.js';

tinymce.PluginManager.add('d2l-fullscreen', function(editor) {

	let state = false;

	editor.addQueryStateHandler(cmds.fullscreen, () => {
		return state;
	});

	editor.addCommand(cmds.fullscreen, () => {
		state = !state;
		editor.getElement().getRootNode().host._fullscreen = state;
	});

});
