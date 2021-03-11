import '@brightspace-ui/core/components/menu/menu-item-separator.js';
import './toolbar.js';
import './button.js';
import './button-color.js';
import './button-menu.js';
import './button-split.js';
import './button-toggle.js';
import '../plugins/a11ychecker.js';
import '../plugins/equation.js';
import '../plugins/fullscreen.js';
import '../plugins/image.js';
import '../plugins/isf.js';
import '../plugins/preview.js';
import '../plugins/quicklink.js';
import '../plugins/wordcount.js';
import { cmds } from '../commands.js';
import { html } from 'lit-element/lit-element.js';

export function getPlugins(component) {
	return [
		'advcode',
		'advtable table',
		'charmap',
		'd2l-a11ychecker a11ychecker',
		'd2l-equation',
		'd2l-fullscreen',
		'd2l-image',
		'd2l-isf',
		'd2l-quicklink',
		'directionality',
		'emoticons',
		'hr',
		'lists',
		component._context ? 'd2l-preview' : 'preview'
	];
}

/*
	plugins: `autolink ${this.fullPage ? 'fullpage d2l-fullpage' : ''} image ${this.pasteLocalImages ? 'imagetools' : ''} link ${(this.mentions && D2L.LP) ? 'mentions' : ''} powerpaste quickbars textpattern d2l-wordcount ${plugins.join(' ')}`,
*/

/*
<d2l-htmleditor-button-menu text="Table" icon="table">
	<d2l-htmleditor-menu-item>
		<span slot="text">Cell and apples</span>
		<d2l-menu style="min-width:100%; max-width: 100%;">
			<d2l-htmleditor-menu-item><span slot="text">Some action</span></d2l-htmleditor-menu-item>
		</d2l-menu>
	</d2l-htmleditor-menu-item>
</d2l-htmleditor-button-menu>
*/

export function renderFullToolbar(component) {
	return html`
		<d2l-htmleditor-toolbar>
			<d2l-htmleditor-button-menu text="${component.localize('formats')}" style="width: 115px;">
				<d2l-htmleditor-menu-item cmd="${cmds.formatBlock}" value="p"><p>Paragraph</p></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.formatBlock}" value="h1"><h1>Heading 1</h1></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.formatBlock}" value="h2"><h2>Heading 2</h2></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.formatBlock}" value="h3"><h3>Heading 3</h3></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.formatBlock}" value="h4"><h4>Heading 4</h4></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.blockQuote}"><blockquote>Blockquote</blockquote></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.formatBlock}" value="code"><code>Code</code></d2l-htmleditor-menu-item>
			</d2l-htmleditor-button-menu>
			<d2l-htmleditor-button-toggle cmd="${cmds.bold}" icon="bold" text="${component.localize('bold')}"></d2l-htmleditor-button-toggle>
			<d2l-htmleditor-button-toggle cmd="${cmds.italic}" icon="italic" text="${component.localize('italic')}"></d2l-htmleditor-button-toggle>
			<d2l-htmleditor-button-split cmd="${cmds.strikethrough}" icon="strike-through" text="Strike-through">
				<d2l-htmleditor-menu-item cmd="${cmds.underline}" icon="underline">Underline</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.strikethrough}" icon="strike-through">Strike-through</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.superscript}" icon="superscript">Superscript</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.subscript}" icon="subscript">Subscript</d2l-htmleditor-menu-item>
			</d2l-htmleditor-button-split>
			<d2l-htmleditor-button-menu text="${component.localize('alignment')}" icon="align-left">
				<d2l-htmleditor-menu-item cmd="${cmds.alignLeft}" icon="align-left">Left</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.alignCenter}" icon="align-center">Center</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.alignRight}" icon="align-center">Right</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.alignJustify}" icon="align-justify">Justify</d2l-htmleditor-menu-item>
				<d2l-menu-item-separator></d2l-menu-item-separator>
				<d2l-htmleditor-menu-item cmd="${cmds.ltr}" icon="ltr">${component.localize('ltr')}</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.rtl}" icon="rtl">${component.localize('rtl')}</d2l-htmleditor-menu-item>
			</d2l-htmleditor-button-menu>
			<d2l-htmleditor-button-menu text="${component.localize('list')}" icon="unordered-list">
				<d2l-htmleditor-menu-item cmd="${cmds.unorderedList}" icon="unordered-list">${component.localize('unorderedlist')}</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.orderedList}" icon="ordered-list">${component.localize('orderedlist')}</d2l-htmleditor-menu-item>
				<d2l-menu-item-separator></d2l-menu-item-separator>
				<d2l-htmleditor-menu-item cmd="${cmds.indent}" icon="indent">${component.localize('indent')}</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.outdent}" icon="outdent">${component.localize('outdent')}</d2l-htmleditor-menu-item>
			</d2l-htmleditor-button-menu>
			${component._context ? html`
				<d2l-htmleditor-button cmd="${cmds.isf}" icon="insert-stuff" text="${component.localize('isf')}"></d2l-htmleditor-button>
				<d2l-htmleditor-button cmd="${cmds.quicklink}" icon="link" text="${component.localize('quicklink')}"></d2l-htmleditor-button>
				<d2l-htmleditor-button cmd="${cmds.image}" icon="image" text="${component.localize('image')}"></d2l-htmleditor-button>
			` : ''}
			<d2l-htmleditor-button-menu text="Table" icon="table">
				<d2l-htmleditor-menu-item cmd="${cmds.table}" icon="table">Insert Table</d2l-htmleditor-menu-item>
				<d2l-menu-item-separator></d2l-menu-item-separator>
				<d2l-htmleditor-menu-item cmd="${cmds.tableCellProps}" icon="table-cell-properties">Cell Properties</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableMergeCells}" icon="table-merge-cells">Merge Cells</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableSplitCells}" icon="table-split-cells">Split Cell</d2l-htmleditor-menu-item>
				<d2l-menu-item-separator></d2l-menu-item-separator>
				<d2l-htmleditor-menu-item cmd="${cmds.tableInsertRowBefore}" icon="table-insert-row-above">Insert Row Before</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableInsertRowAfter}" icon="table-insert-row-after">Insert Row After</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableDeleteRow}" icon="table-delete-row">Delete Row</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableRowProps}" icon="table-row-properties">Row Properties</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableCutRow}" icon="cut-row">Cut Row</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableCopyRow}" icon="duplicate-row">Copy Row</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tablePasteRowBefore}" icon="paste-row-before">Paste Row Before</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tablePasteRowAfter}" icon="paste-row-after">Paste Row After</d2l-htmleditor-menu-item>
				<d2l-menu-item-separator></d2l-menu-item-separator>
				<d2l-htmleditor-menu-item cmd="${cmds.tableInsertColumnBefore}" icon="table-insert-column-before">Insert Column Before</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableInsertColumnAfter}" icon="table-insert-column-after">Insert Column After</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableDeleteColumn}" icon="table-delete-column">Delete Column</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableCutColumn}">Cut Column</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableCopyColumn}">Copy Column</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tablePasteColumnBefore}">Paste Column Before</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tablePasteColumnAfter}">Paste Column After</d2l-htmleditor-menu-item>
				<d2l-menu-item-separator></d2l-menu-item-separator>
				<d2l-htmleditor-menu-item cmd="${cmds.tableSortColumnAsc}">Sort by Column Ascending</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableSortColumnDesc}">Sort by Column Descending</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableSortAdvanced}">Advanced Sort</d2l-htmleditor-menu-item>
				<d2l-menu-item-separator></d2l-menu-item-separator>
				<d2l-htmleditor-menu-item cmd="${cmds.tableProps}">Table Properties</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item cmd="${cmds.tableDelete}" icon="table-delete-table">Delete Table</d2l-htmleditor-menu-item>
			</d2l-htmleditor-button-menu>
			${component._context ? html`
				<d2l-htmleditor-button-split cmd="${cmds.equationGraphical}" icon="equation-graphical" text="${component.localize('graphical')}">
					<d2l-htmleditor-menu-item cmd="${cmds.equationGraphical}" icon="equation-graphical">${component.localize('graphical')}</d2l-htmleditor-menu-item>
					<d2l-htmleditor-menu-item cmd="${cmds.equationLaTeX}" icon="equation-latex">${component.localize('latex')}</d2l-htmleditor-menu-item>
					<d2l-htmleditor-menu-item cmd="${cmds.equationMathML}" icon="equation-mathml">${component.localize('mathml')}</d2l-htmleditor-menu-item>
					<d2l-htmleditor-menu-item cmd="${cmds.equationChemistry}" icon="equation-chemistry">${component.localize('chemistry')}</d2l-htmleditor-menu-item>
				</d2l-htmleditor-button-split>
			` : ''}
			<d2l-htmleditor-button cmd="${cmds.character}" icon="insert-character" text="${component.localize('character')}"></d2l-htmleditor-button>
			<d2l-htmleditor-button cmd="${cmds.emoticons}" icon="emoji" text="Emoticons"></d2l-htmleditor-button>
			<d2l-htmleditor-button cmd="${cmds.hr}" icon="horizontal-rule" text="${component.localize('line')}"></d2l-htmleditor-button>
			<d2l-htmleditor-button cmd="${cmds.a11yChecker}" icon="accessibility-check" text="${component.localize('allychecker')}"></d2l-htmleditor-button>
			<d2l-htmleditor-button-menu cmd="${cmds.fontFamily}" text="${component.localize('fonts')}" style="width: 130px;">
				<d2l-htmleditor-menu-item value="arabic transparent,sans-serif"><span style="font-family: arabic transparent,sans-serif;">Arabic Transparent</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="arial,helvetica,sans-serif"><span style="font-family: arial,helvetica,sans-serif;">Arial</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="comic sans ms,sans-serif"><span style="font-family: comic sans ms,sans-serif;">Comic Sans</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="courier new,courier,sans-serif"><span style="font-family: courier new,courier,sans-serif;">Courier</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="ezra sil,arial unicode ms,arial,sans-serif"><span style="font-family: ezra sil,arial unicode ms,arial,sans-serif;">Ezra SIL</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="georgia,serif"><span style="font-family: georgia,serif;">Georgia</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="Lato,sans-serif"><span style="Lato,sans-serif">Lato (${component.localize('font.family.recommended')})</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="sbl hebrew,times new roman,serif"><span style="font-family: sbl hebrew,times new roman,serif;">SBL Hebrew</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="simplified arabic,sans-serif"><span style="font-family: simplified arabic,sans-serif;">Simplified Arabic</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="tahoma,sans-serif"><span style="font-family: tahoma,sans-serif;">Tahoma</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="times new roman,times,serif"><span style="font-family: times new roman,times,serif;">Times New Roman</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="traditional arabic,serif"><span style="font-family: traditional arabic,serif;">Traditional Arabic<span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="trebuchet ms,helvetica,sans-serif"><span style="font-family: trebuchet ms,helvetica,sans-serif;">Trebuchet<span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="verdana,sans-serif"><span style="font-family: verdana,sans-serif;">Verdana</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="dotum,arial,helvetica,sans-serif"><span style="font-family: dotum,arial,helvetica,sans-serif;">돋움 (Dotum)</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="simsun"><span style="font-family: simsun;">宋体 (Sim Sun)</span></d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="mingliu,arial,helvetica,sans-serif"><span style="font-family: mingliu,arial,helvetica,sans-serif;">細明體 (Ming Liu)</span></d2l-htmleditor-menu-item>
			</d2l-htmleditor-button-menu>
			<d2l-htmleditor-button-menu cmd="${cmds.fontSize}" text="${component.localize('fontsize')}" style="width: 80px;">
				<d2l-htmleditor-menu-item value="8pt">8pt</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="10pt">10pt</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="12pt">12pt</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="14pt">14pt</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="18pt">18pt</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="24pt">24pt</d2l-htmleditor-menu-item>
				<d2l-htmleditor-menu-item value="36pt">36pt</d2l-htmleditor-menu-item>
			</d2l-htmleditor-button-menu>
			${component._context ? html`
				<d2l-htmleditor-button-color></d2l-htmleditor-button-color>
			` : ''}
			<d2l-htmleditor-button cmd="${component._context ? cmds.preview : 'mcePreview'}" icon="preview" text="${component.localize('preview')}"></d2l-htmleditor-button>
			<d2l-htmleditor-button cmd="${cmds.sourceCode}" icon="sourcecode" text="${component.localize('source')}"></d2l-htmleditor-button>
			<d2l-htmleditor-button cmd="${cmds.wordCount}" icon="word-count" text="Word Count"></d2l-htmleditor-button>
			<d2l-htmleditor-button cmd="${cmds.undo}" icon="undo" text="${component.localize('undo')}"></d2l-htmleditor-button>
			<d2l-htmleditor-button cmd="${cmds.redo}" icon="redo" text="${component.localize('redo')}"></d2l-htmleditor-button>
			<d2l-htmleditor-button-toggle cmd="${cmds.fullscreen}" icon="fullscreen" text="${component.localize('fullscreen')}"></d2l-htmleditor-button-toggle>
		</d2l-htmleditor-toolbar>
	`;
}
