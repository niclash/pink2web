// noinspection JSUnusedGlobalSymbols

import {Connection} from "./websocket"
import {Graph} from "@/components/model";

export interface Endpoint {
    node: string;
    port: string;
    index: number;
}

export interface Link {
    src: Endpoint;
    tgt: Endpoint;
}

export interface ClearEvent {
    id: string;
    name: string;
    library: string;
    main: boolean;
    icon: string;
    description: string;
}

export interface AddNodeEvent {
    id: string;
    component: string;
    graph: string;
    metadata: {
        x: number;
        y: number;
    }
}

export interface RemoveNodeEvent {
    id: string;
    graph: string;
}

export interface RenameNodeEvent {
    from: string;
    to: string;
    graph: string;
}

export interface ChangeNodeEvent {
    id: string;
    metadata: {
        x: number;
        y: number;
    }
    graph: string;
}

export interface AddEdgeEvent {
    src: Endpoint;
    tgt: Endpoint;
    metadata: {
        route: number;
        schema: string;
        secure: boolean;
    }
    graph: string;

}

export interface RemoveEdgeEvent {
    src: Endpoint;
    tgt: Endpoint;
    graph: string;
}

export interface ChangeEdgeEvent {
    src: Endpoint;
    tgt: Endpoint;
    metadata: {
        route: number;
        schema: string;
        secure: boolean;
    }
    graph: string;
}

export interface AddInitialEvent {
    src: {
        data: any;
    };
    tgt: Endpoint;
    metadata: {
        route: number;
        schema: string;
        secure: boolean;
    }
    graph: string;
}

export interface RemoveInitialEvent {
    src: {
        data: any;
    };
    tgt: Endpoint;
    graph: string;
}

export interface AddInportEvent {
    public: string;
    node: string;
    port: string;
    metadata: {
        x: number;
        y: number;
    }
    graph: string;
}

export interface RemoveInportEvent {
    public: string;
    graph: string;
}

export interface RenameInportEvent {
    from: string;
    to: string;
    graph: string;
}

export interface AddOutportEvent {
    public: string;
    node: string;
    port: string;
    metadata: {
        x: number;
        y: number;
    }
    graph: string;
}

export interface RemoveOutportEvent {
    public: string;
    graph: string;
}

export interface RenameOutportEvent {
    from: string;
    to: string;
    graph: string;
}

export interface AddGroupEvent {
    name: string;
    nodes: string[];
    metadata: {
        description: string;
    }
    graph: string;
}

export interface RemoveGroupEvent {
    name: string;
    graph: string;
}

export interface RenameGroupEvent {
    from: string;
    to: string;
    graph: string;
}

export interface ChangeGroupEvent {
    name: string;
    metadata: {
        description: string;
    }
    graph: string;
}

export class GraphProtocol {
    private connection: Connection;
    private currentGraph: string = "";
    listeners: {
        onGraphClear: Function[],
        onGraphAddNode: Function[],
        onGraphRemoveNode: Function[],
        onGraphRenameNode: Function[],
        onGraphChangeNode: Function[],
        onGraphAddEdge: Function[],
        onGraphRemoveEdge: Function[],
        onGraphChangeEdge: Function[],
        onGraphAddInitial: Function[],
        onGraphRemoveInitial: Function[],
        onGraphAddInport: Function[],
        onGraphRemoveInport: Function[],
        onGraphRenameInport: Function[],
        onGraphAddOutport: Function[],
        onGraphRemoveOutport: Function[],
        onGraphRenameOutport: Function[],
        onGraphAddGroup: Function[],
        onGraphRemoveGroup: Function[],
        onGraphRenameGroup: Function[],
        onGraphChangeGroup: Function[],
    };

    constructor(connection: Connection) {
        this.connection = connection;
        this.listeners = {
            onGraphClear: [],
            onGraphAddNode: [],
            onGraphRemoveNode: [],
            onGraphRenameNode: [],
            onGraphChangeNode: [],
            onGraphAddEdge: [],
            onGraphRemoveEdge: [],
            onGraphChangeEdge: [],
            onGraphAddInitial: [],
            onGraphRemoveInitial: [],
            onGraphAddInport: [],
            onGraphRemoveInport: [],
            onGraphRenameInport: [],
            onGraphAddOutport: [],
            onGraphRemoveOutport: [],
            onGraphRenameOutport: [],
            onGraphAddGroup: [],
            onGraphRemoveGroup: [],
            onGraphRenameGroup: [],
            onGraphChangeGroup: [],
        };
    }
    addListener( method: keyof GraphProtocol['listeners'], listener: Function ): void {
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
            case "clear": this.clear(payload); break;
            case "addnode": this.addnode(payload); break;
            case "removenode": this.removenode(payload); break;
            case "renamenode": this.renamenode(payload); break;
            case "changenode": this.changenode(payload); break;
            case "addedge": this.addedge(payload); break;
            case "removeedge": this.removeedge(payload); break;
            case "changeedge": this.changeedge(payload); break;
            case "addinitial": this.addinitial(payload); break;
            case "removeinitial": this.removeinitial(payload); break;
            case "addinport": this.addinport(payload); break;
            case "removeinport": this.removeinport(payload); break;
            case "renameinport": this.renameinport(payload); break;
            case "addoutport": this.addoutport(payload); break;
            case "removeoutport": this.removeoutport(payload); break;
            case "renameoutport": this.renameoutport(payload); break;
            case "addgroup": this.addgroup(payload); break;
            case "removegroup": this.removegroup(payload); break;
            case "renamegroup": this.renamegroup(payload); break;
            case "changegroup": this.changegroup(payload); break;
        }
    }

    request(command: string, payload: any) {
        this.connection.send({
            protocol: "graph",
            command: command,
            payload: payload
        });
    }

    request_list_graphs() {
        console.log("Request list graphs");
        this.connection.send({
            protocol: "graph",
            command: "list",
            payload: {}
        });
    }

    request_rename_graph(graphId: string, oldName: string, newName: string) {
        console.log("Request rename graph:" + oldName + "  --->  " + newName);
        this.connection.send({
            protocol: "graph",
            command: "delete",
            payload: {
                id: graphId,
                from: oldName,
                to: newName,
            }
        });
    }

    request_connect(graphName: string) {
        console.log("Request connect:" + graphName);
        this.connection.send({
            protocol: "graph",
            command: "connect",
            payload: {
                id: graphName
            }
        });
    }

    request_disconnect(graphName: string) {
        console.log("Request disconnect:" + graphName);
        this.connection.send({
            protocol: "graph",
            command: "disconnect",
            payload: {
                id: graphName
            }
        });
    }

    request_addnode(id: string, component: string, x: number, y: number) {
        console.log("Request addnode:" + id + ", " + component);
        this.connection.send({
            protocol: "graph",
            command: "addnode",
            payload: {
                id: id,
                component: component,
                metadata: {
                    x: x,
                    y: y,
                },
                graph: this.currentGraph
            }
        });
    }

    request_removenode(id: string) {
        console.log("Request removenode:" + id);
        this.connection.send({
            protocol: "graph",
            command: "removenode",
            payload: {
                id: id,
                graph: this.currentGraph
            }
        });
    }

    request_renamenode(from: string, to: string) {
        console.log("Request renamenode " + from + " ----> " + to);
        this.connection.send({
            protocol: "graph",
            command: "renamenode",
            payload: {
                from: from,
                to: to,
                graph: this.currentGraph
            }
        });
    }

    request_changenode(id: string, metadata: any) {
        console.log("Request changenode:" + id + ", ", metadata);
        this.connection.send({
            protocol: "graph",
            command: "changenode",
            payload: {
                id: id,
                metadata: metadata,
                graph: this.currentGraph
            }
        });
    }

    request_addedge(fromNode: string, toNode: string, fromPort: string, toPort: string, fromIndex: number, toIndex: number, meta: any) {
        console.log("Request addedge:" + fromNode + "." + fromPort + " ---> " + toNode + "." + toPort);
        let link = this.buildLink(fromNode, toNode, fromPort, toPort, fromIndex, toIndex);
        let payload = {
            protocol: "graph",
            command: "addedge",
            payload: {
                src: link.src,
                tgt: link.tgt,
                graph: this.currentGraph,
                metadata: meta
            }
        };
        this.connection.send(payload);
    }

    request_removeedge(fromNode: string, toNode: string, fromPort: string, toPort: string, fromIndex: number, toIndex: number) {
        console.log("Request removeedge:" + fromNode + "." + fromPort + " ---> " + toNode + "." + toPort);
        let link = this.buildLink(fromNode, toNode, fromPort, toPort, fromIndex, toIndex);
        this.connection.send({
            protocol: "graph",
            command: "removeedge",
            payload: {
                src: link.src,
                tgt: link.tgt,
                graph: this.currentGraph
            }
        });
    }

    request_changeedge(fromNode: string, toNode: string, fromPort: string, toPort: string, fromIndex: number, toIndex: number, meta: any) {
        let link = this.buildLink(fromNode, toNode, fromPort, toPort, fromIndex, toIndex);
        this.connection.send({
            protocol: "graph",
            command: "changeedge",
            payload: {
                src: link.src,
                tgt: link.tgt,
                metadata: meta,
                graph: this.currentGraph
            }
        });
    }

    request_addinitial(data: any, toNode: string, toPort: string, toIndex: number, metadata: any) {
        console.log("Request addinitial:" + data + " ---> " + toNode + "." + toPort);
        let tgt = this.buildEndpoint(toNode, toPort, toIndex);
        this.connection.send({
            protocol: "graph",
            command: "addinitial",
            payload: {
                src: {data: data},
                tgt: tgt,
                graph: this.currentGraph,
                metadata: metadata
            }
        });
    }

    // changeinitial is not documented in FBP. It is an extension.
    request_changeinitial(data: any, toNode: string, toPort: string, toIndex: number, metadata: any) {
        console.log("Request changeinitial:" + data + " ---> " + toNode + "." + toPort);
        let tgt = this.buildEndpoint(toNode, toPort, toIndex);
        this.connection.send({
            protocol: "graph",
            command: "changeinitial",
            payload: {
                src: {data: data},
                tgt: tgt,
                graph: this.currentGraph,
                metadata: metadata
            }
        });
    }

    request_removeinitial(data: any, toNode: string, toPort: string, toIndex: number) {
        console.log("Request removeinitial:" + data + " ---> " + toNode + "." + toPort);
        let tgt = this.buildEndpoint(toNode, toPort, toIndex);
        this.connection.send({
            protocol: "graph",
            command: "removeinitial",
            payload: {
                src: data,
                tgt: tgt,
                graph: this.currentGraph
            }
        });
    }

    request_addgroup(name: string, nodes: any[]) {
        console.log("Request addgroup:" + name + " ---> " + nodes);
        this.connection.send({
            protocol: "graph",
            command: "addgroup",
            payload: {
                graph: this.currentGraph,
                name: name,
                nodes: nodes,
                metadata: {
                    description: ""
                }
            }
        });
    }

    request_removegroup(name: string) {
        this.connection.send({
            protocol: "graph",
            command: "renamegroup",
            payload: {
                graph: this.currentGraph,
                name: name
            }
        });
    }

    request_renamegroup(from: string, to: string) {
        this.connection.send({
            protocol: "graph",
            command: "renamegroup",
            payload: {
                graph: this.currentGraph,
                from: from,
                to: to
            }
        });
    }

    request_changegroup(name: string, newDescription: string) {
        this.connection.send({
            protocol: "graph",
            command: "changegroup",
            payload: {
                graph: this.currentGraph,
                name: name,
                metadata: {
                    description: newDescription
                }
            }
        });
    }

    clear(payload: ClearEvent) {
        this.currentGraph = payload.id;
        for (let fn of this.listeners.onGraphClear) {
            fn(payload);
        }
    }

    addnode(payload: any) {
        console.log("addnode", JSON.stringify(payload));
        for (let fn of this.listeners.onGraphAddNode) {
            try {
                fn(payload as AddNodeEvent);
            } catch (e){
                console.log("Error in addnode: ", e);
            }
        }
    }

    removenode(payload: any) {
        console.log("removenode", JSON.stringify(payload));
        for (let fn of this.listeners.onGraphRemoveNode) {
            fn(payload as RemoveNodeEvent);
        }
    }

    renamenode(payload: any) {
        console.log("renamenode", JSON.stringify(payload));
        for (let fn of this.listeners.onGraphRenameNode) {
            fn(payload as RenameNodeEvent);
        }
    }

    changenode(payload: any) {
        console.log("changenode", JSON.stringify(payload));
        for (let fn of this.listeners.onGraphChangeNode) {
            fn(payload as ChangeNodeEvent);
        }
    }

    addedge(payload: any) {
        for (let fn of this.listeners.onGraphAddEdge) {
            fn(payload as AddEdgeEvent);
        }
    }

    removeedge(payload: any) {
        for (let fn of this.listeners.onGraphRemoveEdge) {
            fn(payload as RemoveEdgeEvent);
        }
    }

    changeedge(payload: any) {
        for (let fn of this.listeners.onGraphChangeEdge) {
            fn(payload as ChangeEdgeEvent);
        }
    }

    addinitial(payload: any) {
        for (let fn of this.listeners.onGraphAddInitial) {
            fn(payload as AddInitialEvent);
        }
    }

    removeinitial(payload: any) {
        for (let fn of this.listeners.onGraphRemoveInitial) {
            fn(payload as RemoveInitialEvent);
        }
    }

    addinport(payload: any) {
        for (let fn of this.listeners.onGraphAddInport) {
            fn(payload as AddInportEvent);
        }
    }

    removeinport(payload: any) {
        for (let fn of this.listeners.onGraphRemoveInport) {
            fn(payload as RemoveInportEvent);
        }
    }

    renameinport(payload: any) {
        for (let fn of this.listeners.onGraphRenameInport) {
            fn(payload as RenameInportEvent);
        }
    }

    addoutport(payload: any) {
        for (let fn of this.listeners.onGraphAddOutport) {
            fn(payload as AddOutportEvent);
        }
    }

    removeoutport(payload: any) {
        for (let fn of this.listeners.onGraphRemoveOutport) {
            fn(payload as RemoveOutportEvent);
        }
    }

    renameoutport(payload: any) {
        for (let fn of this.listeners.onGraphRenameOutport) {
            fn(payload as RenameOutportEvent);
        }
    }

    addgroup(payload: any) {
        for (let fn of this.listeners.onGraphAddGroup) {
            fn(payload as AddGroupEvent);
        }
    }

    removegroup(payload: any) {
        for (let fn of this.listeners.onGraphRemoveGroup) {
            fn(payload as RemoveGroupEvent);
        }
    }

    renamegroup(payload: any) {
        for (let fn of this.listeners.onGraphRenameGroup) {
            fn(payload as RenameGroupEvent);
        }
    }

    changegroup(payload: any) {
        for (let fn of this.listeners.onGraphChangeGroup) {
            fn(payload as ChangeGroupEvent);
        }
    }

    validGraph(graph: string) {
        return graph === this.currentGraph;
    }

    buildEndpoint(node: string, port: string, index: number) {
        let src;
        if (index === null)
            src = {
                node: node, port: port
            };
        else
            src = {
                node: node, port: port, index: index
            };
        return src;
    }

    buildLink(fromNode: string, toNode: string, fromPort: string, toPort: string, fromIndex: number, toIndex: number) {
        let src = this.buildEndpoint(fromNode, fromPort, fromIndex);
        let tgt = this.buildEndpoint(toNode, toPort, toIndex);
        return {src: src, tgt: tgt};
    }
}
