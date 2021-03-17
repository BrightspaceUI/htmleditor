import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/dropdown/dropdown.js';
import '@brightspace-ui/core/components/icons/icon.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { buttonStyles } from './button-styles.js';
import { icons } from '../../generated/icons.js';
import { ToolbarItemMixin } from './toolbar-item-mixin.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

class ButtonMenu extends ToolbarItemMixin(LitElement) {

	static get properties() {
		return {
			cmd: { type: String },
			icon: { type: String },
			noOpenerContent: { type: Boolean, attribute: 'no-opener-content' },
			text: { type: String },
			_hasSlottedIcon: { type: Boolean },
			_value: { type: String },
			_valueText: { type: String }
		};
	}

	static get styles() {
		return [buttonStyles, css`
			:host {
				font-size: 1rem;
				margin-top: -1px;
			}
			button {
				align-items: center;
				display: flex;
				justify-content: center;
				overflow: hidden;
				padding: 0 8px 0 10px;
				text-align: start;
				width: 100%;
			}
			:host([dir="rtl"]) button {
				padding: 0 10px 0 8px;
			}
			button > div {
				flex: auto;
				margin-right: 5px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			:host([dir="rtl"]) button > div {
				margin-left: 5px;
				margin-right: 0;
			}
			button > d2l-icon {
				fill: var(--d2l-color-galena);
				flex: none;
			}
			button[aria-expanded="true"] .d2l-htmleditor-button-background {
				background-color: var(--d2l-color-celestine-plus-2);
			}
			button[aria-expanded="true"]:hover .d2l-htmleditor-button-background {
				background-color: #dbf5ff;
			}
			button[aria-expanded="true"] d2l-icon,
			button[aria-expanded="true"] svg {
				fill: var(--d2l-color-celestine);
			}
			.d2l-htmleditor-button-menu-icon-container {
				line-height: 0;
			}
			d2l-dropdown {
				width: 100%;
			}
		`];
	}

	constructor() {
		super();
		this.noOpenerContent = false;
		this._hasSlottedIcon = false;
	}

	async firstUpdated() {
		super.firstUpdated();
		if (!this.cmd) return;

		const content = this.shadowRoot.querySelector('#content').assignedNodes()
			.filter(node => node.nodeType === Node.ELEMENT_NODE && node.tagName === 'D2L-DROPDOWN-MENU');
		if (!content || content.length === 0) return;

		const items = [...content[0].querySelectorAll('d2l-htmleditor-menu-item')];

		const editor = await this._getEditor();
		editor.on('NodeChange', () => {
			const value = editor.queryCommandValue(this.cmd);
			if (value === this._value) return;

			this._value = value;
			let hasSelected = false;

			items.forEach(item => {
				item.selected = (item.value === this._value);
				if (item.selected) {
					hasSelected = true;
					this._valueText = item.textContent;
				}
			});

			if (!hasSelected) {
				this._valueText = this._value;
			}
		});

	}

	render() {
		const hasIcon = this.icon || this._hasSlottedIcon;
		return html`
			<d2l-dropdown @d2l-htmleditor-menu-item-change="${this._handleMenuItemChange}">
				<button
					aria-label="${this.text}"
					class="d2l-dropdown-opener"
					tabindex="${this.activeFocusable ? 0 : -1}"
					title="${this.text}">
					<div class="d2l-htmleditor-button-background"></div>
					${!this.noOpenerContent ? html`<div class="${hasIcon ? 'd2l-htmleditor-button-menu-icon-container' : ''}">
						${this.icon ? unsafeHTML(icons[this.icon]) : html`<slot @slotchange="${this._handleIconSlotChange}" name="icon">${this._valueText ? this._valueText : this.text}</slot>`}
					</div>` : null}
					<d2l-icon icon="tier1:chevron-down-thin"></d2l-icon>
				</button>
				<slot id="content"></slot>
			</d2l-dropdown>
		`;
	}

	focus() {
		const elem = this.shadowRoot.querySelector('button');
		if (elem) elem.focus();
	}

	_handleIconSlotChange(e) {
		// safari dispatches slotchange initially even when empty
		this._hasSlottedIcon = (e.target.assignedNodes().length > 0);
	}

	async _handleMenuItemChange(e) {
		const item = e.target;
		if (this.cmd) {
			const editor = await this._getEditor();
			editor.execCommand(this.cmd, false, item.value);
		} else {
			if (item.value !== 'code' && item.selected) {
				this._valueText = item.textContent;
			}
		}

		const content = this.shadowRoot.querySelector('#content').assignedNodes()
			.filter(node => node.hasAttribute && node.hasAttribute('dropdown-content'))[0];
		content.close();
	}

}

customElements.define('d2l-htmleditor-button-menu', ButtonMenu);
