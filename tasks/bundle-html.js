const fs = require('fs-extra');
const {getDestDir} = require('./paths');

const enLocale = fs.readFileSync('src/_locales/en.config', {encoding: 'utf8'}).replace(/^#.*?$/gm, '');
global.chrome = global.chrome || {};
global.chrome.i18n = global.chrome.i18n || {};
global.chrome.i18n.getMessage = global.chrome.i18n.getMessage || ((name) => {
    const index = enLocale.indexOf(`@${name}`);
    if (index < 0) {
        throw new Error(`Message @${name} not found`);
    }
    const start = index + name.length + 1;
    let end = enLocale.indexOf('@', start);
    if (end < 0) {
        end = enLocale.length;
    }
    const message = enLocale.substring(start, end).trim();
    return message;
});
global.chrome.i18n.getUILanguage = global.chrome.i18n.getUILanguage || (() => 'en-US');

const tsConfig = require('../src/tsconfig.json');
require('ts-node').register({
    ...tsConfig,
    compilerOptions: {
        ...tsConfig.compilerOptions,
        module: 'commonjs',
    },
    ignore: [
        '/node_modules\/(?!malevic).*/',
    ]
});
const Malevic = require('malevic');
const DevToolsBody = require('../src/ui/devtools/components/body').default;
const PopupBody = require('../src/ui/popup/components/body').default;
const CSSEditorBody = require('../src/ui/stylesheet-editor/components/body').default;
const {getMockData, getMockActiveTabInfo} = require('../src/ui/connect/mock');

async function bundlePopupHtml({dir}) {
    let html = await fs.readFile('src/ui/popup/index.html', 'utf8');
    const data = getMockData({isReady: false});
    const tab = getMockActiveTabInfo();
    const actions = null;
    const bodyText = Malevic.renderToString(PopupBody({data, tab, actions}));
    html = html.replace('$BODY', bodyText);
    await fs.outputFile(`${dir}/ui/popup/index.html`, html);
}

async function bundleDevToolsHtml({dir}) {
    let html = await fs.readFile('src/ui/devtools/index.html', 'utf8');
    const data = getMockData();
    const actions = null;
    const bodyText = Malevic.renderToString(DevToolsBody({data, actions}));
    html = html.replace('$BODY', bodyText);
    await fs.outputFile(`${dir}/ui/devtools/index.html`, html);
}

async function bundleCSSEditorHtml({dir}) {
    let html = await fs.readFile('src/ui/stylesheet-editor/index.html', 'utf8');
    const data = getMockData();
    const tab = getMockActiveTabInfo();
    const actions = null;
    const bodyText = Malevic.renderToString(CSSEditorBody({data, tab, actions}));
    html = html.replace('$BODY', bodyText);
    await fs.outputFile(`${dir}/ui/stylesheet-editor/index.html`, html);
}

async function bundleHtml({production}) {
    const dir = getDestDir({production});
    await bundlePopupHtml({dir});
    await bundleDevToolsHtml({dir});
    await bundleCSSEditorHtml({dir});
}

module.exports = bundleHtml;
