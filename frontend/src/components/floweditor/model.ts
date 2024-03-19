import {ClassicPreset as Classic, GetSchemes} from "rete";
import {ComponentEvent} from "./protocols/component";
import {Port} from "./protocols/protocols";
import {Ref, UnwrapRef} from "@vue/reactivity";
import {ref} from "vue";
import {Connection as WsConnection} from "@/components/floweditor/protocols/websocket";
import {ClearEvent} from "@/components/floweditor/protocols/graph";

const socket = new Classic.Socket('socket');

export let componentTemplates: Record<string, ComponentEvent> = {};

export type Node = PrimitiveNode;
type Conn =
    | Connection<PrimitiveNode, PrimitiveNode>
    ;

export class Connection<A extends Node, B extends Node> extends Classic.Connection<A, B> {
}

export type Schemes = GetSchemes<Node, Conn>;

export class Graph {
    constructor(id: string, name: string, description: string, debug: boolean) {
        this.graph = id;
        this.name = name;
        this.description = description;
        this.debug = debug;
        this.running = false;
        this.started = false;
        this.uptime = 0;
    }

    name: string;
    description: string;
    graph: string;
    debug: boolean;
    running: boolean;
    started: boolean;
    uptime: number;
}

export class PrimitiveNode extends Classic.Node {
    readonly inports: Port[];
    readonly outports: Port[];
    description: string;
    width = 180;
    height = 195;

    constructor(name: string, description: string, component: string, inports: Port[], outports: Port[]) {
        super(name);
        this.description = "";
        this.inports = inports;
        this.outports = outports;
        let inHeight = inports.length * 32;
        let outHeight = outports.length * 32;
        this.height = 100 + (inHeight > outHeight ? inHeight : outHeight);
        for (let outport of outports) {
            this.addOutput(outport.id, new Classic.Input(socket, outport.id, outport.addressable));
        }
        for (let inport of inports) {
            this.addInput(inport.id, new Classic.Input(socket, inport.id, inport.addressable));
        }
    }
}

export const vueModel: {
    graphs: Ref<UnwrapRef<Map<string, Graph>>>,
    currentGraph: ClearEvent,
    selectedNodes: Node[],
    pipeDisabled: boolean,
    components: Ref<UnwrapRef<ComponentEvent[]>>,
    selectedComponent: string,
    connection: Ref<UnwrapRef<WsConnection | undefined>>,
    counters: Record<string, number>,
    nextName: () => string,
} = {
    graphs: ref(new Map<string, Graph>()),
    currentGraph: {id: "", name: "", icon: "", description: "", library: "", main: false},
    components: ref([]),
    pipeDisabled: false,
    selectedNodes: [],
    connection: ref(undefined),
    selectedComponent: "",
    counters: {},
    nextName: () => {
        let count = vueModel.counters[vueModel.selectedComponent];
        if (count === undefined)
            count = 0;
        else
            count++;
        vueModel.counters[vueModel.selectedComponent] = count;
        return vueModel.selectedComponent + count;
    }
};
