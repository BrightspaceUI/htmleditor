import '@brightspace-ui/core/components/colors/colors.js';
import { css } from 'lit-element/lit-element.js';

export const buttonStyles = css`
	:host {
		display: inline-block;
	}
	:host([hidden]) {
		display: none;
	}
	button {
		background-color: transparent;
		border-color: var(--d2l-htmleditor-button-border-color, transparent);
		border-radius: var(--d2l-htmleditor-button-border-radius, 0.3rem);
		border-style: solid;
		border-width: 1px;
		box-sizing: border-box;
		color: var(--d2l-color-ferrite);
		cursor: pointer;
		display: inline-block;
		fill: var(--d2l-color-ferrite);
		margin: 0;
		min-height: 34px;
		min-width: 34px;
		outline: none;
		padding: var(--d2l-htmleditor-button-padding, 0);
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
		color: var(--d2l-color-celestine);
		fill: var(--d2l-color-celestine);
	}
	button[disabled] {
		cursor: default;
		opacity: 0.5;
	}
`;
