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
			d2l-menu {
				max-width: 100%;
				min-width: 100%;
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
		const hasIcon = this.icon || this._hasSlottedIcon;
		return html`
			<d2l-dropdown>
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
				<d2l-dropdown-menu @d2l-htmleditor-menu-item-change="${this._handleMenuItemChange}">
					<d2l-menu label="${this.text}">
						<slot></slot>
					</d2l-menu>
				</d2l-dropdown-menu>
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
		this.shadowRoot.querySelector('d2l-dropdown-menu').close();
	}

}

customElements.define('d2l-htmleditor-button-menu', ButtonMenu);

class MenuItem extends MenuItemSelectableMixin(ToolbarItemMixin(LitElement)) {

	static get properties() {
		return {
			cmd: { type: String },
			icon: { type: String }
		};
	}

	static get styles() {
		return [ menuItemStyles, css`
			:host {
				--d2l-menu-border-color: transparent;
				--d2l-menu-border-color-hover: transparent;
				--d2l-menu-foreground-color-hover: var(--d2l-color-celestine);
				align-items: center;
				border-radius: 3px;
				display: flex;
				fill: var(--d2l-color-ferrite);
				margin: 0 4px;
				padding: 7px 12px;
				width: calc(100% - 8px);
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
			d2l-icon {
				flex: none;
				visibility: hidden;
			}
			:host(:focus),
			:host(:hover),
			:host(:focus) d2l-icon,
			:host(:hover) d2l-icon {
				fill: var(--d2l-color-celestine);
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
				margin: 0.2em 0;
			}
			svg,
			::slotted([slot="icon"]) {
				margin-right: 12px;
			}
			:host([dir="rtl"]) svg,
			:host([dir="rtl"]) ::slotted([slot="icon"]) {
				margin-left: 12px;
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
			<d2l-icon icon="tier1:check"></d2l-icon>
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

class MenuItemSeparator extends LitElement {

	static get styles() {
		return css`
			:host {
				border-top: 2px solid var(--d2l-color-gypsum);
				display: block;
				margin: 4px 0;
			}
		`;
	}

	firstUpdated() {
		super.firstUpdated();

		this.setAttribute('role', 'separator');
	}
}

customElements.define('d2l-htmleditor-menu-item-separator', MenuItemSeparator);
