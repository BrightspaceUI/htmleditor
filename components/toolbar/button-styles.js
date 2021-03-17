import '@brightspace-ui/core/components/colors/colors.js';
import { css } from 'lit-element/lit-element.js';

export const buttonStyles = css`
	:host {
		display: inline-block;
		/* apply all whitespace between items using padding to make measurement simpler */
		padding-left: 5px;
		padding-right: 5px;
	}
	:host(:first-child) {
		padding-left: 0;
	}
	:host([dir="rtl"]:first-child) {
		padding-left: 5px;
		padding-right: 0;
	}
	:host([hidden]) {
		display: none;
	}
	button {
		align-items: center;
		background-color: transparent;
		border-color: transparent;
		border-radius: 0.2rem;
		border-style: solid;
		border-width: 2px;
		box-sizing: border-box;
		color: var(--d2l-color-ferrite);
		cursor: pointer;
		display: flex;
		fill: var(--d2l-color-ferrite);
		justify-content: center;
		margin: 0;
		min-height: 34px;
		min-width: 34px;
		outline: none;
		padding: 0;
		position: relative;
		text-align: center;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		vertical-align: middle;
		white-space: nowrap;
		width: auto;
		/* create stacking context for the background so it can be animated */
		z-index: 0;
	}
	button::-moz-focus-inner {
		border: 0;
	}
	.d2l-htmleditor-button-background {
		background-color: transparent;
		border-radius: 4px;
		height: 100%;
		position: absolute;
		/* transform: scale(0.85, 0.85); */
		/* transition: background-color 200ms linear, transform 200ms linear; */
		transition: background-color 200ms linear;
		width: 100%;
		z-index: -1;
	}
	button:hover > .d2l-htmleditor-button-background,
	button:focus > .d2l-htmleditor-button-background {
		background-color: var(--d2l-color-sylvite);
		transform: scale(1, 1);
	}
	button:focus {
		border-color: var(--d2l-color-celestine);
	}
	button[disabled] {
		cursor: default;
		opacity: 0.5;
	}
	button[disabled]:hover,
	button[disabled]:focus {
		background-color: transparent;
		fill: var(--d2l-color-ferrite);
	}
`;
