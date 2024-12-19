<style scoped>
.list-group-item {
  cursor: pointer;
}

h3 {
  padding-top: 15px;
  font-size: large;
}
</style>

<script lang="ts" setup>
import {Connection} from "@/components/protocols/websocket";
import {RuntimeEvent} from "@/components/protocols/runtime";
import {ref} from "vue";
import {Ref, UnwrapRef} from "@vue/reactivity";
import {Graph, vueModel} from './model';

const name = "Processes";

const view = {
  isCollapsed: ref(true),
}

const model: { connection: Ref<UnwrapRef<undefined | Connection>> } = {
  connection: ref(undefined )
}

const addGraphToProcessList = (g: Graph): Graph => {
  vueModel.graphs.value.set(g.graph, g);
  return g;
};

const removeGraph = (id: string) => {
  view.isCollapsed.value = false;
  vueModel.graphs.value.delete(id);
};

const findGraph = (id: string): Graph | undefined => {
  let existing = vueModel.graphs.value.get(id);
  if (existing === undefined) {
    return addGraphToProcessList(new Graph(id, id, "", false));
  }
  return existing;
}

const dataArrived = (linkValue: any) => {
  // to update the value in a link.
  console.log("dataArrived()", linkValue);
};

const toggleCollapse = () => {
  view.isCollapsed.value = !view.isCollapsed.value;
};

const selectProcess = (id: string) => {
  // Call your selectProcess method with the selected graph
  let graph = findGraph(id);
  if( graph === undefined )
    return "";
  console.log('Selected Process:', graph);
  if (model.connection.value !== undefined)
    model.connection.value?.proto.graph.request_connect(graph.graph)
};

////  Protocol Callbacks
const onRuntime = (runtime: RuntimeEvent) => {
  console.log("Processes.onRuntime", runtime, model);
  view.isCollapsed.value = false;
  model.connection.value?.proto.graph.request_list_graphs();
};

const onNetworkStatus = (payload: Graph) => {
  console.log("Process status:", payload);
  addGraphToProcessList(payload);
}

const onOpened = (connection: Connection): void => {
  model.connection.value = connection;
};

const onClosed = (connection: Connection): void => {
  model.connection.value = undefined;
};

defineExpose({
  callbacks: [onRuntime, onNetworkStatus]
});

const emit = defineEmits<{
  onSelection: [value: string] // named tuple syntax
}>();

</script>

<template>
  <div>
    <button
        class="btn btn-primary"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#processesCollapse"
        aria-expanded="false"
        aria-controls="processesCollapse"
        @click="toggleCollapse"
    >
      ☰
    </button>
    <div class="collapse" :class="{ 'show': !view.isCollapsed }" id="processesCollapse">
      <h3>Processes</h3>
      <ul class="list-group">
        <li v-for="[id, graph] in vueModel.graphs.value" :key="graph.graph" @click="$emit('onSelection', graph.graph)" class="list-group-item">
          {{ graph.name }}
        </li>
      </ul>
    </div>
  </div>
</template>
