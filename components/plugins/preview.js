import 'tinymce/tinymce.js';
import { css, LitElement } from 'lit-element/lit-element.js';
import { hasLmsContext, openDialogWithParam } from '../lms-adapter.js';
import { RequesterMixin, requestInstance } from '@brightspace-ui/core/mixins/provider-mixin.js';
import { getComposedActiveElement } from '@brightspace-ui/core/helpers/focus.js';

tinymce.PluginManager.add('d2l-preview', function(editor) {

	// bail if no LMS context
	if (!hasLmsContext()) return;

	const localize = requestInstance(editor.getElement(), 'localize');
	const orgUnitId = requestInstance(editor.getElement(), 'orgUnitId');

	const action = () => {
		const root = editor.getElement().getRootNode();

		let dialog = root.querySelector('d2l-htmleditor-preview-dialog');
		if (!dialog) dialog = root.appendChild(document.createElement('d2l-htmleditor-preview-dialog'));

		dialog.htmlInfo = {
			id: 'preview',
			html: root.host.html,
			htmlOrgUnitId: orgUnitId,
			files: root.host.files
		};
		dialog.opener = root.host;
		dialog.opened = true;

		dialog.addEventListener('d2l-htmleditor-preview-dialog-close', () => {
			root.host.focus();
		}, { once: true });
	};

	editor.addCommand('d2l-preview', action);

	editor.ui.registry.addButton('d2l-preview', {
		tooltip: localize('preview.tooltip'),
		icon: 'preview',
		onAction: action
	});

});

class PreviewDialog extends RequesterMixin(LitElement) {

	static get properties() {
		return {
			opened: { type: Boolean, reflect: true },
			opener: { type: Object },
			htmlInfo: { type: Object }
		};
	}

	static get styles() {
		return css`
			:host {
				display: block;
			}
			:host([hidden]) {
				display: none;
			}
		`;
	}

	constructor() {
		super();
		this.opened = false;
	}

	connectedCallback() {
		super.connectedCallback();
		this._fullPage = this.requestInstance('fullPage');
		this._noFilter = this.requestInstance('noFilter');
		this._orgUnitId = this.requestInstance('orgUnitId');
	}

	render() {
	}

	async updated(changedProperties) {
		super.updated(changedProperties);

		if (!changedProperties.has('opened')) return;

		if (this.opened) {

			await openDialogWithParam(
				getComposedActiveElement(),
				`/d2l/lp/htmleditor/${this._fullPage ? 'fullpagepreview' : 'inlinepreview'}?ou=${this._orgUnitId}`,
				{ editor: this.htmlInfo, filter: this._noFilter ? 0 : 1 },
				{ byPassOpenerFocus: true }
			);

			this.opened = false;

			this.dispatchEvent(new CustomEvent(
				'd2l-htmleditor-preview-dialog-close', {
					bubbles: true
				}
			));

		}

	}

}
customElements.define('d2l-htmleditor-preview-dialog', PreviewDialog);
