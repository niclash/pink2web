<template>
  <div class="accordion" id="componentsAccordion">
    <div v-for="(components, section) in groupComponents()" :key="section">
      <div class="accordion-item">
        <h2 class="accordion-header" id="section{{section}}">
          <button
              class="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              :data-bs-target="'#collapse' + section"
              aria-expanded="true"
              :aria-controls="'collapse' + section"
          >
            {{ section }}
          </button>
        </h2>
        <div
            :id="'collapse' + section"
            class="accordion-collapse collapse show"
            :aria-labelledby="'section' + section"
            data-bs-parent="#componentsAccordion"
        >
          <div class="accordion-body container"> <!-- Apply container class here -->
            <button v-for="component in components" :key="component.fullId" @click="emit('onSelection', component.fullId)">
                <!--<img :src="component.icon" alt="icon" />-->
              {{ component.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ComponentEvent} from "@/components/protocols/component";
import {componentTemplates, vueModel} from '../model';
import {onMounted} from "vue";

const name = "Components";

// Protocol Callback methods
const onComponentComponent = (payload: ComponentEvent) => {
  console.log("Add component:", payload.name, payload.description, payload.inPorts, payload.outPorts);
  vueModel.components.value.push(payload);
  componentTemplates[payload.name] = payload;
};

defineExpose({
  callbacks: []
});

const selectBlocks = () => {
  // Add your logic for selecting blocks
};

const selectLinks = () => {
  // Add your logic for selecting links
};

const groupComponents = () => {
  const groups: Record<string, ComponentEvent[]> = {};
  vueModel.components.value.forEach(component => {
    const [section, name] = component.name.split('/');
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push({...component, name: name, fullId: component.name});
  });
  return groups;
};

const emit = defineEmits<{
  onSelection: [value: string]
}>();

onMounted(() => {
  console.log("FlowEditor.mounted()");
  let proto = vueModel.connection.value?.proto;
  proto?.component.addListener('onComponentComponent', onComponentComponent);
});

</script>

<style scoped>
button {
  border: 0;
  font-size: small;
  display: block;
  background-color: transparent;
}
</style>
