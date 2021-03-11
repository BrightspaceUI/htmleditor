import { findComposedAncestor } from '@brightspace-ui/core/helpers/dom.js';
import { getFirstFocusableDescendant } from '@brightspace-ui/core/helpers/focus.js';

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

	focus() {
		const elem = getFirstFocusableDescendant(this, false);
		if (elem) elem.focus();
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
