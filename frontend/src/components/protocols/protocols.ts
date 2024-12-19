import {NetworkProtocol} from "@/components/protocols/network";
import {ComponentProtocol} from "@/components/protocols/component";
import {GraphProtocol} from "@/components/protocols/graph";
import {TraceProtocol} from "@/components/protocols/trace";
import {RuntimeProtocol} from "@/components/protocols/runtime";
import {Connection} from "@/components/protocols/websocket";
import {EnvironmentProtocol} from "@/components/protocols/environment";

export interface Port {
    id: string;
    type: string;
    schema: string;
    required: boolean;
    addressable: boolean;
    description: string;
    values: string[];
    default: any;
}


export class Protocols {
    network: NetworkProtocol;
    component: ComponentProtocol;
    graph: GraphProtocol;
    runtime: RuntimeProtocol;
    trace: TraceProtocol;
    environment: EnvironmentProtocol;

    constructor(connection: Connection) {
        this.network = new NetworkProtocol(connection);
        this.component = new ComponentProtocol(connection);
        this.graph = new GraphProtocol(connection);
        this.runtime = new RuntimeProtocol(connection);
        this.trace = new TraceProtocol(connection);
        this.environment = new EnvironmentProtocol(connection);
    }

    onMessage(protocol: string, command: string, payload: any) {
        console.log("Protocols.onMessage()", protocol, command, payload);
        switch (protocol) {
            case "component":
                this.component.execute(command, payload);
                break;
            case "graph":
                this.graph.execute(command, payload);
                break;
            case "network":
                this.network.execute(command, payload);
                break;
            case "runtime":
                this.runtime.execute(command, payload);
                break;
            case "trace":
                this.trace.execute(command, payload);
                break;
            case "environment":
                this.environment.execute(command, payload);
                break;
        }
        /*
                    TODO: Check authorization in what way?
                    TODO: Invalid requests causes an exception!
        */

    }
}
