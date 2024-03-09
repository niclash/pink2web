<script lang="ts">
import { defineComponent, onMounted, ref, getCurrentInstance } from 'vue';
import { createEditor } from './viewmodel';
import { websocket } from './protocols/websocket.js';
import { graph_protocol } from './protocols/graph.js';
import { runtime_protocol } from './protocols/runtime.js';
import Processes from "@/components/floweditor/Processes.vue";
import Components from "@/components/floweditor/Components.vue";

export default defineComponent({
  name: "FlowEditor",
  components: { Components, Processes },
  props: {
    initialGraph: "",
    initialSecret: "1234",
    connection: Object,
  },
  methods: {

  },
  setup(props) {
    const componentsRef = ref(null);
    const processesRef = ref(null);
    const instance = getCurrentInstance();

    onMounted(() => {

      // Access refs directly from the component instance
      componentsRef.value = instance.refs.Components;
      processesRef.value = instance.refs.Processes;

      setupWebSocketListener();
      graph_protocol.currentGraph = instance.props.initialGraph;

      // Call createEditor with componentsRef and processesRef if needed
      createEditor(instance.refs.rete as HTMLElement, componentsRef, processesRef);
    });

    const onOpened = (conn: any) => {
      props.connection = conn;
      runtime_protocol.request_runtime(conn, instance.props.initialSecret);
    };

    const onClosed = () => {
      console.log("WebSocket closed.");
    };

    const onError = () => {
      console.log("WebSocket ERROR!");
    };

    const setupWebSocketListener = () => {
      const callbackMethods = {};

      const componentMethods = componentsRef.value; // Assuming componentsRef contains methods

      const cMethodsToInclude = ['addComponent'];
      cMethodsToInclude.forEach((methodName) => {
        if (typeof componentMethods[methodName] === 'function') {
          callbackMethods[methodName] = componentMethods[methodName].bind(componentMethods);
        }
      });

      const processesMethods = processesRef.value; // Assuming componentsRef contains methods
      const pMethodsToInclude = ['addGraph', 'removeGraph', 'findGraph'];
      pMethodsToInclude.forEach((methodName) => {
        if (typeof processesMethods[methodName] === 'function') {
          callbackMethods[methodName] = processesMethods[methodName].bind(processesMethods);
        }
      });

      websocket.init(callbackMethods, onOpened, onClosed, onError);
    };

    return {
      setupWebSocketListener,
    };
  },
});
</script>
<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-auto">
        <Processes ref="Processes">Processes!</Processes>
      </div>
      <div class="col-auto">
        <Components ref="Components">Components!</Components>
      </div>
      <div class="col">
        <main class="rete" ref="rete"></main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rete {
  position: relative;
  height: 90vh;
  font-size: 1rem;
  background: white;
  border-radius: 1em;
  text-align: left;
  border: 3px solid #55b881;
  line-height: 1;
}
</style>