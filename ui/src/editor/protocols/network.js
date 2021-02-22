var known_graphs = [];

var network_protocol = {
    request_start: function (connection) {
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
    start: function (connection, payload) {
    },
    stop: function (connection, payload) {
    },
    getstatus: function (connection, payload) {
    },
    persist: function (connection, payload) {
    },
    debug: function (connection, payload) {
    },
    edges: function (connection, payload) {
    },
    stopped: function (connection, payload) {
        let g = known_graphs[payload.graph];
        g.time = payload.time;
        g.uptime = payload.uptime;
        g.running = payload.running;
        g.started = payload.started;
        g.debug = payload.debug;
    },
    started: function (connection, payload) {
        let g = known_graphs[payload.graph];
        g.time = payload.time;
        g.running = payload.running;
        g.started = payload.started;
        g.debug = payload.debug;
    },
    status: function (connection, payload) {
        let g = known_graphs[payload.graph];
        g.uptime = payload.uptime;
        g.running = payload.running;
        g.started = payload.started;
        g.debug = payload.debug;
    },
    output: function (connection, payload) {
        console.log("Message: " + payload.message, payload.url, payload.type);
    },
    error: function (connection, payload) {
        console.log("Error: " + payload.graph + " : " + payload.message, payload.stack);
    },
    processerror: function (connection, payload) {
        console.log("Error:" + payload.graph + "." + payload.id + " : " + payload.error);
    },
    icon: function (connection, payload) {
        console.log("New Icon: " + payload.graph + "." + payload.id + " => " + payload.error);
    },
    connect: function (connection, payload) {
    },
    begingroup: function (connection, payload) {
    },
    data: function (connection, payload) {
        graph.model.commit(function(m) {
            let link = support.findLink(payload);
            m.set(link, "value", payload.data);
            // link.value = payload.data;
            // link.value = "niclas";
        }, "update link label");
    },
    endgroup: function (connection, payload) {
    },
    disconnect: function (connection, payload) {
    }
};
