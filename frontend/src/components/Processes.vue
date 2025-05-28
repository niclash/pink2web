<template>
  <div>
    <!-- Button to toggle the main process list (existing) -->
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
    <!-- "New..." button to trigger the popup -->
    <button class="btn-sm" type="button" @click="openNewProcessPopup()">New...</button>

    <div class="collapse" :class="{ 'show': !view.isCollapsed }" id="processesCollapse">
      <h3>Processes</h3>
      <ul class="list-group">
        <li v-for="[id, graph] in vueModel.graphs.value" :key="graph.graph" @click="$emit('onSelection', graph.graph)"
            class="list-group-item">
          {{ graph.name }}
        </li>
      </ul>
    </div>
  </div>

  <!-- New Process Popup -->
  <Popup v-if="showNewProcessPopup" :onOk="handleCreateProcess" :onCancel="cancelNewProcessPopup">
    <h4>Create New Process</h4>
    <div class="form-group">
      <label for="newProcessName">Name:</label>
      <input type="text" class="form-control" id="newProcessName" v-model="newProcessName"/>
    </div>
    <div class="form-group">
      <label for="newProcessDescription">Description:</label>
      <input type="text" class="form-control" id="newProcessDescription" v-model="newProcessDescription"/>
    </div>
    <!-- Add some spacing for the buttons -->
    <div style="margin-top: 15px;"></div>
  </Popup>
</template>

<script lang="ts" setup>
import {RuntimeEvent} from "@/components/protocols/runtime";
import {onMounted, ref} from "vue";
// defineEmits is usually auto-imported or available globally in <script setup>
// import { Ref, UnwrapRef, defineEmits } from "vue"; // Not strictly necessary for defineEmits
import {Graph, vueModel} from './model';
import Popup from "@/components/Popup.vue"; // Import the Popup component

const name = "Processes";

const view = {
  isCollapsed: ref(true),
}

const showNewProcessPopup = ref(false);
const newProcessName = ref("");
const newProcessDescription = ref("");

const openNewProcessPopup = () => {
  newProcessName.value = ""; // Reset fields
  newProcessDescription.value = "";
  showNewProcessPopup.value = true;
  console.log("Opening new process popup");
};

const handleCreateProcess = () => {
  if (!newProcessName.value || newProcessName.value.trim() === "") {
    alert("Process name cannot be empty."); // Simple validation for now
    return;
  }
  console.log(`Creating new process: Name='${newProcessName.value}', Description='${newProcessDescription.value}'`);
  vueModel.connection.value?.proto.runtime.request_new_graph(newProcessName.value, newProcessDescription.value, "");
  showNewProcessPopup.value = false; // Close popup after attempting creation
};

const cancelNewProcessPopup = () => {
  showNewProcessPopup.value = false;
  console.log("Cancelled new process popup");
};

// This local model seems redundant if vueModel.connection is used globally
// const model: { connection: Ref<UnwrapRef<undefined | Connection>> } = {
//   connection: ref(undefined )
// }

const addGraphToProcessList = (g: Graph): Graph => {
  vueModel.graphs.value.set(g.graph, g);
  return g;
};

// removeGraph is not currently called from the template
// const removeGraph = (id: string) => {
//   view.isCollapsed.value = false;
//   vueModel.graphs.value.delete(id);
// };

const findGraph = (id: string): Graph | undefined => {
  let existing = vueModel.graphs.value.get(id);
  if (existing === undefined) {
    // This behavior might be okay for optimistic updates, but ensure it aligns with overall logic
    return addGraphToProcessList(new Graph(id, id, "", false));
  }
  return existing;
}

// dataArrived is not currently called
// const dataArrived = (linkValue: any) => {
//   // to update the value in a link.
//   console.log("dataArrived()", linkValue);
// };

const toggleCollapse = () => {
  view.isCollapsed.value = !view.isCollapsed.value;
};

// selectProcess is not directly used by the template's @click, which emits 'onSelection'
// const selectProcess = (id: string) => {
//   let graph = findGraph(id);
//   if( graph === undefined )
//     return "";
//   console.log('Selected Process:', graph);
//   // This direct call might be redundant if App.vue/FlowEditor.vue handles the onSelection event
//   // vueModel.connection.value?.proto.graph.request_connect(graph.graph)
// };

////  Protocol Callbacks

const onRuntime = (runtime: RuntimeEvent) => {
  console.log("Processes.onRuntime", runtime); // Removed 'model' from log as it was local & possibly confusing
  view.isCollapsed.value = false;
}

// onClosed is not registered as a listener
// const onClosed = (connection: Connection): void => {
//   // model.connection.value = undefined;
// }

// onGraphNew will handle the new graph event from the backend
const onGraphCreated = (payload: Graph) => {
  console.log("New graph created:", payload);
  // Assuming the payload for 'graph/new' is a Graph object
  addGraphToProcessList(payload);
  view.isCollapsed.value = false; // Optionally expand the list when a new graph arrives
}

// onGraphDeleted will handle the graph deletion event from the backend
const onGraphDeleted = (payload: { graph: string }) => {
  console.log("Graph deleted:", payload.graph);
  vueModel.graphs.value.delete(payload.graph);
}

const onNetworkStatus = (payload: Graph) => {
  console.log("Process status:", payload);
  addGraphToProcessList(payload);
}

defineExpose({
  callbacks: [onRuntime]
});

const emit = defineEmits<{
  (e: 'onSelection', value: string): void // Updated to Vue 3 event emission syntax
}>();

onMounted(() => {
  console.log("Processes.mounted()");
  let proto = vueModel.connection.value?.proto;
  proto?.runtime.addListener("onRuntime", onRuntime);
  proto?.network.addListener("onNetworkStatus", onNetworkStatus);
  proto?.runtime.addListener("onNewGraphPacket", onGraphCreated);
  proto?.runtime.addListener("onDeleteGraphPacket", onGraphDeleted);
});

</script>

<style scoped>
.list-group-item {
  cursor: pointer;
}

h3 {
  padding-top: 15px;
  font-size: large;
}

/* Basic styling for form elements within the popup */
.form-group {
  margin-bottom: 10px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input.form-control { /* Basic input styling */
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
</style>
