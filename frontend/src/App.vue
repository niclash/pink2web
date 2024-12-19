<template>
  <div v-if="secret !== undefined && secret !== ''">
    <div>
      <img alt="Bali Automation logotype" src="@/assets/logo.svg" height="64px"/>
      <div class="button-container">
        <a class="btn btn-secondary" href="/emulator" target="_blank">Show Emulator</a>
        <button class="btn btn-secondary" @click="logout()">Logout</button>
      </div>
      <div class="spacer"/>
    </div>
    <FlowEditor :secret="secret"></FlowEditor>
  </div>
  <div v-if="secret === undefined || secret === ''">
    <Login @login="login"/>
  </div>
</template>

<script lang="ts" setup>
import FlowEditor from "./components/floweditor/FlowEditor.vue";
import {ref} from "vue";
import Login from "@/components/Login.vue";
import {Connection, Packet} from "@/components/protocols/websocket";
import {vueModel} from "@/components/model";

let user: string | undefined;
let password: string | undefined;

const secret = ref("");

const login = (email:string, pass:string) => {
  console.log("App.login: ", user, pass);
  user = email;
  password = pass;

  let conn = new Connection();
  vueModel.connection.value = conn;
  conn.proto.environment.addListener("onLogin", onLogin);
  conn.addOpenedListener(onOpened);
  conn.addClosedListener(onClosed);
  conn.addErrorListener(onError);
}

const logout = () => {
  user = undefined;
  password = undefined;
  if(vueModel.connection.value !== undefined )
    vueModel.connection.value.close();
}

const onLogin = (conn:Connection, message: Event) => {
  console.log("App:onLogin");
  conn.proto.runtime.request_getruntime();
};

const onOpened = (conn:Connection, message: Event ) => {
  console.log("App:onOpened.");
  if( user !== undefined && password !== undefined)
    conn.proto.environment.request_login(user, password);
}

const onClosed = (conn:Connection, message:CloseEvent) => {
  console.log("App:onClosed");
  vueModel.connection.value = undefined;
};

const onError = (conn:Connection, message:Event) => {
  console.log("App:onError");
};


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

.button-container {
  display: flex;
  gap: 10px; /* Optional: Adds spacing between the buttons */
  justify-content: flex-end;
}

button {
  /* position: absolute; */
  right: 10px;
  top: 20px;
}
</style>
