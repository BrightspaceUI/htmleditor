import '@brightspace-ui/core/components/colors/colors.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';

class Separator extends LitElement {

	static get styles() {
		return css`
			:host {
				display: inline-block;
				padding: 0 6px;
			}
			:host([hidden]) {
				display: none;
			}
			div {
				border-left: 1px solid var(--d2l-color-gypsum);
				box-sizing: border-box;
				height: 22px;
			}
		`;
	}

	render() {
		return html`<div></div>`;
	}

}

customElements.define('d2l-htmleditor-separator', Separator);
