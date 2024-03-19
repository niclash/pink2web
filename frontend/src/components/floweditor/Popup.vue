<script setup lang="ts">

defineProps({
  onOk: {
    type: Function,
    required: true
  },
  onCancel: {
    type: Function,
    required: true
  }
})
defineEmits({})
</script>

<template>
<div class="popup">
  <div class="popup-inner">
    <slot/>
    <div>
      <button class="popup-cancel" @click="onCancel()">Cancel</button>
      <button class="popup-ok" @click="onOk()">OK</button>
    </div>
  </div>
</div>
</template>

<style scoped>
.popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background-color: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.popup-inner {
  background: white;
  padding: 32px;
}
.popup-ok {

}
.popup-cancel {

}
</style>