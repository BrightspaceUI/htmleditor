
import { css, html } from 'lit-element/lit-element.js';
import { buttonStyles } from './button-styles.js';
import { classMap } from 'lit-html/directives/class-map.js';
import ResizeObserver from 'resize-observer-polyfill/dist/ResizeObserver.es.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

const keyCodes = Object.freeze({
	ENTER: 13,
	END: 35,
	HOME: 36,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40
});

export const ToolbarMixin = superclass => class extends RtlMixin(superclass) {

	static get properties() {
		return {
			_chomping: { type: Boolean },
			_state: { type: String },
			_overflowing: { type: Boolean }
		};
	}

	static get styles() {
		return [ buttonStyles, css`
			:host {
				display: block;
				margin: 10px 10px 0 10px;
			}
			:host([hidden]) {
				display: none;
			}
			.d2l-htmleditor-toolbar-container {
				display: flex;
				max-height: 210px;
				transition: max-height 250ms ease-out;
			}
			.d2l-htmleditor-toolbar-chomping {
				max-height: 34px;
			}
			.d2l-htmleditor-toolbar-actions {
				flex: auto;
			}
			.d2l-htmleditor-toolbar-actions > div {
				align-items: center;
				display: flex;
				flex-wrap: wrap;
			}
			.d2l-htmleditor-toolbar-chomper-container {
				flex: none;
			}
			.d2l-htmleditor-toolbar-chomper {
				display: none;
			}
			.d2l-htmleditor-toolbar-overflowing .d2l-htmleditor-toolbar-chomper {
				display: flex;
			}
			.d2l-htmleditor-toolbar-actions > div > * {
				transition: opacity 250ms ease-out;
			}
			.d2l-htmleditor-toolbar-actions > div > [data-toolbar-item-state="chomped"] {
				display: none;
			}
			.d2l-htmleditor-toolbar-actions > div > [data-toolbar-item-state="hidden"] {
				opacity: 0;
			}
		`];
	}

	constructor() {
		super();
		this._measures = {};
		this._overflowing = true;
		this._chomping = true;
		this._state = 'chomping';
	}

	firstUpdated() {
		super.firstUpdated();

		this._updateMeasures();

		this._chompResizeObserver = new ResizeObserver(this._handleChompResize.bind(this));
		this._chompResizeObserver.observe(this.shadowRoot.querySelector('.d2l-htmleditor-toolbar-container'));

		const focusables = this._getFocusables();
		if (focusables && focusables.length > 0) focusables[0].activeFocusable = true;
	}

	_getFocusables(chomped) {
		const focusables = this._getItems().filter(node => node.tagName !== 'D2L-HTMLEDITOR-SEPARATOR'
			&& (node.getAttribute('data-toolbar-item-state') !== 'chomped' || chomped));

		if (this._overflowing) {
			focusables.push(this.shadowRoot.querySelector('.d2l-htmleditor-toolbar-chomper'));
		}
		return focusables;
	}

	_getItems() {
		return [...this.shadowRoot.querySelector('.d2l-htmleditor-toolbar-actions > div').children];
	}

	async _handleChomperClick() {
		this._chomping = !this._chomping;
		this._updateItemsVisibility(true);
	}

	_handleChompResize(entries) {
		if (this._measures.available === entries[0].contentRect.width) return;
		this._measures.available = entries[0].contentRect.width;
		this._updateItemsVisibility(false);
	}

	_handleKeyDown(e) {

		if (e.keyCode !== keyCodes.LEFT && e.keyCode !== keyCodes.RIGHT && e.keyCode !== keyCodes.HOME && e.keyCode !== keyCodes.END) return;

		const setActiveFocusable = async focusable => {
			focusable.activeFocusable = true;
			await focusable.updateComplete;
			requestAnimationFrame(() => {
				focusable.focus();
			});
		};

		const focusables = this._getFocusables();
		const index = focusables.findIndex(item => item.activeFocusable);

		let newIndex = index;
		focusables[index].activeFocusable = false;
		if (this._dir === 'rtl' && e.keyCode === keyCodes.LEFT) {
			if (index === focusables.length - 1) newIndex = 0;
			else newIndex = index + 1;
		} else if (this._dir === 'rtl' && e.keyCode === keyCodes.RIGHT) {
			if (index === 0) newIndex = focusables.length - 1;
			else newIndex = index - 1;
		} else if (e.keyCode === keyCodes.LEFT) {
			if (index === 0) newIndex = focusables.length - 1;
			else newIndex = index - 1;
		} else if (e.keyCode === keyCodes.RIGHT) {
			if (index === focusables.length - 1) newIndex = 0;
			else newIndex = index + 1;
		} else if (e.keyCode === keyCodes.HOME) {
			newIndex = 0;
		} else if (e.keyCode === keyCodes.END) {
			newIndex = focusables.length - 1;
		}

		// prevent default so page doesn't scroll when hitting HOME/END
		e.preventDefault();

		setActiveFocusable(focusables[newIndex]);
	}

	_render(items) {
		const classes = {
			'd2l-htmleditor-toolbar-container': true,
			'd2l-htmleditor-toolbar-overflowing': this._overflowing,
			'd2l-htmleditor-toolbar-chomping': this._chomping
		};

		return html`
			<div
				class="${classMap(classes)}"
				data-state="${this._state}"
				@keydown="${this._handleKeyDown}"
				role="toolbar">
				<div class="d2l-htmleditor-toolbar-actions">
					<div>${items}</div>
				</div>
				<div class="d2l-htmleditor-toolbar-chomper-container">
					<button
						aria-label="${this.localize('more')}"
						class="d2l-htmleditor-toolbar-chomper"
						@click="${this._handleChomperClick}"
						tabindex="-1"
						title="${this.localize('more')}">
						<div class="d2l-htmleditor-button-background"></div>
						<d2l-icon icon="tier1:more"></d2l-icon>
					</button>
				</div>
			</div>
		`;
	}

	_updateItemsVisibility(animate, items) {

		if (!items) items = this._getItems();

		this._overflowing = (this._measures.total > this._measures.available);
		if (this._chomping) {

			let total = (this._overflowing ? this._measures.chomper : 0);

			items.forEach((item, i) => {
				total += this._measures.items[i];
				if (total > this._measures.available) {

					// only animate it when user has clicked chomper
					if (animate) {
						item.addEventListener('transitionend', () => {
							// only set final state if still chomping (in case user reverses during animation)
							if (this._chomping) item.setAttribute('data-toolbar-item-state', 'chomped');
						}, { once: true });
						item.setAttribute('data-toolbar-item-state', 'hidden');
					} else {
						item.setAttribute('data-toolbar-item-state', 'chomped');
					}

					// if chomping item with the current roving tabindex then reset it
					if (item.activeFocusable) {
						item.activeFocusable = false;
						items[0].activeFocusable = true;
					}

				} else {
					item.removeAttribute('data-toolbar-item-state');
				}
			});

		} else {

			items.forEach(item => {
				if (animate && item.getAttribute('data-toolbar-item-state') === 'chomped') {
					item.setAttribute('data-toolbar-item-state', 'hidden');
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							item.removeAttribute('data-toolbar-item-state');
						});
					});
				} else {
					item.removeAttribute('data-toolbar-item-state');
				}
			});

		}

	}

	_updateMeasures() {

		this._measures = {
			available: this.offsetWidth,
			chomper: this.shadowRoot.querySelector('.d2l-htmleditor-toolbar-chomper').offsetWidth,
			items: [],
			total: 0
		};

		const items = this._getItems();
		requestAnimationFrame(() => {
			items.forEach(item => {
				const width = item.offsetWidth;
				this._measures.items.push(width);
				this._measures.total += width;
			});
			this._updateItemsVisibility(false, items);
		});

	}

};
