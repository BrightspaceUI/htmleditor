
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
				transition-delay: 200ms;
				transition: opacity 250ms ease-out;
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
					<svg style="height: 18px; width: 18px; transform: scale(-1,1);" xmlns="http://www.w3.org/2000/svg" version="1.0" width="1280.000000pt" height="936.000000pt" viewBox="0 0 1280.000000 936.000000" preserveAspectRatio="xMidYMid meet">
					<metadata>
					Created by potrace 1.15, written by Peter Selinger 2001-2017
					</metadata>
					<g transform="translate(0.000000,936.000000) scale(0.100000,-0.100000)" stroke="none">
					<path d="M4365 9350 c-498 -38 -961 -143 -1415 -322 -173 -68 -518 -240 -683 -340 -1240 -752 -2058 -2015 -2231 -3443 -125 -1033 95 -2074 625 -2960 398 -664 941 -1210 1606 -1613 165 -100 510 -272 683 -340 214 -84 460 -161 660 -207 627 -144 1252 -162 1874 -55 1126 193 2143 796 2860 1694 135 168 317 430 305 439 -2 2 -894 559 -1981 1238 -1088 679 -1978 1236 -1978 1239 0 3 890 560 1978 1239 1087 679 1979 1236 1981 1238 12 9 -173 275 -314 450 -308 384 -671 714 -1087 987 -632 414 -1333 663 -2089 741 -183 19 -625 27 -794 15z"/>
					<path d="M7652 5286 c-134 -33 -288 -143 -368 -263 -21 -31 -51 -96 -68 -143 -26 -74 -30 -99 -30 -195 -1 -122 13 -182 67 -294 41 -85 158 -204 247 -254 140 -77 318 -98 470 -56 280 77 476 350 456 637 -6 101 -47 226 -100 305 -83 124 -246 238 -384 266 -70 14 -224 13 -290 -3z"/>
					<path d="M9825 5281 c-275 -80 -454 -316 -455 -598 0 -112 14 -172 65 -279 61 -127 152 -218 279 -279 50 -24 115 -48 144 -54 68 -14 196 -14 264 0 73 15 203 78 264 127 95 77 176 204 208 329 21 78 21 227 0 307 -57 221 -228 393 -451 450 -82 21 -240 20 -318 -3z"/>
					<path d="M12020 5284 c-169 -44 -323 -169 -399 -324 -93 -190 -93 -370 0 -559 51 -103 152 -210 249 -264 184 -101 417 -103 605 -4 86 45 212 174 253 259 53 108 76 216 69 323 -10 165 -65 285 -186 406 -60 60 -94 85 -161 117 -47 22 -109 45 -138 51 -73 15 -226 13 -292 -5z"/>
					</g>
					</svg>
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
