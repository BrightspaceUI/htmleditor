import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/icons/icon.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { icons } from '../../generated/icons.js';
import { MenuItemSelectableMixin } from '@brightspace-ui/core/components/menu/menu-item-selectable-mixin.js';
import { menuItemStyles } from '@brightspace-ui/core/components/menu/menu-item-styles.js';
import { ToolbarItemMixin } from './toolbar-item-mixin.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

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
			<div><slot name="text">${this.text}</slot></div>
			<d2l-icon icon="tier1:check"></d2l-icon>
			<slot></slot>
		`;
	}

	async _handleSelectCheckbox(e) {
		if (!this.cmd) return;

		// ignore if target is not this item (nested menu case)
		if (e.target !== this) return;

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
