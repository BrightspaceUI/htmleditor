import './button.js';
import '@brightspace-ui/core/components/colors/colors.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { getComposedActiveElement } from '@brightspace-ui/core/helpers/focus.js';
import { icons } from '../../generated/icons.js';
import { Localizer } from '../../lang/localizer.js';
import { openDialog } from '../lms-adapter.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { ToolbarItemMixin } from './toolbar-item-mixin.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

const defaultColor = '#494c4e';

class ButtonColor extends Localizer(ToolbarItemMixin(RtlMixin(LitElement))) {

	static get properties() {
		return {
			_color: { type: String }
		};
	}

	static get styles() {
		return css`
			:host {
				--d2l-htmleditor-button-color-value: var(--d2l-color-ferrite);
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
			div {
				display: flex;
			}
			div:hover .d2l-htmleditor-button-color-apply,
			div:focus-within .d2l-htmleditor-button-color-apply {
				--d2l-htmleditor-button-border-color: var(--d2l-color-gypsum) transparent var(--d2l-color-gypsum) var(--d2l-color-gypsum);
				--d2l-htmleditor-button-border-radius: 0.3rem 0 0 0.3rem;
			}
			div:hover .d2l-htmleditor-button-color-select,
			div:focus-within .d2l-htmleditor-button-color-select {
				--d2l-htmleditor-button-border-color: var(--d2l-color-gypsum) var(--d2l-color-gypsum) var(--d2l-color-gypsum) transparent;
				--d2l-htmleditor-button-border-radius: 0 0.3rem 0.3rem 0;
			}
			:host([dir="rtl"]) div:hover .d2l-htmleditor-button-color-apply,
			:host([dir="rtl"]) div:focus-within .d2l-htmleditor-button-color-apply {
				--d2l-htmleditor-button-border-color: var(--d2l-color-gypsum) var(--d2l-color-gypsum) var(--d2l-color-gypsum) transparent;
				--d2l-htmleditor-button-border-radius: 0 0.3rem 0.3rem 0;
			}
			:host([dir="rtl"]) div:hover .d2l-htmleditor-button-color-select,
			:host([dir="rtl"]) div:focus-within .d2l-htmleditor-button-color-select {
				--d2l-htmleditor-button-border-color: var(--d2l-color-gypsum) transparent var(--d2l-color-gypsum) var(--d2l-color-gypsum);
				--d2l-htmleditor-button-border-radius: 0.3rem 0 0 0.3rem;
			}
			#tox-icon-text-color__color {
				fill: var(--d2l-htmleditor-button-color-value);
				stroke: var(--d2l-htmleditor-button-color-value);
			}
		`;
	}

	constructor() {
		super();
		this._color = defaultColor;
	}

	render() {
		return html`
			<div>
				<d2l-htmleditor-button
					class="d2l-htmleditor-button-color-apply"
					@click="${this._applyColor}"
					text="${this.localize('textcolor')}">
					${unsafeHTML(icons['text-color'])}
				</d2l-htmleditor-button>
				<d2l-htmleditor-button
					class="d2l-htmleditor-button-color-select"
					@click="${this._handleSelectColor}"
					text="${this.localize('selectcolor')}">
					<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
						<path d="M2.39 6.49a1.5 1.5 0 0 1 2.12-.1L9 10.47l4.49-4.08a1.5 1.5 0 0 1 2.02 2.22L10 13.62A1.474 1.474 0 0 1 9 14a1.523 1.523 0 0 1-1-.38L2.49 8.61a1.5 1.5 0 0 1-.1-2.12z"/>
					</svg>
				</d2l-htmleditor-button>
			</div>
		`;
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		if (!changedProperties.has('_color')) return;
		this.style.setProperty('--d2l-htmleditor-button-color-value', this._color);
	}

	async _applyColor() {
		const editor = await this._getEditor();
		editor.execCommand('forecolor', false, this._color);
	}

	_getComputedStyle(node, propertyName) {

		const parseColor = value => {
			// parses rgb and rgba colors
			if (!value.startsWith('rgb')) return;
			value = value.replace('rgb(', '').replace('rgba(', '').replace(')', '');
			value = value.split(',');
			return {
				r: parseInt(value[0]),
				g: parseInt(value[1]),
				b: parseInt(value[2]),
				a: (value.length === 4 ? parseFloat(value[3]) : 1)
			};
		};

		const getStyleValue = node => {
			if (node.nodeType === Node.DOCUMENT_NODE) {
				node = node.body;
				return window.getComputedStyle(node, null).getPropertyValue(propertyName);
			}

			let value = window.getComputedStyle(node, null).getPropertyValue(propertyName);
			if (propertyName === 'background-color' && node.parentNode) {
				// ignore completely transparent (does not handle partial transparency)
				if (value === 'transparent') {
					value = getStyleValue(node.parentNode);
				} else {
					const color = parseColor(value);
					if (color && color.a === 0) value = getStyleValue(node.parentNode);
				}
			}
			return value;
		};

		return getStyleValue(node);
	}

	async _handleSelectColor() {
		const editor = await this._getEditor();

		let contextNode = (editor.selection ? editor.selection.getNode() : null);
		if (!contextNode) return;

		if (contextNode.nodeType === Node.DOCUMENT_NODE) {
			contextNode = contextNode.body;
		}

		const backgroundColor = this._getComputedStyle(contextNode, 'background-color');

		const color = await openDialog(
			getComposedActiveElement(),
			`/d2l/lp/htmleditor/foregroundcolor?backgroundColor=${backgroundColor}`
		);

		if (color && color !== '') {
			this._color = color;
			this._applyColor();
		}

	}

}

customElements.define('d2l-htmleditor-button-color', ButtonColor);
