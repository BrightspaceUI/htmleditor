import 'tinymce/tinymce.js';
import { css, LitElement } from 'lit-element/lit-element.js';
import { RequesterMixin, requestInstance } from '@brightspace-ui/core/mixins/provider-mixin.js';
import { getComposedActiveElement } from '@brightspace-ui/core/helpers/focus.js';
import { hasLmsContext } from './lms-adapter.js';

tinymce.PluginManager.add('d2l-quicklink', function(editor) {

	// bail if no LMS context
	if (!hasLmsContext()) return;

	const localize = requestInstance(editor.getElement(), 'localize');

	editor.ui.registry.addButton('d2l-quicklink', {
		tooltip: localize('quicklink.tooltip'),
		icon: 'link',
		onAction: () => {
			const root = editor.getElement().getRootNode();

			let dialog = root.querySelector('d2l-htmleditor-quicklink-dialog');
			if (!dialog) dialog = root.appendChild(document.createElement('d2l-htmleditor-quicklink-dialog'));

			const contextNode = (editor.selection ? editor.selection.getNode() : null);

			if (contextNode && contextNode.tagName === 'A') {
				dialog.quicklink = {
					href: contextNode.getAttribute('href'),
					target: contextNode.getAttribute('target'),
					text: contextNode.innerText
				};
			} else {
				dialog.text = tinymce.DOM.decode(editor.selection.getContent());
			}

			dialog.opened = true;
			dialog.addEventListener('d2l-htmleditor-quicklink-dialog-close', (e) => {

				const quicklinks = e.detail.quicklinks;
				if (!quicklinks || quicklinks.length === 0) return;

				const html = quicklinks.reduce((acc, cur) => {
					return acc += cur.html;
				}, '');

				if (html) {
					if (contextNode && contextNode.tagName === 'A') {
						// expand selection if necessary to replace current link
						editor.selection.select(contextNode);
					}
					editor.execCommand('mceInsertContent', false, html);
				}

				root.host.focus();

			}, { once: true });

		}
	});

});

class QuicklinkDialog extends RequesterMixin(LitElement) {

	static get properties() {
		return {
			opened: { type: Boolean, reflect: true },
			quicklink: { type: Object },
			text: { type: String }
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
		this.text = '';
	}

	connectedCallback() {
		super.connectedCallback();
		this._orgUnitId = this.requestInstance('orgUnitId');
	}

	render() {
	}

	async updated(changedProperties) {
		super.updated(changedProperties);

		if (!changedProperties.has('opened')) return;

		if (this.opened) {

			let resultPromise;

			if (window.ifrauclient) {

				const ifrauClient = await window.ifrauclient().connect();
				const quicklinksService = await ifrauClient.getService('quicklinks', '0.1');

				resultPromise = quicklinksService.create({
					canChangeType: true,
					outputFormat: 'html',
					selectedText: this.text,
					showCancelButton: true,
					urlShowTarget: true,
					urlShowCancelButtonInline: false
				}, this.quicklink ? {
					href: this.quicklink.href,
					text: this.quicklink.text,
					target: this.quicklink.target,
					outputFormat: 'html'
				} : undefined);

			} else {

				resultPromise = new Promise(resolve => {

					let selectUrl = new D2L.LP.Web.Http.UrlLocation(`/d2l/lp/quicklinks/manage/${this._orgUnitId}/createdialog
						?typeKey=
						&initialViewType=Default
						&outputFormat=html
						&selectedText=${this.text}
						&parentModuleId=0
						&canChangeType=true
						&showCancelButton=true
						&urlShowTarget=true
						&urlShowCancelButtonInline=false
						&contextId=
					`);

					if (this.quicklink) selectUrl = selectUrl.WithQueryString(
						'itemData',
						new D2L.LP.QuickLinks.Web.Desktop.Controls.QuickLinkSelector.ItemData(
							'',
							null,
							this.quicklink.href,
							this.quicklink.text,
							[{ name: 'target', value: (this.quicklink.target === '_top' ? 'WholeWindow' : (this.quicklink.target === '_blank' ? 'NewWindow' : 'SameFrame')) }],
							'html'
						)
					);

					const selectResult = D2L.LP.Web.UI.Desktop.MasterPages.Dialog.Open(
						getComposedActiveElement(),
						selectUrl,
						{ byPassOpenerFocus: true }
					);

					selectResult.AddReleaseListener(resolve);
					selectResult.AddListener(quicklinks => {

						if (!quicklinks || quicklinks.length === 0) {
							resolve();
							return;
						}

						const createResult = D2L.LP.Web.UI.Rpc.ConnectObject(
							'POST',
							new D2L.LP.Web.Http.UrlLocation(`/d2l/lp/quicklinks/manage/${this._orgUnitId}/createmultiple`),
							{ 'items': quicklinks }
						);

						createResult.AddReleaseListener(resolve);
						createResult.AddListener(quicklinks => resolve(quicklinks));

					});

				});

			}

			const result = await resultPromise;

			this.opened = false;

			this.dispatchEvent(new CustomEvent(
				'd2l-htmleditor-quicklink-dialog-close', {
					bubbles: true,
					detail: { quicklinks: result }
				}
			));

		}

	}

}
customElements.define('d2l-htmleditor-quicklink-dialog', QuicklinkDialog);
