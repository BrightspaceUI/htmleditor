
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { buttonStyles } from './button-styles.js';
import { classMap } from 'lit-html/directives/class-map.js';
import ResizeObserver from 'resize-observer-polyfill/dist/ResizeObserver.es.js';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin.js';

const keyCodes = Object.freeze({
	END: 35,
	HOME: 36,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
});

class Toolbar extends RtlMixin(LitElement) {

	static get properties() {
		return {
			_chomping: { type: Boolean },
			_state: { type: String },
			_measured: { type: Boolean },
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
			div {
				align-items: center;
				display: flex;
				flex-wrap: wrap;
				max-height: 210px;
				transition: max-height 250ms ease-out;
			}
			.d2l-htmleditor-toolbar-measuring {
				opacity: 0;
				position: absolute;
			}
			.d2l-htmleditor-toolbar-chomping {
				max-height: 34px;
			}
			button {
				display: none;
			}
			.d2l-htmleditor-toolbar-measuring button,
			.d2l-htmleditor-toolbar-overflowing button {
				display: flex;
			}
			::slotted(*) {
				transition: opacity 250ms ease-out;
				transition-delay: 200ms;
			}
			::slotted([data-toolbar-item-state="chomped"]) {
				display: none;
			}
			::slotted([data-toolbar-item-state="hidden"]) {
				opacity: 0;
			}
		`];
	}

	constructor() {
		super();
		this._measured = false;
		this._measures = {};
		this._overflowing = true;
		this._chomping = true;
		this._state = 'chomping';
	}

	firstUpdated() {
		super.firstUpdated();
		this._measures.available = this.offsetWidth;
		this._measures.chomper = this.shadowRoot.querySelector('button').offsetWidth;
		this._resizeObserver = new ResizeObserver(this._handleResize.bind(this));
		this._resizeObserver.observe(this.shadowRoot.querySelector('div'));
		this._initializeRovingTabIndex();
	}

	render() {
		const classes = {
			'd2l-htmleditor-toolbar-measuring': !this._measured,
			'd2l-htmleditor-toolbar-overflowing': this._overflowing,
			'd2l-htmleditor-toolbar-chomping': this._chomping
		};

		return html`
			<div
				class="${classMap(classes)}"
				data-state="${this._state}"
				@keydown="${this._handleKeyDown}">
				<slot @slotchange="${this._handleSlotChange}"></slot>
				<button @click="${this._handleChomperClick}">
					<d2l-icon icon="tier1:more"></d2l-icon>
				</button>
			</div>
		`;
	}

	async _handleChomperClick() {
		this._chomping = !this._chomping;
		this._updateItemsVisibility(true);
	}

	async _handleKeyDown(e) {

		if (e.keyCode !== keyCodes.LEFT && e.keyCode !== keyCodes.RIGHT && e.keyCode !== keyCodes.HOME && e.keyCode !== keyCodes.END) return;
		if (e.target === this.shadowRoot.querySelector('button')) return;

		const items = this.shadowRoot.querySelector('slot').assignedNodes({ flatten: true })
			.filter(node => node.nodeType === Node.ELEMENT_NODE && node.getAttribute('data-toolbar-item-state') !== 'chomped');

		const index = items.findIndex(item => item.focusable);

		let newIndex = index;
		items[index].focusable = false;
		if (this._dir === 'rtl' && e.keyCode === keyCodes.LEFT) {
			if (index === items.length - 1) newIndex = 0;
			else newIndex = index + 1;
		} else if (this._dir === 'rtl' && e.keyCode === keyCodes.RIGHT) {
			if (index === 0) newIndex = items.length - 1;
			else newIndex = index - 1;
		} else if (e.keyCode === keyCodes.LEFT) {
			if (index === 0) newIndex = items.length - 1;
			else newIndex = index - 1;
		} else if (e.keyCode === keyCodes.RIGHT) {
			if (index === items.length - 1) newIndex = 0;
			else newIndex = index + 1;
		} else if (e.keyCode === keyCodes.HOME) {
			newIndex = 0;
		} else if (e.keyCode === keyCodes.END) {
			newIndex = items.length - 1;
		}

		// prevent default so page doesn't scroll when hitting HOME/END
		e.preventDefault();

		items[newIndex].focusable = true;
		await items[newIndex].updateComplete;
		items[newIndex].focus();

	}

	_handleResize(entries) {
		if (this._measures.available === entries[0].contentRect.width) return;
		this._measures.available = entries[0].contentRect.width;
		this._updateItemsVisibility(false);
	}

	_handleSlotChange(e) {

		this._measures.items = [];
		this._measures.total = 0;

		const items = e.target.assignedNodes({ flatten: true })
			.filter(node => node.nodeType === Node.ELEMENT_NODE);

		requestAnimationFrame(() => {
			items.forEach(item => {
				const width = item.offsetWidth;
				this._measures.items.push(width);
				this._measures.total += width;
			});
			this._updateItemsVisibility(false, items);
		});

	}

	_initializeRovingTabIndex() {
		const items = this.shadowRoot.querySelector('slot').assignedNodes({ flatten: true })
			.filter(node => node.nodeType === Node.ELEMENT_NODE);
		items[0].focusable = true;

	}

	_updateItemsVisibility(animate, items) {
		if (!items) items = this.shadowRoot.querySelector('slot').assignedNodes({ flatten: true })
			.filter(node => node.nodeType === Node.ELEMENT_NODE);

		if (this._chomping) {

			this._overflowing = (this._measures.total > this._measures.available);
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
					if (item.focusable) {
						item.focusable = false;
						items[0].focusable = true;
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

		this._measured = true;
	}

}

customElements.define('d2l-htmleditor-toolbar', Toolbar);
