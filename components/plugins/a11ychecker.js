import { cmds } from '../commands.js';

tinymce.PluginManager.add('d2l-a11ychecker', function(editor) {

	editor.addCommand(cmds.a11yChecker, function() {
		editor.plugins.a11ychecker.toggleaudit();
	});

});
