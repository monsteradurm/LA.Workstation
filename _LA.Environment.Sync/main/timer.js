import path from "path";
import fs from "fs";
import util from "util";
import { EnvironmentService } from "./services/Environment.service.js";
import { switchMap, timer } from "rxjs";
import { tap } from "rxjs/operators";
import {fileURLToPath} from 'url';
import moment from 'moment';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var log_file = fs.createWriteStream(__dirname + '/../../_LA.Environment.Sync.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log(__dirname + '../../_LA.Environment.Sync.log');
console.log = function(d) { //
    log_file.write(new moment().format('HH:MM:SS DD/MM/YYYY') + '\t' + util.format(d) + '\n');
    log_stdout.write(new moment().format('HH:MM:SS DD/MM/YYYY') + '\t' + util.format(d) + '\n');
  };

// pull environment changes every 5 minutes
timer(0, 1024 * 300).pipe(
    tap(t => console.log("Env Service --> Service Timer, " + t)),
    tap(t => {
        const LAREPO = 'C:/_LA.Repositories';
        const ENVIRONMENT = 'C:/_LA.Repositories/_Environment';
        const WDIREPO = 'C:/_WDI.Repositories';
    
        [LAREPO, ENVIRONMENT, WDIREPO].forEach(d => {
            if (!fs.existsSync(d)) {
                console.log(d + " Does not Exist, Creating...")
                fs.mkdirSync(d);
            }
        })
    }),
    switchMap(() => EnvironmentService.Synchronize$)
) 
.subscribe(() => { 

})