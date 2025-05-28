// noinspection JSUnusedGlobalSymbols

import {Connection} from "@/components/protocols/websocket";
import {Port} from "@/components/protocols/protocols";

export interface ComponentsReadyEvent {}

export interface ComponentEvent {
    displayName: string;
    fullId: string;
    description: string;
    icon: string;
    subgraph: boolean;
    inPorts: Port[];
    outPorts: Port[];
}

// Not used
export interface SourceEvent {
    name: string;
    language: string;
    library: string;
    code: string;
    tests: string;
}

export interface ComponentErrorEvent {
    message: string;
}

export class ComponentProtocol {
    listeners: {
        onComponentComponent: Function[],
        onComponentsReady: Function[],
        onComponentError: Function[],
    };
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
        this.listeners = {
            onComponentComponent: [],
            onComponentsReady: [],
            onComponentError: [],
        };
    }

    addListener( method: keyof ComponentProtocol['listeners'], listener: Function ): void {
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

    request_list() {
        this.connection.send({
            protocol: "component",
            command: "list",
            payload: {}
        });
    }

    source(payload: any) {
        // not supported
        console.log("ERROR: source() is not supported!", payload);
    }

    error(payload: any) {
        alert(payload.message); // TODO put somewhere on screen
        for(let fn of this.listeners.onComponentError )
        {
            fn(payload);
        }
    }

    component(payload: any) {
        for(let fn of this.listeners.onComponentComponent )
        {
            fn(payload as ComponentEvent);
        }
    }

    componentsready( payload: any) {
        // When components list is completed.
        for(let fn of this.listeners.onComponentsReady )
        {
            fn(payload);
        }
    }

    execute(command: string, payload: any) {
        switch(command)
        {
            case "component": this.component(payload); break;
            case "componentsready": this.componentsready(payload); break;
            case "error": this.error(payload); break;
            case "source": this.source(payload); break;
        }
    }
}
