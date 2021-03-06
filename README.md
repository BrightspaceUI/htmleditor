# d2l-htmleditor

[![NPM version](https://img.shields.io/npm/v/@brightspace-ui/htmleditor.svg)](https://www.npmjs.org/package/@brightspace-ui/htmleditor)

An HTML editor that integrates with Brightspace. Coming soon!

## Installation

To install from NPM:

```shell
npm install @brightspace-ui/htmleditor
```

## Usage

**Important**: user-authored HTML must be trusted or properly sanitized!

Import the editor component:
```javascript
import '@brightspace-ui/htmleditor/htmleditor.js';
```

HTML fragment:
```html
<d2l-htmleditor html="..." label="..."></d2l-htmleditor>
```

HTML document (including `head` & `body`):
```html
<d2l-htmleditor html="..." label="..." full-page></d2l-htmleditor>
```

Types of editors (toolbar features):
```html
<d2l-htmleditor html="..." label="..." type="full|inline|inline-limited"></d2l-htmleditor>
```

**Note**: Inline/inline-limited modes are currently in development. The current experience for these modes is not reflective of their intended design and will definitely change. Use at your own risk.

**Properties:**

| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Property&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Type&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Description |
|--|--|--|
| `attached-images-only` | Boolean | Whether or not to restrict image uploads to attachments and prevent saving to course/shared files. |
| `auto-save` | Boolean | Whether or not to prompt the user when navigating away from the page while the editor has unsaved content. |
| `disabled` | Boolean | Whether the content is read-only. |
| `files` | Array | Read-only. An array of FileInfo objects for files added. |
| `file-upload-for-all-users` | Boolean | Whether or not to enable file uploads to course or shared files. |
| `full-page` | Boolean | Whether an HTML document or fragment is being authored. |
| `full-page-font-color` | String, default: `'#494c4e'` (ferrite) | The `body` font color. Only applies when `full-page` is `true`. |
| `full-page-font-family` | String, default: Browser default | The `body` font. Only applies when `full-page` is `true`. |
| `full-page-font-size` | String, default: Browser default | The `body` font size. Only applies when `full-page` is `true`. |
| `height` | String, default: `'355px'` | Initial height of the editor in `px`, `rem`, or `%`. |
| `html` | String, default: `''` | The HTML being authored. |
| `initializationComplete` | Promise | Read-only. Fulfilled when the editor has been fully initialized; pending otherwise. |
| `isDirty` | Boolean | Read-only. Whether or not the editor is [dirty](https://www.tiny.cloud/docs/api/tinymce/tinymce.editor/#isdirty). |
| `label` | String, required | Label for the editor. |
| `label-hidden` | Boolean | Hides the label visually. |
| `mentions` | Boolean | Whether or not to enable [@mentions](https://www.tiny.cloud/docs/enterprise/mentions/). |
| `no-filter` | Boolean | Whether or not to disable filtering for the content. |
| `no-spellchecker` | Boolean | Whether or not to disable spell checking. |
| `paste-local-images` | Boolean | Whether or not to enable local image pasting and drag-and-drop. |
| `type` | String, default: `'full'` | Whether to render the editor in `full`, `inline`, or `inline-limited` mode. |
| `width` | String, default: 100% of bounding container | Initial width of the editor. |
| `word-count-in-footer` | Boolean | Whether or not to display the current word/character counts in the editor footer.

**Methods:**

| Method | Returns | Description |
|--|--|--|
| `focus()` | | Places focus in the editor. |

**Events:**

| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Event&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Properties | Description |
|--|--|--|
| `d2l-htmleditor-blur` | None | Dispatched when TinyMCE fires a blur event on the editor. |
| `d2l-htmleditor-image-upload-complete` | None | Dispatched when images finish uploading to the editor. If multiple images are being uploaded, the event will only be dispatched once all images are uploaded. |
| `d2l-htmleditor-image-upload-start` | None | Dispatched when images start uploading to the editor. If multiple images are being uploaded, the event will only be dispatched for the first image. |

## Integration

Together, the feature flag and config variable specify whether the new editor should be rendered.

* `F15913-html-editor-alignment` feature flag for the new editor
* `d2l.Tools.WYSIWYG.NewEditor` config variable for the new editor

The `IHtmlEditorAlignmentSwitch` (C#) and `D2L.LP.Web.UI.Desktop.Controls.HtmlEditor.IsNewEditorEnabled()` (JavaScript) can be used to check the net result of the feature flag and config variable for conditional rendering.

## Developing, Testing and Contributing

After cloning the repo, run `npm install` to install dependencies, `npm run build` to extract the supported tinyMCE languages.

### Running the demos

To start an [es-dev-server](https://open-wc.org/developing/es-dev-server.html) that hosts the demo page and tests:

```shell
npm start
```

### Skinning

We use a custom skin for the HTML editor generated from [TinyMCE's skinning tool](http://skin.tiny.cloud/t5/). To modify the skin, upload `/tinymce/skin-params.json` from this repo into the skinning tool, make any necessary changes, download/unzip the skin, and place the contained `skins/ui`folder in `/tinymce/skins/ui`. The skinning tool does not generate `skin.shadowdom.css` or `skin.shadowdom.min.css`, so these files will need to be edited directly if changes are necessary. If adding a new skin, these files will need to be copied from an existing skin.

### Linting

```shell
# eslint and lit-analyzer
npm run lint

# eslint only
npm run lint:eslint

# lit-analyzer only
npm run lint:lit
```

### Testing

```shell
# lint, unit test and visual-diff test
npm test

# lint only
npm run lint

# unit tests only
npm run test:headless

# debug or run a subset of local unit tests
# then navigate to `http://localhost:9876/debug.html`
npm run test:headless:watch
```

### Visual Diff Testing

This repo uses the [@brightspace-ui/visual-diff utility](https://github.com/BrightspaceUI/visual-diff/) to compare current snapshots against a set of golden snapshots stored in source control.

The golden snapshots in source control must be updated by Github Actions.  If your PR's code changes result in visual differences, a PR with the new goldens will be automatically opened for you against your branch.

If you'd like to run the tests locally to help troubleshoot or develop new tests, you can use these commands:

```shell
# Install dependencies locally
npm i mocha -g
npm i @brightspace-ui/visual-diff puppeteer --no-save

# run visual-diff tests
mocha './**/*.visual-diff.js' -t 40000

# subset of visual-diff tests:
mocha './**/*.visual-diff.js' -t 40000 -g some-pattern

# update visual-diff goldens
mocha './**/*.visual-diff.js' -t 40000 --golden
```

## Versioning & Releasing

> TL;DR: Commits prefixed with `fix:` and `feat:` will trigger patch and minor releases when merged to `master`. Read on for more details...

The [sematic-release GitHub Action](https://github.com/BrightspaceUI/actions/tree/master/semantic-release) is called from the `release.yml` GitHub Action workflow to handle version changes and releasing.

### Version Changes

All version changes should obey [semantic versioning](https://semver.org/) rules:
1. **MAJOR** version when you make incompatible API changes,
2. **MINOR** version when you add functionality in a backwards compatible manner, and
3. **PATCH** version when you make backwards compatible bug fixes.

The next version number will be determined from the commit messages since the previous release. Our semantic-release configuration uses the [Angular convention](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular) when analyzing commits:
* Commits which are prefixed with `fix:` or `perf:` will trigger a `patch` release. Example: `fix: validate input before using`
* Commits which are prefixed with `feat:` will trigger a `minor` release. Example: `feat: add toggle() method`
* To trigger a MAJOR release, include `BREAKING CHANGE:` with a space or two newlines in the footer of the commit message
* Other suggested prefixes which will **NOT** trigger a release: `build:`, `ci:`, `docs:`, `style:`, `refactor:` and `test:`. Example: `docs: adding README for new component`

To revert a change, add the `revert:` prefix to the original commit message. This will cause the reverted change to be omitted from the release notes. Example: `revert: fix: validate input before using`.

### Releases

When a release is triggered, it will:
* Update the version in `package.json`
* Tag the commit
* Create a GitHub release (including release notes)
* Deploy a new package to NPM

### Releasing from Maintenance Branches

Occasionally you'll want to backport a feature or bug fix to an older release. `semantic-release` refers to these as [maintenance branches](https://semantic-release.gitbook.io/semantic-release/usage/workflow-configuration#maintenance-branches).

Maintenance branch names should be of the form: `+([0-9])?(.{+([0-9]),x}).x`.

Regular expressions are complicated, but this essentially means branch names should look like:
* `1.15.x` for patch releases on top of the `1.15` release (after version `1.16` exists)
* `2.x` for feature releases on top of the `2` release (after version `3` exists)
