'use strict';

import { app, protocol, BrowserWindow } from 'electron';
import bodyParser from 'body-parser';
import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
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

srv.use(express.static(path.join(__static, 'web'))); // eslint-disable-line no-undef

srv.post('/api/message', (req, res) => {
    try {
        const data = req.body;
        let msg = (data.message || '').replace('#speak', '').trim();
        data.message = msg;
        data.comment = `"${msg}"`;
        win.webContents.send('message', data);
    } catch (err) { console.log('Error. ' + err); }
    res.send(`Thanks for your message! ${JSON.stringify(req.body)}`);
});

srv.post('/api/keypad', (req, res) => {
    var data = req.body;
    var code = data.code || '';
    win.webContents.send('keypad-update', data);
    console.log('Set keypad code to ' + code + '.');
    res.send('Setting keypad code.');
});

srv.post('/api/intrusion', (req, res) => {
    var data = req.body;
    const payload = validateAuthorizationHeader(req.header('authorization'));
    if (payload.success) {
        win.webContents.send('intrusion-update', data);
        console.log('Intrusion status is ' + data.value + '.');
        res.send('Intrusion status: ' + data.value + '.');
    } else {
        res.send('Intrusion not accepted: Authorization failed.');
    }
});

srv.post('/api/shm', (req, res) => {
    var data = req.body;
    const payload = validateAuthorizationHeader(req.header('authorization'));
    if (payload.success) {
        win.webContents.send('shm-update', data);
        console.log('SHM status is: ' + data.value + '.');
        res.send('SHM status: ' + data.value + '.');
    } else {
        res.send('SHM update not accepted: Authorization failed.');
    }
});

srv.post('/api/:type', (req, res) => {
    const type = req.params.type;
    const payload = validateAuthorizationHeader(req.header('authorization'));
    if (payload.success) {
        try {
            const data = req.body;
            data.comment = `
                ${data.device.name} 
                ${data.type === 'level' ? 'level' : ''}
                ${data.type !== 'level' && data.device.name.slice(-1) === 's' ? 'are' : 'is'} 
                ${data.value}.
            `;
            if (data.device.capability === 'presence') {
                data.comment = `${data.device.name} has ${data.device.value === 'present' ? 'arrived' : 'left'}.`;
            }
            win.webContents.send('device-update', data);
        } catch (err) {
            console.log('Error. ' + err);
        }
        res.send(`Notification: ${type} ${JSON.stringify(req.body)}`);
    } else {
        res.send(`Notification: ${type} not accepted: Authorization failed.`);
    }
});

// JWT Security

function validateAuthorizationHeader (auth) {
    const authArray = auth ? auth.split(' ') : [];
    const jwt = authArray.length === 2 ? authArray[1] : '';
    try {
        let payload = jsonwebtoken.verify(jwt, settings.server.jwtHmac, {
            audience: settings.smartthingsIsConfigured.uri,
            issuer: settings.serverApiUri
        });
        payload.success = true;
        return payload;
    } catch (exc) {
        console.log(`Token is invalid. ${exc}`);
        return { 'success': false };
    }
}

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
    win = new BrowserWindow(settings.windowOptions);

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
    app.quit();
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
