


var runtime = {};

var runtime_protocol = {
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
    getruntime: function (connection, payload) {
        return runtime;
    },
    packet: function (connection, payload) {
    },
    error: function (connection, payload) {
        alert(payload.message); // TODO: output somewhere else.
    },
    ports: function (connection, payload) {
    },
    runtime: function (connection, payload) {
        runtime = payload;
    },
    packetsent: function (connection, payload) {
    }
};
