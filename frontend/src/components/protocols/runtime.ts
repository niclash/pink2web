import {Connection} from "@/components/protocols/websocket";

export interface GetRuntimeCommand {
}

export interface Packet {
    port: string;
    event: string;
    type: string;
    schema: string;
    graph: string;
    payload: any;
}

export interface RuntimeErrorEvent {
    message: string;
}

export interface PortsEvent {
    graph: string;
    inports: {
        id: string;
        type: string;
        schema: string;
        required: boolean;
        addressable: boolean;
        description: string;
        values: any[];
        default: any;
    }[];
    outports: {
        id: string;
        type: string;
        schema: string;
        required: boolean;
        addressable: boolean;
        description: string;
        values: any[];
        default: any;
    }[];
}

export interface RuntimeEvent {
    id: string;
    label: string;
    version: string;
    allCapabilities: string;
    capabilities: string;
    graph: string;
    type: string;
    namespace: string;
    repository: string;
    repositoryVersion: string;
}

export interface PacketSentEvent {
    port: string;
    event: string;
    type: string;
    schema: string;
    graph: string;
    payload: any;
}

export interface Runtime {
    id: string;
    label: string;
    version: string;
    allCapabilities: string[],
    capabilities: string[],
    graph: string;
    type: string;
    namespace: string;
    repository: string;
    repositoryVersion: string;
}

export class RuntimeProtocol {
    private connection: Connection;
    listeners: {
        onRuntimePacket: Function[],
        onRuntimeError: Function[],
        onRuntimePorts: Function[],
        onRuntime: Function[],
        onRuntimePacketSent: Function[],
    };

    constructor(connection: Connection) {
        this.connection = connection;
        this.listeners = {
            onRuntimePacket: [],
            onRuntimeError: [],
            onRuntimePorts: [],
            onRuntime: [],
            onRuntimePacketSent: [],
        };
    }

    addListener( method: keyof RuntimeProtocol['listeners'], listener: Function ): void {
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
            case "packet": this.packet(payload); break;
            case "error": this.error(payload); break;
            case "ports": this.ports(payload); break;
            case "runtime": this.runtime(payload); break;
            case "packetsent": this.packetsent(payload); break;
        }
    }

    request_getruntime() {
        this.connection.send({
            protocol: "runtime",
            command: "getruntime",
            payload: {
            }
        });
    }

    packet(payload: any) {
        console.log("Runtime.packet()", payload);
        if (this.listeners.onRuntimePacket) {
            for (let fn of this.listeners.onRuntimePacket) {
                fn(payload as Packet);
            }
        }
    }

    error(payload: any) {
        console.log("Runtime.error()", payload);
        if (this.listeners.onRuntimeError) {
            for (let fn of this.listeners.onRuntimeError) {
                fn(payload as RuntimeErrorEvent);
            }
        }
    }

    ports(payload: any) {
        console.log("Runtime.ports()", payload);
        if (this.listeners.onRuntimePorts) {
            for (let fn of this.listeners.onRuntimePorts) {
                fn(payload as PortsEvent);
            }
        }
    }

    runtime(payload: any) {
        console.log("Runtime.runtime()", payload);
        if (this.listeners.onRuntime) {
            for (let fn of this.listeners.onRuntime) {
                fn(payload as RuntimeEvent);
            }
        }
    }

    packetsent(payload: any) {
        console.log("Runtime.packetsent()", payload);
        if (this.listeners.onRuntimePacketSent) {
            for (let fn of this.listeners.onRuntimePacketSent) {
                fn(payload as PacketSentEvent);
            }
        }
    }
}

