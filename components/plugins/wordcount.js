import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/colors/colors.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import '@brightspace-ui/core/components/dropdown/dropdown-button-subtle.js';
import '@brightspace-ui/core/components/dropdown/dropdown-menu.js';
import '@brightspace-ui/core/components/menu/menu.js';
import 'tinymce/tinymce.js';
import { countAll, countCharacters, countWords } from '../../wordcount/wordcount.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { RequesterMixin, requestInstance } from '@brightspace-ui/core/mixins/provider-mixin.js';
import { formatNumber } from '@brightspace-ui/intl/lib/number.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles.js';

const footerCountType = {
	CHAR: 'char',
	NOTHING: 'nothing',
	WORD: 'word',
};

tinymce.PluginManager.add('d2l-wordcount', function(editor) {

	const wordCountInFooter = requestInstance(editor.getElement(), 'wordCountInFooter');
	const localize = requestInstance(editor.getElement(), 'localize');

	const root = editor.getElement().getRootNode();

	const countButton = document.createElement('button');
	countButton.id = 'd2l-wordcount-footer-button';
	countButton.setAttribute('data-d2l-count-option', footerCountType.WORD);

	const getButtonCount = (countType, text) => {
		switch (countType) {
			case footerCountType.CHAR:
				return countCharacters(text);
			case footerCountType.WORD:
			default:
				return countWords(text);
		}
	};

	const getButtonLangTerm = (countType, isSelection) => {
		switch (countType) {
			case footerCountType.CHAR:
				return isSelection ? 'wordcount.footer.selectioncharactercount' : 'wordcount.footer.charactercount';
			case footerCountType.WORD:
			default:
				return isSelection ? 'wordcount.footer.selectionwordcount' : 'wordcount.footer.wordcount';
		}
	};

	const openWordCountDialog = () => {
		let dialog = root.querySelector('d2l-htmleditor-wordcount-dialog');
		if (!dialog) dialog = root.appendChild(document.createElement('d2l-htmleditor-wordcount-dialog'));

		const text = editor.getContent({ source_view: true, format: 'text' });
		const counts = countAll(text);
		const paragraphCount = _countParagraphs(editor, text);

		dialog.counts = {
			wordCount: counts.wordCount,
			characterCount: counts.characterCount,
			characterCountWithoutSpaces: counts.characterCountWithoutSpaces,
			paragraphCount: paragraphCount
		};

		dialog.opened = true;

		const isSelection = editor.selection && !editor.selection.isCollapsed();

		if (isSelection) {
			const selectedText = editor.selection.getContent({ source_view: true, format: 'text' });
			const selectedCounts = countAll(selectedText);
			const selectedParagraphCount = _countSelectedParagraphs(editor, selectedText);

			dialog.selectedCounts = {
				wordCount: selectedCounts.wordCount,
				characterCount: selectedCounts.characterCount,
				characterCountWithoutSpaces: selectedCounts.characterCountWithoutSpaces,
				paragraphCount: selectedParagraphCount
			};
		}

		if (wordCountInFooter) dialog.countType = countButton.getAttribute('data-d2l-count-option');

		dialog.addEventListener('d2l-htmleditor-wordcount-select-option', (e) => {
			if (!e.detail) return;

			if (wordCountInFooter) {
				const countType = e.detail.selectedCountType;
				countButton.setAttribute('data-d2l-count-option', countType);

				if (countType === footerCountType.NOTHING) {
					countButton.style.display = 'none';
					countButton.textContent = null;

					return;
				}

				countButton.style.display = null;

				let count;
				switch (countType) {
					case footerCountType.CHAR:
						count = isSelection ? e.detail.selectedCounts.characterCount : e.detail.counts.characterCount;
						break;
					case footerCountType.WORD:
					default:
						count = isSelection ? e.detail.selectedCounts.wordCount : e.detail.counts.wordCount;
						break;
				}

				countButton.textContent = localize(getButtonLangTerm(countType, isSelection), { count: count });
			}
		});

		dialog.addEventListener('d2l-dialog-close', () => {
			dialog.counts = {};
			dialog.opened = false;
			dialog.selectedCounts = {};

			root.host.focus();

		}, { once: true });
	};

	editor.addCommand('d2l-wordcount', openWordCountDialog);

	editor.ui.registry.addButton('d2l-wordcount', {
		tooltip: localize('wordcount.tooltip'),
		icon: 'word-count',
		onAction: openWordCountDialog
	});

	if (!wordCountInFooter) return;

	countButton.onclick = openWordCountDialog;

	editor.on('init', () => {
		const statusBar = root.querySelector('.tox-statusbar');
		const statusBarResizeHandler = statusBar.querySelector('.tox-statusbar__resize-handle');

		statusBar.insertBefore(countButton, statusBarResizeHandler);
	});

	let timerId = 0;
	editor.on('change input selectionchange setcontent textInput', () => {
		clearTimeout(timerId);

		timerId = setTimeout(() => {
			const isSelection = editor.selection && !editor.selection.isCollapsed();
			const text = isSelection
				? editor.selection.getContent({ source_view: true, format: 'text' })
				: editor.getContent({ source_view: true, format: 'text' });

			const countOption = countButton.getAttribute('data-d2l-count-option');
			countButton.textContent = localize(getButtonLangTerm(countOption, isSelection), { count: getButtonCount(countOption, text) });
		}, 100);
	});

});

class WordCountDialog extends RequesterMixin(RtlMixin(LitElement)) {

	static get properties() {
		return {
			counts: { type: Object },
			countType: { type: String },
			opened: { type: Boolean, reflect: true },
			selectedCounts: { type: Object }
		};
	}

	static get styles() {
		return [ selectStyles, css`
			:host {
				display: block;
			}
			:host([hidden]) {
				display: none;
			}
			[slot="footer"] {
				display: flex;
				flex-wrap: wrap;
				justify-content: space-between;
			}
			d2l-button {
				flex: 0 1 auto;
			}
			table {
				border-collapse: collapse;
				table-layout: fixed;
				width: 100%;
			}
			thead th:nth-child(1) {
				text-align: left;
				width: 50%;
			}
			thead th:nth-child(2) {
				width: 25%;
			}
			thead th:nth-child(3) {
				width: 25%;
			}
			tbody td:nth-child(1) {
				text-align: left;
			}
			th, td {
				padding: 0.3rem 0;
				text-align: right;
			}
			tr {
				border-bottom: solid;
				border-color: var(--d2l-color-gypsum);
				border-width: 3px 0;
			}
			tr:last-child {
				border-bottom: none;
			}
		`];
	}

	constructor() {
		super();
		this.counts = {};
		this.countType = footerCountType.WORD;
		this.opened = false;
		this.selectedCounts = {};
	}

	connectedCallback() {
		super.connectedCallback();
		this._localize = this.requestInstance('localize');
		this._wordCountInFooter = this.requestInstance('wordCountInFooter');
	}

	render() {
		return html`
			<d2l-dialog width="500" title-text="${this._localize('wordcount.dialog.title')}" ?opened="${this.opened}">
				${this._renderWordCountInfo()}
				<div slot="footer">
					<d2l-button primary data-dialog-action>${this._localize('wordcount.dialog.closebutton')}</d2l-button>
					${this._wordCountInFooter ? this._renderCountSelectionDropdown() : ''}
				</div>
			</d2l-dialog>`;
	}

	_getCountOptionText() {
		switch (this.countType) {
			case footerCountType.CHAR:
				return this._localize('wordcount.footerselectorlabel.character');
			case footerCountType.WORD:
				return this._localize('wordcount.footerselectorlabel.word');
			case footerCountType.NOTHING:
			default:
				return this._localize('wordcount.footerselectorlabel.nocount');
		}
	}

	_handleSelectCharacterCountOption() {
		this._setSelectedCountOption(footerCountType.CHAR);
	}

	_handleSelectNoCountOption() {
		this._setSelectedCountOption(footerCountType.NOTHING);
	}

	_handleSelectWordCountOption() {
		this._setSelectedCountOption(footerCountType.WORD);
	}

	_renderCountSelectionDropdown() {
		return html`
			<d2l-dropdown-button-subtle id="d2l-wordcount-option" text="${this._getCountOptionText()}">
				<d2l-dropdown-menu>
					<d2l-menu label=${this._localize('wordcount.footerselector.menulabel')}>
						<d2l-menu-item
							text=${this._localize('wordcount.footerselector.wordcount')}
							@d2l-menu-item-select="${this._handleSelectWordCountOption}">
						</d2l-menu-item>
						<d2l-menu-item
							text=${this._localize('wordcount.footerselector.charactercount')}
							@d2l-menu-item-select="${this._handleSelectCharacterCountOption}">
						</d2l-menu-item>
						<d2l-menu-item
							text=${this._localize('wordcount.footerselector.nocount')}
							@d2l-menu-item-select="${this._handleSelectNoCountOption}">
						</d2l-menu-item>
					</d2l-menu>
				</d2l-dropdown-menu>
			</d2l-dropdown-button-subtle>`;
	}

	_renderWordCountInfo() {
		return html`
			<table>
				<thead>
					<tr>
						<th>${this._localize('wordcount.dialog.countlabel')}</th>
						<th>${this._localize('wordcount.dialog.documentlabel')}</th>
						<th>${this._localize('wordcount.dialog.selectionlabel')}</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>${this._localize('wordcount.dialog.words')}</td>
						<td>${formatNumber(this.counts.wordCount)}</td>
						<td>${formatNumber(this.selectedCounts.wordCount || 0)}</td>
					</tr>
					<tr>
						<td>${this._localize('wordcount.dialog.characters')}</td>
						<td>${formatNumber(this.counts.characterCount)}</td>
						<td>${formatNumber(this.selectedCounts.characterCount || 0)}</td>
					</tr>
					<tr>
						<td>${this._localize('wordcount.dialog.characterswithoutspaces')}</td>
						<td>${formatNumber(this.counts.characterCountWithoutSpaces)}</td>
						<td>${formatNumber(this.selectedCounts.characterCountWithoutSpaces || 0)}</td>
					</tr>
					<tr>
						<td>${this._localize('wordcount.dialog.paragraphs')}</td>
						<td>${formatNumber(this.counts.paragraphCount)}</td>
						<td>${formatNumber(this.selectedCounts.paragraphCount || 0)}</td>
					</tr>
				</tbody>
			</table>`;
	}

	_setSelectedCountOption(countType) {
		this.countType = countType;

		const selectorButton = this.shadowRoot.querySelector('#d2l-wordcount-option');
		selectorButton.text = this._getCountOptionText(countType);

		this.dispatchEvent(new CustomEvent(
			'd2l-htmleditor-wordcount-select-option', {
				bubbles: true,
				detail: {
					counts: this.counts,
					selectedCounts: this.selectedCounts,
					selectedCountType: countType
				}
			}
		));
	}
}

function _countParagraphs(editor, text) {
	if (text.length === 0) return 0;
	return editor.getBody().getElementsByTagName('p').length;
}

function _countSelectedParagraphs(editor) {
	if (!editor.selection || editor.selection.isCollapsed()) return 0;

	const html = editor.selection.getContent({ format: 'html' });
	const template = document.createElement('template');
	template.insertAdjacentHTML('afterbegin', html);

	let paragraphCount = template.getElementsByTagName('p').length;

	// If the editor has a selection and there's HTML present, but the
	// HTML contains no p tags, we've likely selected text only and
	// haven't managed to capture a paragraph tag - this means we still
	// have 1 paragraph that needs to be counted.
	if (paragraphCount === 0 && html.length !== 0) paragraphCount = 1;

	return paragraphCount;
}

customElements.define('d2l-htmleditor-wordcount-dialog', WordCountDialog);
