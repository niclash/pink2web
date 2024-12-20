<script lang="ts" setup>
import Processes from "@/components/Processes.vue";
import Components from "@/components/floweditor/Components.vue";
import {Connection as WsConnection, Connection, Packet} from "@/components/protocols/websocket";
import {onMounted, ref, watch} from "vue";
import ReteEditor from "@/components/floweditor/ReteController.vue";
import {vueModel} from "@/components/model";
import {RuntimeEvent} from "@/components/protocols/runtime";

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

const comps = ref(null);
const procs = ref(null);
const editor = ref(null);

defineExpose({
  callbacks: []
});

onMounted(() => {
  console.log("FlowEditor.mounted()");
});


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