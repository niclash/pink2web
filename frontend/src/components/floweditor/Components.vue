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
            <div v-for="component in components" :key="component.name">
              <i class="material-icons">{{ component.icon }}</i><sup>{{ component.name }}</sup>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

class Port {
  type: string;
  id: string;
  description: string;
  addressable: boolean;
}

class ComponentType {
  description: string;
  icon: string;
  name: string;
  subgraph: boolean;
  inports: Port[];
  outports: Port[];
}

export default defineComponent({
  name: "Components",
  setup() {
    const componentCollection = ref<ComponentType[]>([
    ]);

    const groupComponents = () => {
      const groups = {};
      componentCollection.value.forEach(component => {
        const [section, name] = component.name.split('/');
        console.log("Niclas____", component.name, section, name);
        if (!groups[section]) {
          groups[section] = [];
        }
        groups[section].push({ ...component, name });
      });
      return groups;
    };

    const addComponent = (payload: ComponentType) => {
      console.log("Add component:", payload);

      // Update the collection
      componentCollection.value.push(payload);

      // Trigger a reactivity update by cloning the array
      componentCollection.value = [...componentCollection.value];
    };

    const selectBlocks = () => {
      // Add your logic for selecting blocks
    };

    const selectLinks = () => {
      // Add your logic for selecting links
    };

    return {
      groupComponents,
      addComponent,
      selectBlocks,
      selectLinks,
    };
  },
  async mounted() {
    // editor.selectBlocks()
  }
});
</script>

<style scoped>
</style>
