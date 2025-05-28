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
        onNewGraphPacket: Function[],
        onDeleteGraphPacket: Function[],
        onRuntimePacket: Function[],
        onRuntimeError: Function[],
        onRuntimePorts: Function[],
        onRuntime: Function[],
        onRuntimePacketSent: Function[],
    };

    constructor(connection: Connection) {
        this.connection = connection;
        this.listeners = {
            onNewGraphPacket: [],
            onDeleteGraphPacket: [],
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
            case "new_graph": this.new_graph(payload); break;
            case "delete_graph": this.delete_graph(payload); break;
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

    request_new_graph(graphName: string, description: string, icon: string) {
        console.log("Request new graph:" + graphName);
        this.connection.send({
            protocol: "runtime",
            command: "new_graph",
            payload: {
                name: graphName,
                description: description,
                icon: icon,
            }
        });
    }

    request_delete_graph(graphId: string, graphName: string) {
        console.log("Request delete graph:" + graphName);
        this.connection.send({
            protocol: "runtime",
            command: "delete_graph",
            payload: {
                id: graphId,
                name: graphName
            }
        });
    }

    new_graph(payload: any) {
        if (this.listeners.onNewGraphPacket) {
            for (let fn of this.listeners.onNewGraphPacket) {
                fn(payload as Packet);
            }
        }
    }

    delete_graph(payload: any) {
        if (this.listeners.onDeleteGraphPacket) {
            for (let fn of this.listeners.onDeleteGraphPacket) {
                fn(payload as Packet);
            }
        }
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

