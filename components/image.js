import 'tinymce/tinymce.js';
import { css, LitElement } from 'lit-element/lit-element.js';
import { hasLmsContext, openLegacyDialog, uploadFile } from './lms-adapter.js';
import { RequesterMixin, requestInstance } from '@brightspace-ui/core/mixins/provider-mixin.js';
import { getComposedActiveElement } from '@brightspace-ui/core/helpers/focus.js';

const fileTypes = {
	All: 0,
	Image: 1
};

class FileData {
	constructor(fileSystemType, id, fileName, size, location) {
		this.FileSystemType = fileSystemType;
		this.Id = id;
		this.FileName = fileName;
		this.Size = size;
		this.Location = location;
	}
}

export function uploadImage(editor, blobInfo, success, failure) {

	// bail if no LMS context (local file upload relies on LMS context for now)
	if (!hasLmsContext()) return;

	const orgUnitId = requestInstance(editor, 'orgUnitId');
	const maxFileSize = requestInstance(editor, 'maxFileSize');

	editor._uploadImageCount++;
	if (editor._uploadImageCount === 1) { // only fire the upload started event on the first image being uploaded
		editor.dispatchEvent(new CustomEvent(
			'd2l-htmleditor-image-upload-start', {
				bubbles: true
			}
		));
	}

	const fileName = blobInfo.filename().replace('blobid', 'pic');
	const blob = blobInfo.blob();

	uploadFile(orgUnitId, fileName, blob, maxFileSize).then(uploadedFile => {
		const location = `/d2l/lp/files/temp/${uploadedFile.FileId}/View`;

		editor.files.push(
			new FileData(
				uploadedFile.FileSystemType,
				uploadedFile.FileId,
				uploadedFile.FileName,
				uploadedFile.Size,
				location
			)
		);

		success(location);

		editor._uploadImageCount--;
		if (editor._uploadImageCount <= 0) {
			editor.dispatchEvent(new CustomEvent(
				'd2l-htmleditor-image-upload-complete', {
					bubbles: true
				}
			));
		}

	}).catch(errorResponse => failure(errorResponse));

}

tinymce.PluginManager.add('d2l-image', function(editor) {

	// bail if no LMS context
	if (!hasLmsContext()) return;

	const localize = requestInstance(editor.getElement(), 'localize');

	editor.ui.registry.addButton('d2l-image', {
		tooltip: localize('image.tooltip'),
		icon: 'image',
		onAction: () => {
			const root = editor.getElement().getRootNode();

			let dialog = root.querySelector('d2l-htmleditor-file-selector-dialog');
			if (!dialog) dialog = root.appendChild(document.createElement('d2l-htmleditor-file-selector-dialog'));

			const fileUploadForAllUsers = requestInstance(editor.getElement(), 'fileUploadForAllUsers');
			const attachedImagesOnly = requestInstance(editor.getElement(), 'attachedImagesOnly');
			const viewFiles = requestInstance(editor.getElement(), 'viewFiles');
			const uploadFiles = requestInstance(editor.getElement(), 'uploadFiles');
			const orgUnitPath = requestInstance(editor.getElement(), 'orgUnitPath');

			if (viewFiles) {
				if (uploadFiles || fileUploadForAllUsers) dialog.areaFilters = 'MyComputer,OuFiles,SharedFiles,Url';
				else dialog.areaFilters = 'OuFiles,SharedFiles,Url';
			}
			if (!fileUploadForAllUsers) dialog.forceSaveToCourseFiles = true;
			if (uploadFiles && fileUploadForAllUsers) dialog.allowSaveToCourseFiles = true;
			if (viewFiles && fileUploadForAllUsers && attachedImagesOnly) {
				dialog.allowSaveToCourseFiles = false;
				dialog.areaFilters = 'OuFiles,MyComputer,Url';
			}

			dialog.responseKeys = 'files,IsDecorative,ImageAlt';
			dialog.fileType = fileTypes.Image;
			dialog.uploadHelp = fileUploadForAllUsers ? 'Framework.HtmlEditor2.lblInsertImageInlineHelp' : '';
			dialog.opened = true;

			dialog.addEventListener('d2l-htmleditor-file-selector-dialog-close', (e) => {
				if (!e.detail) return;

				let src;
				const file = e.detail.files[0];
				if (file.FileSystemType.toLowerCase() === 'content') {

					// pre-pend orgUnitPath if necessary
					src = file.FileId;
					if (src.substr(0, 1) !== '/') src = orgUnitPath + src;

					// any special characters in this src should be treated as part of the file path and not
					// in the context of the url (e.g. & is not the url meaning of & ) so it's safe to encode the whole thing.
					src = src.split('/').reduce((acc, cur) => {
						return `${acc}/${encodeURIComponent(cur)}`;
					});

					// IE doesn't recognize extensions when the dot is encoded
					//src = src.replace( "%2E", "." );

				} else if (file.FileSystemType.toLowerCase() === 'temp') {
					src = `/d2l/lp/files/temp/${file.FileId}/View`;
				} else if (file.FileSystemType.toLowerCase() === 'external') {
					src = file.FileId;
				}

				root.host.files.push(
					new FileData(
						file.FileSystemType,
						file.FileId,
						file.FileName,
						file.Size,
						src
					)
				);

				const tempImg = document.createElement('img');
				tempImg.setAttribute('src', src);
				tempImg.setAttribute('alt', e.detail.IsDecorative ? '' : e.detail.ImageAlt);
				tempImg.setAttribute('title', e.detail.IsDecorative ? '' : e.detail.ImageAlt);
				tempImg.setAttribute('data-d2l-editor-default-img-style', 'true');
				tempImg.style.maxWidth = '100%';

				editor.execCommand('mceInsertContent', false, tempImg.outerHTML);
				root.host.focus();

			}, { once: true });

		}
	});

});

class FileSelectorDialog extends RequesterMixin(LitElement) {

	static get properties() {
		return {
			allowSaveToCourseFiles: { type: Boolean },
			areaFilters: { type: String },
			fileType: { type: Number },
			forceSaveToCourseFiles: { type: Boolean },
			opened: { type: Boolean, reflect: true },
			responseKeys: { type: String },
			uploadHelp: { type: String }
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
		this.allowSaveToCourseFiles = false;
		this.areaFilters = 'Url';
		this.fileType = fileTypes.All;
		this.forceSaveToCourseFiles = false;
		this.opened = false;
		this.responseKeys = 'files';
		this.uploadHelp = '';
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

			const tempResult = await openLegacyDialog(
				getComposedActiveElement(),
				`/d2l/common/dialogs/file/main.d2l
					?ou=${this._orgUnitId}
					&af=${this.areaFilters}
					&am=0
					&fsc=${this.forceSaveToCourseFiles ? '1' : '0'}
					&asc=${this.allowSaveToCourseFiles ? '1' : '0'}
					&mfs=0
					&afid=1
					&uih=${this.uploadHelp}
					&f=${this.fileType}`,
				{
					srcCallback: 'DialogCallback',
					responseDataKey: this.responseKeys,
					width: 700,
					height: 520,
					buttons: [
						{ IsEnabled: true, IsPrimary: true, Key: 'BTN_next', ResponseType: 1, Param: 'next', Text: 'Insert' },
						{ IsEnabled: true, IsPrimary: false, Key: 'BTN_back', ResponseType: 1, Param: 'back', Text: 'Back' },
						{ IsEnabled: true, IsPrimary: false, ResponseType: 0, Text: 'Cancel' }
					]
				},
				{ byPassOpenerFocus: true }
			);

			this.opened = false;

			let result;
			if (tempResult) {
				result = {};
				const keys = this.responseKeys.split(',');
				keys.forEach((key, index) => {
					result[key] = tempResult[index];
				});
			}

			this.dispatchEvent(new CustomEvent(
				'd2l-htmleditor-file-selector-dialog-close', {
					bubbles: true,
					detail: result
				}
			));

		}

	}

}
customElements.define('d2l-htmleditor-file-selector-dialog', FileSelectorDialog);
