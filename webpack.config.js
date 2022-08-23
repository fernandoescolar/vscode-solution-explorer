/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const config = {
    target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    node: {
        __dirname: false
    },
    entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: { // the bundle is stored in the 'out' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, 'out'),
        filename: 'extension.js',
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    devtool: 'source-map',
    externals: {
        vscode: "commonjs vscode" // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    },
    resolve: { // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: ['.ts', '.js'],
        modules: [path.resolve(__dirname, 'node_modules')],
        alias: {
			["@SolutionExplorerProvider"]: path.resolve(__dirname, './src/SolutionExplorerProvider.ts'),
            ["@actions"]: path.resolve(__dirname, './src/actions'),
			["@commands"]: path.resolve(__dirname, './src/commands'),
			["@core"]: path.resolve(__dirname, './src/core'),
			["@events"]: path.resolve(__dirname, './src/events'),
			["@extensions"]: path.resolve(__dirname, './src/extensions'),
			["@logs"]: path.resolve(__dirname, './src/logs'),
			["@templates"]: path.resolve(__dirname, './src/templates'),
			["@tree"]: path.resolve(__dirname, './src/tree')
		}
    },
    resolveLoader: {
        modules: [ path.resolve(__dirname, 'node_modules') ]
    },
    module: {
		rules: [{
			test: /\.ts$/,
			exclude: /node_modules/,
			use: [{
				loader: 'ts-loader'
			}]
		}]
	},
    performance: {
		hints: false
	}
}

module.exports = config;
