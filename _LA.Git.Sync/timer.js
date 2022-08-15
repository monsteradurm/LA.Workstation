import path from "path";
import fs from "fs";
import util from "util";
import { from, switchMap, timer } from "rxjs";
import { tap } from "rxjs/operators";
import {fileURLToPath} from 'url';
import moment from 'moment';
import * as sg from 'simple-git';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var log_file = fs.createWriteStream(__dirname + '/../_LA.Git.Sync.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log(__dirname + '../_LA.Git.Sync.log');
console.log = function(d) { //
    log_file.write(new moment().format('HH:MM:SS DD/MM/YYYY') + '\t' + util.format(d) + '\n');
    log_stdout.write(new moment().format('HH:MM:SS DD/MM/YYYY') + '\t' + util.format(d) + '\n');
  };

  const git = sg.simpleGit('C:/_LA.Workstation', {  });
  timer(0, 1024 * 600).pipe(
    tap(t => console.log("Git Service --> Service Timer, " + t)),
    switchMap(() => {
        console.log('git reset --hard origin/master');
        return git.reset('hard', 'origin/master');
    }),
    tap(console.log),
    switchMap(() => {
        console.log('git fetch --all');
        return git.fetch('all');
    }),
    tap(console.log),
    switchMap(() => {
        console.log('git pull -f');
        return git.pull('f');
    }),
    tap(console.log),
    switchMap(() => {
        console.log('git clean -f');
        return git.clean(sg.CleanOptions.FORCE);
    })
    /*
    switchMap(from(git.fetch())),
    switchMap(from(git.pull('origin', 'master'))),
    switchMap(from(git.clean(sg.CleanOptions.FORCE)))*/
  ).subscribe(() => { 

})