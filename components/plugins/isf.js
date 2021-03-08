import 'tinymce/tinymce.js';
import { css, LitElement } from 'lit-element/lit-element.js';
import { hasLmsContext, openLegacyDialog } from '../lms-adapter.js';
import { RequesterMixin, requestInstance } from '@brightspace-ui/core/mixins/provider-mixin.js';
import { cmds } from '../commands.js';
import { getComposedActiveElement } from '@brightspace-ui/core/helpers/focus.js';

export const isfStyles = css`
	/* stylelint-disable-next-line selector-class-pattern */
	.disf_default, .disf_flash, .disf_shockwave, .disf_quicktime, .disf_windowsmedia, .disf_realmedia {
		background-color: #f9fafb;
		background-image: url(data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%3E%3Cg%20fill%3D%22none%22%3E%3Cg%20fill%3D%22%2372777A%22%3E%3Cpath%20d%3D%22M22%202C23.1%202%2024%202.9%2024%204L24%2022C24%2023.1%2023.1%2024%2022%2024L4%2024C2.9%2024%202%2023.1%202%2022L2%204C2%202.9%202.9%202%204%202L22%202%2022%202ZM22%200L4%200C1.8%200%200%201.8%200%204L0%2022C0%2024.2%201.8%2026%204%2026L22%2026C24.2%2026%2026%2024.2%2026%2022L26%204C26%201.8%2024.2%200%2022%200L22%200%2022%200Z%22%2F%3E%3Cpath%20d%3D%22M10%2021C9.4%2021%209%2020.6%209%2020L9%206C9%205.6%209.2%205.3%209.6%205.1%209.9%204.9%2010.3%205%2010.6%205.2L19.6%2012.2C19.9%2012.4%2020%2012.7%2020%2013%2020%2013.3%2019.9%2013.6%2019.6%2013.8L10.6%2020.8C10.4%2020.9%2010.2%2021%2010%2021L10%2021ZM11%208L11%2018%2017.4%2013%2011%208Z%22%2F%3E%3Cpath%20d%3D%22M30%208L30%2026C30%2028.2%2028.2%2030%2026%2030L8%2030C7.4%2030%207%2029.6%207%2029%207%2028.4%207.4%2028%208%2028L24%2028C26.2%2028%2028%2026.2%2028%2024L28%208C28%207.4%2028.4%207%2029%207%2029.6%207%2030%207.4%2030%208L30%208Z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E);
		background-position: center;
		background-repeat: no-repeat;
		border: 1px solid #d3d9e3;
		border-radius: 0.3rem;
		vertical-align: middle;
	}
	/* stylelint-disable-next-line selector-class-pattern */
	.disf_default:hover, .disf_flash:hover, .disf_shockwave:hover, .disf_quicktime:hover, .disf_windowsmedia:hover, .disf_realmedia:hover {
		background-color: #f2f8fc;
		background-image: url(data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%3E%3Cg%20fill%3D%22none%22%3E%3Cg%20fill%3D%22%231C5295%22%3E%3Cpath%20d%3D%22M22%202C23.1%202%2024%202.9%2024%204L24%2022C24%2023.1%2023.1%2024%2022%2024L4%2024C2.9%2024%202%2023.1%202%2022L2%204C2%202.9%202.9%202%204%202L22%202%2022%202ZM22%200L4%200C1.8%200%200%201.8%200%204L0%2022C0%2024.2%201.8%2026%204%2026L22%2026C24.2%2026%2026%2024.2%2026%2022L26%204C26%201.8%2024.2%200%2022%200L22%200%2022%200Z%22%2F%3E%3Cpath%20d%3D%22M10%2021C9.4%2021%209%2020.6%209%2020L9%206C9%205.6%209.2%205.3%209.6%205.1%209.9%204.9%2010.3%205%2010.6%205.2L19.6%2012.2C19.9%2012.4%2020%2012.7%2020%2013%2020%2013.3%2019.9%2013.6%2019.6%2013.8L10.6%2020.8C10.4%2020.9%2010.2%2021%2010%2021L10%2021ZM11%208L11%2018%2017.4%2013%2011%208Z%22%2F%3E%3Cpath%20d%3D%22M30%208L30%2026C30%2028.2%2028.2%2030%2026%2030L8%2030C7.4%2030%207%2029.6%207%2029%207%2028.4%207.4%2028%208%2028L24%2028C26.2%2028%2028%2026.2%2028%2024L28%208C28%207.4%2028.4%207%2029%207%2029.6%207%2030%207.4%2030%208L30%208Z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E);
		border: 1px solid #006fbf;
	}
`.cssText;

tinymce.PluginManager.add('d2l-isf', function(editor) {

	// bail if no LMS context
	if (!hasLmsContext()) return;

	const localize = requestInstance(editor.getElement(), 'localize');
	const wmodeOpaque = requestInstance(editor.getElement(), 'wmodeOpaque');

	const action = () => {
		const root = editor.getElement().getRootNode();

		let dialog = root.querySelector('d2l-htmleditor-isf-dialog');
		if (!dialog) dialog = root.appendChild(document.createElement('d2l-htmleditor-isf-dialog'));

		dialog.opened = true;
		dialog.addEventListener('d2l-htmleditor-isf-dialog-close', (e) => {
			const html = e.detail.html;
			if (html) editor.execCommand('mceInsertContent', false, html);
			root.host.focus();
		}, { once: true });
	};

	editor.addCommand(cmds.isf, action);

	editor.ui.registry.addButton('d2l-isf', {
		tooltip: localize('insertstuff.tooltip'),
		icon: 'insert-stuff',
		onAction: action
	});

	const regExp = {
		HrefString: '_mce_href=\"[^\"]*\"', // eslint-disable-line no-useless-escape
		SrcString: '_mce_src=\"[^\"]*\"', // eslint-disable-line no-useless-escape
		OpenScript: '<mce:script',
		CloseScript: '</mce:script>'
	};

	function StringBuilder(initialValue) {
		this.myString = initialValue || '';
	}

	StringBuilder.prototype.Append = function(value) {
		this.myString += value;
	};

	StringBuilder.prototype.ToString = function() {
		return this.myString;
	};

	const getImageClassName = (classId) => {
		if (classId !== null) {
			classId = classId.toLowerCase();
			const guidIndex = classId.indexOf(':');
			if (guidIndex !== -1 && (classId.length > guidIndex + 1)) {
				classId = classId.substring(guidIndex + 1);
			}
		} else {
			classId = '';
		}

		switch (classId) {
			case 'd27cdb6e-ae6d-11cf-96b8-444553540000':
			case 'application/x-shockwave-flash':
			case 'd2l_flash':
				return 'disf_flash';
			case '166b1bca-3f9c-11cf-8075-444553540000':
				return 'disf_shockwave';
			case '6bf52a52-394a-11d3-b153-00c04f79faa6':
			case '22d6f312-b0f6-11d0-94ab-0080c74c7e95':
			case '05589fa1-c356-11ce-bf01-00aa0055595a':
				return 'disf_windowsmedia';
			case '02bf25d5-8c17-4b23-bc80-d3488abddc6b':
			case 'd2l_qt':
				return 'disf_quicktime';
			case 'cfcdaa03-8be4-11cf-b84b-0020afbbccfa':
				return 'disf_realmedia';
			default:
				return 'disf_default';
		}
	};

	const getAttributeValue = (attributeName, html) => {
		let attValue = null;
		const attRe = new RegExp(`${attributeName}=(\"[^<>"]*\"|\'[^<>\']*\'|\w+)`, 'i'); // eslint-disable-line no-useless-escape
		const attMatch = attRe.exec(html);
		if (attMatch !== null && attMatch.length > 1) {
			if (attMatch[1].length > 1 &&
				(attMatch[1].substr(0, 1) === '\'' || attMatch[1].substr(0, 1) === '\"')) { // eslint-disable-line no-useless-escape
				attValue = attMatch[1].substring(1, attMatch[1].length - 1);
			} else {
				attValue = attMatch[1];
			}
		}
		return attValue;
	};

	const createElement = (html, height, width) => {
		if (width === null) width = '100px';
		if (height === null) height = '100px';

		html = decodeURIComponent(html);

		// remove plugin_href if necessary (clean-up any possible left-over Plugin stuff)
		html = html.replace(new RegExp(regExp.HrefString, 'g'), '');

		html = html.replace(new RegExp(regExp.SrcString, 'g'), '');

		html = html.replace(new RegExp('width=[\"\']{1}[0-9px]+[\'\"]', 'gi'), `width="${width}"`); // eslint-disable-line no-useless-escape
		html = html.replace(new RegExp('height=[\"\']{1}[0-9px]+[\'\"]', 'gi'), `height="${height}"`); // eslint-disable-line no-useless-escape

		html = html.replace(new RegExp('width=[0-9px]+', 'gi'), `width=${width}`);
		html = html.replace(new RegExp('height=[0-9px]+', 'gi'), `height=${height}`);

		return html;
	};

	const createImage = (html) => {

		let width = getAttributeValue('width', html);
		if (width === null) width = '150px';

		let height = getAttributeValue('height', html);
		if (height === null) height = '150px';

		let classId = getAttributeValue('classid', html);
		if (classId === null) classId = getAttributeValue('type', html);

		const altLabel = tinymce.EditorManager.i18n.translate('Insert stuff placeholder');

		// create an image with the encoded content
		return `<img alt="${altLabel}" width="${width}" height="${height}" class="${getImageClassName(classId)}" data-isf-content="${encodeURIComponent(html)}" src="data:image/gif;base64,R0lGODlhFAAUAIAAAP///////yH+EUNyZWF0ZWQgd2l0aCBHSU1QACH5BAEKAAEALAAAAAAUABQAAAIRjI+py+0Po5y02ouz3rz7rxUAOw==" />`;
	};

	const setDefaultImageStyle = (context) => {
		if (context.content === null || context.content.length <= 0) return;

		const node = new DOMParser().parseFromString(context.content, 'text/html');
		if (!node || !node.body || !node.body.firstElementChild) return;

		const img = node.body.firstElementChild;
		if (!img || img.nodeName.toUpperCase() !== 'IMG'
			|| img.hasAttribute('width') || img.hasAttribute('height')
			|| img.style.width || img.style.height) return;

		img.style.maxWidth = '100%';
		img.setAttribute('data-d2l-editor-default-img-style', 'true');

		context.content = img.outerHTML;
	};

	const convertToImages = (context) => {
		if (context.content && context.content.length > 0 &&
			(context.content.search(/(<object|<embed|<iframe)/i) !== -1)) {

			let html = context.content;
			const sb = new StringBuilder();
			const embedStartRe = new RegExp('(<embed)', 'i');
			const objectStartRe = new RegExp('(<object)', 'i');
			const iFrameStartRe = new RegExp('(<iframe)', 'i');
			const scriptStartRe = new RegExp(`(<script|${regExp.OpenScript})`, 'i');
			const searchRe = new RegExp(`(<object|<embed|<iframe|<script|${regExp.OpenScript})`, 'i');

			let toIndex = 0;
			while (html.length > 0) {

				toIndex = html.search(searchRe);
				if (toIndex === 0) {
					embedStartRe.lastIndex = 0;
					scriptStartRe.lastIndex = 0;
					objectStartRe.lastIndex = 0;
					iFrameStartRe.lastIndex = 0;

					searchRe.lastIndex = toIndex;
					const match = searchRe.exec(html)[0];
					if (scriptStartRe.test(match)) {

						// skip script
						let scriptEndIndex = html.indexOf('>', toIndex);
						if (html.substr(scriptEndIndex - 1, 1) === '/') {
							toIndex = scriptEndIndex + 1;
						} else {
							const scriptEndRe = new RegExp(`(<\\/script>|${regExp.CloseScript})`, 'i');
							scriptEndIndex = html.search(scriptEndRe);
							if (scriptEndIndex !== -1) {
								toIndex = html.indexOf('>', scriptEndIndex) + 1;
							} else {
								toIndex = html.indexOf('>', toIndex) + 1;
							}
						}

						// append the script
						sb.Append(html.substring(0, toIndex));
						html = html.substring(toIndex);

					} else if (objectStartRe.test(match)) {

						let isValidObject = true;
						const objectHtml = html.substring(0).toLowerCase();
						let objectCount = 1;
						let objectFromIndex = 7;
						let objectStartIndex = 0;
						let objectEndIndex = 0;

						while (objectCount > 0) {
							objectStartIndex = objectHtml.indexOf('<object', objectFromIndex);
							objectEndIndex = objectHtml.indexOf('</object>', objectFromIndex);
							if (objectStartIndex !== -1 && objectStartIndex < objectEndIndex) {
								objectCount += 1;
								objectFromIndex = objectStartIndex + 7;
							} else {
								if (objectEndIndex !== -1) {
									objectCount -= 1;
									objectFromIndex = objectEndIndex + 9;
								}
							}

							// protected against bad user mark-up
							if (objectEndIndex === -1) {
								isValidObject = false;
								break;
							}
						}

						if (isValidObject) {
							sb.Append(createImage(html.substring(0, objectFromIndex)));
							html = html.substring(objectFromIndex);
						} else {
							sb.Append(html);
							html = '';
						}

					} else if (embedStartRe.test(match)) {

						let embedEndIndex = html.indexOf('>');
						if (html.substr(embedEndIndex - 1, 1) === '/') {
							embedEndIndex = embedEndIndex + 1;
						} else {
							const embedEndRe = new RegExp('</embed>', 'i');
							embedEndIndex = html.search(embedEndRe);
							if (embedEndIndex !== -1) {
								embedEndIndex = embedEndIndex + 8;
							} else {
								embedEndIndex = html.indexOf('>') + 1;
							}
						}

						sb.Append(createImage(html.substring(0, embedEndIndex)));
						html = html.substring(embedEndIndex);

					} else if (iFrameStartRe.test(match)) {

						const iFrameEndIndex = html.indexOf('>');
						let iFrameHtml = html.substring(0, iFrameEndIndex + 1);

						const iFrameSrcRe = new RegExp('src=(\'|")[^>]*youtube[^\'">]*(\'|")', 'i');

						iFrameHtml = iFrameHtml.replace(iFrameSrcRe, function(srcHtml) {

							if (wmodeOpaque) {
								if (srcHtml.indexOf('wmode') === -1) {
									if (srcHtml.indexOf('?') === -1) {
										return `${srcHtml.substring(0, srcHtml.length - 1)}?wmode=opaque${srcHtml.substring(srcHtml.length - 1)}`;
									} else {
										return `${srcHtml.substring(0, srcHtml.length - 1)}&amp;wmode=opaque${srcHtml.substring(srcHtml.length - 1)}`;
									}
								} else {
									return srcHtml.replace(/wmode=([^&#\'\"]*)/, 'wmode=opaque'); // eslint-disable-line no-useless-escape
								}
							} else {
								if (srcHtml.indexOf('wmode') !== -1) {
									return srcHtml = srcHtml.replace(/wmode=([^&#\'\"]*)/, 'wmode='); // eslint-disable-line no-useless-escape
								} else {
									return srcHtml;
								}
							}

						});

						sb.Append(iFrameHtml);

						html = html.substring(iFrameEndIndex + 1);

					}

				} else {
					if (toIndex === -1) {
						sb.Append(html);
						break;
					} else {
						sb.Append(html.substring(0, toIndex));
						html = html.substring(toIndex);
					}
				}

			}

			context.content = sb.ToString();
		}
		setDefaultImageStyle(context);
	};

	const convertToElements = (context) => {
		if (context.content && context.content.length > 0 &&
			(context.content.search(/data-isf-content/i) !== -1)) {

			let html = context.content;
			const sb = new StringBuilder();

			let toIndex = 0;
			const imgStartRe = new RegExp('(<img)', 'i');

			while (html.length > 0) {

				imgStartRe.lastIndex = 0;
				toIndex = html.search(imgStartRe);
				if (toIndex === 0) {

					let imgEndIndex = html.indexOf('>');
					if (html.substr(imgEndIndex - 1, 1) === '/') {
						imgEndIndex = imgEndIndex + 1;
					} else {
						const imgEndRe = new RegExp('</img>', 'i');
						imgEndIndex = html.search(imgEndRe);
						if (imgEndIndex !== -1) {
							imgEndIndex = imgEndIndex + 6;
						} else {
							imgEndIndex = html.indexOf('>') + 1;
						}
					}

					const imgHtml = html.substring(0, imgEndIndex);
					if (imgHtml.indexOf('data-isf-content') !== -1) {
						sb.Append(createElement(
							getAttributeValue('data-isf-content', imgHtml),
							getAttributeValue('height', imgHtml),
							getAttributeValue('width', imgHtml)
						));
					} else {
						sb.Append(imgHtml);
					}
					html = html.substring(imgEndIndex);

				} else {
					if (toIndex === -1) {
						sb.Append(html);
						break;
					} else {
						sb.Append(html.substring(0, toIndex));
						html = html.substring(toIndex);
					}
				}
			}
			context.content = sb.ToString();
		}
	};

	editor.on('BeforeSetContent', (e) => {
		convertToImages(e);
	});

	editor.on('PostProcess', (e) => {
		if (e.get) convertToElements(e);
	});

});

class IsfDialog extends RequesterMixin(LitElement) {

	static get properties() {
		return {
			opened: { type: Boolean, reflect: true }
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
		this._orgUnitId = this.requestInstance('orgUnitId');
		this._isfContextId = this.requestInstance('isfContextId');
		this._noFilter = this.requestInstance('noFilter');
	}

	render() {
	}

	async updated(changedProperties) {
		super.updated(changedProperties);

		if (!changedProperties.has('opened')) return;

		if (this.opened) {

			const result = await openLegacyDialog(
				getComposedActiveElement(),
				`/d2l/common/dialogs/isf/selectItem.d2l?ou=${this._orgUnitId}&extensionPoint=${this._isfContextId ? this._isfContextId : ''}&filterMode=${this._noFilter ? 'None' : 'Strict'}`,
				{
					srcCallback: 'GetSelectedItem',
					responseDataKey: 'itemSource',
					width: 975,
					height: 650,
					buttons: [{ IsEnabled: true, IsPrimary: true, Key: 'BTN_next', ResponseType: 1, Param: 'next', Text: 'Insert' }],
					byPassOpenerFocus: true
				}
			);

			this.opened = false;

			this.dispatchEvent(new CustomEvent(
				'd2l-htmleditor-isf-dialog-close', {
					bubbles: true,
					detail: { html: result }
				}
			));

		}

	}

}
customElements.define('d2l-htmleditor-isf-dialog', IsfDialog);
