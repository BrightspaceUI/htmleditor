import 'tinymce/tinymce.js';
import 'tinymce/icons/default/icons.js';
import 'tinymce/plugins/charmap/plugin.js';
import 'tinymce/plugins/code/plugin.js';
import 'tinymce/plugins/directionality/plugin.js';
import 'tinymce/plugins/fullpage/plugin.js';
import 'tinymce/plugins/fullscreen/plugin.js';
import 'tinymce/plugins/hr/plugin.js';
import 'tinymce/plugins/lists/plugin.js';
import 'tinymce/plugins/preview/plugin.js';
import 'tinymce/plugins/table/plugin.js';
import 'tinymce/themes/silver/theme.js';
//import './tinymce/plugins/a11ychecker/plugin.js';
//import './tinymce/plugins/powerpaste/plugin.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { getUniqueId } from '@brightspace-ui/core/helpers/uniqueId.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

// To update from nre tinyMCE install
// 1. copy skins from installed node_modules/tinymce into tinymce/skins
// 2. copy new language packs from https://www.tiny.cloud/get-tiny/language-packages/ into tinymce/langs
// 3. copy new enterprise plugins into tinymce/plugins

// TODO: resolve language
// TODO: localize font-families
// TODO: configure formats
// TODO: figure out how to load out own icons without getting 404s
// TODO: deal with importing styles
// TODO: find out why enterprise plugins are not loaded properly above but are when using external_plugins
// TODO: set powerpaste_word_import based on paste formatting config value (clean, merge, prompt)
// TODO: convert pasted local images if upload location provided (previously only allowed local images if provided)
// TODO: review whether pasted content needs prepcessing to avoid pasted image links getting converted to images
// TODO: configure paste_as_text if using tinyMCEs paste as text feature (fra editor sets to false if power paste enabled) - probably not needed
// TODO: provide a way for consumer to specify upload location for images, and configure images_upload_handler
// TODO: review whether we need to stop pasting of image addresses (see fra editor)
// TODO: refactor classic / inline if necessary (need Design discussion)
// TODO: review allow_script_urls (ideally we can turn this off)
// TODO: review resize (monolith specifies both, but this would require enabling statusbar)
// TODO: content CSS (fragment and fullpage)
// TODO: review auto-focus and whether it should be on the API
// TODO: monolith intrgration (d2l_image d2l_isf d2l_equation fullscreen d2l_link d2l_equation d2l_code d2l_preview smallscreen)
// TODO: editor resize (ref monolith resize handler, updates editor size)
// TODO: why do class-stream, assignment-editor, and rubric editor turn off object-resizing?

const pathFromUrl = (url) => {
	return url.substring(0, url.lastIndexOf('/'));
};

const baseImportPath = pathFromUrl(import.meta.url);

class HtmlEditor extends RtlMixin(LitElement) {

	static get properties() {
		return {
			fullPage: { type: Boolean, attribute: 'full-page' },
			fullPageFontColor: { type: String, attribute: 'full-page-font-color' },
			fullPageFontFamily: { type: String, attribute: 'full-page-font-family' },
			fullPageFontSize: { type: String, attribute: 'full-page-font-size' },
			height: { type: String },
			html: { type: String },
			inline: { type: Boolean },
			noSpellchecker: { type: Boolean, attribute: 'no-spellchecker'},
			width: { type: String },
			_editorId: { type: String }
		};
	}

	static get styles() {
		return css`
			:host {
				display: block;
			}
			:host([hidden]) {
				display: none;
			}
			.tox-tinymce.tox-fullscreen {
				z-index: 1001;
			}
		`;
	}

	constructor() {
		super();
		this.fullPage = false;
		this.height = '355px';
		this.inline = false;
		this.noSpellchecker = false;
		this.width = '100%';
		this._editorId = getUniqueId();
		this._html = '';
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

		requestAnimationFrame(() => {

			const textarea = this.shadowRoot.querySelector(`#${this._editorId}`);
			const locale = 'en-US';

			const fullPageConfig = {};
			if (this.fullPage) {
				if (this.fullPageFontColor) fullPageConfig.fullpage_default_text_color = this.fullPageFontColor;
				if (this.fullPageFontFamily) fullPageConfig.fullpage_default_font_family = this.fullPageFontFamily;
				if (this.fullPageFontSize) fullPageConfig.fullpage_default_font_size = this.fullPageFontSize;
			}

			const powerPasteConfig = {
				powerpaste_allow_local_images: true,
				powerpaste_block_drop : false,
				powerpaste_word_import: 'merge'
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
				directionality: this.dir ? this.dir : 'ltr',
				extended_valid_elements: 'span[*]',
				external_plugins: {
					'a11ychecker': `${baseImportPath}/tinymce/plugins/a11ychecker/plugin.js`,
					'powerpaste': `${baseImportPath}/tinymce/plugins/powerpaste/plugin.js`
				},
				font_formats: 'Arabic Transparent=arabic transparent,sans-serif; Arial (Recommended)=arial,helvetica,sans-serif; Comic Sans=comic sans ms,sans-serif; Courier=courier new,courier,sans-serif; Ezra SIL=ezra sil,arial unicode ms,arial,sans-serif; Georgia=georgia,serif; SBL Hebrew=sbl hebrew,times new roman,serif; Simplified Arabic=simplified arabic,sans-serif; Tahoma=tahoma,sans-serif; Times New Roman=times new roman,times,serif; Traditional Arabic=traditional arabic,serif; Trebuchet=trebuchet ms,helvetica,sans-serif; Verdana=verdana,sans-serif; 돋움 (Dotum)=dotum,arial,helvetica,sans-serif; 宋体 (Sim Sun)=simsun; 細明體 (Ming Liu)=mingliu,arial,helvetica,sans-serif',
				fontsize_formats: '8pt 10pt 12pt 14pt 18pt 24pt 36pt',
				height: this.height,
				inline: this.inline,
				language: locale !== 'en-US' ? locale : null,
				language_url: `/tinymce/langs/${locale}.js`,
				menubar: false,
				object_resizing : true,
				plugins: `a11ychecker charmap code directionality ${this.fullPage ? 'fullpage' : ''} fullscreen hr lists powerpaste preview table`,
				relative_urls: false,
				skin_url: `${baseImportPath}/tinymce/skins/ui/oxide`,
				statusbar: false,
				target: textarea,
				toolbar: this.inline
					? 'bold italic underline'
					: 'bold italic underline | strikethrough subscript superscript | bullist numlist | indent outdent | alignleft alignright aligncenter alignjustify | charmap hr | table | forecolor | styleselect fontselect fontsizeselect | undo redo | preview code fullscreen | ltr rtl',
				valid_elements: '*[*]',
				width: this.width,
				...fullPageConfig,
				...powerPasteConfig
			});

		});

	}

	render() {
		if (this.inline) {
			return html`<div id="${this._editorId}" .innerHTML="${this._html}"></div>`;
		} else {
			return html`<textarea id="${this._editorId}" aria-hidden="true" tabindex="-1">${this._html}</textarea>`;
		}
	}

	focus() {
		tinymce.EditorManager.get(this._editorId).focus();
	}

}
customElements.define('d2l-htmleditor', HtmlEditor);
