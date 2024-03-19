import {NetworkProtocol} from "@/components/floweditor/protocols/network";
import {ComponentProtocol} from "@/components/floweditor/protocols/component";
import {GraphProtocol} from "@/components/floweditor/protocols/graph";
import {TraceProtocol} from "@/components/floweditor/protocols/trace";
import {RuntimeProtocol} from "@/components/floweditor/protocols/runtime";
import {Connection} from "@/components/floweditor/protocols/websocket";

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

    constructor(connection: Connection, secret: String) {
        this.network = new NetworkProtocol(connection);
        this.component = new ComponentProtocol(connection);
        this.graph = new GraphProtocol(connection);
        this.runtime = new RuntimeProtocol(connection);
        this.trace = new TraceProtocol(connection);
    }

    onMessage(protocol: string, command: string, payload: any) {
        console.log("Protocols.onMessage()", payload);
        let secret = payload.secret;
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
        }
        /*
                    TODO: Check authorization in what way?
                    TODO: Invalid requests causes an exception!
        */

    }
}
