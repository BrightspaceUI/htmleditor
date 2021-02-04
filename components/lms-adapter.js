
let contextPromise;

export function getContext() {
	if (contextPromise) return contextPromise;

	contextPromise = new Promise(async resolve => { // eslint-disable-line no-async-promise-executor
		if (window.ifrauclient) {
			const ifrauClient = await window.ifrauclient().connect();
			const editorService = await ifrauClient.getService('htmleditor', '0.1');
			resolve(JSON.parse(await editorService.getContext()));
		} else {
			resolve(JSON.parse(document.documentElement.getAttribute('data-he-context')));
		}
	});

	return contextPromise;
}

export function hasLmsContext() {
	return D2L.LP || window.ifrauclient;
}

let dialogService;

export async function openLegacyDialog(location, settings) {
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
				settings.opener,
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
