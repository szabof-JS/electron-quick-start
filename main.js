// # Modified version of the official repo https://github.com/electron/electron-quick-start
// # Modification are related to profiling only using v8-profiler
// # First tried using v8-profiler build according to http://electron.atom.io/docs/tutorial/debugging-main-process-node-inspector/#use-node-inspector-for-debugging
// #    - $ node_modules/.bin/node-pre-gyp --target=1.4.15 --runtime=electron --fallback-to-build --directory node_modules/v8-debug/ --dist-url=https://atom.io/download/atom-shell reinstall
// #    - $ node_modules/.bin/node-pre-gyp --target=1.4.15 --runtime=electron --fallback-to-build --directory node_modules/v8-profiler/ --dist-url=https://atom.io/download/atom-shell reinstall
// # Then tried using modified v8-profiler from https://github.com/jrieken/v8-profiler/tree/fixRequireCall
// # At last I tried another modified v8-profiler module from https://github.com/RisingStack/v8-profiler

const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// # Modification for profiling #1:
const fs = require('fs');
const profiler = require('@risingstack/v8-profiler');
//const profiler = require('v8-profiler');
const profileName = "test";
// # Modification for profiling #1 - END

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// # Modification for profiling #2:
// app.on('ready', createWindow)
app.on('ready', () => {
  profiler.startProfiling(profileName, true);

  createWindow();
});
// # Modification for profiling #2 - END

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // # Modification for profiling #3:
  const profile = profiler.stopProfiling(profileName);
  profile.export((error, result) => {
    console.log("================> writing profiler data to '" + profileName + ".cpuprofile'");
    fs.writeFileSync(profileName + ".cpuprofile", result);
    profile.delete();
    process.exit();
  });
  // # Modification for profiling #3 - END

  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.