var Service = require('node-windows').Service;

var svc = new Service({
  name:'LA.Environment.Sync',
  description: 'LA.Environment.Sync',
  script: 'C:/_LA.Workstation/_LA.Environment.Sync/main/timer.js',
});

svc.on('install',function(){
  svc.start();
});

svc.install();