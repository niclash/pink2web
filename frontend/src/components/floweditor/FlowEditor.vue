<script lang="ts" setup>
import Processes from "@/components/floweditor/Processes.vue";
import Components from "@/components/floweditor/Components.vue";
import {Connection} from "./protocols/websocket";
import {onMounted, ref, watch} from "vue";
import ReteEditor from "@/components/floweditor/ReteEditor.vue";
import {vueModel} from "@/components/floweditor/model";

const name = "FlowEditor";
const components = {Components, Processes};
const callbackMethods: Record<string, Function[]> = {};

const props = defineProps({
  secret: {
    type: String,
    required: true
  }
});


const openProcess = (processId: string) => {
  console.log("openProcess(" + processId + ");");
  vueModel.connection.value?.proto.graph.request_connect(processId);
}

const addComponent = (componentType: string) => {
  console.log("addComponent(" + componentType + ");");

}

///// Startup code
watch(() => props.secret, (newQ, oldQ) => {
  if (props.secret !== "") {
    vueModel.connection.value = new Connection(props.secret);
    setupCallbackMethods();
    vueModel.connection.value.setupListeners(callbackMethods);
  }
});

const onOpened = (conn: Connection) => {
  console.log("onOpened")
  vueModel.connection.value = conn;
  conn.proto.runtime.request_getruntime();
};

const onClosed = () => {
  console.log("WebSocket closed.");
  vueModel.connection.value = undefined;
};

const onError = () => {
  console.log("WebSocket ERROR!");
};
// const allProtocolMethods = (conn: Connection): string[] => {
//   let allNames: string[] = [];
//   Object.keys(conn.proto.component.listeners).forEach( (method) => allNames.push(method) );
//   Object.keys(conn.proto.graph.listeners).forEach( (method) => allNames.push(method) );
//   Object.keys(conn.proto.network.listeners).forEach( (method) => allNames.push(method) );
//   Object.keys(conn.proto.runtime.listeners).forEach( (method) => allNames.push(method) );
//   Object.keys(conn.proto.trace.listeners).forEach( (method) => allNames.push(method) );
//   console.log( allNames );
//   return allNames;
// };
const comps = ref(null);
const procs = ref(null);
const editor = ref(null);

const setupCallbackMethods = () => {
  console.log("FlowEditor.setupCallbackMethods()");
  // let conn = model.connection.value as Connection;
  // const methodsToInclude = allProtocolMethods(conn);

  addCallbackMethod('onOpened', onOpened);
  addCallbackMethod('onClosed', onClosed);
  addCallbackMethod('onError', onError);

  const componentMethods: { callbacks: ((payload: any) => void)[] } = comps.value!;
  const processesMethods: { callbacks: ((payload: any) => void)[] } = procs.value!;
  const editorMethods: { callbacks: ((payload: any) => void)[] } = editor.value!;

  componentMethods.callbacks.forEach((m) => {
    let methodName = m.name;
    addCallbackMethod(methodName, m);
  });
  processesMethods.callbacks.forEach((m) => {
    let methodName = m.name;
    addCallbackMethod(methodName, m);
  });
  editorMethods.callbacks.forEach((m) => {
    let methodName = m.name;
    addCallbackMethod(methodName, m);
  });
}
const addCallbackMethod = (name: string, fn: (conn: Connection) => void) => {
  if (!(name in callbackMethods)) {
    callbackMethods[name] = [];
  }
  callbackMethods[name].push(fn);
}

onMounted(() => {
  console.log("FlowEditor.mounted()");
});
/////
</script>


<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-auto">
        <Processes ref="procs" @onSelection="(processName:string) => {openProcess(processName)}">Processes!</Processes>
      </div>
      <div class="col-auto">
        <Components ref="comps" @onSelection="(compType:string) => {addComponent(compType)}">Components!</Components>
      </div>
      <ReteEditor ref="editor"/>
    </div>
  </div>
</template>

<style scoped>

</style>