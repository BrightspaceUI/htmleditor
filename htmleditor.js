import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/html-block/html-block.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { HtmlEditorMixin } from './htmleditor-mixin.js';
import { inputLabelStyles } from '@brightspace-ui/core/components/inputs/input-label-styles.js';
import { inputStyles } from '@brightspace-ui/core/components/inputs/input-styles.js';
import { offscreenStyles } from '@brightspace-ui/core/components/offscreen/offscreen.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

// To update from new tinyMCE install
// 1. copy skins from installed node_modules/tinymce into tinymce/skins
// 2. copy new language packs from https://www.tiny.cloud/get-tiny/language-packages/ into tinymce/langs
// 3. copy new enterprise plugins into tinymce/plugins

// TODO: review whether pasted content needs prepcessing to avoid pasted image links getting converted to images
// TODO: configure paste_as_text if using tinyMCEs paste as text feature (fra editor sets to false if power paste enabled) - probably not needed
// TODO: review whether we need to stop pasting of image addresses (see fra editor)
// TODO: review allow_script_urls (ideally we can turn this off)
// TODO: review auto-focus and whether it should be on the API

const isShadowDOMSupported = !(window.ShadyDOM && window.ShadyDOM.inUse);

const editorTypes = {
	FULL: 'full',
	INLINE: 'inline',
	INLINE_LIMITED: 'inline-limited'
};

class HtmlEditor extends HtmlEditorMixin(SkeletonMixin(LitElement)) {

	static get properties() {
		return {
			disabled: { type: Boolean },
			labelHidden: { type: Boolean, attribute: 'label-hidden' },
			type: { type: String },
			_isEditing: { type: Boolean, attribute: 'is-editing' },
			_isInlineEditButtonFocusing: { type: Boolean }
		};
	}

	static get styles() {
		return [ super.styles, inputLabelStyles, inputStyles, offscreenStyles, css`
			:host {
				display: block;
			}
			:host([hidden]) {
				display: none;
			}
			.d2l-htmleditor-container {
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 6px;
			}
			.d2l-htmleditor-percentage-height {
				height: inherit;
			}
			.d2l-htmleditor-fullscreen {
				background-color: #ffffff;
				display: flex;
				flex-direction: column;
				height: 100vh;
				left: 0;
				position: fixed;
				top: 0;
				width: 100%;
				z-index: 1001;
			}
			.d2l-htmleditor-fullscreen .d2l-htmleditor-editor-container {
				flex: auto;
			}
			/* stylelint-disable-next-line selector-class-pattern */
			.d2l-htmleditor-fullscreen .tox-tinymce {
				height: 100% !important;
			}
			.d2l-htmleditor-inline-container .d2l-htmleditor-container {
				display: none;
			}
			.d2l-htmleditor-inline-container.d2l-is-editing .d2l-htmleditor-container {
				display: block;
			}
			.d2l-htmleditor-inline-container.d2l-is-editing .d2l-htmleditor-inline-html-block,
			.d2l-htmleditor-inline-container.d2l-is-editing .d2l-htmleditor-inline-button {
				display: none;
			}
			:host([skeleton]) .d2l-skeletize::before {
				z-index: 2;
			}
		`];
	}

	constructor() {
		super();
		this.disabled = false;
		this.labelHidden = false;
		this.type = editorTypes.FULL;
		this._isEditing = false;
		this._isInlineEditButtonFocusing = false;
	}

	async firstUpdated(changedProperties) {
		await super.firstUpdated(changedProperties);

		if (!isShadowDOMSupported) return;

		this.addEventListener('d2l-htmleditor-blur', () => {
			if (this.type === editorTypes.INLINE || this.type === editorTypes.INLINE_LIMITED) {
				this._isEditing = false;
			}
		});

		this._toolbar = await import('./components/toolbar/toolbar-full.js');
		this.requestUpdate();

		requestAnimationFrame(() => {
			// eventually we can lazy load, but not until the plugins have been updated for toolbar refactoring
			this._initializeTinymce(this._toolbar.getPlugins(this));
		});

	}

	render() {

		if (this.disabled) {
			return html`
				<d2l-html-block class="d2l-skeletize">
					<template>${unsafeHTML(this._html)}</template>
				</d2l-html-block>`;
		}

		if (this.type === editorTypes.FULL) {
			return this._renderFullEditor();
		}

		return this._renderInlineEditor();

	}

	focus() {
		if ((this.type === editorTypes.INLINE || this.type === editorTypes.INLINE_LIMITED) && !this._isEditing) {
			const inlineButton = this.shadowRoot.querySelector('.d2l-htmleditor-inline-button');
			inlineButton.focus();
		} else {
			super.focus();
		}
	}

	_getToolbarConfig() {
		return false;
		if (this.type === editorTypes.INLINE_LIMITED) {
			return 'bold italic underline | d2l-list d2l-isf emoticons';
		} else if (this.type === editorTypes.INLINE) {
			return [
				'bold italic underline | d2l-align d2l-list d2l-isf | fullscreen',
				`styleselect | bold italic underline d2l-inline | d2l-align d2l-list | d2l-isf d2l-quicklink d2l-image | table d2l-equation charmap emoticons hr | a11ycheck | fontselect | fontsizeselect | forecolor | ${ this._context ? 'd2l-preview' : 'preview'} code | undo redo | fullscreen`
			];
		} else {
			return `styleselect | bold italic underline d2l-inline | d2l-align d2l-list | d2l-isf d2l-quicklink d2l-image | table d2l-equation charmap emoticons hr | a11ycheck | fontselect | fontsizeselect | forecolor | ${ this._context ? 'd2l-preview' : 'preview'} code d2l-wordcount | undo redo | fullscreen`;
		}
	}

	_onInlineEditButtonBlur() {
		this._isInlineEditButtonFocusing = false;
	}

	_onInlineEditButtonFocus() {
		this._isInlineEditButtonFocusing = true;
	}

	async _onInlineEditClick() {
		this._isEditing = true;
		await this.updateComplete;
		requestAnimationFrame(() => this.focus());
	}

	_renderEditor(toolbar) {
		const containerClasses = {
			'd2l-htmleditor-container': true,
			'd2l-skeletize': true,
			'd2l-htmleditor-percentage-height': super.height.includes('%'),
			'd2l-htmleditor-fullscreen': this._fullscreen
		};

		return html`
			${this.label && !this.labelHidden ? html`<span class="d2l-input-label d2l-skeletize" aria-hidden="true">${this.label}</span>` : ''}
			<div class="${classMap(containerClasses)}">
				<div class="d2l-htmleditor-toolbar-container">${toolbar}</div>
				<div class="d2l-htmleditor-editor-container">${this._render()}</div>
			</div>
		`;
	}

	_renderFullEditor() {
		if (this._toolbar) {
			return this._renderEditor(this._toolbar.renderFullToolbar(this));
		} else {
			return this._renderEditor();
		}
	}

	_renderInlineEditor() {

		const hasPercentageHeight = this.height.includes('%');

		const containerClasses = {
			'd2l-htmleditor-inline-container': true,
			'd2l-htmleditor-percentage-height': hasPercentageHeight,
			'd2l-is-editing': this._isEditing
		};

		const htmlBlockClasses = {
			'd2l-htmleditor-inline-html-block': true,
			'd2l-htmleditor-percentage-height': hasPercentageHeight,
			'd2l-input': true,
			'd2l-input-focus': this._isInlineEditButtonFocusing
		};

		return html`
			<div class="${classMap(containerClasses)}">
				<button @blur="${this._onInlineEditButtonBlur}"
					class="d2l-offscreen d2l-htmleditor-inline-button"
					@click="${this._onInlineEditClick}"
					@focus="${this._onInlineEditButtonFocus}">
					${this.localize('inline.button', { name: this.label })}
				</button>
				<div class="${classMap(htmlBlockClasses)}" @click="${this._onInlineEditClick}">
					<d2l-html-block class="d2l-skeletize">
						<template>${unsafeHTML(this._html)}</template>
					</d2l-html-block>
				</div>
				${this._renderEditor(renderFullToolbar())}
			</div>`;

	}

}

customElements.define('d2l-htmleditor', HtmlEditor);
