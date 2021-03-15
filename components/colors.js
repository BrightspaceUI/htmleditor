import 'tinymce/tinymce.js';
import { css, LitElement } from 'lit-element/lit-element.js';
import { hasLmsContext, openDialog } from './lms-adapter.js';
import { getComposedActiveElement } from '@brightspace-ui/core/helpers/focus.js';
import { requestInstance } from '@brightspace-ui/core/mixins/provider-mixin.js';

tinymce.PluginManager.add('d2l-color-picker', function(editor) {

	// bail if no LMS context
	if (!hasLmsContext()) return;

	const localize = requestInstance(editor.getElement(), 'localize');
	const root = editor.getElement().getRootNode();

	const getComputedStyle = (node, propertyName) => {

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
	};

	editor.ui.registry.addButton('d2l-color-picker', {
		icon: 'textcolor',
		tooltip: localize('colors.tooltip'),
		onAction: () => {
			let dialog = root.querySelector('d2l-htmleditor-color-picker-dialog');
			if (!dialog) dialog = root.appendChild(document.createElement('d2l-htmleditor-color-picker-dialog'));

			let contextNode = (editor.selection ? editor.selection.getNode() : null);
			if (contextNode) {
				if (contextNode.nodeType === Node.DOCUMENT_NODE) contextNode = contextNode.body;
				dialog.backgroundColor = getComputedStyle(contextNode, 'background-color');
			}

			dialog.opener = root.host;
			dialog.opened = true;

			dialog.addEventListener('d2l-htmleditor-color-picker-dialog-close', (e) => {
				if (!e.detail || !e.detail.color) return;
				editor.execCommand('forecolor', false, e.detail.color);

				root.host.focus();
			}, { once: true });
		}
	});
});

class ColorPickerDialog extends LitElement {

	static get properties() {
		return {
			backgroundColor: { type: String, attribute: 'background-color' },
			opened: { type: Boolean, reflect: true },
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
		`;
	}

	constructor() {
		super();
		this.backgroundColor = '';
		this.opened = false;
	}

	render() {
	}

	async updated(changedProperties) {
		super.updated(changedProperties);

		if (!changedProperties.has('opened')) return;

		if (this.opened) {

			const result = await openDialog(
				getComposedActiveElement(),
				`/d2l/lp/htmleditor/foregroundcolor?backgroundColor=${this.backgroundColor}`
			);

			this.opened = false;

			this.dispatchEvent(new CustomEvent(
				'd2l-htmleditor-color-picker-dialog-close', {
					bubbles: true,
					detail: { color: result }
				}
			));

		}

	}

}
customElements.define('d2l-htmleditor-color-picker-dialog', ColorPickerDialog);
