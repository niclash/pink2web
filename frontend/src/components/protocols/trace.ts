import {Connection} from "@/components/protocols/websocket";

export interface StartCommand {
    buffersize: number;
    graph: string;
}

export interface StopCommand {
    graph: string;
}

export interface DumpCommand {
    flowtrace: string;
    graph: string;
}

export interface ClearCommand {
    graph: string;
}

export interface MessageEvent {
    message: string;
}

export class TraceProtocol {
    private connection: Connection;
    listeners: Record<string, Function[]>;

    constructor(connection: Connection) {
        this.connection = connection;
        this.listeners = {};
    }

    addListener( method: keyof TraceProtocol['listeners'], listener: Function ): void {
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
            case "start": this.start(payload); break;
            case "stop": this.stop(payload); break;
            case "dump": this.dump(payload); break;
            case "clear": this.clear(payload); break;
            case "error": this.error(payload); break;
        }
    }

    start(payload: any) {
    }

    stop(payload: any) {
    }

    dump(payload: any) {
    }

    clear(payload: any) {
    }

    error(payload: any) {
    }
}
