import { requestInstance } from '@brightspace-ui/core/mixins/provider-mixin.js';

let mentionsService;

export async function queryMentions(editor, term) {
	if (window.ifrauclient) {

		if (!mentionsService) {
			const ifrauClient = await window.ifrauclient().connect();
			mentionsService = await ifrauClient.getService('mentions', '0.1');
		}

		return await mentionsService.queryUsers(term);

	} else {

		const orgUnitId = requestInstance(editor, 'orgUnitId');

		return new Promise(resolve => {

			D2L.LP.Web.UI.Rpc.Connect(
				D2L.LP.Web.UI.Rpc.Verbs.GET,
				new D2L.LP.Web.Http.UrlLocation('/d2l/lp/htmleditor/tinymce/mentionsSearchQuery'),
				{ searchTerm: term, orgUnitId: orgUnitId },
				{ success: resolve }
			);

		});

	}
}
