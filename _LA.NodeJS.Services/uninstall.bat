cd c:/_LA.Workstation/_LA.NodeJS.Services
call pm2 kill
call pm2 delete all
call taskkill /IM electron.exe /F

cd c:/_LA.Workstation/_LA.Environment.Sync
call node uninstall.js

cd c:/_LA.Workstation/_LA.Workstation.Sync
call node uninstall.js