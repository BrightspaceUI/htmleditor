import { findComposedAncestor } from '@brightspace-ui/core/helpers/dom.js';

export const ToolbarItemMixin = superclass => class extends superclass {

	static get properties() {
		return {
			focusable: { type: Boolean, reflect: true },
		};
	}

	constructor() {
		super();
		this.focusable = false;
	}

	_getEditor() {
		return this._getEditorComponent()._getEditor();
	}

	_getEditorComponent() {
		const component = findComposedAncestor(this, elem => {
			return elem.tagName === 'D2L-HTMLEDITOR';
		});
		return component;
	}

};
