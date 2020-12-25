const graph_protocol = {
    currentGraph: null,
    request: function (connection, command, payload) {
        connection.send({
            protocol: "graph",
            command: command,
            payload: payload
        });
    },
    request_clear: function (connection, graphName, humanName, library, main, icon, description) {
        console.log("Request clear:"+ graphName);
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
        console.log( "Request addnode:" + id + ", " + component);
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
        console.log( "Request removenode:" + id );
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
        console.log( "Request renamenode " + from + " to " + to);
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
        console.log( "Request changenode:" + id + ", " + component);
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
        console.log( "Request addedge:" + fromNode + "." + fromPort + " ---> " + toNode + "." + toPort );
        let link = this.buildLink(fromNode, toNode, fromPort, toPort, fromIndex, toIndex);
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
        console.log( "Request removeedge:" + fromNode + "." + fromPort + " ---> " + toNode + "." + toPort );
        let link = this.buildLink(fromNode, toNode, fromPort, toPort, fromIndex, toIndex);
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
        let link = this.buildLink(fromNode, toNode, fromPort, toPort, fromIndex, toIndex);
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
        console.log( "Request addinitial:" + data + " ---> " + toNode + "." + toPort );
        let tgt = this.buildEndpoint(toNode, toPort, toIndex);
        connection.send({
            protocol: "graph",
            command: "addinitial",
            payload: {
                src: data,
                tgt: tgt,
                graph: this.currentGraph,
                metadata: metadata
            }
        });
    },
    request_removeinitial: function (connection, data, toNode, toPort, toIndex) {
        console.log( "Request removeinitial:" + data + " ---> " + toNode + "." + toPort );
        let tgt = this.buildEndpoint(toNode, toPort, toIndex);
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
        console.log( "Request addgroup:" + name + " ---> " + nodes );
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
            let node = this.findNode(payload.id);
            if (node !== null) {
                viewModel.removeNodeData(node);
            }
        }
    },

    renamenode: function (connection, payload) {
        console.log("renamenode", JSON.stringify(payload));
        if (this.validGraph(payload.graph)) {
            let node = this.findNode(payload.from);
            if (node !== null) {
                console.log( "NICLAS!!!!", node);
                viewModel.setKeyForNodeData(node, payload.to);
            }
        }
    },

    changenode: function (connection, payload) {
        console.log("changenode", JSON.stringify(payload));
        if (this.validGraph(payload.graph)) {
            let node = this.findNode(payload.from);
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
            let link = this.findLink(payload);
            if (link !== null) {
                viewModel.removeLinkData(link);
            }
        }
    },
    changeedge: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
            if (this.validGraph(payload.graph)) {
                let link = this.findLink(payload);
                if (link !== null) {
                    link.metadata = payload.metadata;
                }
            }
        }
    },
    addinitial: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    removeinitial: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
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
            viewModel.addNodeData({id: groupName, isGroup: true, component:"StandardGroup"});
            payload.nodes.forEach( function(n) {
                let node = viewModel.findNodeDataForKey(n);
                viewModel.setGroupKeyForNodeData( node, groupName );
            });
        }
    },
    removegroup: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
            let groupName = payload.name;
            viewModel.nodeDataArray.forEach( function(n) {
                let key = viewModel.getKeyForNodeData(n);
                let node = viewModel.findNodeDataForKey(key);
                let group = viewModel.getGroupKeyForNodeData( node );
                if( group === groupName )
                {
                    viewModel.setGroupKeyForNodeData( node, undefined );
                }
            });
        }
    },
    renamegroup: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
            let groupName = payload.from;
            viewModel.nodeDataArray.forEach( function(n) {
                let key = viewModel.getKeyForNodeData(n);
                let node = viewModel.findNodeDataForKey(key);
                let group = viewModel.getGroupKeyForNodeData( node );
                if( group === groupName )
                {
                    viewModel.setGroupKeyForNodeData( node, payload.to );
                }
            });
        }
    },
    changegroup: function (connection, payload) {
        if (this.validGraph(payload.graph)) {
        }
    },
    findNode: function (name) {
        return viewModel.findNodeDataForKey(name);
    },
    findLink: function (linkToFind) {
        for (let idx in viewModel.linkDataArray) {
            if (viewModel.linkDataArray.hasOwnProperty(idx)) {
                let link = viewModel.linkDataArray[idx];
                if (this.linkEquals(link, linkToFind)) {
                    return link;
                }
            }
        }
        return null;
    },
    linkEquals: function (link1, link2) {
        return this.endpointEquals(link1.src, link2.src) && this.endpointEquals(link1.tgt, link2.tgt);
    },
    endpointEquals: function (endp1, endp2) {
        if (endp1.node !== endp2.node)
            return false;
        if (endp1.port !== endp2.port)
            return false;
        if (endp1.index === null && endp2.index === null) {
            return true;
        }
        if (endp1.index === null || endp2.index === null) {
            return false;
        }
        return endp1.index === endp2.index;
    },
    buildEndpoint: function (node, port, index) {
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
    },
    buildLink: function (fromNode, toNode, fromPort, toPort, fromIndex, toIndex) {
        let src = this.buildEndpoint(fromNode, fromPort, fromIndex);
        let tgt = this.buildEndpoint(toNode, toPort, toIndex);
        return {src: src, tgt: tgt};
    },
    validGraph: function (graph) {
        return graph === this.currentGraph;
    }
};
