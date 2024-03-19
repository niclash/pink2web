
<template>
  <div>
    <img alt="Bali Automation logotype" src="@/assets/logo.svg" height="64px"/>
    <button class="btn btn-secondary" @click="() => toggleConnectPopup()" >Connect</button>
    <Popup v-if="connectPopup" :onOk="updateSecret" :onCancel="toggleConnectPopup"><label>Secret:&nbsp;</label><input ref="secretInput"/></Popup>
    <div class="spacer"/>
  </div>
  <FlowEditor :secret="secret"></FlowEditor>
</template>

<script lang="ts" setup>
import FlowEditor from "./components/floweditor/FlowEditor.vue";
import Login from "./components/floweditor/Login.vue";
import Popup from "@/components/floweditor/Popup.vue";
import {ref} from "vue";

const secret = ref("");
const connectPopup = ref(false);
const secretInput=ref<HTMLInputElement | null>(null);
const updateSecret = () => {
  let elem = secretInput.value as HTMLInputElement;
  secret.value = elem.value;
  connectPopup.value = false;
};
const toggleConnectPopup = () => {
  connectPopup.value = !connectPopup.value;
}

</script>

<style scoped>
img {
  position: absolute;
  left: 20px;
  top: 10px;
}

.spacer {
  margin-bottom: 70px
}

button {
  position: absolute;
  right: 10px;
  top: 20px;
}
</style>
