
let contextPromise;

export function getContext() {
	if (contextPromise) return contextPromise;

	contextPromise = new Promise(async resolve => { // eslint-disable-line no-async-promise-executor
		let context;
		if (window.ifrauclient) {
			const ifrauClient = await window.ifrauclient().connect();
			const editorService = await ifrauClient.getService('htmleditor', '0.1');
			context = JSON.parse(await editorService.getContext());
			context.host = await ifrauClient.request('valenceHost');
			resolve(context);
		} else {
			context = JSON.parse(document.documentElement.getAttribute('data-he-context'));
			if (context) {
				context.host = '';
				resolve(context);
			} else {
				resolve();
			}
		}

	});

	return contextPromise;
}

export function hasLmsContext() {
	return D2L.LP || window.ifrauclient;
}

let dialogService;

export async function openDialogWithParam(opener, location, params, settings) {
	if (window.ifrauclient) {

		if (!dialogService) {
			const ifrauClient = await window.ifrauclient().connect();
			dialogService = await ifrauClient.getService('dialog', '0.1');
		}

		try {
			const result = await dialogService.openWithParam(
				location,
				params,
				settings
			);
			return result;
		} catch (e) {
			// aborting the dialog rejects the promise so we swallow exception here
			return '';
		}

	} else {

		const result = await (new Promise(resolve => {
			const dialogResult = D2L.LP.Web.UI.Desktop.MasterPages.Dialog.OpenWithParam(
				opener,
				new D2L.LP.Web.Http.UrlLocation(location),
				params,
				settings
			);

			dialogResult.AddReleaseListener(resolve);
			dialogResult.AddListener(stuff => resolve(stuff));
		}));

		return result;
	}
}

export async function openLegacyDialog(opener, location, settings) {
	if (window.ifrauclient) {

		if (!dialogService) {
			const ifrauClient = await window.ifrauclient().connect();
			dialogService = await ifrauClient.getService('dialog', '0.1');
		}

		try {
			const result = await dialogService.openLegacy(
				location,
				{
					PreferredSize: {
						PreferredHeight: settings.height,
						PreferredWidth: settings.width
					}
				},
				settings.buttons,
				settings.srcCallback,
				settings.responseDataKey
			);
			return result;
		} catch (e) {
			// aborting the dialog rejects the promise so we swallow exception here
			return '';
		}

	} else {

		const result = await (new Promise(resolve => {
			const dialogResult = D2L.LP.Web.UI.Legacy.MasterPages.Dialog.Open(
				opener,
				new D2L.LP.Web.Http.UrlLocation(location),
				settings.srcCallback,
				null,
				settings.responseDataKey,
				settings.width,
				settings.height,
				null,
				settings.buttons,
				false,
				null
			);

			dialogResult.AddReleaseListener(resolve);
			dialogResult.AddListener(stuff => resolve(stuff));
		}));

		return result;
	}
}
