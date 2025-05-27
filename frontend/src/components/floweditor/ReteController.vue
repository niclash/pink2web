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

const onGraphClear = (payload: ClearEvent): void => {
  startTransaction(payload, true);
  vueModel.currentGraph = payload;
  editor.clear().finally(() => endTransaction());
};

const onGraphAddNode = (payload: AddNodeEvent): void => {
  console.log("NICLAS!!!")
  startTransaction(payload);
  try {
    let template = componentTemplates[payload.component];
    let inp: Port[] = cloneDescriptors(template.inPorts);
    let outp: Port[] = cloneDescriptors(template.outPorts);
    let node = new PrimitiveNode(payload.id, "", payload.component, inp, outp);
    editor.addNode(node).then((n) => {
      console.log("Niclas___translate()", n);
      return editor.area.translate(node.id, payload.metadata);
    });
  } finally {
    endTransaction();
  }
};

const onGraphRemoveNode = (payload: RemoveNodeEvent): void => {
  startTransaction(payload);
  let node = findNodeByName(payload.id)?.id;
  if (node !== undefined)
    editor.removeNode(node).finally(() => endTransaction());
  else
    endTransaction();
};

const onGraphRenameNode = (payload: RenameNodeEvent): void => {
  startTransaction(payload);
  let oldName = payload.from;
  let node = findNodeByName(oldName);
  if (node !== undefined)
    node.label = payload.to;
  endTransaction();
};

const onGraphChangeNode = (payload: ChangeNodeEvent): void => {
  startTransaction(payload);
  let node = findNodeByName(payload.id);
  if (node !== undefined)
    editor.setPosition(node.id, payload.metadata as Position).then(() => endTransaction())
  else
    endTransaction();
};

const onGraphAddEdge = (p: AddEdgeEvent): void => {
  startTransaction(p);
  let srcNode = findNodeByName(p.src.node);
  let srcPort = p.src.port;
  let tgtNode = findNodeByName(p.tgt.node);
  let tgtPort = p.tgt.port;
  if (srcNode !== undefined && tgtNode !== undefined) {
    let link = new Connection(srcNode, srcPort, tgtNode, tgtPort);
    editor.addConnection(link).then(() => endTransaction());
  } else {
    endTransaction();
  }
};

const onGraphRemoveEdge = (payload: RemoveEdgeEvent): void => {
  startTransaction(payload);
  let notFound = true;
  try {
    let srcNode = findNodeByName(payload.src.node)?.id;
    let tgtNode = findNodeByName(payload.tgt.node)?.id;
    editor.getConnections()
        .filter(c => c.source === srcNode)
        .filter(c => c.target === tgtNode)
        .filter(c => c.sourceOutput === payload.src.port)
        .filter(c => c.targetInput === payload.tgt.port)
        .map(c => c.id)
        .forEach((link) => {
          notFound = false;
          editor.removeConnection(link).then(() => endTransaction());
        });
  } finally {
    if (notFound)
      endTransaction();
  }
};

const onGraphChangeEdge = (payload: ChangeEdgeEvent): void => {
  startTransaction(payload);
  endTransaction();
};

const onGraphAddInitial = (payload: AddInitialEvent): void => {
  startTransaction(payload);
  let tgtNode = findNodeByName(payload.tgt.node);
  if (tgtNode !== undefined) {
    editor.addInitial(payload.src.data, tgtNode, payload.tgt.port, payload.tgt.index).finally(() => endTransaction());
  } else {
    endTransaction();
  }
};

const onGraphRemoveInitial = (payload: RemoveInitialEvent): void => {
  startTransaction(payload);
  let tgtNode = findNodeByName(payload.tgt.node);
  if (tgtNode !== undefined)
    editor.removeInitial(tgtNode, payload.tgt.port, payload.tgt.index).finally(() => endTransaction());
  else
    endTransaction();
};

const onGraphAddInport = (payload: AddInportEvent): void => {
  startTransaction(payload);

  endTransaction();
};

const onGraphRemoveInport = (payload: RemoveInportEvent): void => {
  startTransaction(payload);

  endTransaction();
};

const onGraphRenameInport = (payload: RenameInportEvent): void => {
  startTransaction(payload);

  endTransaction();
};

const onGraphAddOutport = (payload: AddOutportEvent): void => {
  startTransaction(payload);

  endTransaction();
};
const onGraphRemoveOutport = (payload: RemoveOutportEvent): void => {
  startTransaction(payload);

  endTransaction();
};
const onGraphRenameOutport = (payload: RenameOutportEvent): void => {
  startTransaction(payload);

  endTransaction();
};
const onGraphAddGroup = (payload: AddGroupEvent): void => {
  startTransaction(payload);

  endTransaction();
};
const onGraphRemoveGroup = (payload: RemoveGroupEvent): void => {
  startTransaction(payload);

  endTransaction();
};
const onGraphRenameGroup = (payload: RenameGroupEvent): void => {
  startTransaction(payload);

  endTransaction();
};
const onGraphChangeGroup = (payload: ChangeGroupEvent): void => {
  startTransaction(payload);

  endTransaction();
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
      console.log("Pipe Context:", vueModel.pipesDisabled, ctx);
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