
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

class Toolbar extends SkeletonMixin(LitElement) {

	static get styles() {
		return [ super.styles, css`
			:host {
				align-items: center;
				display: flex;
				flex-wrap: wrap;
				margin: 10px 10px 0 10px;
			}
			:host([hidden]) {
				display: none;
			}
			button {
				background-color: transparent;
				border-color: transparent;
				border-radius: 0.3rem;
				border-style: none;
				box-sizing: border-box;
				cursor: pointer;
				display: inline-block;
				fill: var(--d2l-color-ferrite);
				margin: 0;
				min-height: 34px;
				min-width: 34px;
				outline: none;
				padding: 0;
				text-align: center;
				-webkit-user-select: none;
				-moz-user-select: none;
				-ms-user-select: none;
				user-select: none;
				vertical-align: middle;
				white-space: nowrap;
				width: auto;
			}
			button::-moz-focus-inner {
				border: 0;
			}
			button[disabled]:hover,
			button[disabled]:focus {
				background-color: transparent;
				fill: var(--d2l-color-ferrite);
			}
			button:hover,
			button:focus {
				background-color: var(--d2l-color-gypsum);
				fill: var(--d2l-color-celestine);
			}
			button[disabled] {
				cursor: default;
				opacity: 0.5;
			}
		`];
	}

	render() {
		return html`
			<slot></slot>
			<button>
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
		`;
	}

}

customElements.define('d2l-htmleditor-toolbar', Toolbar);
