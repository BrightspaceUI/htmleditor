import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import '@brightspace-ui/core/components/inputs/input-text.js';
import 'tinymce/tinymce.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { RequesterMixin, requestInstance } from '@brightspace-ui/core/mixins/provider-mixin.js';
import { inputLabelStyles } from '@brightspace-ui/core/components/inputs/input-label-styles.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles.js';

const directionOptions = {
	Default: '',
	LTR: 'ltr',
	RTL: 'rtl'
};

tinymce.PluginManager.add('d2l-attributes', function(editor) {

	const localize = requestInstance(editor.getElement(), 'localize');
	const root = editor.getElement().getRootNode();

	const canAddAttributes = (node) => {
		if (!node) return false;

		return node.nodeName !== 'BODY'
			&& node.nodeName !== 'BR'
			&& node.nodeType !== Node.DOCUMENT_NODE
			&& node.getAttribute !== undefined;
	};

	const openAttributesDialog = () => {
		let dialog = root.querySelector('d2l-htmleditor-attributes-dialog');
		if (!dialog) dialog = root.appendChild(document.createElement('d2l-htmleditor-attributes-dialog'));

		dialog.opened = true;

		const currentNode = editor.selection && editor.selection.getNode();

		if (canAddAttributes(currentNode)) {
			dialog.attributes = {
				title: currentNode.getAttribute('title') || '',
				id: currentNode.getAttribute('id') || '',
				className: currentNode.className || '',
				style: currentNode.style || '',
				textDirection: currentNode.getAttribute('dir') || ''
			};
		}

		dialog.addEventListener('d2l-dialog-close', (e) => {
			dialog.opened = false;
			dialog.attributes = {};

			if (e.detail.action === 'create' && currentNode) {
				const setAttr = (name, val) => {
					if (val === '') currentNode.removeAttribute(name);
					else currentNode.setAttribute(name, val);
				};

				currentNode.className = dialog.shadowRoot.querySelector('#d2l-attributes-class').value;

				setAttr('title', dialog.shadowRoot.querySelector('#d2l-attributes-title').value);
				setAttr('id', dialog.shadowRoot.querySelector('#d2l-attributes-id').value);
				setAttr('style', dialog.shadowRoot.querySelector('#d2l-attributes-style').value);
				setAttr('dir', dialog.shadowRoot.querySelector('#d2l-attributes-direction-select').value);
			}

			root.host.focus();
		}, { once: true });
	};

	editor.addCommand('attributes', openAttributesDialog);

	editor.ui.registry.addMenuItem('d2l-attributes', {
		text: localize('attributes'),
		icon: 'insert-attributes',
		onAction: openAttributesDialog,
		onSetup: api => {
			if (editor.selection) {
				const node = editor.selection && editor.selection.getNode();
				api.setDisabled(!canAddAttributes(node));
			} else {
				api.setDisabled(true);
			}
		}
	});

	editor.ui.registry.addButton('d2l-attributes', {
		tooltip: localize('attributes'),
		icon: 'insert-attributes',
		onAction: openAttributesDialog,
		onSetup: api => {
			if (editor.selection) {
				const node = editor.selection && editor.selection.getNode();
				api.setDisabled(!canAddAttributes(node));
			} else {
				api.setDisabled(true);
			}
		}
	});

});

class AttributesDialog extends RequesterMixin(RtlMixin(LitElement)) {

	static get properties() {
		return {
			attributes: { type: Object },
			opened: { type: Boolean, reflect: true }
		};
	}

	static get styles() {
		return [ inputLabelStyles, selectStyles, css`
			:host {
				display: block;
			}
			:host([hidden]) {
				display: none;
			}
			.d2l-attributes-text-input-container {
				margin-bottom: 30px;
			}
		`];
	}

	constructor() {
		super();
		this.attributes = {};
		this.opened = false;
	}

	connectedCallback() {
		super.connectedCallback();
		this._localize = this.requestInstance('localize');
	}

	render() {
		return html`
			<d2l-dialog width="500" title-text="${this._localize('attributes')}" ?opened="${this.opened}">
				<div>
					<div class="d2l-attributes-text-input-container">
						<d2l-input-text
							id="d2l-attributes-title"
							label="${this._localize('attributes.title')}"
							size="50" type="text">
						</d2l-input-text>
					</div>				
					<div class="d2l-attributes-text-input-container">
						<d2l-input-text
							id="d2l-attributes-id"
							label="${this._localize('attributes.id')}"
							size="50"
							type="text">
						</d2l-input-text>
					</div>					
					<div class="d2l-attributes-text-input-container">
						<d2l-input-text
							id="d2l-attributes-class"
							label="${this._localize('attributes.class')}"
							size="50" type="text">
						</d2l-input-text>
					</div>
					<div class="d2l-attributes-text-input-container">
						<d2l-input-text
							id="d2l-attributes-style"
							label="${this._localize('attributes.style')}"
							size="50"
							type="text">
						</d2l-input-text>
					</div>
					<label class="d2l-input-label d2l-skeletize" for="d2l-attributes-direction-select">${this._localize('attributes.direction.label')}</label>
					<select id="d2l-attributes-direction-select" class="d2l-input-select">
						<option ?selected="${this._getDefaultDirection('')}" value="${directionOptions.Default}">${this._localize('attributes.direction.default')}</option>
						<option ?selected="${this._getDefaultDirection(directionOptions.LTR)}" value="${directionOptions.LTR}">${this._localize('direction.ltr')}</option>
						<option ?selected="${this._getDefaultDirection(directionOptions.RTL)}" value="${directionOptions.RTL}">${this._localize('direction.rtl')}</option>
					</select>
				</div>
				<d2l-button slot="footer" primary data-dialog-action="create">${this._localize('attributes.create')}</d2l-button>
				<d2l-button slot="footer" data-dialog-action>${this._localize('attributes.cancel')}</d2l-button>
			</d2l-dialog>`;
	}

	_getDefaultDirection(direction) {
		if (!this.attributes.textDirection) return direction === '';
		return this.attributes.textDirection === direction;
	}
}

customElements.define('d2l-htmleditor-attributes-dialog', AttributesDialog);
