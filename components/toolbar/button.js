import '@brightspace-ui/core/components/colors/colors.js';
import { html, LitElement } from 'lit-element/lit-element.js';
import { buttonStyles } from './button-styles.js';
import { icons } from '../../generated/icons.js';
import { ToolbarItemMixin } from './toolbar-item-mixin.js';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

class Button extends ToolbarItemMixin(LitElement) {

	static get properties() {
		return {
			cmd: { type: String },
			disabled: { type: Boolean },
			icon: { type: String },
			text: { type: String }
		};
	}

	static get styles() {
		return buttonStyles;
	}

	async firstUpdated() {
		super.firstUpdated();
		if (!this.cmd) return;
		if (this.cmd !== 'undo' && this.cmd !== 'redo') return;
		const editor = await this._getEditor();
		editor.on('NodeChange', () => {
			if (this.cmd === 'undo') this.disabled = !editor.undoManager.hasUndo();
			else if (this.cmd === 'redo') this.disabled = !editor.undoManager.hasRedo();
		});
	}

	render() {
		return html`
			<button
				aria-label="${this.text}"
				@click="${this._handleClick}"
				?disabled="${this.disabled}"
				tabindex="${this.focusable ? 0 : -1}"
				title="${this.text}">
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
	}

}

customElements.define('d2l-htmleditor-button', Button);
