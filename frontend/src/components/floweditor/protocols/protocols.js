import {network_protocol} from "@/components/floweditor/protocols/network.js";
import {runtime_protocol} from "@/components/floweditor/protocols/runtime.js";
import {trace_protocol} from "@/components/floweditor/protocols/trace.js";
import {graph_protocol} from "@/components/floweditor/protocols/graph.js";
import {component_protocol} from "@/components/floweditor/protocols/component.js";

export const protocols = {
    network: network_protocol,
    component: component_protocol,
    graph: graph_protocol,
    runtime: runtime_protocol,
    trace: trace_protocol
};
