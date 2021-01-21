var websocket = {
    device_connection: null,
    currentRequests: {},
    hash: function(data) {
        // hash that is order independent.
        // failure of this to produce a unique number only affects Undo/Redo operations.
        var sum = 0;
        for( var idx in data ){
            if( data.hasOwnProperty(idx)) {
                var ch = data.charCodeAt(idx);
                if( ch > 32 )
                    sum = sum + ch;
            }
        }
        console.log("HASHING: " + sum, data);
        return sum;
    },
    cleanCurrent: function() {
        for( var idx in websocket.currentRequests ){
            if( websocket.currentRequests.hasOwnProperty(idx))
            {
                var req = websocket.currentRequests[idx];
                if( req.ts < new Date().getTime() )
                    delete websocket.currentRequests[idx];
            }
        }
    },
    init: function (onOpened, onClosed = null, onError = null) {
        let conn = {
            underlying: new WebSocket('ws://' + location.hostname + ':3569/'),
            send: function(data) {
                if( typeof data !== 'string' ){
                    data = JSON.stringify(data);
                }
                websocket.currentRequests[websocket.hash(data)] = {data: data, ts: (new Date().getTime() + 60000) };
                console.log("<==", data);
                this.underlying.send(data);
                websocket.cleanCurrent();
            }
        };
        conn.underlying.onopen = function () {
            console.log("Websocket Opened");
            onOpened(conn);
        };
        conn.underlying.onclose = function () {
            console.log("Websocket Closed");
            if (onClosed !== null)
                onClosed(conn);
        };
        conn.underlying.onerror = function (event) {
            console.log("Websocket Error", event);
            if (onError !== null)
                onError(event);
        };

        conn.underlying.onmessage = function (message) {
            console.log("==>", JSON.stringify(message.data));
            let current = websocket.currentRequests[websocket.hash(message.data)];
            let data = JSON.parse(message.data);
            let protocol = data.protocol;
            let command = data.command;
            let payload = data.payload;
            let secret = payload.secret;        // TODO: Check authorization in what way?

            // TODO: Invalid requests causes an exception!

            graph.startTransaction(protocol + " " + command);
            viewModel.skipsUndoManager = true;
            graph.skipsUndoManager = true;
            try {
                protocols[protocol][command](websocket.device_connection, payload);
            } catch(e){
                console.log("Protocol command not found: ", protocol, command, e );
            } finally {
                viewModel.skipsUndoManager = false;
                graph.skipsUndoManager = false;
                graph.commitTransaction(protocol + " " + command);
            }
        };
        websocket.device_connection = conn;
    }
};
