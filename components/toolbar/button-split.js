import './button-menu.js';
import './button-toggle.js';
import '@brightspace-ui/core/components/colors/colors.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { ToolbarItemMixin } from './toolbar-item-mixin.js';

class ButtonSplit extends ToolbarItemMixin(RtlMixin(LitElement)) {

	static get properties() {
		return {
			cmd: { type: String },
			icon: { type: String },
			text: { type: String }
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
			div {
				display: flex;
			}
			d2l-htmleditor-button-menu {
				--d2l-htmleditor-button-padding: 0;
				margin-top: 0;
			}
			div:hover d2l-htmleditor-button-toggle,
			div:focus-within d2l-htmleditor-button-toggle {
				--d2l-htmleditor-button-border-color: var(--d2l-color-gypsum) transparent var(--d2l-color-gypsum) var(--d2l-color-gypsum);
				--d2l-htmleditor-button-border-radius: 0.3rem 0 0 0.3rem;
			}
			div:hover d2l-htmleditor-button-menu,
			div:focus-within d2l-htmleditor-button-menu {
				--d2l-htmleditor-button-border-color: var(--d2l-color-gypsum) var(--d2l-color-gypsum) var(--d2l-color-gypsum) transparent;
				--d2l-htmleditor-button-border-radius: 0 0.3rem 0.3rem 0;
			}
			:host([dir="rtl"]) div:hover d2l-htmleditor-button-toggle,
			:host([dir="rtl"]) div:focus-within d2l-htmleditor-button-toggle {
				--d2l-htmleditor-button-border-color: var(--d2l-color-gypsum) var(--d2l-color-gypsum) var(--d2l-color-gypsum) transparent;
				--d2l-htmleditor-button-border-radius: 0 0.3rem 0.3rem 0;
			}
			:host([dir="rtl"]) div:hover d2l-htmleditor-button-menu,
			:host([dir="rtl"]) div:focus-within d2l-htmleditor-button-menu {
				--d2l-htmleditor-button-border-color: var(--d2l-color-gypsum) transparent var(--d2l-color-gypsum) var(--d2l-color-gypsum);
				--d2l-htmleditor-button-border-radius: 0.3rem 0 0 0.3rem;
			}
		`;
	}

	render() {
		return html`
			<div>
				<d2l-htmleditor-button-toggle
					cmd="${this.cmd}"
					icon="${this.icon}"
					text="${this.text}">
				</d2l-htmleditor-button-toggle>
				<d2l-htmleditor-button-menu
					@d2l-htmleditor-menu-item-select="${this._handleMenuItemSelect}"
					no-opener-content
					text="${this.text}">
					<slot></slot>
				</d2l-htmleditor-button-menu>
			</div>
		`;
	}

	_handleMenuItemSelect(e) {
		this.cmd = e.target.cmd;
		this.icon = e.target.icon;
		this.text = e.target.text;
	}

}

customElements.define('d2l-htmleditor-button-split', ButtonSplit);
