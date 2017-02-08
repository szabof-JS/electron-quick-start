# Summary of my attempts to do profiling for the main process of Electron

As none of my attempts were successful, I decided to use a simple 'standard' app ([`electron-quick-start` repo](https://github.com/electron/electron-quick-start)) this way possible errors of my own app can be excluded.

The steps written here were done using Node v6.1.0, v6.3.1, and v7.4.0 and Electron v1.4.13, v1.4.15, and v1.2.0. All steps were done on Windows 10 64-bit. (This summary was finalized on Node v7.4.0 and Electron 1.4.15.)

## I started using this [official documentation](http://electron.atom.io/docs/tutorial/debugging-main-process-node-inspector/):

### First I tried the [`electron-inspector` solution](http://electron.atom.io/docs/tutorial/debugging-main-process-node-inspector/#use-electron-inspector-for-debugging):
I have already had a working `node-gyp` installation, so I skipped it this time.
In step 3 command `npm install electron-inspector --save-dev` gives me error.

(Would my `node-gyp` installation be wrong? Not likely as below in step 4 of the `node-inspector` solution I managed to build `v8-debugger`, and `v8-profiler` using `node-gyp`.)

### Then I tried the [`node-inspector` solution](http://electron.atom.io/docs/tutorial/debugging-main-process-node-inspector/#use-node-inspector-for-debugging):
Steps 1-3 were done successfully.

In step 4 I used these commands (for actual Electron version 1.4.15):
```
node_modules/.bin/node-pre-gyp --target=1.4.15 --runtime=electron --fallback-to-build --directory node_modules/v8-debug/ --dist-url=https://atom.io/download/atom-shell reinstall
node_modules/.bin/node-pre-gyp --target=1.4.15 --runtime=electron --fallback-to-build --directory node_modules/v8-profiler/ --dist-url=https://atom.io/download/atom-shell reinstall
```

In step 5 I used this command: `node_modules/.bin/electron --debug=5858 .`

In step 6 I started `node-inspector` using this command: `ELECTRON_RUN_AS_NODE=true node_modules/.bin/electron node_modules/node-inspector/bin/inspector.js`

Then I opened the profiler according to the documentation using this URL: [`http://127.0.0.1:8080/debug?ws=127.0.0.1:8080&port=5858`](http://127.0.0.1:8080/debug?ws=127.0.0.1:8080&port=5858)

At first sight, everything seemed to be OK. I started a CPU profiling but after clicking on "Stop" button nothing happened (it was still "recording"). Then I tried to switch to Sources tab and I wasn't able to get the source code. In practice nothing worked.

## Then I tried to find other solutions:

### I tried to use v8-profile in the code using it's API:
[I forked repo `electron-quick-start`](https://github.com/szabof-JS/electron-quick-start) and only made modifications as few as possible in order to create a profile using `v8-profiler`. (All my modifications are signed by comments like `// # Modification...`.)

First I tried using `v8-profiler` rebuilt by myself according to the official documentation (see above).

Then I installed two `v8-profiler` clones built for Electron v1.3.0+ ([this one from jrieken](https://github.com/jrieken/v8-profiler/tree/fixRequireCall) and [this one from RisingStack](https://github.com/RisingStack/v8-profiler)).

All of these tries gave similar errors:
```
App threw an error during load
Error: The specified procedure could not be found.
...
```

#### The result of my first try (based on my own built `v8-profiler`:
```
$ node_modules/.bin/electron .

App threw an error during load
Error: Cannot find module './build/profiler/v5.6.5/node-v50-win32-x64/profiler.node'
    at Module._resolveFilename (module.js:455:15)
    at Function.Module._resolveFilename (C:\_CODE\electron-quick-start\node_modules\electron\dist\resources\electron.asar\common\reset-search-paths.js:35:12)
    at Function.Module._load (module.js:403:25)
    at Module.require (module.js:483:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (C:\_CODE\electron-quick-start\node_modules\v8-profiler\v8-profiler.js:2:15)
    at Module._compile (module.js:556:32)
    at Object.Module._extensions..js (module.js:565:10)
    at Module.load (module.js:473:32)
    at tryModuleLoad (module.js:432:12)

```
I realized that folder `./build/profiler/v5.6.5/node-v50-win32-x64` doesn't exist, so I copied the existing `./build/profiler/v5.6.5/electron-v1.2-win32-x64` folder and its content to the expected folder. Sadly this didn't solve the issue, I got the following error:
```
$ node_modules/.bin/electron  .

App threw an error during load
Error: The specified procedure could not be found.
\\?\C:\_CODE\electron-quick-start\node_modules\v8-profiler\build\profiler\v5.6.5\node-v50-win32-x64\profiler.node
    at Error (native)
    at process.module.(anonymous function) [as dlopen] (ELECTRON_ASAR.js:173:20)
    at Object.Module._extensions..node (module.js:583:18)
    at Object.module.(anonymous function) [as .node] (ELECTRON_ASAR.js:173:20)
    at Module.load (module.js:473:32)
    at tryModuleLoad (module.js:432:12)
    at Function.Module._load (module.js:424:3)
    at Module.require (module.js:483:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (C:\_CODE\electron-quick-start\node_modules\v8-profiler\v8-profiler.js:2:15)

```

#### The result of my second try (based on [this repo](https://github.com/jrieken/v8-profiler/tree/fixRequireCall)):
```
$ node_modules/.bin/electron  .

App threw an error during load
Error: The specified procedure could not be found.
\\?\C:\_CODE\electron-quick-start\node_modules\v8-profiler\build\Release\profiler.node
    at Error (native)
    at process.module.(anonymous function) [as dlopen] (ELECTRON_ASAR.js:173:20)
    at Object.Module._extensions..node (module.js:583:18)
    at Object.module.(anonymous function) [as .node] (ELECTRON_ASAR.js:173:20)
    at Module.load (module.js:473:32)
    at tryModuleLoad (module.js:432:12)
    at Function.Module._load (module.js:424:3)
    at Module.require (module.js:483:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (C:\_CODE\electron-quick-start\node_modules\v8-profiler\v8-profiler.js:2:15)

```

#### The result of my third try (based on [this repo](https://github.com/RisingStack/v8-profiler)):
```
$ node_modules/.bin/electron  .

App threw an error during load
Error: Cannot find module './build/profiler/v5.7.0/node-v50-win32-x64/profiler.node'
    at Module._resolveFilename (module.js:455:15)
    at Function.Module._resolveFilename (C:\_CODE\electron-quick-start\node_modules\electron\dist\resources\electron.asar\common\reset-search-paths.js:35:12)
    at Function.Module._load (module.js:403:25)
    at Module.require (module.js:483:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (C:\_CODE\electron-quick-start\node_modules\@risingstack\v8-profiler\v8-profiler.js:2:15)
    at Module._compile (module.js:556:32)
    at Object.Module._extensions..js (module.js:565:10)
    at Module.load (module.js:473:32)
    at tryModuleLoad (module.js:432:12)
```
I realized that folder `./build/profiler/v5.6.5/node-v50-win32-x64` doesn't exist here too, so I copied the existing `./build/profiler/v5.6.5/electron-v1.2-win32-x64` folder and its content to the expected folder. Sadly this didn't solve the issue, I got the following error:
```
$ node_modules/.bin/electron  .

App threw an error during load
Error: The specified procedure could not be found.
\\?\C:\_CODE\electron-quick-start\node_modules\@risingstack\v8-profiler\build\profiler\v5.7.0\node-v50-win32-x64\profiler.node
    at Error (native)
    at process.module.(anonymous function) [as dlopen] (ELECTRON_ASAR.js:173:20)
    at Object.Module._extensions..node (module.js:583:18)
    at Object.module.(anonymous function) [as .node] (ELECTRON_ASAR.js:173:20)
    at Module.load (module.js:473:32)
    at tryModuleLoad (module.js:432:12)
    at Function.Module._load (module.js:424:3)
    at Module.require (module.js:483:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (C:\_CODE\electron-quick-start\node_modules\@risingstack\v8-profiler\v8-profiler.js:2:15)
```