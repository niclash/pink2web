import {runtime_protocol} from "@/components/floweditor/protocols/runtime.js";
import components from "@/components/floweditor/Components.vue";

export const component_protocol = {
    request_list: function (connection) {
        model.clear();
        connection.send({
            protocol: "component",
            command: "list",
            payload: {
                secret: runtime_protocol.currentSecret
            }
        });
    },
    list: function (target,connection, payload) {  // TODO: WHAT IS THIS???
        console.log("NICLAS!!")
        for( idx in model.nodes )        {
            if( model.nodes.hasOwnProperty(idx)){
                connection.send({
                    protocol: "component",
                    command: "component",
                    payload: model.nodes[idx]
                });
            }
            connection.send({
                protocol: "component",
                command: "componentsready",
                payload: {
                    secret: runtime_protocol.currentSecret
                }
            });
        }
    },

    getsource: function( target,connection, payload ){
        // not supported
    },

    source: function (target,connection, payload) {
        // not supported
    },

    error: function (target,connection, payload) {
        alert(payload.message); // TODO put somewhere on screen
    },

    component: function (target,connection, payload) {
        console.log("Niclas1", target);
        console.log("Niclas2", target.addComponent);
        target.addComponent( payload );
    },

    componentsready: function (target,connection, payload) {
        // When components list is completed.
    },
};
