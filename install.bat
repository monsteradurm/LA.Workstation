cd c:/_LA.Workstation/_LA.NodeJS.Services
call npm install
call npm install pm2 -g 
call npm install pm2-windows-startup -g
call npm install electron -g
call pm2 kill
call pm2 delete all
call pm2-startup install
call pm2 start start.js --name LA.NodeJS.Services
call pm2 save

cd c:/_LA.Workstation/_LA.Environment.Sync
call npm install -g node-windows
call npm install
call npm install node-windows@1.0.0-beta.6
call npm link node-windows
call node install.js

cd c:/_LA.Workstation/_LA.Git.Sync
call npm install
call npm install node-windows@1.0.0-beta.6
call npm link node-windows
call node install.js

cd c:/_LA.Workstation/_LA.Workstation.Sync
call npm install
call npm link node-windows
call node install.js