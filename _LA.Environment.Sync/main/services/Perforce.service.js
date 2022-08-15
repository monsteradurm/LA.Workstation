import P4 from "p4api"
import { LAREPO } from "./Environment.service.js";

export class PerforceService {
    static async Login(addr, user, password) {
        const p4 = new P4.P4({ 
            p4set: {
                P4PORT: addr,
                P4API_TIMEOUT: 5000}
        });

        p4.addOpts({env:{P4USER: user}})
        PerforceService.Trust(p4, user);
        return await p4.cmd("login", password);
        //return await p4.cmd("login -s");
    }

    static async Connection(login) {
        //TrustArgs { get; set; } = "-p ssl:52.147.58.109:1666 trust -y";
        const {Server, Username, Password} = login;
        const p4 = new P4.P4({ 
            p4set: {
                P4PORT: Server,
                P4API_TIMEOUT: 5000}
        });
        PerforceService.Trust(p4, Username);
        p4.addOpts({env:{P4USER: Username}});
        await p4.cmd("login", Password);
        return p4;
    }

    static Trust(p4, user) {
        p4.cmd(`-p ${LAREPO} -u ${user} trust -y`);
    }
    static get LastConnection() {
        const p4 = new P4.P4({ 
            p4set: {
                P4PORT: LAREPO,
                P4API_TIMEOUT: 5000}
        });
        return p4;
    }

    static async Clients(login) {
        let p4 = PerforceService.LastConnection;
        if (login)
            p4 = await PerforceService.Connection(login);

        return await p4.cmd("clients -u " + login.Username);       
    }

    static async Depots(login) {
        const p4 = await PerforceService.Connection(login);
        return await p4.cmd("depots");
    }


    static async Where(login, map, client) {
        let p4 = PerforceService.LastConnection;
        if (login)
            p4 = await PerforceService.Connection(login);

        await p4.cmd("set P4CLIENT=" + client);
        return await p4.cmd("where //" + map + "/...")
    }

    static async Groups(login) {
        let p4 = PerforceService.LastConnection;
        if (login)
            p4 = await PerforceService.Connection(login);
        return await p4.cmd("groups -u " + login.Username);
    }

    static async Protects(login) {
        let p4 = PerforceService.LastConnection;
        if (login)
            p4 = await PerforceService.Connection(login);
        return await p4.cmd("protects -u " + login.Username);
    }

    static async Users(login) {
        let p4 = PerforceService.LastConnection;
        if (login)
            p4 = await PerforceService.Connection(login);
        return await p4.cmd("users");
    }

    static async Client(login, name) {
        let p4 = PerforceService.LastConnection;
        if (login)
            p4 = await PerforceService.Connection(login);
        PerforceService.SetClientConfig(p4, name);
        let out = await p4.cmd("client -o")
        return out;
    }

    static async SetIgnore(login, client, ignore) {
        let p4 = PerforceService.LastConnection;
        if (login)
            p4 = await PerforceService.Connection(login);
        PerforceService.SetClientConfig(p4, client);
        p4.addOpts({env: {P4Ignore:ignore.replace('\\', '/')}})
    };

    static async SetClientConfig(p4, client) {
        p4.addOpts({env:{
            P4CLIENT:client, 
            P4CONFIG: "p4config.txt",
            }
        })
    } 

    static async Sync(login, client, from, to) {
        let p4 = PerforceService.LastConnection;
        if (login)
            p4 = await PerforceService.Connection(login);
        PerforceService.SetClientConfig(p4, client);
        return await p4.cmd(`sync -s ${from} ${to}`);
    }

    static async UpsertClient(login, config) {
        let p4 = PerforceService.LastConnection;
        if (login)
            p4 = await PerforceService.Connection(login);
        console.log('p4 client -i < ' + config);

        return await p4.rawCmd('client -i ', config);
    }

}