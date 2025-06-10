<script setup lang="ts">

import {onMounted, ref} from "vue";
import {createEditor} from './viewmodel';
import {editor} from './viewmodel/default';
import {componentTemplates, Connection, Node, PrimitiveNode, vueModel} from "../model";
import {
  AddEdgeEvent,
  AddGroupEvent,
  AddInitialEvent,
  AddInportEvent,
  AddNodeEvent,
  AddOutportEvent,
  ChangeEdgeEvent,
  ChangeGroupEvent,
  ChangeNodeEvent,
  ClearEvent,
  GraphProtocol,
  RemoveEdgeEvent,
  RemoveGroupEvent,
  RemoveInitialEvent,
  RemoveInportEvent,
  RemoveNodeEvent,
  RemoveOutportEvent,
  RenameGroupEvent,
  RenameInportEvent,
  RenameNodeEvent,
  RenameOutportEvent
} from "@/components/protocols/graph";
import {Port} from "@/components/protocols/protocols";
import {Position} from "rete-area-plugin/_types/types";

const rete = ref<HTMLElement | null>(null);

const startTransaction = (payload: any, skipGraphIdCheck: boolean = false) => {
  if (!skipGraphIdCheck && vueModel.currentGraph.id !== payload.graph)   // try to ensure we don't get superfluous messages from old interactions, or from other users.
    throw 'invalid graph id';
  console.log("Transaction { ");
  vueModel.pipesDisabled = true;
}

const endTransaction = () => {
  vueModel.pipesDisabled = false;
  console.log("};");
};

const findNodeByName = (name: string): Node | undefined => {
  let result: Node[] = [];
  editor.getNodes().forEach((n: Node) => {
    if (n.label === name)
      result.push(n);
  });
  if (result.length > 0)
    return result[0]
  return undefined;
}

const cloneDescriptors = (ports: Port[]): Port[] => {
  let clone: Port[] = [];
  for (let desc of ports) {
    clone.push({
      id: desc.id,
      type: desc.type,
      description: desc.description,
      addressable: desc.addressable,
      default: desc.default,
      required: desc.required,
      schema: desc.schema,
      values: []
    });
  }
  return clone;
}

const onGraphClear = async (payload: ClearEvent): Promise<void> => {
  startTransaction(payload, true);
  vueModel.currentGraph = payload;
  try {
    await editor.clear();
  } finally {
    endTransaction();
  }
};

const onGraphAddNode = async (payload: AddNodeEvent): Promise<void> => {
  console.log("OnGraphAddNode")
  startTransaction(payload);
  try {
    let template = componentTemplates[payload.component];
    let inp: Port[] = cloneDescriptors(template.inPorts);
    let outp: Port[] = cloneDescriptors(template.outPorts);
    let node = new PrimitiveNode(payload.id, "", payload.component, inp, outp);
    await editor.addNode(node);
    await editor.area.translate(node.id, payload.metadata);
  } finally {
    endTransaction();
  }
};

const onGraphRemoveNode = async (payload: RemoveNodeEvent): Promise<void> => {
  startTransaction(payload);
  try {
    let node = findNodeByName(payload.id)?.id;
    if (node !== undefined) {
      await editor.removeNode(node);
    }
  } finally {
    endTransaction();
  }
};

const onGraphRenameNode = (payload: RenameNodeEvent): void => {
  startTransaction(payload);
  try {
    let oldName = payload.from;
    let node = findNodeByName(oldName);
    if (node !== undefined) {
      node.label = payload.to; // This is a synchronous property change
    }
  } finally {
    endTransaction();
  }
};

const onGraphChangeNode = async (payload: ChangeNodeEvent): Promise<void> => {
  startTransaction(payload);
  try {
    let node = findNodeByName(payload.id);
    if (node !== undefined) {
      await editor.setPosition(node.id, payload.metadata as Position);
    }
  } finally {
    endTransaction();
  }
};

const onGraphAddEdge = async (p: AddEdgeEvent): Promise<void> => {
  startTransaction(p);
  try {
    let srcNode = findNodeByName(p.src.node); // Ensure these are the Rete Node objects
    let srcPort = p.src.port; // Ensure these are the string IDs of the ports
    let tgtNode = findNodeByName(p.tgt.node);
    let tgtPort = p.tgt.port;

    if (srcNode !== undefined && tgtNode !== undefined) {
      // The Connection class from model.ts extends Classic.Connection
      // Its constructor might be: constructor(source: SourceNode, sourceOutput: SourceOutputKey, target: TargetNode, targetInput: TargetInputKey)
      // Assuming p.src.port and p.tgt.port are the correct key types (string IDs).
      let link = new Connection(srcNode, srcPort as any, tgtNode, tgtPort as any); // Using 'as any' if type checking is problematic with generic keys
      await editor.addConnection(link);
    }
  } finally {
    endTransaction();
  }
};

const onGraphRemoveEdge = async (payload: RemoveEdgeEvent): Promise<void> => {
  startTransaction(payload);
  try {
    let srcNodeId = findNodeByName(payload.src.node)?.id;
    let tgtNodeId = findNodeByName(payload.tgt.node)?.id;

    if (srcNodeId && tgtNodeId) {
      const connections = editor.getConnections();
      const matchingConnections = connections.filter(c =>
          c.source === srcNodeId &&
          c.target === tgtNodeId &&
          c.sourceOutput === payload.src.port &&
          c.targetInput === payload.tgt.port
      );

      if (matchingConnections.length > 0) {
        await editor.removeConnection(matchingConnections[0].id);
      }
    }
  } finally {
    endTransaction();
  }
};

const onGraphChangeEdge = async (payload: ChangeEdgeEvent): Promise<void> => {
  startTransaction(payload);
  try {

  } finally {
    endTransaction();
  }
};

const onGraphAddInitial = async (payload: AddInitialEvent): Promise<void> => {
  startTransaction(payload);
  try {
    let tgtNode = findNodeByName(payload.tgt.node);
    if (tgtNode !== undefined) {
      // Assuming editor.addInitial might be async or trigger piped events
      await editor.addInitial(payload.src.data, tgtNode, payload.tgt.port, payload.tgt.index);
    }
  } finally {
    endTransaction();
  }
};

const onGraphRemoveInitial = async (payload: RemoveInitialEvent): Promise<void> => {
  startTransaction(payload);
  try {
    let tgtNode = findNodeByName(payload.tgt.node);
    if (tgtNode !== undefined){
      // Assuming editor.removeInitial might be async or trigger piped events
      await editor.removeInitial(tgtNode, payload.tgt.port, payload.tgt.index);
    }
  } finally {
    endTransaction();
  }
};

const onGraphAddInport = async (payload: AddInportEvent): Promise<void> => {
  startTransaction(payload);
  try {

  } finally {
    endTransaction();
  }
};

const onGraphRemoveInport = async (payload: RemoveInportEvent): Promise<void> => {
  startTransaction(payload);
  try {

  }finally {
    endTransaction();
  }
};

const onGraphRenameInport = async (payload: RenameInportEvent): Promise<void> => {
  startTransaction(payload);
  try {

  } finally {
    endTransaction();
  }
};

const onGraphAddOutport = async (payload: AddOutportEvent): Promise<void> => {
  startTransaction(payload);
  try {

  } finally {
    endTransaction();
  }
};

const onGraphRemoveOutport = async (payload: RemoveOutportEvent): Promise<void> => {
  startTransaction(payload);
  try {

  } finally {
    endTransaction();
  }
};
const onGraphRenameOutport = async (payload: RenameOutportEvent): Promise<void> => {
  startTransaction(payload);
  try {

  } finally {
    endTransaction();
  }
};
const onGraphAddGroup = async (payload: AddGroupEvent): Promise<void> => {
  startTransaction(payload);
  try {

  } finally {
    endTransaction();
  }
};
const onGraphRemoveGroup = async (payload: RemoveGroupEvent): Promise<void> => {
  startTransaction(payload);
  try {

  } finally {
    endTransaction();
  }
};
const onGraphRenameGroup = async (payload: RenameGroupEvent): Promise<void> => {
  startTransaction(payload);
  try {

  } finally {
    endTransaction();
  }
};
const onGraphChangeGroup = async (payload: ChangeGroupEvent): Promise<void> => {
  startTransaction(payload);
  try {

  } finally {
    endTransaction();
  }
};


const callbacks = [
  onGraphClear,
  onGraphAddNode,
  onGraphRemoveNode,
  onGraphRenameNode,
  onGraphChangeNode,
  onGraphAddEdge,
  onGraphRemoveEdge,
  onGraphChangeEdge,
  onGraphAddInitial,
  onGraphRemoveInitial,
  onGraphAddInport,
  onGraphRemoveInport,
  onGraphRenameInport,
  onGraphAddOutport,
  onGraphRemoveOutport,
  onGraphRenameOutport,
  onGraphAddGroup,
  onGraphRemoveGroup,
  onGraphRenameGroup,
  onGraphChangeGroup,
];

onMounted(() => {
  createEditor(rete.value!);
  setTimeout(() => {
    editor.addPipe((ctx) => {
      if (vueModel.pipesDisabled) {
        return ctx;
      }
      let graphProtocol = vueModel.connection.value?.proto.graph;
      switch (ctx.type) {
        case 'nodecreate':
          let nodeName = vueModel.nextName();
          let componentType = vueModel.selectedComponent;
          graphProtocol?.request_addnode(nodeName, componentType, 300, 300);
          return undefined;
        case 'noderemove':
          graphProtocol?.request_removenode(ctx.data.label);
          return undefined;
        case 'connectioncreate':
          let fromNode: string | undefined = editor.getNode(ctx.data.source)?.label;
          let fromPort: string = ctx.data.sourceOutput;
          let fromIndex: number = -1;
          let toNode: string | undefined = editor.getNode(ctx.data.target)?.label;
          let toPort: string = ctx.data.targetInput;
          let toIndex: number = -1;
          if (fromNode === undefined || toNode === undefined)
            return undefined;
          graphProtocol?.request_addedge(fromNode, toNode, fromPort, toPort, fromIndex, toIndex, {});
          return undefined;
        case 'connectionremove':
          let srcNode = editor.getNode(ctx.data.source)?.label;
          let tgtNode = editor.getNode(ctx.data.target)?.label;
          if (srcNode === undefined || tgtNode === undefined)
            return undefined;
          graphProtocol?.request_removeedge(srcNode, tgtNode, ctx.data.sourceOutput, ctx.data.targetInput, -1, -1);
          return undefined;
      }
      return ctx;
    });
    editor.area.addPipe((ctx) => {
      let graphProtocol = vueModel.connection.value?.proto.graph;
      if (vueModel.pipesDisabled) {
        return ctx;
      }
      if (graphProtocol) {
        // if( ctx.type !== "pointermove" && ctx.type.indexOf("render") == -1 )
        //   console.log("Area Context:", ctx);
        switch (ctx.type) {
          case 'nodetranslate':
            let node = editor.getNode(ctx.data.id);
            if (node !== undefined) {
              let nodeName = node.label;
              graphProtocol.request_changenode(nodeName, ctx.data.position);
            }
            return undefined;
          case 'nodetranslated':
          case 'nodedragged':
          case 'unmount':
          case 'pointerup':
          case 'pointermove':
          case 'render':
          case 'rendered':
            return ctx;
        }
      }
      return ctx;
    });
  }, 100);
  let conn = vueModel.connection.value;
  if (conn !== undefined) {
    let graph = conn.proto.graph;
    callbacks.forEach(cb => {
      let name = cb.name;
      graph.addListener(name as keyof GraphProtocol['listeners'], cb)
    });
  }
});

</script>

<template>
  <div class="col">
    <main class="rete" ref="rete"></main>
  </div>
</template>

<style scoped>
.rete {
  position: relative;
  height: 85vh;
  font-size: 1rem;
  background: white;
  border-radius: 1em;
  text-align: left;
  border: 3px solid #55b881;
  line-height: 1;
}
</style>