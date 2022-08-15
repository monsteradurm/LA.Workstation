const { app, BrowserWindow, Tray, Menu, shell } = require('electron');
const exec = require('child_process').exec;

//exec('"C:/_LA.Workstation/_LA.Workstation.Sync/node_modules/.bin/nodemon.cmd" "C:/_LA.Workstation/_LA.Workstation.Sync/server.js"')
//import('../../_LA.Environment.Sync/main/timer.js');
//const title = 'LA.Workstation.Sync'

app.whenReady().then(() => {
    const tray = new Tray('C:/_LA.Workstation/_LA.NodeJS.Services/tray/LA.ico')
    const contextMenu = Menu.buildFromTemplate([
        { label: 'LA.Workstation.Client', type: 'normal', click: (evt) => {
              shell.openExternal(`http://localhost:4000`)
            } 
        },
        { type: 'separator' },
        { label: 'LA.Environment.Logs', type: 'normal', click: (evt) => {
            const win = new BrowserWindow({
                width: 800,
                height: 600,
              });

              win.loadFile('c:/_LA.Workstation/_LA.Environment.Sync/main/pages/index.html')
            }
        },
      ])
      
      tray.setContextMenu(contextMenu)
      tray.setToolTip(title)
      tray.setTitle(title)
  });

  app.on('before-quit', (e) => { e.preventDefault() });