import {graph_protocol} from "@/components/floweditor/protocols/graph.js";
import {runtime_protocol} from "@/components/floweditor/protocols/runtime.js";


export const network_protocol = {
    request_start: function (onMessage, connection) {
        connection.send({
            protocol: "network",
            command: "start",
            payload: {
                graph: graph_protocol.currentGraph,
                secret: runtime_protocol.currentSecret
            }
        });
    },
    request_stop: function (connection) {
        connection.send({
            protocol: "network",
            command: "stop",
            payload: {
                graph: graph_protocol.currentGraph,
                secret: runtime_protocol.currentSecret
            }
        });
    },
    request_getstatus: function (connection) {
        connection.send({
            protocol: "network",
            command: "getstatus",
            payload: {
                graph: graph_protocol.currentGraph,
                secret: runtime_protocol.currentSecret
            }
        });
    },
    request_persist: function (connection) {
        connection.send({
            protocol: "network",
            command: "persist",
            payload: {
                graph: graph_protocol.currentGraph,
                secret: runtime_protocol.currentSecret
            }
        });
    },
    request_debug: function (connection, enable) {
        connection.send({
            protocol: "network",
            command: "debug",
            payload: {
                enable: enable,
                graph: graph_protocol.currentGraph,
                secret: runtime_protocol.currentSecret
            }
        });
    },
    request_edges: function (connection, links) {
        connection.send({
            protocol: "network",
            command: "edges",
            payload: {
                edges: links,
                graph: graph_protocol.currentGraph,
                secret: runtime_protocol.currentSecret
            }
        });
    },
    start: function (target, connection, graphId) {
    },
    stop: function (target, connection, payload) {
    },
    getstatus: function (target, connection, payload) {
    },
    persist: function (target, connection) {
    },
    debug: function (target, connection, payload) {
    },
    edges: function (target, connection, payload) {
    },
    stopped: function (target, connection, payload) {
        console.log(payload);
        let g = target.findGraph(payload.graph);
        g.time = payload.time;
        g.uptime = payload.uptime;
        g.running = payload.running;
        g.started = payload.started;
        g.debug = payload.debug;
    },
    started: function (target, connection, payload) {
        console.log(payload);
        let g = target.findGraph(payload.graph);
        g.time = payload.time;
        g.running = payload.running;
        g.started = payload.started;
        g.debug = payload.debug;
    },
    status: function (target, connection, payload) {
        console.log(payload);
        let g = target.findGraph(payload.graph);
        g.running = payload.running;
        g.name = payload.name;
        g.description = payload.description;
        g.started = payload.started;
        g.debug = payload.debug;
        g.eventrate = payload.eventrate;
        g.uptime = payload.uptime;
        console.log(g);
    },
    output: function (target, connection, payload) {
        console.log("Message: " + payload.message, payload.url, payload.type);
    },
    error: function (target, connection, payload) {
        console.log("Error: " + payload.graph + " : " + payload.message, payload.stack);
    },
    processerror: function (target, connection, payload) {
        console.log("Error:" + payload.graph + "." + payload.id + " : " + payload.error);
    },
    icon: function (target, connection, payload) {
        console.log("New Icon: " + payload.graph + "." + payload.id + " => " + payload.error);
    },
    connect: function (target, connection, payload) {
    },
    begingroup: function (target, connection, payload) {
    },
    data: function (target, connection, payload) {
        target.dataArrived(payload);
    },
    endgroup: function (target, connection, payload) {
    },
    disconnect: function (target, connection, payload) {
    }
};
