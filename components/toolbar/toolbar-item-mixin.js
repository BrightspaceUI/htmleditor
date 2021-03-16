import { findComposedAncestor } from '@brightspace-ui/core/helpers/dom.js';

export const ToolbarItemMixin = superclass => class extends superclass {

	static get properties() {
		return {
			/**
			 * Indicates whether the element is the active focusable (has the roving tabindex).
			 */
			activeFocusable: { type: Boolean, reflect: true, attribute: 'active-focusable' },
		};
	}

	constructor() {
		super();
		this.activeFocusable = false;
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