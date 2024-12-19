<script lang="ts" setup>
import Processes from "@/components/Processes.vue";
import {Connection} from "../protocols/websocket";
import {onMounted, ref, watch} from "vue";
import {vueModel} from "@/components/model";

const name = "Emulator";
const components = {Processes};
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

onMounted(() => {
  console.log("Emulator.mounted()");
});
/////
</script>


<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-auto">
        <Processes ref="procs" @onSelection="(processName:string) => {openProcess(processName)}">Processes!</Processes>
      </div>
      <div>
        <div class="inputs">Inputs</div>
        <div class="outputs">Outputs</div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>