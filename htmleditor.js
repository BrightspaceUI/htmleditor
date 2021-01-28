import '@brightspace-ui/core/components/alert/alert.js';
import '@brightspace-ui/core/components/html-block/html-block.js';
import './components/quicklink.js';
import './components/equation.js';
import './components/preview.js';
import './components/wordcount.js';
import 'tinymce/tinymce.js';
import 'tinymce/icons/default/icons.js';
import 'tinymce/plugins/autosave/plugin.js';
import 'tinymce/plugins/autolink/plugin.js';
import 'tinymce/plugins/charmap/plugin.js';
import 'tinymce/plugins/code/plugin.js';
import 'tinymce/plugins/directionality/plugin.js';
import 'tinymce/plugins/emoticons/plugin.js';
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
import { css, html, LitElement, unsafeCSS } from 'lit-element/lit-element.js';
import { addIcons } from './generated/icons.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { getUniqueId } from '@brightspace-ui/core/helpers/uniqueId.js';
import { inputLabelStyles } from '@brightspace-ui/core/components/inputs/input-label-styles.js';
import { isfStyles } from './components/isf.js';
import { Localizer } from './lang/localizer.js';
import { ProviderMixin } from '@brightspace-ui/core/mixins/provider-mixin.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';
import { tinymceLangs } from './generated/langs.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { uploadImage } from './components/image.js';

// To update from new tinyMCE install
// 1. copy skins from installed node_modules/tinymce into tinymce/skins
// 2. copy new language packs from https://www.tiny.cloud/get-tiny/language-packages/ into tinymce/langs
// 3. copy new enterprise plugins into tinymce/plugins

// TODO: review whether pasted content needs prepcessing to avoid pasted image links getting converted to images
// TODO: configure paste_as_text if using tinyMCEs paste as text feature (fra editor sets to false if power paste enabled) - probably not needed
// TODO: review whether we need to stop pasting of image addresses (see fra editor)
// TODO: review allow_script_urls (ideally we can turn this off)
// TODO: review auto-focus and whether it should be on the API

const editorTypes = {
	FULL: 'full',
	INLINE: 'inline',
	INLINE_LIMITED: 'inline-limited'
};

const isShadowDOMSupported = !(window.ShadyDOM && window.ShadyDOM.inUse);

const context = JSON.parse(document.documentElement.getAttribute('data-he-context'));

const rootFontSize = window.getComputedStyle(document.documentElement, null).getPropertyValue('font-size');

const documentLang = (document.documentElement.getAttribute('lang') ?? 'en').replace('-', '_');

let tinymceLang = documentLang;
if (!tinymceLangs.includes(documentLang)) {
	const cultureIndex = tinymceLang.indexOf('_');
	if (cultureIndex !== -1) tinymceLang = tinymceLang.substring(0, cultureIndex);
	if (!tinymceLangs.includes(tinymceLang)) {
		tinymceLang = tinymceLangs.find((lang) => {
			return lang.startsWith(tinymceLang);
		});
		if (!tinymceLang) tinymceLang = 'en';
	}
}

const pathFromUrl = (url) => {
	return url.substring(0, url.lastIndexOf('/'));
};

const baseImportPath = pathFromUrl(import.meta.url);

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

class HtmlEditor extends SkeletonMixin(ProviderMixin(Localizer(RtlMixin(LitElement)))) {

	static get properties() {
		return {
			attachedImagesOnly: { type: Boolean, attribute: 'attached-images-only' },
			autoSave: { type: Boolean, attribute: 'auto-save' },
			disabled: { type: Boolean },
			files: { type: Array },
			fileUploadForAllUsers: { type: Boolean, attribute: 'file-upload-for-all-users' },
			fullPage: { type: Boolean, attribute: 'full-page' },
			fullPageFontColor: { type: String, attribute: 'full-page-font-color' },
			fullPageFontFamily: { type: String, attribute: 'full-page-font-family' },
			fullPageFontSize: { type: String, attribute: 'full-page-font-size' },
			height: { type: String },
			html: { type: String },
			label: { type: String },
			labelHidden: { type: Boolean, attribute: 'label-hidden' },
			mentions: { type: Boolean },
			noFilter: { type: Boolean, attribute: 'no-filter' },
			noSpellchecker: { type: Boolean, attribute: 'no-spellchecker' },
			pasteLocalImages: { type: Boolean, attribute: 'paste-local-images' },
			type: { type: String },
			width: { type: String },
			wordCountInFooter: { type: Boolean, attribute: 'word-count-in-footer' },
			_editorId: { type: String }
		};
	}

	static get styles() {
		return [ super.styles, inputLabelStyles, css`
			:host {
				display: block;
			}
			:host([hidden]) {
				display: none;
			}
			.d2l-htmleditor-container {
				border: 1px solid var(--d2l-color-mica); /* snow */
				border-radius: 6px;
				padding: 4px; /* snow */
			}
			.d2l-htmleditor-no-tinymce {
				display: none;
			}
			:host([skeleton]) .d2l-skeletize::before {
				z-index: 2;
			}
			/* stylelint-disable selector-class-pattern */
			.tox .tox-toolbar__group {
				padding: 0 4px 0 8px; /* snow */
			}
			.tox .tox-pop__dialog .tox-toolbar-nav-js {
				margin-bottom: 0; /* snow */
				margin-top: 0; /* snow */
				min-height: auto; /* snow */
				padding: 0; /* snow */
			}
			.tox .tox-pop__dialog .tox-toolbar {
				background: none; /* snow */
			}
			.tox-tinymce-aux,
			.tox.tox-tinymce.tox-fullscreen {
				background-color: #ffffff;
				z-index: 1000;
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
			/* stylelint-enable selector-class-pattern */
		`];
	}

	constructor() {
		super();
		this.attachedImagesOnly = false;
		this.autoSave = false;
		this.disabled = false;
		this.files = [];
		this.fileUploadForAllUsers = false;
		this.fullPage = false;
		this.fullPageFontColor = '#494c4e';
		this.height = '355px';
		this.label = '';
		this.labelHidden = false;
		this.mentions = false;
		this.noFilter = false;
		this.noSpellchecker = false;
		this.pasteLocalImages = false;
		this.type = editorTypes.FULL;
		this.width = '100%';
		this.wordCountInFooter = false;
		this._editorId = getUniqueId();
		this._html = '';
		this._initializationComplete = new Promise((resolve) => {
			this._initializationResolve = resolve;
		});
		this._uploadImageCount = 0;
		if (context) {
			this.provideInstance('maxFileSize', context.maxFileSize);
			this.provideInstance('orgUnitId', context.orgUnitId);
			this.provideInstance('orgUnitPath', context.orgUnitPath);
			this.provideInstance('uploadFiles', context.uploadFiles);
			this.provideInstance('viewFiles', context.viewFiles);
			this.provideInstance('wmodeOpaque', context.wmodeOpaque);
		}
		setTimeout(() => {
			this.provideInstance('attachedImagesOnly', this.attachedImagesOnly);
			this.provideInstance('fileUploadForAllUsers', this.fileUploadForAllUsers);
			this.provideInstance('fullPage', this.fullPage);
			this.provideInstance('noFilter', this.noFilter);
			this.provideInstance('wordCountInFooter', this.wordCountInFooter);
		}, 0);
		this.provideInstance('localize', this.localize.bind(this));
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

	firstUpdated(changedProperties) {
		super.firstUpdated(changedProperties);

		if (!isShadowDOMSupported) return;

		requestAnimationFrame(() => {

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
				powerpaste_word_import: context ? context.pasteFormatting : 'merge'
			};

			const autoSaveConfig = {
				autosave_ask_before_unload: this.autoSave,
				autosave_restore_when_empty: false,
				autosave_retention: '0s'
			};

			/*
			paste_preprocess: function(plugin, data) {
				// Stops Paste plugin from converting pasted image links to image
				data.content += ' ';
			},
			*/

			tinymce.init({
				a11ychecker_allow_decorative_images: true,
				allow_html_in_named_anchor: true,
				allow_script_urls: true,
				branding: false,
				browser_spellcheck: !this.noSpellchecker,
				convert_urls: false,
				content_css: `${baseImportPath}/tinymce/skins/content/default/content.css`,
				content_style: this.fullPage ? isfStyles : `${contentFragmentStyles} ${isfStyles}`,
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
					setTimeout(() => D2L.LP.Web.UI.Rpc.Connect(
						D2L.LP.Web.UI.Rpc.Verbs.GET,
						new D2L.LP.Web.Http.UrlLocation('/d2l/lp/htmleditor/tinymce/mentionsSearchQuery'),
						{ searchTerm: query.term, orgUnitId: context.orgUnitId },
						{ success: success }
					), 0);
				},
				mentions_menu_complete: (editor, userinfo) => {
					const span = editor.getDoc().createElement('span');
					span.textContent = `@${userinfo.name}`;
					span.setAttribute('data-mentions-id', userinfo.id);
					return span;
				},
				mentions_selector: 'span[data-mentions-id]',
				object_resizing : true,
				plugins: `a11ychecker ${this.autoSave ? 'autosave' : ''} advtable autolink charmap advcode directionality emoticons ${this.fullPage ? 'fullpage' : ''} fullscreen hr image ${this.pasteLocalImages ? 'imagetools' : ''} lists link ${(this.mentions && D2L.LP) ? 'mentions' : ''} powerpaste ${D2L.LP ? 'd2l-preview' : 'preview'} quickbars table textpattern d2l-equation d2l-image d2l-isf d2l-quicklink d2l-wordcount`,
				quickbars_insert_toolbar: false,
				relative_urls: false,
				resize: true,
				setup: (editor) => {
					addIcons(editor);

					editor.on('blur', () => {
						if (this.pasteLocalImages) editor.uploadImages();

						this.dispatchEvent(new CustomEvent(
							'd2l-htmleditor-blur', {
								bubbles: true
							}
						));
					});

					const createSplitButton = (name, icon, tooltip, cmd, items) => {
						editor.ui.registry.addSplitButton(name, {
							icon: icon,
							tooltip: tooltip,
							onAction: () => editor.execCommand(cmd),
							onItemAction: (api, value) => editor.execCommand(value),
							select: value => editor.queryCommandState(value),
							fetch: callback => callback(items)
						});
					};

					const createMenuButton = (name, icon, tooltip, items) => {
						editor.ui.registry.addMenuButton(name, {
							tooltip: tooltip,
							icon: icon,
							fetch: callback => callback(items)
						});
					};

					const createToggleMenuItem = (name, icon, text, cmd) => {
						editor.ui.registry.addToggleMenuItem(name, {
							text: text,
							icon: icon,
							onAction: () => editor.execCommand(cmd),
							onSetup: api => api.setActive(editor.queryCommandState(cmd))
						});
					};

					createSplitButton('d2l-inline', 'strike-through', 'Strike-through', 'strikethrough', [
						{ type: 'choiceitem', icon: 'strike-through', text: 'Strike-through', value: 'strikethrough' },
						{ type: 'choiceitem', icon: 'superscript', text: 'Superscript', value: 'superscript' },
						{ type: 'choiceitem', icon: 'subscript', text: 'Subscript', value: 'subscript' }
					]);

					createToggleMenuItem('d2l-align-left', 'align-left', 'Left', 'justifyLeft');
					createToggleMenuItem('d2l-align-center', 'align-center', 'Center', 'justifyCenter');
					createToggleMenuItem('d2l-align-right', 'align-right', 'Right', 'justifyRight');
					createToggleMenuItem('d2l-align-justify', 'align-justify', 'Justify', 'justifyFull');
					createToggleMenuItem('d2l-ltr', 'ltr', 'Left to Right', 'mceDirectionLTR');
					createToggleMenuItem('d2l-rtl', 'rtl', 'Right to Left', 'mceDirectionRTL');
					createMenuButton('d2l-align', 'align-left', 'Alignment', 'd2l-align-left d2l-align-center d2l-align-right d2l-align-justify | d2l-ltr d2l-rtl');

					createSplitButton('d2l-list', 'unordered-list', 'Bulleted List', 'insertUnorderedList', [
						{ type: 'choiceitem', icon: 'unordered-list', text: 'Bulleted List', value: 'insertUnorderedList' },
						{ type: 'choiceitem', icon: 'ordered-list', text: 'Numbered List', value: 'insertOrderedList' },
						{ type: 'choiceitem', icon: 'indent', text: 'Increase Indent', value: 'indent' },
						{ type: 'choiceitem', icon: 'outdent', text: 'Decrease Indent', value: 'outdent' }
					]);

				},
				skin_url: `${baseImportPath}/tinymce/skins/ui/snow`,
				statusbar: true,
				target: textarea,
				toolbar: this._getToolbarConfig(),
				toolbar_mode: 'sliding',
				valid_elements: '*[*]',
				width: this.width,
				...autoSaveConfig,
				...fullPageConfig,
				...powerPasteConfig
			});

		});

	}

	render() {

		if (this.disabled) {
			return html`
				<d2l-html-block class="d2l-skeletize">
					<template>${unsafeHTML(this._html)}</template>
				</d2l-html-block>`;
		}

		const textAreaClasses = {
			'd2l-htmleditor-no-tinymce': !isShadowDOMSupported
		};

		//if (this.type === editorTypes.INLINE || this.type === editorTypes.INLINE_LIMITED) {
		//	return html`<div id="${this._editorId}" .innerHTML="${this._html}"></div>`;
		//} else {
		return html`
		${this.label && !this.labelHidden ? html`<span class="d2l-input-label d2l-skeletize" aria-hidden="true">${this.label}</span>` : ''}
			<div class="d2l-htmleditor-container d2l-skeletize">
				<textarea id="${this._editorId}" class="${classMap(textAreaClasses)}" aria-hidden="true" tabindex="-1">${this._html}</textarea>
			</div>
		${!isShadowDOMSupported ? html`<d2l-alert>Web Components are not supported in this browser. Upgrade or switch to a newer browser to use the shiny new HtmlEditor.</d2l-alert>` : ''}`;
		//}

	}

	focus() {
		const editor = tinymce.EditorManager.get(this._editorId);
		if (editor) editor.focus();
	}

	get initializationComplete() {
		return this._initializationComplete;
	}

	get isDirty() {
		const editor = tinymce.EditorManager.get(this._editorId);
		return (editor && editor.isDirty());
	}

	_getMinHeight() {
		const defaultMinHeight = 300;
		const heightParts = this.height.split(/(?<=\d)(?=\D)/);

		if (heightParts.length !== 2) return defaultMinHeight;

		const heightValue = heightParts[0];
		const heightUnits = heightParts[1];

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

	_getToolbarConfig() {
		if (this.type === editorTypes.INLINE_LIMITED) {
			return 'bold italic underline | d2l-list d2l-isf emoticons';
		} else if (this.type === editorTypes.INLINE) {
			return [
				'bold italic underline | d2l-align d2l-list d2l-isf | fullscreen',
				`styleselect | bold italic underline d2l-inline | d2l-align d2l-list | d2l-isf d2l-quicklink d2l-image | table d2l-equation charmap emoticons hr | a11ycheck | fontselect | fontsizeselect | forecolor | ${ D2L.LP ? 'd2l-preview' : 'preview'} code | undo redo | fullscreen`
			];
		} else {
			return `styleselect | bold italic underline d2l-inline | d2l-align d2l-list | d2l-isf d2l-quicklink d2l-image | table d2l-equation charmap emoticons hr | a11ycheck | fontselect | fontsizeselect | forecolor | ${ D2L.LP ? 'd2l-preview' : 'preview'} code d2l-wordcount | undo redo | fullscreen`;
		}
	}

}

customElements.define('d2l-htmleditor', HtmlEditor);
