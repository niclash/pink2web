
export const graph_protocol = {
    initial_counter: 0,
    currentGraph: null,
    request: function (connection, command, payload) {
        connection.send({
            protocol: "graph",
            command: command,
            payload: payload
        });
    },
    request_list_graphs: function (connection) {
        console.log("Request list graphs");
        connection.send({
            protocol: "graph",
            command: "list",
            payload: {
            }
        });
    },
    request_new_graph: function (connection, graphName, description) {
        console.log("Request new graph:" + graphName);
        connection.send({
            protocol: "graph",
            command: "new",
            payload: {
                name: graphName,
                description: description,
            }
        });
    },
    request_delete_graph: function (connection, graphId, graphName) {
        console.log("Request new graph:" + graphName);
        connection.send({
            protocol: "graph",
            command: "delete",
            payload: {
                id: graphId,
                name: graphName
            }
        });
    },
    request_rename_graph: function (connection, graphId, oldName, newName) {
        console.log("Request new graph:" + graphName);
        connection.send({
            protocol: "graph",
            command: "delete",
            payload: {
                id: graphId,
                from: oldName,
                to: newName,
            }
        });
    },
    request_connect: function (connection, graphName) {
        console.log("Request connect:" + graphName);
        connection.send({
            protocol: "graph",
            command: "connect",
            payload: {
                id: graphName
            }
        });
    },
    request_disconnect: function (connection, graphName) {
        console.log("Request disconnect:" + graphName);
        connection.send({
            protocol: "graph",
            command: "disconnect",
            payload: {
                id: graphName
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
    // changeinitial is not documented in FBP. It is an extension.
    request_changeinitial: function (connection, data, toNode, toPort, toIndex, metadata = null) {
        console.log("Request changeinitial:" + data + " ---> " + toNode + "." + toPort);
        let tgt = support.buildEndpoint(toNode, toPort, toIndex);
        connection.send({
            protocol: "graph",
            command: "changeinitial",
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
    clear: function (target,connection, payload) {
        target.clear();
        this.currentGraph = payload.id;
        this.name = payload.name;
        this.library = payload.library;
        this.main = payload.main;
        this.icon = payload.icon;
        this.description = payload.description;
    },

    addnode: function (target,connection, payload) {
        console.log("addnode", JSON.stringify(payload));
        if (this.validGraph(payload.graph)) {
            target.addNodeData(payload);
        }
    },

    removenode: function (target,connection, payload) {
        console.log("removenode", JSON.stringify(payload));
        if (this.validGraph(payload.graph)) {
            let node = target.findNode(payload.id);
            if (node !== null) {
                target.removeNodeData(node);
            }
        }
    },

    renamenode: function (target,connection, payload) {
        console.log("renamenode", JSON.stringify(payload));
        if (this.validGraph(payload.graph)) {
            let node = target.findNode(payload.from);
            if (node !== null) {
                target.setKeyForNodeData(node, payload.to);
            }
            target.linkDataArray.forEach( link => {
                if( payloadlink.src.block.equals(link.from) )
                    payloadlink.src.block = link.to;
                if( payloadlink.tgt.block.equals(link.from) )
                    payloadlink.tgt.block = link.to;
            });
        }
    },

    changenode: function (target,connection, payload) {
        console.log("changenode", JSON.stringify(payload));
        if (this.validGraph(payload.graph)) {
            let node = target.findNode(payload.from);
            if (node !== null) {
                node.metadata = payload.metadata;
            }
        }
    },
    addedge: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
            target.addLinkData(payload);
        }
    },
    removeedge: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
            let link = target.findLink(payload);
            if (link !== null) {
                target.removeLinkData(link);
            }
        }
    },
    changeedge: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
            let link = target.findLink(payload);
            if (link !== null) {
                link.metadata = payload.metadata;
            }
        }
    },
    addinitial: function (target,connection, payload) {
        console.log("addinitial" + JSON.stringify(payload));
        if (this.validGraph(payload.graph)) {
            let id = "initial" + this.initial_counter++;
            target.addNodeData({component:"_built_in/initial", id:id, data:payload.src.data});
            payload.src.node = id;
            payload.src.port = "out";
            target.addLinkData(payload);
        }
    },
    removeinitial: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
            let link = support.findLinkTo(payload.tgt);
            if( link !== null ) {
                let node = target.findNode(link.src.node);
                target.removeNodeData(node);
                target.removeLinkData(link);
            }
        }
    },
    addinport: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    removeinport: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    renameinport: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    addoutport: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    removeoutport: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    renameoutport: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    addgroup: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
            let groupName = payload.name;
            target.addNodeData({id: groupName, isGroup: true, component: "StandardGroup"});
            payload.nodes.forEach(function (n) {
                let node = target.findNodeDataForKey(n);
                target.setGroupKeyForNodeData(node, groupName);
            });
        }
    },
    removegroup: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
            let groupName = payload.name;
            target.nodeDataArray.forEach(function (n) {
                let key = target.getKeyForNodeData(n);
                let node = target.findNodeDataForKey(key);
                let group = target.getGroupKeyForNodeData(node);
                if (group === groupName) {
                    target.setGroupKeyForNodeData(node, undefined);
                }
            });
        }
    },
    renamegroup: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
            let groupName = payload.from;
            target.nodeDataArray.forEach(function (n) {
                let key = target.getKeyForNodeData(n);
                let node = target.findNodeDataForKey(key);
                let group = target.getGroupKeyForNodeData(node);
                if (group === groupName) {
                    target.setGroupKeyForNodeData(node, payload.to);
                }
            });
        }
    },
    changegroup: function (target,connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    validGraph: function (graph) {
        return graph === this.currentGraph;
    }
};
