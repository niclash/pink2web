console.log("HELLO!!!");
var $$$ = go.GraphObject.make;
var viewModel;

const libVue = new Vue({
    el: '#blocks',
    data: {
        components: {}
    }
});


function initPinkweb() {
    let onOpened = function (conn) {
        console.log("Try message", conn);
        runtime_protocol.request_runtime(conn, "12345");
    };
    websocket.init(onOpened);
    graph_protocol.currentGraph = "";
    runtime_protocol.currentSecret = "1234";

    graph = $$$(go.Diagram, "pinkflow-editor",
        {
            "undoManager.isEnabled": true,
            "toolManager.hoverDelay": 200,
            "draggingTool.dragsLink": false,
            "draggingTool.isGridSnapEnabled": true,
            "linkingTool.isUnconnectedLinkValid": true,
            "linkingTool.portGravity": 20,
            "relinkingTool.isUnconnectedLinkValid": true,
            "relinkingTool.portGravity": 20,
            "toolManager.dragSelectingTool": $$$(RealtimeDragSelectingTool, {isPartialInclusion: true}),
            "relinkingTool.fromHandleArchetype":
                $$$(go.Shape, "Diamond", {
                    segmentIndex: 0,
                    cursor: "pointer",
                    desiredSize: new go.Size(8, 8),
                    fill: "tomato",
                    stroke: "darkred"
                }),
            "relinkingTool.toHandleArchetype":
                $$$(go.Shape, "Diamond", {
                    segmentIndex: -1,
                    cursor: "pointer",
                    desiredSize: new go.Size(8, 8),
                    fill: "darkred",
                    stroke: "tomato"
                }),
            "linkReshapingTool.handleArchetype":
                $$$(go.Shape, "Diamond", {desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue"}),
            "ChangedSelection": function (evt) {
                var links = [];
                if (evt.subject === null) {
                    return;
                }
                graph.model.commit(function(m) {
                    m.linkDataArray.forEach( l => m.set(l, "value", ""));
                }, "remove link label");

                evt.subject.filter((p) => p instanceof go.Link).each((link) => {
                    let linkdata = {
                        src: link.data.src,
                        tgt: link.data.tgt
                    }
                    links.push(linkdata);
                });
                network_protocol.request_edges(websocket.device_connection, links);
            },
            "ModelChanged": function (evt) {
                // ignore unimportant Transaction events
                if (!evt.isTransactionFinished) return;
                var txn = evt.object;  // a Transaction
                if (txn === null) return;
                // iterate over all of the actual ChangedEvents of the Transaction
                txn.changes.each(function (e) {
                    // record node insertions and removals
                    if (e.change === go.ChangedEvent.Property) {
                        if (e.modelChange === "linkFromKey") {
                            console.log(evt.propertyName + " changed From key of link: " +
                                e.object + " from: " + JSON.stringify(e.oldValue) + " to: " + JSON.stringify(e.newValue));
                        } else if (e.modelChange === "linkToKey") {
                            console.log(evt.propertyName + " changed To key of link: " +
                                e.object + " from: " + JSON.stringify(e.oldValue) + " to: " + JSON.stringify(e.newValue));
                        }
                    } else if (e.change === go.ChangedEvent.Insert && e.modelChange === "linkDataArray") {
                        console.log(evt.propertyName + " added link: " + JSON.stringify(e.newValue));
                    } else if (e.change === go.ChangedEvent.Remove && e.modelChange === "linkDataArray") {
                        console.log(evt.propertyName + " removed link: " + JSON.stringify(e.oldValue));
                    }
                });
            }
        });

    // This redirects the AddLink to the backend and the operation will be carried out
    // when the backend sends the addedge() back to the UI. This means that all UI should be updated automatically
    let linkingtool = graph.toolManager.linkingTool;
    linkingtool.insertLink = function (fromnode, fromport, tonode, toport) {
        if (tonode === null || toport === null)
            return null;
        console.log(fromnode, fromport);
        if (fromnode === null || fromport === null) {
            let data = parseFloat(prompt("Constant Value", "0.0"));
            graph_protocol.request_addinitial(websocket.device_connection, data, tonode.key, toport.portId);
        } else {
            graph_protocol.request_addedge(websocket.device_connection, fromnode.key, tonode.key, fromport.portId, toport.portId, null, null);
        }
        return null;
    };

    let tool = graph.toolManager.textEditingTool;
    tool.oldActivate = tool.doActivate;
    tool.doActivate = function () {
        tool.oldActivate();
        tool.oldName = tool.textBlock.text;
    };
    tool.oldAcceptText = tool.acceptText;
    tool.acceptText = function (reason) {
        let newName = tool.currentTextEditor.valueFunction();
        graph_protocol.request_renamenode(websocket.device_connection, tool.oldName, newName);
        tool.doCancel();
    };
    graph.commandHandler.deleteSelection = function () {
        let selection = graph.selection;
        selection.each((v) => {
            if (v.key !== undefined) {
                // Node
                graph_protocol.request_removenode(websocket.device_connection, v.key);
            } else if (v.fromPortId !== undefined && v.fromNode.key !== undefined && v.toPortId !== undefined && v.toNode.key !== undefined) {
                // Link
                graph_protocol.request_removeedge(websocket.device_connection, v.fromNode.key, v.toNode.key, v.fromPortId, v.toPortId);
            }
        });
    };

    // noinspection ES6ModulesDependencies
    graph.nodeTemplateMap = new go.Map();
    graph.groupTemplateMap.add("StandardGroup",
        $$$(go.Group, "Vertical",
            $$$(go.Panel, "Auto",
                $$$(go.Shape, "RoundedRectangle", {fill: "white"}),
                $$$(go.TextBlock, "Group", {alignment: go.Spot.Top, stroke: "black", font: "bold 9pt sans-serif"}),
                $$$(go.Placeholder, {padding: new go.Margin(20, 5, 5, 5)})
            )
        ));
    graph.linkTemplate =
        $$$(go.Link,
            {routing: go.Link.Orthogonal, corner: 3},
            $$$(go.Shape),
            $$$(go.Shape, {toArrow: "Standard"}),
            $$$(go.TextBlock,
                {
                    segmentIndex: 0,
                    segmentOffset: new go.Point(NaN, NaN),
                    segmentOrientation: go.Link.OrientUpright,
                },
                new go.Binding("text", "value")),
            $$$(go.TextBlock,
                {
                    segmentIndex: -1,
                    segmentOffset: new go.Point(NaN, NaN),
                    segmentOrientation: go.Link.OrientUpright,
                },
                new go.Binding("text", "value"))
        );
    graph.layout = $$$(go.LayeredDigraphLayout, {columnSpacing: 10});
    viewModel = $$$(go.GraphLinksModel,
        {
            nodeDataArray: [],
            linkDataArray: []
        });

    viewModel.nodeCategoryProperty = "component";
    viewModel.nodeKeyProperty = "id";

    // The links are represented like this;
    // {"tgt":{"port":"input2","node":"block7"},"src":{"port":"output","node":"block6"},"graph":"main"}
    viewModel.linkFromKeyProperty = (data, newval) => {
        if (newval === undefined) {
            if (data.src === undefined)
                return undefined;
            return data.src.node;
        }
        if (data.src == null) {
            data.src = {};
        }
        data.src.node = newval;
    };
    viewModel.linkFromPortIdProperty = (data, newval) => {
        if (newval === undefined) {
            if (data.src === undefined)
                return undefined;
            return data.src.port;
        }
        if (data.src == null) {
            data.src = {};
        }
        data.src.port = newval;
    };

    viewModel.linkToKeyProperty = (data, newval) => {
        if (newval === undefined) {
            if (data.tgt === undefined)
                return undefined;
            return data.tgt.node;
        }
        if (data.tgt == null) {
            data.tgt = {};
        }
        data.tgt.node = newval;
    };

    viewModel.linkToPortIdProperty = (data, newval) => {
        if (newval === undefined) {
            if (data.tgt === undefined)
                return undefined;
            return data.tgt.port;
        }
        if (data.tgt == null) {
            data.tgt = {};
        }
        data.tgt.port = newval;
    };
    graph.model = viewModel;
    makeInitialTemplate("_built_in/initial");
}

function removeNode(e, obj) {
    graph.commandHandler.deleteSelection();
}

var support = {
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
    }
}
var makeGroupCounter = 0;

function makeGroup(e, obj) {
    let nodes = [];
    let selection = graph.selection;
    selection.each((v) => {
        if (v.key !== undefined) {
            nodes.push(v.key);
        }
    });
    graph_protocol.request_addgroup(websocket.device_connection, "group" + makeGroupCounter++, nodes);
}

function makePort(name, left) {
    const port = $$$(go.Shape, "Rectangle",
        {
            fill: "gray", stroke: null,
            desiredSize: new go.Size(8, 8),
            portId: name,
            toMaxLinks: 1,
            cursor: "pointer"
        });

    const lab = $$$(go.TextBlock, name, {font: "7pt sans-serif"});

    const panel = $$$(go.Panel, "Horizontal", {margin: new go.Margin(2, 0)});

    if (left) {
        port.toSpot = go.Spot.Left;
        port.toLinkable = true;
        lab.margin = new go.Margin(1, 0, 0, 1);
        panel.alignment = go.Spot.TopLeft;
        panel.add(port);
        panel.add(lab);
    } else {
        port.fromSpot = go.Spot.Right;
        port.fromLinkable = true;
        lab.margin = new go.Margin(1, 1, 0, 0);
        panel.alignment = go.Spot.TopRight;
        panel.add(lab);
        panel.add(port);
    }
    return panel;
}

function makeInitialTemplate(fullname) {  // 'initial' is the immediate value that can be assigned to an input port.
    graph.startTransaction("make initial template");
    const port = $$$(go.Shape, "Rectangle",
        {
            stroke: null,
            desiredSize: new go.Size(8, 8),
            portId: "out",
            toMaxLinks: 1,
            cursor: "pointer"
        });

    const node = $$$(go.Node, "Spot",
        $$$(go.Panel, "Auto",
            $$$(go.TextBlock,
                {
                    column: 0, row: 0, columnSpan: 3, alignment: go.Spot.Center,
                    editable: true,
                    isMultiline: false,
                    font: "bold 10pt sans-serif",
                    margin: new go.Margin(2, 2)
                },
                new go.Binding("text", "data")
            )
        )
    );
    graph.nodeTemplateMap.set(fullname, node);
    graph.commitTransaction("make initial template");
}

function makeTemplate(fullname, component) {
    console.log("Make Template", fullname, component.name, component);
    graph.startTransaction("make template");
    let typename = component.name;
    let description = component.description;
    let icon = component.icon;
    let background = "#eee";
    let inports = [];
    let outports = [];
    let idx;
    const contextMenu = {};
    contextMenu.addressableIn = false;
    for (idx in component.inPorts) {
        if (component.inPorts.hasOwnProperty(idx)) {
            let portname = component.inPorts[idx].id;
            if (component.inPorts[idx].addressable) {
                contextMenu.addressableIn = true;
            }
            inports.push(makePort(portname, true));
        }
    }
    for (idx in component.outPorts) {
        if (component.outPorts.hasOwnProperty(idx)) {
            let portname = component.outPorts[idx].id;
            outports.push(makePort(portname, false));
        }
    }
    let menuEntries = [];
    menuEntries.push($$$("ContextMenuButton", $$$(go.TextBlock, "Make Group"), {click: makeGroup}));
    menuEntries.push($$$("ContextMenuButton", $$$(go.TextBlock, "Delete"), {click: removeNode}));
    if (contextMenu.addressableIn) {
        menuEntries.push($$$("ContextMenuButton", $$$(go.TextBlock, "Add Inport"), {click: addNodeInport}));
        menuEntries.push($$$("ContextMenuButton", $$$(go.TextBlock, "Remove Inport"), {click: removeNodeInport}));
    }
    const node = $$$(go.Node, "Spot",
        {
            contextMenu: $$$("ContextMenu", menuEntries)
        },
        $$$(go.Panel, "Auto",
            {
                toolTip: $$$(go.Adornment, "Spot",      // that has several labels around it
                    {background: "#444", padding: $$$(go.Margin, {top: 10, left: 5, bottom: 10, right: 5})},  // avoid hiding tooltip when mouse moves
                    $$$(go.TextBlock, description,
                        {alignment: go.Spot.Center, alignmentFocus: go.Spot.Top, stroke: "white"})
                )
            },
            $$$(go.Shape, "Rectangle",
                {
                    fill: background,
                    spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight
                },
            ),
            $$$(go.Panel, "Table",
                $$$(go.RowColumnDefinition,
                    {column: 0, alignment: go.Spot.Left}),
                $$$(go.RowColumnDefinition,
                    {column: 2, alignment: go.Spot.Right}),
                $$$(go.TextBlock,
                    {
                        column: 0, row: 0, columnSpan: 3, alignment: go.Spot.Center,
                        editable: true,
                        isMultiline: false,
                        font: "bold 10pt sans-serif",
                        margin: new go.Margin(10, 15)
                    },
                    new go.Binding("text", "id")
                ),
                $$$(go.TextBlock, ""),
                $$$(go.TextBlock, typename,
                    {
                        row: 2, column: 0, columnSpan: 3,
                        margin: new go.Margin(10, 15),
                        maxSize: new go.Size(80, 40),
                        alignment: go.Spot.Center,
                        stroke: "black",
                        font: "bold 9pt sans-serif"
                    }
                ),
                $$$(go.Panel, "Vertical",
                    {
                        column: 0, row: 1,
                        alignment: go.Spot.Left,
                        alignmentFocus: new go.Spot(0, 0.5, 8, 0)
                    },
                    inports),
                $$$(go.Panel, "Vertical",
                    {
                        column: 2, row: 1,
                        alignment: go.Spot.Right,
                        alignmentFocus: new go.Spot(1, 0.5, -8, 0)
                    },
                    outports)
            )
        )
    );
    graph.nodeTemplateMap.set(fullname, node);
    graph.commitTransaction("make template");
}

let componentCounter = 0;

function instantiateComponent(lib, component) {
    let type = component.name;
    console.log("instantiate component", lib, component);
    graph_protocol.request_addnode(websocket.device_connection, type + componentCounter++, lib + "/" + type, 50, 50);
    console.log("instantiate component end", viewModel.nodeDataArray);
}
