import '@brightspace-ui/core/components/alert/alert.js';
import 'tinymce/tinymce.js';
import 'tinymce/icons/default/icons.js';
import 'tinymce/plugins/autosave/plugin.js';
import 'tinymce/plugins/autolink/plugin.js';
import 'tinymce/plugins/charmap/plugin.js';
import 'tinymce/plugins/code/plugin.js';
import 'tinymce/plugins/directionality/plugin.js';
import 'tinymce/plugins/emoticons/js/emojis.js';
import 'tinymce/plugins/fullpage/plugin.js';
import 'tinymce/plugins/fullscreen/plugin.js';
import 'tinymce/plugins/hr/plugin.js';
import 'tinymce/plugins/image/plugin.js';
import 'tinymce/plugins/imagetools/plugin.js';
import 'tinymce/plugins/link/plugin.js';
import 'tinymce/plugins/lists/plugin.js';
import 'tinymce/plugins/preview/plugin.js';
import 'tinymce/plugins/quickbars/plugin.js';
import 'tinymce/plugins/table/plugin.js';
import 'tinymce/plugins/textpattern/plugin.js';
import 'tinymce/themes/silver/theme.js';
import { css, html, unsafeCSS } from 'lit-element/lit-element.js';
import { getImage, uploadImage } from './components/image.js';
import { addIcons } from './generated/icons.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { getContext } from './components/lms-adapter.js';
import { getUniqueId } from '@brightspace-ui/core/helpers/uniqueId.js';
import { isfStyles } from './components/isf.js';
import { Localizer } from './lang/localizer.js';
import { ProviderMixin } from '@brightspace-ui/core/mixins/provider-mixin.js';
import { queryMentions } from './components/mentions.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { tinymceLangs } from './generated/langs.js';

const isShadowDOMSupported = !(window.ShadyDOM && window.ShadyDOM.inUse);
const rootFontSize = window.getComputedStyle(document.documentElement, null).getPropertyValue('font-size');

const pathFromUrl = url => url.substring(0, url.lastIndexOf('/'));
const baseImportPath = pathFromUrl(import.meta.url);

const documentLang = (document.documentElement.getAttribute('lang') ?? 'en').replace('-', '_');

let tinymceLang = documentLang;
if (!tinymceLangs.includes(documentLang)) {
	const cultureIndex = tinymceLang.indexOf('_');
	if (cultureIndex !== -1) tinymceLang = tinymceLang.substring(0, cultureIndex);
	if (!tinymceLangs.includes(tinymceLang)) {
		tinymceLang = tinymceLangs.find(lang => {
			return lang.startsWith(tinymceLang);
		});
		if (!tinymceLang) tinymceLang = 'en';
	}
}

const a11yCheckerRuleUrlMap = {
	'D1': 'https://www.w3.org/WAI/WCAG21/Techniques/html/H42.html',
	'D2': 'https://www.w3.org/WAI/WCAG21/Techniques/general/G141.html',
	'D3': 'https://www.w3.org/WAI/WCAG21/Techniques/html/H2.html',
	'D40': 'https://www.w3.org/WAI/WCAG21/Techniques/html/H48.html',
	'D4U': 'https://www.w3.org/WAI/WCAG21/Techniques/html/H48.html',
	'D5A': 'https://www.w3.org/WAI/WCAG21/Techniques/general/G145.html',
	'D5B': 'https://www.w3.org/WAI/WCAG21/Techniques/general/G18.html',
	'D5C': 'https://www.w3.org/WAI/WCAG21/Techniques/general/G17.html',
	'H93': 'https://www.w3.org/WAI/WCAG21/Techniques/html/H93.html',
	'I1': 'https://www.w3.org/WAI/WCAG21/Techniques/general/G95.html',
	'I2': 'https://www.w3.org/WAI/WCAG21/Techniques/general/G95.html',
	'T1': 'https://www.w3.org/WAI/WCAG21/Techniques/html/H39.html',
	'T2': 'https://www.w3.org/WAI/WCAG21/Techniques/html/H73.html',
	'T3': 'https://www.w3.org/WAI/WCAG21/Techniques/html/H73.html',
	'T4A': 'https://www.w3.org/WAI/WCAG21/Techniques/html/H51.html',
	'T4B': 'https://www.w3.org/WAI/WCAG21/Techniques/html/H51.html',
	'T4C': 'https://www.w3.org/WAI/WCAG21/Techniques/html/H63.html'
};

const fullPageStyles = css`
	@import url("https://s.brightspace.com/lib/fonts/0.5.0/fonts.css");
`.cssText;

const contentFragmentStyles = css`
	@import url("https://s.brightspace.com/lib/fonts/0.5.0/fonts.css");
	html {
		/* stylelint-disable-next-line function-name-case */
		font-size: ${unsafeCSS(rootFontSize)};
	}
	body {
		color: #494c4e;
		font-family: 'Lato', sans-serif;
		font-size: 0.95rem;
		font-weight: normal;
		letter-spacing: 0.01rem;
		line-height: 1.4rem;
	}
	table {
		font-family: 'Lato', sans-serif;
		font-size: inherit;
	}
`.cssText;

export const HtmlEditorMixin = superclass => class extends Localizer(RtlMixin(ProviderMixin(superclass))) {

	static get properties() {
		return {
			attachedImagesOnly: { type: Boolean, attribute: 'attached-images-only' },
			autoSave: { type: Boolean, attribute: 'auto-save' },
			files: { type: Array },
			fileUploadForAllUsers: { type: Boolean, attribute: 'file-upload-for-all-users' },
			fullPage: { type: Boolean, attribute: 'full-page' },
			fullPageFontColor: { type: String, attribute: 'full-page-font-color' },
			fullPageFontFamily: { type: String, attribute: 'full-page-font-family' },
			fullPageFontSize: { type: String, attribute: 'full-page-font-size' },
			height: { type: String },
			html: { type: String },
			label: { type: String },
			mentions: { type: Boolean },
			noFilter: { type: Boolean, attribute: 'no-filter' },
			noSpellchecker: { type: Boolean, attribute: 'no-spellchecker' },
			pasteLocalImages: { type: Boolean, attribute: 'paste-local-images' },
			width: { type: String },
			wordCountInFooter: { type: Boolean, attribute: 'word-count-in-footer' },
			_editorId: { type: String },
			_fraContext: { type: Boolean, attribute: 'fra-context', reflect: true }
		};
	}

	static get styles() {
		return [ super.styles, css`
			.d2l-htmleditor-no-tinymce {
				display: none;
			}
			.d2l-htmleditor-tinymce-percentage-height {
				height: inherit;
			}
			/* stylelint-disable selector-class-pattern */
			:host(.tox-fullscreen) {
				position: fixed;
			}
			:host(.tox-shadowhost.tox-fullscreen) {
				z-index: 1000 !important;
			}
			.tox-tinymce-aux,
			.tox.tox-tinymce.tox-fullscreen {
				z-index: 1000 !important;
			}
			.tox.tox-silver-sink.tox-tinymce-aux {
				position: fixed !important; /* Safari fix */
				width: 100%;
			}
			:host([type="inline"]) .tox-tinymce .tox-toolbar-overlord > div:nth-child(2) {
				display: none;
			}
			:host([type="inline"]) .tox-tinymce.tox-fullscreen .tox-toolbar-overlord > div:nth-child(1) {
				display: none;
			}
			:host([type="inline"]) .tox-tinymce.tox-fullscreen .tox-toolbar-overlord > div:nth-child(2) {
				display: flex;
			}
			.tox-tinymce.tox-fullscreen .tox-statusbar__resize-handle {
				display: none;
			}
			:host([fra-context]:not(.tox-fullscreen)) {
				transform: scale(1); /* css magic to work around tinymce dialog fixed/flex positioning in large frames */
			}
			:host([fra-context].tox-fullscreen) .tox-dialog-wrap {
				bottom: auto;
			}
			:host([fra-context]) .tox-dialog {
				max-height: 100vh;
			}
			/* stylelint-enable selector-class-pattern */
		`];
	}

	constructor() {
		super();
		this.attachedImagesOnly = false;
		this.autoSave = false;
		this.files = [];
		this.fileUploadForAllUsers = false;
		this.fullPage = false;
		this.fullPageFontColor = '#494c4e';
		this.height = '355px';
		this.label = '';
		this.mentions = false;
		this.noFilter = false;
		this.noSpellchecker = false;
		this.pasteLocalImages = false;
		this.width = '100%';
		this.wordCountInFooter = false;
		this._html = '';
		this._editorId = getUniqueId();
		this._fraContext = !!window.ifrauclient;
		this._initializationComplete = new Promise(resolve => {
			this._initializationResolve = resolve;
		});
		this._uploadImageCount = 0;
	}

	get html() {
		const editor = tinymce.EditorManager.get(this._editorId);
		if (editor) {
			return editor.getContent();
		} else {
			return this._html;
		}
	}

	set html(val) {
		const oldVal = this._html;
		if (oldVal !== val) {
			this._html = val;
			const editor = tinymce.EditorManager.get(this._editorId);
			if (editor) {
				editor.setContent(this._html);
			}
			this.requestUpdate('html', oldVal);
		}
	}

	get isDirty() {
		const editor = tinymce.EditorManager.get(this._editorId);
		return (editor && editor.isDirty());
	}

	set isDirty(isDirty) {
		const editor = tinymce.EditorManager.get(this._editorId);
		if (editor) editor.setDirty(isDirty);
	}

	async firstUpdated(changedProperties) {
		super.firstUpdated(changedProperties);

		if (!isShadowDOMSupported) return;

		this._context = await getContext();
		if (this._context) {
			this.provideInstance('host', this._context.host);
			this.provideInstance('maxFileSize', this._context.maxFileSize);
			this.provideInstance('orgUnitId', this._context.orgUnitId);
			this.provideInstance('orgUnitPath', this._context.orgUnitPath);
			this.provideInstance('uploadFiles', this._context.uploadFiles);
			this.provideInstance('viewFiles', this._context.viewFiles);
			this.provideInstance('wmodeOpaque', this._context.wmodeOpaque);
		}
		this.provideInstance('attachedImagesOnly', this.attachedImagesOnly);
		this.provideInstance('fileUploadForAllUsers', this.fileUploadForAllUsers);
		this.provideInstance('fullPage', this.fullPage);
		this.provideInstance('noFilter', this.noFilter);
		this.provideInstance('wordCountInFooter', this.wordCountInFooter);
		this.provideInstance('localize', this.localize.bind(this));

		requestAnimationFrame(() => {
			// eventually we can lazy load, but not until the plugins have been updated for toolbar refactoring
			this._initializeTinymce();
		});

	}

	async updated(changedProperties) {
		super.updated(changedProperties);
	}

	focus() {
		const editor = tinymce.EditorManager.get(this._editorId);
		if (editor) editor.focus();
	}

	get initializationComplete() {
		return this._initializationComplete;
	}

	_getMinHeight() {
		const defaultMinHeight = 300;
		const splitPosition = this.height.search(/\D/);

		if (splitPosition === -1) return defaultMinHeight;

		const heightValue = this.height.slice(0, splitPosition);
		const heightUnits = this.height.replace(heightValue, '');

		const fontSizeValue = rootFontSize.replace('px', '');

		switch (heightUnits) {
			case 'px':
				return heightValue < defaultMinHeight ? heightValue : defaultMinHeight;
			case 'rem':
				return (heightValue * fontSizeValue) < defaultMinHeight ? (heightValue * fontSizeValue) : defaultMinHeight;
			default:
				return defaultMinHeight;
		}
	}

	async _initializeTinymce() {

		const textarea = this.shadowRoot.querySelector(`#${this._editorId}`);

		const fullPageConfig = {};
		if (this.fullPage) {
			if (this.fullPageFontColor) fullPageConfig.fullpage_default_text_color = this.fullPageFontColor;
			if (this.fullPageFontFamily) fullPageConfig.fullpage_default_font_family = this.fullPageFontFamily;
			if (this.fullPageFontSize) fullPageConfig.fullpage_default_font_size = this.fullPageFontSize;
		}

		const powerPasteConfig = {
			powerpaste_allow_local_images: this.pasteLocalImages,
			powerpaste_block_drop: !this.pasteLocalImages,
			powerpaste_word_import: this._context ? this._context.pasteFormatting : 'merge'
		};

		const autoSaveConfig = {
			autosave_ask_before_unload: this.autoSave,
			autosave_restore_when_empty: false,
			autosave_retention: '0s'
		};

		const documentConfig = {};
		if (this._context && this._context.host) {
			documentConfig.document_base_url = this._context.host;
		}

		const imageToolsConfig = {};
		if (this._fraContext) imageToolsConfig.imagetools_fetch_image = img => getImage(this, img.src);

		/*
		paste_preprocess: function(plugin, data) {
			// Stops Paste plugin from converting pasted image links to image
			data.content += ' ';
		},
		*/

		tinymce.init({
			a11ychecker_allow_decorative_images: true,
			a11ychecker_issue_url_callback: ruleId => a11yCheckerRuleUrlMap[ruleId],
			allow_html_in_named_anchor: true,
			allow_script_urls: true,
			branding: false,
			browser_spellcheck: !this.noSpellchecker,
			convert_urls: false,
			content_css: `${baseImportPath}/tinymce/skins/content/default/content.css`,
			content_style: this.fullPage ? `${fullPageStyles} ${isfStyles}` : `${contentFragmentStyles} ${isfStyles}`,
			contextmenu: 'image imagetools table',
			directionality: this.dir ? this.dir : 'ltr',
			elementpath: false,
			extended_valid_elements: 'span[*]',
			external_plugins: {
				'a11ychecker': `${baseImportPath}/tinymce/plugins/a11ychecker/plugin.js`,
				'advcode': `${baseImportPath}/tinymce/plugins/advcode/plugin.js`,
				'advtable': `${baseImportPath}/tinymce/plugins/advtable/plugin.js`,
				'mentions': `${baseImportPath}/tinymce/plugins/mentions/plugin.js`,
				'powerpaste': `${baseImportPath}/tinymce/plugins/powerpaste/plugin.js`
			},
			font_formats: `Arabic Transparent=arabic transparent,sans-serif; Arial=arial,helvetica,sans-serif; Comic Sans=comic sans ms,sans-serif; Courier=courier new,courier,sans-serif; Ezra SIL=ezra sil,arial unicode ms,arial,sans-serif; Georgia=georgia,serif; Lato (${this.localize('font.family.recommended')})=Lato,sans-serif; SBL Hebrew=sbl hebrew,times new roman,serif; Simplified Arabic=simplified arabic,sans-serif; Tahoma=tahoma,sans-serif; Times New Roman=times new roman,times,serif; Traditional Arabic=traditional arabic,serif; Trebuchet=trebuchet ms,helvetica,sans-serif; Verdana=verdana,sans-serif; 돋움 (Dotum)=dotum,arial,helvetica,sans-serif; 宋体 (Sim Sun)=simsun; 細明體 (Ming Liu)=mingliu,arial,helvetica,sans-serif`,
			fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
			height: this.height,
			image_uploadtab: false,
			images_upload_handler: (blobInfo, success, failure) => uploadImage(this, blobInfo, success, failure),
			init_instance_callback: editor => {
				if (!editor) return;

				if (editor.plugins && editor.plugins.autosave) {
					// removing the autosave plugin prevents saving of content but retains the "ask_before_unload" behaviour
					delete editor.plugins.autosave;
				}

				const iframe = editor.getContentAreaContainer().firstElementChild;
				if (iframe) iframe.title = this.label;

				this._initializationResolve();
			},
			// inline: this.type === editorTypes.INLINE || this.type === editorTypes.INLINE_LIMITED,
			language: tinymceLang,
			language_url: `${baseImportPath}/tinymce/langs/${tinymceLang}.js`,
			link_context_toolbar: true,
			link_default_protocol: 'https',
			menubar: false,
			min_height: this._getMinHeight(),
			mentions_fetch: (query, success) => {
				setTimeout(async() => success(await queryMentions(this, query.term)), 0);
			},
			mentions_menu_complete: (editor, userinfo) => {
				const span = editor.getDoc().createElement('span');
				span.textContent = `@${userinfo.name}`;
				span.setAttribute('data-mentions-id', userinfo.id);
				return span;
			},
			mentions_selector: 'span[data-mentions-id]',
			object_resizing : true,
			plugins: `a11ychecker ${this.autoSave ? 'autosave' : ''} advtable autolink charmap advcode directionality emoticons ${this.fullPage ? 'fullpage d2l-fullpage' : ''} fullscreen hr image ${this.pasteLocalImages ? 'imagetools' : ''} lists link ${(this.mentions && D2L.LP) ? 'mentions' : ''} powerpaste ${this._context ? 'd2l-preview' : 'preview'} quickbars table textpattern d2l-attributes d2l-color-picker d2l-equation d2l-image d2l-isf d2l-quicklink d2l-wordcount`,
			quickbars_insert_toolbar: false,
			relative_urls: false,
			resize: true,
			setup: editor => {
				addIcons(editor);

				editor.on('blur', () => {
					if (this.pasteLocalImages) editor.uploadImages();

					this._html = editor.getContent();

					this.dispatchEvent(new CustomEvent(
						'd2l-htmleditor-blur', {
							bubbles: true
						}
					));
				});

				const createSplitButton = (name, icon, tooltip, cmd, items) => {
					editor.ui.registry.addSplitButton(name, {
						icon: icon,
						tooltip: this.localize(tooltip),
						onAction: () => editor.execCommand(cmd),
						onItemAction: (api, value) => editor.execCommand(value),
						select: value => value !== 'outdent' && editor.queryCommandState(value),
						fetch: callback => callback(items)
					});
				};

				const createMenuButton = (name, icon, tooltip, items) => {
					editor.ui.registry.addMenuButton(name, {
						tooltip: this.localize(tooltip),
						icon: icon,
						fetch: callback => callback(items)
					});
				};

				const createMenuItem = (name, icon, text, cmd) => {
					editor.ui.registry.addMenuItem(name, {
						text: this.localize(text),
						icon: icon,
						onAction: () => editor.execCommand(cmd)
					});
				};

				const createToggleMenuItem = (name, icon, text, cmd) => {
					editor.ui.registry.addToggleMenuItem(name, {
						text: this.localize(text),
						icon: icon,
						onAction: () => editor.execCommand(cmd),
						onSetup: api => api.setActive(editor.queryCommandState(cmd))
					});
				};

				createSplitButton('d2l-inline', 'strike-through', 'format.strikethrough', 'strikethrough', [
					{ type: 'choiceitem', icon: 'strike-through', text: this.localize('format.strikethrough'), value: 'strikethrough' },
					{ type: 'choiceitem', icon: 'superscript', text: this.localize('format.superscript'), value: 'superscript' },
					{ type: 'choiceitem', icon: 'subscript', text: this.localize('format.subscript'), value: 'subscript' }
				]);

				createToggleMenuItem('d2l-align-left', 'align-left', 'align.left', 'justifyLeft');
				createToggleMenuItem('d2l-align-center', 'align-center', 'align.center', 'justifyCenter');
				createToggleMenuItem('d2l-align-right', 'align-right', 'align.right', 'justifyRight');
				createToggleMenuItem('d2l-align-justify', 'align-justify', 'align.justify', 'justifyFull');
				createToggleMenuItem('d2l-ltr', 'ltr', 'direction.ltr', 'mceDirectionLTR');
				createToggleMenuItem('d2l-rtl', 'rtl', 'direction.rtl', 'mceDirectionRTL');
				createMenuButton('d2l-align', 'align-left', 'align', 'd2l-align-left d2l-align-center d2l-align-right d2l-align-justify | d2l-ltr d2l-rtl');

				createSplitButton('d2l-list', 'unordered-list', 'list.bullets', 'insertUnorderedList', [
					{ type: 'choiceitem', icon: 'unordered-list', text: this.localize('list.bullets'), value: 'insertUnorderedList' },
					{ type: 'choiceitem', icon: 'ordered-list', text: this.localize('list.numbers'), value: 'insertOrderedList' },
					{ type: 'choiceitem', icon: 'indent', text: this.localize('indent'), value: 'indent' },
					{ type: 'choiceitem', icon: 'outdent', text: this.localize('outdent'), value: 'outdent' }
				]);

				createMenuItem('d2l-horizontalrule', 'horizontal-rule', 'horizontalrule', 'InsertHorizontalRule');
				createMenuItem('d2l-emoji', 'emoji', 'emoji', 'mceEmoticons');
				createMenuItem('d2l-symbols', 'insert-character', 'symbols', 'mceShowCharmap');
				createMenuButton('d2l-insert', 'insert', 'insert', 'd2l-attributes d2l-horizontalrule d2l-emoji d2l-symbols');

			},
			skin_url: `${baseImportPath}/tinymce/skins/ui/d2l`,
			statusbar: true,
			style_formats: [
				{ title: 'Paragraph', format: 'p' },
				{ title: 'Heading 1', format: 'h1' },
				{ title: 'Heading 2', format: 'h2' },
				{ title: 'Heading 3', format: 'h3' },
				{ title: 'Heading 4', format: 'h4' },
				{ title: 'Blockquote', format: 'blockquote' },
				{ title: 'Code', format: 'code' }
			],
			target: textarea,
			toolbar: this._getToolbarConfig(),
			//toolbar: false,
			toolbar_mode: 'sliding',
			valid_elements: '*[*]',
			width: this.width,
			...autoSaveConfig,
			...documentConfig,
			...fullPageConfig,
			...imageToolsConfig,
			...powerPasteConfig
		});

	}

	_render() {
		const containerClasses = {
			'd2l-htmleditor-tinymce': true,
			'd2l-htmleditor-tinymce-percentage-height': this.height.includes('%')
		};

		const textAreaClasses = {
			'd2l-htmleditor-no-tinymce': !isShadowDOMSupported
		};

		return html`
			<div class="${classMap(containerClasses)}">
				<textarea id="${this._editorId}" class="${classMap(textAreaClasses)}" aria-hidden="true" tabindex="-1">${this._html}</textarea>
			</div>
			${!isShadowDOMSupported ? html`<d2l-alert>Web Components are not supported in this browser. Upgrade or switch to a newer browser to use the shiny new HtmlEditor.</d2l-alert>` : ''}
		`;
	}

};
