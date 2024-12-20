import {Connection} from "@/components/protocols/websocket";

export interface OnLogin {
    user: string;
    secret: string;
}

export interface OnLogout {
    user: string;
}

export class EnvironmentProtocol {
    private connection: Connection;
    listeners: {
        onLogin: Function[],
        onLogout: Function[],
    };

    constructor(connection: Connection) {
        this.connection = connection;
        this.listeners = {
            onLogin: [],
            onLogout: []
        };
    }

    addListener( method: keyof EnvironmentProtocol['listeners'], listener: Function ): void {
        if (!this.listeners[method]) {
            this.listeners[method] = [];
        }
        this.listeners[method].push(listener);
    }

    addListeners( protocolListeners: Record<string, Function[]> ): void {
        let list = this.listeners;
        Object.entries(list).forEach( ([method, array]) => {
            let fns: Function[] = protocolListeners[method];
            if( fns !== undefined )
                array.push(...fns);
        } );
    };

    execute(command: string, payload: any) {
        console.log("Environment: execute", command, payload);
        switch (command) {
            case "login": this.onLogin(payload); break;
            case "logout": this.onLogout(payload); break;
        }
    }

    request_login(user: string, password: string) {
        this.connection.send_raw({
            protocol: "environment",
            command: "login",
            payload: {
                user: user,
                password: password
            }
        });
    }

    request_logout() {
        this.connection.send({
            protocol: "environment",
            command: "logout",
            payload: {}
        });
    }

    onLogin(payload: any) {
        console.log("onLogin", JSON.stringify(payload));
        for (let fn of this.listeners.onLogin) {
            fn(this.connection, payload as OnLogin);
        }
    }

    onLogout(payload: any) {
        console.log("onLogout", JSON.stringify(payload));
        for (let fn of this.listeners.onLogout) {
            fn(this.connection, payload as OnLogout);
        }
    }
}
