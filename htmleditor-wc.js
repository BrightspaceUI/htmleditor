import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import './components/actions/hr.js';
import './components/actions/symbol.js';
import 'tinymce/tinymce.js';
import 'tinymce/plugins/charmap/plugin.js';
import 'tinymce/themes/silver/theme.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { getUniqueId } from '@brightspace-ui/core/helpers/uniqueId.js';
import { LocalizeStaticMixin } from '@brightspace-ui/core/mixins/localize-static-mixin.js';
import { registerButton } from './components/toolbar/button.js';
import { registerButtonToggle } from './components/toolbar/button-toggle.js';
import { registerSelect } from './components/toolbar/select.js';
import { tinymceStyles } from './tinymce/skins/skin.js';

const fontSizes = [
	{value: '', text: 'Font Size'},
	{value: '8pt', text: '8pt'},
	{value: '10pt', text: '10pt'},
	{value: '12pt', text: '12pt'},
	{value: '14pt', text: '14pt'},
	{value: '18pt', text: '18pt'},
	{value: '24pt', text: '24pt'},
	{value: '36pt', text: '36pt'}
];
const formats = [
	{value: '', text: 'Format'},
	{value: 'p', text: 'Paragraph'},
	{value: 'address', text: 'Address'},
	{value: 'h1', text: 'Heading 1'},
	{value: 'h2', text: 'Heading 2'},
	{value: 'h3', text: 'Heading 3'},
	{value: 'h4', text: 'Heading 4'},
	{value: 'h5', text: 'Heading 5'},
	{value: 'h6', text: 'Heading 6'}
];
const fonts = [
	{value: '', text: 'Font Family'},
	{value: 'arabic transparent,sans-serif', text: 'Arabic Transparent'},
	{value: 'arial,helvetica,sans-serif', text: 'Arial (Recommended)'},
	{value: 'comic sans ms,sans-serif', text: 'Comic Sans'},
	{value: 'courier new,courier,sans-serif', text: 'Courier'},
	{value: 'ezra sil,arial unicode ms,arial,sans-serif', text:'Ezra SIL'},
	{value: 'georgia,serif', text: 'Georgia'},
	{value: 'sbl hebrew,times new roman,serif', text: 'SBL Hebrew'},
	{value: 'simplified arabic,sans-serif', text: 'Simplified Arabic'},
	{value: 'tahoma,sans-serif', text: 'Tahoma'},
	{value: 'times new roman,times,serif', text: 'Times New Roman'},
	{value: 'traditional arabic,serif', text: 'Traditional Arabic'},
	{value: 'trebuchet ms,helvetica,sans-serif', text: 'Trebuchet'},
	{value: 'verdana,sans-serif', text: 'Verdana'},
	{value: 'dotum,arial,helvetica,sans-serif', text: '돋움 (Dotum)'},
	{value: 'simsun', text: '宋体 (Sim Sun)'},
	{value: 'mingliu,arial,helvetica,sans-serif', text: '細明體 (Ming Liu)'}
];

class HtmlEditor extends LocalizeStaticMixin(LitElement) {

	static get properties() {
		return {
			height: { type: String },
			inline: { type: Boolean },
			noSpellchecker: { type: Boolean, attribute: 'no-spellchecker'},
			width: { type: String },
			_editorId: { type: String }
		};
	}

	static get styles() {
		return [tinymceStyles, css`
			:host {
			}
			:host([hidden]) {
				display: none;
			}
		`];
	}

	static get resources() {
		return {
			'ar': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'da': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'de': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'en': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'es': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'fr': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'ja': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'ko': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'nl': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'pt': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'sv': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'tr': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'tr-tr': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'zh': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'zh-cn': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' },
			'zh-tw': { bold: 'Bold', italic: 'Italic', underline: 'Underline', fontFamily: 'Font Family', undo: 'Undo', redo: 'redo' }
		};
	}

	constructor() {
		super();
		this.height = '355px';
		this.inline = false;
		this.noSpellchecker = false;
		this.width = '100%';
		this._editorId = getUniqueId();
	}

	firstUpdated(changedProperties) {
		super.firstUpdated(changedProperties);

		requestAnimationFrame(() => {

			const textarea = this.shadowRoot.querySelector(`#${this._editorId}`);
			const locale = 'en-US';

			tinymce.init({
				a11ychecker_allow_decorative_images: true,
				allow_html_in_named_anchor: true,
				allow_script_urls: true,
				branding: false,
				browser_spellcheck: !this.noSpellchecker,
				convert_urls: false,
				content_css: '/tinymce/skins/content/default/content.css',
				directionality: this.dir ? this.dir : 'ltr',
				extended_valid_elements: 'span[*]',
				external_plugins: {'a11ychecker': '/tinymce/plugins/a11ychecker/plugin.js'},
				height: this.height,
				inline: this.inline,
				language: locale !== 'en-US' ? locale : null,
				language_url: `/tinymce/langs/${locale}.js`,
				menubar: false,
				object_resizing : true,
				plugins: 'a11ychecker charmap d2l-actions',
				relative_urls: false,
				setup: (editor) => { console.log(editor); },
				skin_url: '/tinymce/skins',
				statusbar: false,
				target: textarea,
				toolbar: false,
				valid_elements: '*[*]',
				width: this.width
			});

		});

	}

	render() {
		if (!this._originalContent) {
			const template = this.querySelector('template');
			if (this.inline) {
				this._originalContent = document.importNode(template.content, true);
			} else {
				const temp = document.createElement('div');
				temp.appendChild(document.importNode(template.content, true));
				this._originalContent = temp.innerHTML;
			}
		}

		if (this.inline) {
			return html`<div id="${this._editorId}">${this._originalContent}</div>`;
		} else {
			return html`
				<div>
					<d2l-htmleditor-button-toggle data-key="bold" text="${this.localize('bold')}"></d2l-htmleditor-button-toggle>
					<d2l-htmleditor-button-toggle data-key="italic" text="${this.localize('italic')}"></d2l-htmleditor-button-toggle>
					<d2l-htmleditor-button-toggle data-key="underline" text="${this.localize('underline')}"></d2l-htmleditor-button-toggle>
					<d2l-htmleditor-button-toggle data-key="strikethrough" text="Strikethrough"></d2l-htmleditor-button-toggle>
					<d2l-htmleditor-button-toggle data-key="subscript" text="Subscript"></d2l-htmleditor-button-toggle>
					<d2l-htmleditor-button-toggle data-key="superscript" text="Superscript"></d2l-htmleditor-button-toggle>
					<d2l-htmleditor-button-toggle data-key="insertUnorderedList" text="Unordered List"></d2l-htmleditor-button-toggle>
					<d2l-htmleditor-button-toggle data-key="insertOrderedList" text="Ordered List"></d2l-htmleditor-button-toggle>
					<d2l-htmleditor-button-toggle data-key="justifyLeft" text="Align Left"></d2l-htmleditor-button-toggle>
					<d2l-htmleditor-button-toggle data-key="justifyRight" text="Align Right"></d2l-htmleditor-button-toggle>
					<d2l-htmleditor-button-toggle data-key="justifyCenter" text="Align Center"></d2l-htmleditor-button-toggle>
					<d2l-htmleditor-button-toggle data-key="justifyFull" text="Align Justify"></d2l-htmleditor-button-toggle>
					<d2l-htmleditor-button data-key="indent" text="Indent"></d2l-htmleditor-button>
					<d2l-htmleditor-button data-key="outdent" text="Outdent"></d2l-htmleditor-button>
					<d2l-htmleditor-button data-key="a11ycheck" text="Accessibility"></d2l-htmleditor-button>
					<d2l-htmleditor-button data-key="undo" text="${this.localize('undo')}"></d2l-htmleditor-button>
					<d2l-htmleditor-button data-key="redo" text="${this.localize('redo')}"></d2l-htmleditor-button>
					<d2l-htmleditor-select data-key="fontname" text="${this.localize('fontFamily')}" .options="${fonts}"></d2l-htmleditor-select>
					<d2l-htmleditor-select data-key="fontsize" text="Font Size" .options="${fontSizes}"></d2l-htmleditor-select>
					<d2l-htmleditor-select data-key="formatBlock" text="Format" .options="${formats}"></d2l-htmleditor-select>
					<d2l-htmleditor-button data-key="symbol" text="Insert Symbol"></d2l-htmleditor-button>
					<d2l-htmleditor-button-toggle data-key="hr" text="Insert Line"></d2l-htmleditor-button-toggle>
					<d2l-htmleditor-button data-key="insertHorizontalRule" text="Insert Line (native)"></d2l-htmleditor-button>
				</div>
				<textarea id="${this._editorId}">${this._originalContent}</textarea>
			`;
		}
	}

	focus() {
		tinymce.EditorManager.get(this._editorId).focus();
	}

}

customElements.define('d2l-htmleditor', HtmlEditor);

tinymce.PluginManager.add('d2l-actions', function(editor) {
	registerButtonToggle(editor, 'bold');
	registerButtonToggle(editor, 'italic');
	registerButtonToggle(editor, 'underline');
	registerButtonToggle(editor, 'strikethrough');
	registerButtonToggle(editor, 'subscript');
	registerButtonToggle(editor, 'superscript');
	registerButtonToggle(editor, 'insertUnorderedList');
	registerButtonToggle(editor, 'insertOrderedList');
	registerButton(editor, 'indent');
	registerButton(editor, 'outdent');
	registerButtonToggle(editor, 'justifyLeft');
	registerButtonToggle(editor, 'justifyRight');
	registerButtonToggle(editor, 'justifyCenter');
	registerButtonToggle(editor, 'justifyFull');
	registerSelect(editor, 'fontname');
	registerSelect(editor, 'fontsize');
	registerSelect(editor, 'formatBlock');

	editor.on('init', () => editor.undoManager.clear());
	registerButton(editor, 'undo', {enabled: () => editor.undoManager.hasUndo()});
	registerButton(editor, 'redo', {enabled: () => editor.undoManager.hasRedo()});

	registerButton(editor, 'symbol', {
		action: () => {
			const dialog = document.createElement('d2l-htmleditor-symbol-dialog');
			if (editor && editor.selection) {
				let node = editor.selection.getNode();
				if (node.nodeType === Node.DOCUMENT_NODE) node = node.body;
				dialog.fontFamily = window.getComputedStyle(node)['font-family'];
			}
			document.body.appendChild(dialog).opened = true;
			dialog.addEventListener('d2l-htmleditor-symbol-dialog-close', (e) => {
				const htmlCode = e.detail.htmlCode;
				if (htmlCode) editor.execCommand('mceInsertContent', false, htmlCode);
			}, { once: true });
			//editor.execCommand('mceShowCharmap'));
		}
	});

	registerButtonToggle(editor, 'hr', {
		action: () => {
			const dialog = document.createElement('d2l-htmleditor-hr-dialog');
			if (editor && editor.selection) {
				const node = editor.selection.getNode();
				if (node.tagName === 'HR') {
					const width = node.style.width;
					const hrData = {};
					if (width.indexOf('%') !== -1) {
						hrData.width = {value: width.replace('%', ''), units: '%'};
					} else if (width.indexOf('px') !== -1) {
						hrData.width = {value: width.replace('px', ''), units: 'px'};
					}
					const height = node.style.height;
					if (height === 'auto' || height.indexOf('px') === -1) {
						hrData.height = 0;
					} else {
						hrData.height = height.replace('px', '');
					}
					hrData.hasShadow = (node.style.borderStyle === 'inset');
					dialog.hrData = hrData;
				}
			}
			document.body.appendChild(dialog).opened = true;
			dialog.addEventListener('d2l-htmleditor-hr-dialog-close', (e) => {
				const html = e.detail.html;
				if (html) editor.execCommand('mceInsertContent', false, html);
			}, { once: true });
		},
		active: () => {
			if (editor && editor.selection) {
				const node = editor.selection.getNode();
				return node.tagName === 'HR';
			}
			return false;
		}
	});

	registerButton(editor, 'insertHorizontalRule');

	registerButton(editor, 'a11ycheck', {
		action: () => {
			editor.plugins.a11ychecker.toggleaudit();
			//console.log(editor.plugins.a11ychecker.getReport());
		}
	});
});
