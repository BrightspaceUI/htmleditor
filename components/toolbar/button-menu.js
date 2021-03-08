import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/dropdown/dropdown.js';
import '@brightspace-ui/core/components/dropdown/dropdown-menu.js';
import '@brightspace-ui/core/components/icons/icon.js';
import '@brightspace-ui/core/components/menu/menu.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { buttonStyles } from './button-styles.js';
import { icons } from '../../generated/icons.js';
import { MenuItemSelectableMixin } from '@brightspace-ui/core/components/menu/menu-item-selectable-mixin.js';
import { menuItemStyles } from '@brightspace-ui/core/components/menu/menu-item-styles.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { ToolbarItemMixin } from './toolbar-item-mixin.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

class ButtonMenu extends ToolbarItemMixin(RtlMixin(LitElement)) {

	static get properties() {
		return {
			cmd: { type: String },
			icon: { type: String },
			noOpenerContent: { type: Boolean, attribute: 'no-opener-content' },
			text: { type: String },
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
				padding: var(--d2l-htmleditor-button-padding, 0 10px);
				text-align: start;
				width: 100%;

			}
			button > div {
				flex: auto;
				margin-right: 10px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			button > svg {
				flex: none;
			}
			:host([dir="rtl"]) button > div {
				margin-left: 10px;
				margin-right: 0;
			}
			d2l-dropdown {
				width: 100%;
			}
			d2l-menu {
				max-width: 100%;
				min-width: 100%;
			}
		`];
	}

	async firstUpdated() {
		super.firstUpdated();
		if (!this.cmd) return;

		const items = this.shadowRoot.querySelector('d2l-menu').querySelector('slot')
			.assignedNodes({ flatten: true })
			.filter(node => node.nodeType === Node.ELEMENT_NODE);

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
		return html`
			<d2l-dropdown>
				<button aria-label="${this.text}" class="d2l-dropdown-opener">
					${!this.noOpenerContent ? html`<div>
						${this.icon ? unsafeHTML(icons[this.icon]) : html`<slot name="icon">${this._valueText ? this._valueText : this.text}</slot>`}
					</div>` : null}
					<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
						<path d="M2.39 6.49a1.5 1.5 0 0 1 2.12-.1L9 10.47l4.49-4.08a1.5 1.5 0 0 1 2.02 2.22L10 13.62A1.474 1.474 0 0 1 9 14a1.523 1.523 0 0 1-1-.38L2.49 8.61a1.5 1.5 0 0 1-.1-2.12z"/>
					</svg>
				</button>
				<d2l-dropdown-menu>
					<d2l-menu label="${this.text}"
						@d2l-htmleditor-menu-item-change="${this._handleMenuItemChange}">
						<slot></slot>
					</d2l-menu>
				</d2l-dropdown-menu>
			</d2l-dropdown>
		`;
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
		this.shadowRoot.querySelector('d2l-dropdown-menu').close();
	}

}

customElements.define('d2l-htmleditor-button-menu', ButtonMenu);

class MenuItem extends MenuItemSelectableMixin(ToolbarItemMixin(RtlMixin(LitElement))) {

	static get properties() {
		return {
			cmd: { type: String },
			icon: { type: String }
		};
	}

	static get styles() {
		return [ menuItemStyles, css`
			:host {
				align-items: center;
				display: flex;
				fill: var(--d2l-color-ferrite);
				padding: 4px 10px;
			}
			:host([hidden]) {
				display: none;
			}
			div {
				flex: auto;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			svg {
				flex: none;
			}
			d2l-icon {
				flex: none;
				visibility: hidden;
			}
			:host(:focus),
			:host(:hover),
			:host(:focus) d2l-icon,
			:host(:hover) d2l-icon {
				fill: var(--d2l-color-celestine-minus-1);
			}
			:host([aria-checked="true"]) > d2l-icon {
				visibility: visible;
			}
			::slotted(p),
			::slotted(h1),
			::slotted(h2),
			::slotted(h3),
			::slotted(h4),
			::slotted(blockquote),
			::slotted(code) {
				margin: 0.3em 0;
			}
			svg,
			::slotted([slot="icon"]) {
				margin-right: 10px;
			}
			:host([dir="rtl"]) svg,
			:host([dir="rtl"]) ::slotted([slot="icon"]) {
				margin-left: 10px;
				margin-right: 0;
			}
		`];
	}

	constructor() {
		super();
		this.role = 'menuitemcheckbox';
	}

	async firstUpdated() {
		super.firstUpdated();
		this.addEventListener('d2l-menu-item-select', this._handleSelectCheckbox);

		if (!this.cmd) return;

		const setSelected = selected => {
			if (selected === this.selected) return;
			this.selected = selected;
			this.dispatchEvent(new CustomEvent('d2l-htmleditor-menu-item-change', { bubbles: true, composed: false }));
		};

		const editor = await this._getEditor();
		editor.on('NodeChange', () => {
			if (this.value) {
				const value = editor.queryCommandValue(this.cmd);
				setSelected(this.value === value);
			} else {
				const state = editor.queryCommandState(this.cmd);
				setSelected(state);
			}
		});
	}

	render() {
		return html`
			${this.icon ? unsafeHTML(icons[this.icon]) : html`<slot name="icon"></slot>`}
			<div><slot></slot></div>
			<d2l-icon icon="tier1:check-circle"></d2l-icon>
		`;
	}

	async _handleSelectCheckbox(e) {
		this.selected = !this.selected;
		if (this.cmd) {
			const editor = await this._getEditor();
			editor.execCommand(this.cmd, false, this.value);
		}
		if (this.selected) {
			this.dispatchEvent(new CustomEvent('d2l-htmleditor-menu-item-select', { bubbles: true, composed: false }));
		}
		this.dispatchEvent(new CustomEvent('d2l-htmleditor-menu-item-change', { bubbles: true, composed: false }));
		this.__onSelect(e);
	}

}

customElements.define('d2l-htmleditor-menu-item', MenuItem);
