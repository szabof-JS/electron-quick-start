# Összefoglaló az eddigi Electron master process profiling próbálkozásokról

Mivel egyik próbálkozás sem vezetett eredményre, ezért (hogy a saját alkalmazásunkból eredő esetleges hibákat kizárjam) [a "hivatalos" `electron-quick-start` repót](https://github.com/electron/electron-quick-start) használtam.

Az itt leírt lépéseket Node v6.1.0, v6.3.1 és v7.4.0 illetve Electron v1.4.13, v1.4.15 és v1.2.0 esetén is kipróbáltam. Minden lépés Windows 10 64-bit OS-en történt. (Maga ez az összefoglaló Node v7.4.0 és Electron v1.4.15 mellett került rögzítésre.)

## Első körben [a hivatalos leírás](http://electron.atom.io/docs/tutorial/debugging-main-process-node-inspector/) szerint indultam el:

### Először [az `electron-inspector`-ral próbálkoztam](http://electron.atom.io/docs/tutorial/debugging-main-process-node-inspector/#use-electron-inspector-for-debugging):
A node-gyp telepítést már korábban (más projektben) megcsináltam, ezért azt kihagytam.
A 3. lépésben az `npm install electron-inspector --save-dev` telepítésnél hibát kapok.

(Lehet, hogy mégsem lenne jó a `node-gyp` a gépemen? Ennek ellentmond az, hogy később /a `node-inspector`-féle leírás 4. lépésében/ sikeresen fordítottam `node-gyp`-vel a `v8-debugger` és a `v8-profiler` modulokat.)

### Ezután [a node-inspector megoldást](http://electron.atom.io/docs/tutorial/debugging-main-process-node-inspector/#use-node-inspector-for-debugging) néztem meg:
Az 1-3. lépések simán lefutottak.

A 4. lépésben így futtattam le a parancsokat (az aktuális Electron verzió az 1.4.15 volt):
```
node_modules/.bin/node-pre-gyp --target=1.4.15 --runtime=electron --fallback-to-build --directory node_modules/v8-debug/ --dist-url=https://atom.io/download/atom-shell reinstall
node_modules/.bin/node-pre-gyp --target=1.4.15 --runtime=electron --fallback-to-build --directory node_modules/v8-profiler/ --dist-url=https://atom.io/download/atom-shell reinstall
```

Az 5. lépésben ezt a parancsot használtam: `node_modules/.bin/electron --debug=5858 .`

A 6. lépésben így indítottam el a `node-inspector`-t: `ELECTRON_RUN_AS_NODE=true node_modules/.bin/electron node_modules/node-inspector/bin/inspector.js`

Ezt követően a leírás alapján megnyitottam a profilert: [`http://127.0.0.1:8080/debug?ws=127.0.0.1:8080&port=5858`](http://127.0.0.1:8080/debug?ws=127.0.0.1:8080&port=5858)

Első látásra minden jónak tűnt, de a profile rögzítés végén a "Stop"-ra kattintva nem történik semmi: nem jön elő semmi, a kiírás még mindig "recording" marad. Ha a "Sources" fülre kattintok, akkor nem jönnek be a .js forrás állományok - gyakorlatilag nem működik semmi sem.

## Ezután keresni kezdtem az egyéb megoldásokat:

### Megpróbáltam API-n keresztül elérni a profilert:
A hivatalos `electron-quick-start`˛repóba csak a minimális szükséges módosításokat tettem bele (kommenttel jelölve őket `// # Modification...`)

A fenti lépésekben Electron v1.4.15-re újrafordított `v8-profiler` használatával kezdtem.

Ezután telepítettem a kifejezetten Electronra módosított `v8-profiler` két változatát is ([ezt](https://github.com/jrieken/v8-profiler/tree/fixRequireCall) illetve [ezt](https://github.com/RisingStack/v8-profiler)).

A kiegészített appot ebben a repóban lehet megtalálni: [github.com/szabof-JS/electron-quick-start](https://github.com/szabof-JS/electron-quick-start).

Mindhárom fenti `v8-profiler` API próbálkozás hasonló eredményt (hibát) ad.

#### Az első (fenti lépések szerint fordított) `v8-profiler` eredménye:
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
Észrevettem, hogy a `./build/profiler/v5.6.5/node-v50-win32-x64` mappa nem létezik, ezért a létező `./build/profiler/v5.6.5/electron-v1.2-win32-x64` mappát duplikáltam a tartalmával együtt ezen a néven. Sajnos ez sem vezetett eredményre:
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

#### A második ([ebből a repóból származó](https://github.com/jrieken/v8-profiler/tree/fixRequireCall)) eredménye:
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

#### A harmadik ([ebből a repóból származó](https://github.com/RisingStack/v8-profiler)) eredménye:
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
Észrevettem, hogy a `./build/profiler/v5.6.5/node-v50-win32-x64` mappa itt sem létezik, ezért a létező `./build/profiler/v5.6.5/electron-v1.2-win32-x64` mappát duplikáltam a tartalmával együtt ezen a néven. Sajnos ez sem vezetett eredményre:
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