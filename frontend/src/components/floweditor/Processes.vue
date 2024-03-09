<script lang="ts">
import {defineComponent, ref, onMounted} from 'vue';
import {graph_protocol} from "@/components/floweditor/protocols/graph";

class Graph {
  constructor(id: string, name: string, description: string, debug: boolean) {
    this.graph = id;
    this.name = name;
    this.description = description;
    this.debug = debug;
    this.running = false;
    this.started = false;
    this.uptime = 0;
  }

  name: string;
  description: string;
  graph: string;
  debug: boolean;
  running: boolean;
  started: boolean;
  uptime: number;
}
const connRef = ref(null);

export default defineComponent({
  name: "Processes",
  data() {
    return {
      isCollapsed: false,
      graphs: []
    };
  },
  mounted() {
    // Perform any actions needed when the component is mounted
  },
  methods: {
    addGraph(g: Graph): Graph {
      this.graphs.push(g);
      console.log("Niclas.addGraph()", this.graphs);
      return g;
    },
    removeGraph(id: string): Graph | undefined {
      const index = this.graphs.findIndex(graph => graph.graph === id);
      if (index !== -1) {
        const removedGraph = this.graphs.splice(index, 1)[0];
        return removedGraph;
      }
      return undefined;
    },
    findGraph(id: string): Graph | undefined {
      let existing = this.graphs[id];
      if (existing === undefined) {
        return this.addGraph(new Graph(id));
      }
      return existing;
    },
    dataArrived(linkValue) {
      // to update the value in a link.
      console.log("NICLAS.dataArrived()", linkValue);
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    selectProcess(graph:Graph) {
      // Call your selectProcess method with the selected graph
      console.log('Selected Process:', graph);
      graph_protocol.request_connect(websocket.device_connection, graph.graph)
    },
  },
});
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
    <div class="collapse" :class="{ 'show': !isCollapsed }" id="processesCollapse">
      <h3>Processes</h3>
      <ul class="list-group">
        <li v-for="graph in graphs" :key="graph.name" @click="selectProcess(graph)" class="list-group-item">
          {{ graph.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.list-group-item {
  cursor: pointer;
}
h3 {
  padding-top: 15px;
  font-size: large;
}
</style>
