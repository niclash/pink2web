

let runtime = {};

export const runtime_protocol = {
    currentSecret: "",
    request_runtime: function(connection, secret) {
        connection.send({
            protocol: "runtime",
            command: "getruntime",
            payload: {
                secret: secret
            }
        });
        this.currentSecret = secret;
    },
    getruntime: function (target,connection, payload) {
        return runtime;
    },
    packet: function (target,connection, payload) {
    },
    error: function (target,connection, payload) {
        alert(payload.message); // TODO: output somewhere else.
    },
    ports: function (target,connection, payload) {
    },
    runtime: function (target,connection, payload) {
        runtime = payload;
    },
    packetsent: function (target,connection, payload) {
    }
};
