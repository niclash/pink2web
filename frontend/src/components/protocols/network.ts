// noinspection JSUnusedGlobalSymbols

import {Connection} from "@/components/protocols/websocket";
import {Endpoint, Link} from "@/components/protocols/graph";

export interface StartCommand {
    graph: string;
}

export interface GetStatusCommand {
    graph: string;
}

export interface StopCommand {
    graph: string;
}

export interface PersistCommand {
}

export interface DebugCommand {
    enable: boolean;
    graph: string;
}

export interface EdgesCommand {
    edges: Link[];
    graph: string;
}

export interface StoppedEvent {
    time: string;
    uptime: number;
    started: boolean;
    running: boolean;
    debug: boolean;
    graph: string;
}

export interface StartedEvent {
    time: string;
    started: boolean;
    running: boolean;
    debug: boolean;
    graph: string;
}

export interface StatusEvent {
    uptime: number;
    started: boolean;
    running: boolean;
    debug: boolean;
    graph: string;
}

enum OutputEventType { message, previewurl}

export interface OutputEvent {
    message: string;
    type: string;
    url: string;
}

export interface NetworkErrorEvent {
    message: string;
    stack: string;
    graph: string;
}

export interface ProcessErrorEvent {
    id: string;
    error: string;
    graph: string;
}

export interface IconEvent {
    id: string;
    icon: string;
    graph: string;
}

export interface ConnectEvent {
    id: string;
    src: Endpoint;
    tgt: Endpoint;
    graph: string;
    subgraph: string[];
}

export interface BeginGroupEvent {
    id: string;
    src: Endpoint;
    tgt: Endpoint;
    graph: string;
    subgraph: string[];
}

export interface DataEvent {
    id: string;
    src: Endpoint;
    tgt: Endpoint;
    graph: string;
    subgraph: string[];
}

export interface EndGroupEvent {
    id: string;
    src: Endpoint;
    tgt: Endpoint;
    graph: string;
    subgraph: string[];
}

export interface DisconnectEvent {
    id: string;
    src: Endpoint;
    tgt: Endpoint;
    graph: string;
    subgraph: string[];
}

export class NetworkProtocol {
    private connection: Connection;
    listeners: {
        onNetworkStarted: Function[],
        onNetworkStopped: Function[],
        onNetworkStatus: Function[],
        onNetworkOutput: Function[],
        onNetworkError: Function[],
        onNetworkProcessError: Function[],
        onNetworkIcon: Function[],
        onNetworkConnect: Function[],
        onNetworkDisconnect: Function[],
        onNetworkBeginGroup: Function[],
        onNetworkData: Function[],
        onNetworkEndGroup: Function[],
    };

    constructor(connection: Connection) {
        this.connection = connection;
        this.listeners = {
            onNetworkStarted: [],
            onNetworkStopped: [],
            onNetworkStatus: [],
            onNetworkOutput: [],
            onNetworkError: [],
            onNetworkProcessError: [],
            onNetworkIcon: [],
            onNetworkConnect: [],
            onNetworkDisconnect: [],
            onNetworkBeginGroup: [],
            onNetworkData: [],
            onNetworkEndGroup: [],
        };
    }

    addListener( method: keyof NetworkProtocol['listeners'], listener: Function ): void {
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
        switch(command)
        {
            case "stopped": this.stopped(payload); break;
            case "started": this.started(payload); break;
            case "status": this.status(payload); break;
            case "output": this.output(payload); break;
            case "error": this.error(payload); break;
            case "processerror": this.processerror(payload); break;
            case "icon": this.icon(payload); break;
            case "connect": this.connect(payload); break;
            case "begingroup": this.begingroup(payload); break;
            case "data": this.data(payload); break;
            case "endgroup": this.endgroup(payload); break;
            case "disconnect": this.disconnect(payload); break;
        }
    }

    request_start() {
        this.connection.send({
            protocol: "network",
            command: "start",
            payload: {
                graph: this.connection.currentGraph,
            },
        });
    }

    request_stop() {
        this.connection.send({
            protocol: "network",
            command: "stop",
            payload: {
                graph: this.connection.currentGraph,
            },
        });
    }

    request_getstatus() {
        this.connection.send({
            protocol: "network",
            command: "getstatus",
            payload: {
                graph: this.connection.currentGraph,
            },
        });
    }

    request_persist() {
        this.connection.send({
            protocol: "network",
            command: "persist",
            payload: {
                graph: this.connection.currentGraph,
            }
        });
    }

    request_debug(enable: boolean) {
        this.connection.send({
            protocol: "network",
            command: "debug",
            payload: {
                enable: enable,
                graph: this.connection.currentGraph,
            }
        });
    }

    request_edges(links: Link[]) {
        this.connection.send({
            protocol: "network",
            command: "edges",
            payload: {
                edges: links,
                graph: this.connection.currentGraph,
            }
        });
    }

    stopped(payload: any) {
        console.log(payload);
        for (let fn of this.listeners.onNetworkStopped) {
            fn(payload);
        }
    }

    started(payload: any) {
        console.log(payload);
        for (let fn of this.listeners.onNetworkStarted) {
            fn(payload);
        }
    }

    status(payload: any) {
        console.log(payload);
        for (let fn of this.listeners.onNetworkStatus) {
            fn(payload);
        }
    }

    output(payload: any) {
        console.log("Message: " + payload.message, payload.url, payload.type);
        for (let fn of this.listeners.onNetworkOutput) {
            fn(payload);
        }
    }

    error(payload: any) {
        console.log("Error: " + payload.graph + " : " + payload.message, payload.stack);
        for (let fn of this.listeners.onNetworkError) {
            fn(payload);
        }
    }

    processerror(payload: any) {
        console.log("Error:" + payload.graph + "." + payload.id + " : " + payload.error);
        for (let fn of this.listeners.onNetworkProcessError) {
            fn(payload);
        }
    }

    icon(payload: any) {
        console.log("New Icon: " + payload.graph + "." + payload.id + " => " + payload.error);
        for (let fn of this.listeners.onNetworkIcon) {
            fn(payload);
        }
    }
    connect(payload: any) {
        console.log("Network.connect()", payload);
        for (let fn of this.listeners.onNetworkConnect) {
            fn(payload);
        }
    }

    begingroup(payload: any) {
        console.log("Network.begingroup()", payload);
        for (let fn of this.listeners.onNetworkBeginGroup) {
            fn(payload);
        }
    }

    data(payload: any) {
        console.log("Network.data()", payload);
        for (let fn of this.listeners.onNetworkData) {
            fn(payload);
        }
    }

    endgroup(payload: any) {
        console.log("Network.endgroup()", payload);
        for (let fn of this.listeners.onNetworkEndGroup) {
            fn(payload);
        }
    }

    disconnect(payload: any) {
        console.log("Network.disconnect()", payload);
        for (let fn of this.listeners.onNetworkDisconnect) {
            fn(payload);
        }
    }
}
