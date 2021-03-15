import './button.js';
import '@brightspace-ui/core/components/colors/colors.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { getComposedActiveElement } from '@brightspace-ui/core/helpers/focus.js';
import { icons } from '../../generated/icons.js';
import { Localizer } from '../../lang/localizer.js';
import { openDialog } from '../lms-adapter.js';
import { ToolbarItemMixin } from './toolbar-item-mixin.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

class ButtonColor extends Localizer(ToolbarItemMixin(LitElement)) {

	static get styles() {
		return css`
			:host {
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
		`;
	}

	render() {
		return html`
			<d2l-htmleditor-button
				?activeFocusable="${this.activeFocusable}"
				class="d2l-htmleditor-button-color-select"
				@click="${this._handleSelectColor}"
				text="${this.localize('selectcolor')}">
				${unsafeHTML(icons['text-color'])}
			</d2l-htmleditor-button>
		`;
	}

	focus() {
		const elem = this.shadowRoot.querySelector('d2l-htmleditor-button');
		if (elem) elem.focus();
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
			editor.execCommand('forecolor', false, color);
		}

	}

}

customElements.define('d2l-htmleditor-button-color', ButtonColor);
