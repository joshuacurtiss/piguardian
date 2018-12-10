'use strict';

import { app, protocol, BrowserWindow } from 'electron';
import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';
import Settings from './model/Settings';
import {
    createProtocol,
    installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib';

const isDevelopment = process.env.NODE_ENV !== 'production';
const APPDATADIR = app.getPath('userData');
const SETTINGSPATH = path.join(APPDATADIR, 'state.json');
const settings = new Settings(SETTINGSPATH);
const srv = express();
let win;

/**
 *  CONFIGURE WEB SERVER
 */

srv.use(bodyParser.json());

srv.use((req, res, next) => {
    const dt = new Date().toLocaleString();
    console.log(`${dt}: ${req.method} ${req.url}${req.body.length ? '\n' : ' '}${typeof req.body === 'object' ? JSON.stringify(req.body) : req.body}`);
    next();
});

srv.get('/', (req, res) => {
    res.send('Hello! Thanks for visiting!');
});

// TODO: This should receive a msg to reload the server if settings are updated.
srv.listen(settings.server.port, () => {
    console.log(`Listening on port ${settings.server.port}!`);
});

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true });

/**
 * Instantiates the main app window.
 */
function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
        backgroundColor: '#000',
        width: isDevelopment ? 1400 : 800,
        height: isDevelopment ? 600 : 480,
        webPreferences: {
            webSecurity: false
        }
    });

    if (isDevelopment || process.env.IS_TEST) {
    // Load the url of the dev server if in development mode
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) win.webContents.openDevTools();
    } else {
        createProtocol('app');
        // Load the index.html when not in development
        win.loadURL('app://./index.html');
    }

    win.on('closed', () => {
        win = null;
    });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
        await installVueDevtools();
    }
    createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', data => {
            if (data === 'graceful-exit') {
                app.quit();
            }
        });
    } else {
        process.on('SIGTERM', () => {
            app.quit();
        });
    }
}
