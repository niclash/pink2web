<script lang="ts">
import {defineComponent} from 'vue';
import FlowEditor from "@/components/floweditor/FlowEditor.vue";

export default defineComponent({
  components: {FlowEditor}
});

</script>

<template>
  <div>
    <img alt="Bali Automation logotype" src="@/assets/logo.svg" height="32px" width="27px" />
  </div>
  <FlowEditor></FlowEditor>
</template>

<style scoped>
img { margin-bottom: 0.5em; }
</style>
