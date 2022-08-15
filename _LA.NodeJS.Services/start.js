const exec = require('child_process').exec;
exec('"C:/_LA.Workstation/_LA.NodeJS.Services/node_modules/.bin/electron.cmd" "C:/_LA.Workstation/_LA.NodeJS.Services/tray/laws.js"',
    {
        windowsHide: true
    });