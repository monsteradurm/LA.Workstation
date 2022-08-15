import * as nw from 'node-windows';
const Service = nw.default.Service;

var svc = new Service({
  name:'LA.Git.Sync',
  description: 'LA.Git.Sync',
  script: 'C:/_LA.Workstation/_LA.Git.Sync/timer.js',
});

svc.on('install',function(){
  svc.start();
});

svc.install();