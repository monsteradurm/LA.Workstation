import { EMPTY, from, timer, of, combineLatest } from "rxjs";
import { PerforceService } from "./perforce.service.js";
import { tap, map, switchMap, concatMap, shareReplay, take } from 'rxjs/operators';
import os from "os";
import fs from "fs";
import * as _ from 'underscore';
import moment from 'moment';

export const ReadLastLogin = () => {
    const fn = "C:\\_LA.Repositories\\connection.json";
    let rawdata = {}

    if (fs.existsSync(fn)) {
        try {
            rawdata = JSON.parse(fs.readFileSync(fn));
        } catch { }
        
    }

    return rawdata;
}

export const LAREPO = 'ssl:52.147.58.109:1666';
export const ENVIRONMENT_ROOT = "C:/_LA.Repositories/_Environment";

export class EnvironmentService {  
    static LastLogin$ = of(os.userInfo()['username']).pipe(
        map((user) => {
            if (user === 'SYSTEM')
            {
                const details = ReadLastLogin();
                if (!details) return CURRENTUSER;

                return Object.keys(details)[0];
            }
            return user;
        }),
        switchMap((CURRENTUSER) => {
            const details = ReadLastLogin();
            if (!details || !details[CURRENTUSER]) {
                console.log("Warning, User has not logged into this workstation! (ever)")
                return EMPTY
            } else {
                let user = details[CURRENTUSER];
                if (!user[LAREPO]) {
                    console.log("Warning, User has not logged into this workstation! (ever)")
                    return EMPTY;
                }
                return of(user[LAREPO])
            }
        }),
        shareReplay(1),
    )

    static InitializeEnvironmentClient$ = EnvironmentService.LastLogin$.pipe(
        switchMap(login => login ? of(login) : EMPTY),
        switchMap(login => from(PerforceService.UpsertClient(login, 
            `Client: ${EnvironmentService.ClientName(login)}\n` +
            `Root: \t${ENVIRONMENT_ROOT}\n` + 
            `Owner: ${login.Username}\n` +
            `Host: \t${login.Host}\n`)
            ).pipe(
                switchMap(() => 
                    PerforceService.Client(login, `${login.Username}.${login.Host}._Environment`))
            )
        ),
    )

    static Client$ = EnvironmentService.LastLogin$.pipe(
        switchMap(login => from(PerforceService.Client(login, 
                `${login.Username}.${login.Host}._Environment`)
                ).pipe(
                    switchMap(client => client ? 
                        of(client) : EnvironmentService.InitializeEnvironmentClient$
                    ),
                    map( result => result.stat[0])
                )
        )
    )

    static Environments$ = EnvironmentService.LastLogin$.pipe(
            switchMap(login => from(PerforceService.Depots(login)).pipe(
                map(result => _.pluck(result.stat, 'name')),
                map(depots => _.filter(depots, d => d.indexOf('_Environment') === 0)),
            )
        ),
        take(1)
    );

    static UpsertClient = (login, views) => {
        console.log("UPSERTING CLIENT");
        let config = `Client: ${EnvironmentService.ClientName(login)}\n` +
        `Root: \t${ENVIRONMENT_ROOT}\n` + 
        `Owner: ${login.Username}\n` +
        `Host: \t${login.Host}\n`;

        if (views && views.length > 0) {
            config += 'View:\n'
            views.forEach(v => config += '\t' + v + '\n')
        }

        return from(PerforceService.UpsertClient(login, config)).pipe(
            switchMap(result => 
                PerforceService.Client(login, EnvironmentService.ClientName(login)))
        )
    }
    
    static ClientName = (login) => {
        return `Client: ${login.Username}.${login.Host}._Environment`;
    }
    static GetViews(client) {
        return _.uniq(Object.keys(client).filter(a => a.indexOf('View') === 0).map(
            a => client[a]
        ));
    }

    static ValidateClient$(client, env) {
        console.log("Validating Client: " + env)
        const views = EnvironmentService.GetViews(client);
        const root = ENVIRONMENT_ROOT + "/" + env;

        if (!fs.existsSync(root)) {
            console.log('Env Service --> ' + ENVIRONMENT_ROOT + ' Does not Exist, Creating...');
            fs.mkdirSync(root)
        }

        const mapping = '//' + env + '/... ' + '//' + client.Client + '/' + env + '/...';

        if (views.indexOf(mapping) < 0) {
            console.log("Adding View to Client: " + mapping);
            views.push(mapping);
            return EnvironmentService.LastLogin$.pipe(
                switchMap(login => EnvironmentService.UpsertClient(login, views)).pipe(
                    map(result => result.stat[0])
                ),
            );
        }

        return of(client);
        
    }
    static SynchronizeEnvironment$ = (client, env) => {
        console.log("Synchronizing: " + env + '...');
        const depotPath = '//' + env + '/... ';
        const clientPath = '//' + client.Client + '/' + env + '/...';

        return EnvironmentService.LastLogin$.pipe(
        switchMap(login => 
                from(PerforceService.Sync(login, client.Client, depotPath, clientPath)).pipe(
                    map(result => result.error && result.error.filter(e => e.data.indexOf('up-to-date') > -1).length > 0 ?
                        { result: env + ' is already syncronized...'} : result),
                    tap(result => console.log("Env Service --> " + env 
                    + " Synchonization Result: " + JSON.stringify(result) + "\n"))
                )
            )
        )
    }

    static Synchronize$ = EnvironmentService.Environments$.pipe(
        tap(() => console.log("Env Service --> Iterating Over Environment Depots")),
        tap(environments => console.log(JSON.stringify(environments) + "\n")),
        switchMap(environments => from(environments).pipe(
                concatMap(env => 
                    EnvironmentService.Client$.pipe(
                        switchMap(client => 
                            EnvironmentService.ValidateClient$(client, env).pipe(
                                switchMap(client => 
                                    EnvironmentService.SynchronizeEnvironment$(client, env))
                            )
                        )
                    )
                )
            )
        )
    )
}