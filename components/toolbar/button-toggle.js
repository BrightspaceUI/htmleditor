import '@brightspace-ui/core/components/colors/colors.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { buttonStyles } from './button-styles.js';
import { icons } from '../../generated/icons.js';
import { ToolbarItemMixin } from './toolbar-item-mixin.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

class ButtonToggle extends ToolbarItemMixin(LitElement) {

	static get properties() {
		return {
			cmd: { type: String },
			disabled: { type: Boolean },
			icon: { type: String },
			text: { type: String },
			_active: { type: Boolean }
		};
	}

	static get styles() {
		return [buttonStyles, css`
			button[aria-pressed="true"] .d2l-htmleditor-button-background {
				background-color: var(--d2l-color-celestine-plus-2);
			}
			button[aria-pressed="true"]:hover .d2l-htmleditor-button-background {
				background-color: #dbf5ff;
			}
			button[aria-pressed="true"] svg {
				fill: var(--d2l-color-celestine);
			}
		`];
	}

	constructor() {
		super();
		this._active = false;
	}

	async firstUpdated() {
		super.firstUpdated();
		if (!this.cmd) return;
		const editor = await this._getEditor();
		editor.on('NodeChange', () => {
			this._active = !!editor.queryCommandState(this.cmd);
		});
	}

	render() {
		return html`
			<button
				aria-label="${this.text}"
				aria-pressed="${this._active ? 'true' : 'false'}"
				@click="${this._handleClick}"
				?disabled="${this.disabled}"
				tabindex="${this.activeFocusable ? 0 : -1}"
				title="${this.text}">
				<div class="d2l-htmleditor-button-background"></div>
				${this.icon ? unsafeHTML(icons[this.icon]) : html`<slot></slot>`}
			</button>`;
	}

	focus() {
		const elem = this.shadowRoot.querySelector('button');
		if (elem) elem.focus();
	}

	async _handleClick() {
		if (!this.cmd) return;
		const editor = await this._getEditor();
		editor.execCommand(this.cmd);
		// make sure the cmd state if updated (ex. for fullscreen)
		this._active = !!editor.queryCommandState(this.cmd);
	}

}

customElements.define('d2l-htmleditor-button-toggle', ButtonToggle);
