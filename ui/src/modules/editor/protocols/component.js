
var component_protocol = {
    request_list: function (connection) {
        libVue.components = {};
        connection.send({
            protocol: "component",
            command: "list",
            payload: {
                secret: runtime_protocol.currentSecret
            }
        });
    },
    list: function (connection, payload) {
        for( idx in components )        {
            if( components.hasOwnProperty(idx)){
                connection.send({
                    protocol: "component",
                    command: "component",
                    payload: libVue.components[idx]
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

    getsource: function( connection, payload ){
        // not supported
    },

    source: function (connection, payload) {
        // not supported
    },

    error: function (connection, payload) {
        alert(payload.message); // TODO put somewhere on screen
    },

    component: function (connection, payload) {
        let fullname = payload.name;
        let parts = payload.name.split('/');
        payload.name = parts[1];
        let lib = parts[0];
        if( !libVue.components.hasOwnProperty(lib))
        {
            Vue.set(libVue.components, lib, []);
        }
        libVue.components[lib] = libVue.components[lib].filter(item => item.name !== payload.name );
        libVue.components[lib].push(payload);
        libVue.components[lib].sort( (a,b) => a.name.localeCompare(b.name));
        makeTemplate(fullname, payload);
    },

    componentsready: function (connection, payload) {
        for( idx in this.refreshList )
            if( this.refreshList.hasOwnProperty(idx)){
                this.refreshList[idx]();
            }
    },
    refreshList: []
};
