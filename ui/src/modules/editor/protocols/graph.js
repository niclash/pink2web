const graph_protocol = {
    initial_counter: 0,
    currentGraph: null,
    request: function (connection, command, payload) {
        connection.send({
            protocol: "graph",
            command: command,
            payload: payload
        });
    },
    request_clear: function (connection, graphName, humanName, library, main, icon, description) {
        console.log("Request clear:" + graphName);
        connection.send({
            protocol: "graph",
            command: "clear",
            payload: {
                id: graphName,
                name: humanName,
                library: library,
                main: main,
                icon: icon,
                description: description
            }
        });
    },
    request_addnode: function (connection, id, component, x, y) {
        console.log("Request addnode:" + id + ", " + component);
        connection.send({
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
    },
    request_removenode: function (connection, id) {
        console.log("Request removenode:" + id);
        connection.send({
            protocol: "graph",
            command: "removenode",
            payload: {
                id: id,
                graph: this.currentGraph
            }
        });
    },
    request_renamenode: function (connection, from, to) {
        console.log("Request renamenode " + from + " to " + to);
        connection.send({
            protocol: "graph",
            command: "renamenode",
            payload: {
                from: from,
                to: to,
                graph: this.currentGraph
            }
        });
    },
    request_changenode: function (connection, id, metadata) {
        console.log("Request changenode:" + id + ", " + component);
        connection.send({
            protocol: "graph",
            command: "changenode",
            payload: {
                id: id,
                metadata: metadata,
                graph: this.currentGraph
            }
        });
    },
    request_addedge: function (connection, fromNode, toNode, fromPort, toPort, fromIndex, toIndex, metadata = null) {
        console.log("Request addedge:" + fromNode + "." + fromPort + " ---> " + toNode + "." + toPort);
        let link = support.buildLink(fromNode, toNode, fromPort, toPort, fromIndex, toIndex);
        let payload = {
            protocol: "graph",
            command: "addedge",
            payload: {
                src: link.src,
                tgt: link.tgt,
                graph: this.currentGraph,
                metadata: metadata
            }
        };
        if (metadata !== null)
            payload.metadata = metadata;
        connection.send(payload);
    },
    request_removeedge: function (connection, fromNode, toNode, fromPort, toPort, fromIndex = null, toIndex = null) {
        console.log("Request removeedge:" + fromNode + "." + fromPort + " ---> " + toNode + "." + toPort);
        let link = support.buildLink(fromNode, toNode, fromPort, toPort, fromIndex, toIndex);
        connection.send({
            protocol: "graph",
            command: "removeedge",
            payload: {
                src: link.src,
                tgt: link.tgt,
                graph: this.currentGraph
            }
        });
    },
    request_changeedge: function (connection, fromNode, toNode, fromPort, toPort, fromIndex, toIndex, metadata = null) {
        let link = support.buildLink(fromNode, toNode, fromPort, toPort, fromIndex, toIndex);
        connection.send({
            protocol: "graph",
            command: "changeedge",
            payload: {
                src: link.src,
                tgt: link.tgt,
                metadata: metadata,
                graph: this.currentGraph
            }
        });
    },
    request_addinitial: function (connection, data, toNode, toPort, toIndex, metadata = null) {
        console.log("Request addinitial:" + data + " ---> " + toNode + "." + toPort);
        let tgt = support.buildEndpoint(toNode, toPort, toIndex);
        connection.send({
            protocol: "graph",
            command: "addinitial",
            payload: {
                src: {data: data},
                tgt: tgt,
                graph: this.currentGraph,
                metadata: metadata
            }
        });
    },
    request_removeinitial: function (connection, data, toNode, toPort, toIndex) {
        console.log("Request removeinitial:" + data + " ---> " + toNode + "." + toPort);
        let tgt = support.buildEndpoint(toNode, toPort, toIndex);
        connection.send({
            protocol: "graph",
            command: "removeinitial",
            payload: {
                src: data,
                tgt: tgt,
                graph: this.currentGraph
            }
        });
    },
    request_addgroup: function (connection, name, nodes) {
        console.log("Request addgroup:" + name + " ---> " + nodes);
        connection.send({
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
    },
    request_removegroup: function (connection, name) {
        connection.send({
            protocol: "graph",
            command: "renamegroup",
            payload: {
                graph: this.currentGraph,
                name: name
            }
        });
    },
    request_renamegroup: function (connection, from, to) {
        connection.send({
            protocol: "graph",
            command: "renamegroup",
            payload: {
                graph: this.currentGraph,
                from: from,
                to: to
            }
        });
    },
    request_changegroup: function (connection, name, newDescription) {
        connection.send({
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
    },
    clear: function (connection, payload) {
        viewModel.clear();
        graph.clear();
        viewModel.nodeDataArray = [];
        viewModel.linkDataArray = [];
        this.currentGraph = payload.id;
        this.name = payload.name;
        this.library = payload.library;
        this.main = payload.main;
        this.icon = payload.icon;
        this.description = payload.description;
    },

    addnode: function (connection, payload) {
        console.log("addnode", JSON.stringify(payload));
        if (this.validGraph(payload.graph)) {
            viewModel.addNodeData(payload);
        }
    },

    removenode: function (connection, payload) {
        console.log("removenode", JSON.stringify(payload));
        if (this.validGraph(payload.graph)) {
            let node = support.findNode(payload.id);
            if (node !== null) {
                viewModel.removeNodeData(node);
            }
        }
    },

    renamenode: function (connection, payload) {
        console.log("renamenode", JSON.stringify(payload));
        if (this.validGraph(payload.graph)) {
            let node = support.findNode(payload.from);
            if (node !== null) {
                viewModel.setKeyForNodeData(node, payload.to);
            }
            viewModel.linkDataArray.forEach( link => {
                if( payloadlink.src.block.equals(link.from) )
                    payloadlink.src.block = link.to;
                if( payloadlink.tgt.block.equals(link.from) )
                    payloadlink.tgt.block = link.to;
            });
        }
    },

    changenode: function (connection, payload) {
        console.log("changenode", JSON.stringify(payload));
        if (this.validGraph(payload.graph)) {
            let node = support.findNode(payload.from);
            if (node !== null) {
                node.metadata = payload.metadata;
            }
        }
    },
    addedge: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
            viewModel.addLinkData(payload);
        }
    },
    removeedge: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
            let link = support.findLink(payload);
            if (link !== null) {
                viewModel.removeLinkData(link);
            }
        }
    },
    changeedge: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
            let link = support.findLink(payload);
            if (link !== null) {
                link.metadata = payload.metadata;
            }
        }
    },
    addinitial: function (connection, payload) {
        console.log("addinitial" + JSON.stringify(payload));

        if (this.validGraph(payload.graph)) {
            let id = "initial" + this.initial_counter++;
            viewModel.addNodeData({component:"_built_in/initial", id:id, data:payload.src.data});
            payload.src.node = id;
            payload.src.port = "out";
            viewModel.addLinkData(payload);
        }
    },
    removeinitial: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
            let input = support.findInput(payload.tgt);  // TODO... Not done
            input.initial = undefined;
        }
    },
    addinport: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    removeinport: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    renameinport: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    addoutport: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    removeoutport: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    renameoutport: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    addgroup: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
            let groupName = payload.name;
            viewModel.addNodeData({id: groupName, isGroup: true, component: "StandardGroup"});
            payload.nodes.forEach(function (n) {
                let node = viewModel.findNodeDataForKey(n);
                viewModel.setGroupKeyForNodeData(node, groupName);
            });
        }
    },
    removegroup: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
            let groupName = payload.name;
            viewModel.nodeDataArray.forEach(function (n) {
                let key = viewModel.getKeyForNodeData(n);
                let node = viewModel.findNodeDataForKey(key);
                let group = viewModel.getGroupKeyForNodeData(node);
                if (group === groupName) {
                    viewModel.setGroupKeyForNodeData(node, undefined);
                }
            });
        }
    },
    renamegroup: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
            let groupName = payload.from;
            viewModel.nodeDataArray.forEach(function (n) {
                let key = viewModel.getKeyForNodeData(n);
                let node = viewModel.findNodeDataForKey(key);
                let group = viewModel.getGroupKeyForNodeData(node);
                if (group === groupName) {
                    viewModel.setGroupKeyForNodeData(node, payload.to);
                }
            });
        }
    },
    changegroup: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    validGraph: function (graph) {
        return graph === this.currentGraph;
    }
};
