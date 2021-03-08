
export const a11ychecker = {
	name: '',
	cmd: '',
	icon: '',
	term: ''
};

tinymce.PluginManager.add('d2l-a11ychecker', function(editor) {

	editor.addCommand('d2l-allychecker', function() {
		editor.plugins.a11ychecker.toggleaudit();
	});

});
