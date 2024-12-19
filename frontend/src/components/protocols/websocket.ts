import {Protocols} from "@/components/protocols/protocols";

export interface Packet {
    protocol: string;
    command: string;
    payload: any;
    secret?: string;
}

export class Connection {
    private readonly underlying: WebSocket;
    currentSecret: string | undefined;
    currentGraph: string;
    readonly proto: Protocols;
    openListeners: ((conn:Connection, event: Event) => void)[] = [];
    closeListeners: ((conn:Connection, event: CloseEvent) => void)[] = [];
    errorListeners: ((conn:Connection, event: Event) => void)[] = [];

    constructor() {
        console.log("Creating Connection...");
        this.underlying = new WebSocket('ws://' + location.hostname + ':3569/');
        this.currentGraph = "";
        this.proto = new Protocols(this);
        this.underlying.onopen = (message: Event) => { this.onOpen(message) };
        this.underlying.onclose = (message: CloseEvent) => { this.onClose(message) };
        this.underlying.onerror = (message: Event) => { this.onError(message) };
        this.underlying.onmessage = (message: MessageEvent) => { this.onMessage(message) };
    }

    close() {
        this.underlying.close();
    }

    onOpen(message: Event) {
        console.log("WebSocket.onOpen", JSON.stringify(message));
        this.openListeners.forEach( listener => {
            try {
                listener(this, message);
            } catch(e) {
                console.log("Error in listener: ", listener.name, e);
            }
        });
    }

    onClose(message: CloseEvent) {
        console.log("WebSocket.onClose()", JSON.stringify(message));
        this.closeListeners.forEach( listener => {
            try {
                listener(this, message);
            } catch(e) {
                console.log("Error in listener: ", listener.name, e);
            }
        });
    }

    onError(message: Event) {
        console.log("WebSocket.onError()", JSON.stringify(message));
        this.errorListeners.forEach( listener => {
            try {
                listener(this, message);
            } catch(e) {
                console.log("Error in listener: ", listener.name, e);
            }
        });
    }

    onMessage(message: MessageEvent) {
        console.log("==>", JSON.stringify(message.data));
        let data = JSON.parse(message.data);
        let protocol = data.protocol;
        let command = data.command;
        let payload = data.payload;

        // graph.startTransaction(protocol + " " + command);
        // viewModel.skipsUndoManager = true;
        // graph.skipsUndoManager = true;
        try {
            this.proto.onMessage(protocol, command, payload);
        } catch (e) {
            console.log("Protocol command not found: ", protocol, command, e);
        } finally {
            // viewModel.skipsUndoManager = false;
            // graph.skipsUndoManager = false;
            // graph.commitTransaction(protocol + " " + command);
        }
    }

    send_raw(packet: Packet): void {
        let data = JSON.stringify(packet);
        console.log("<==", data);
        this.underlying.send(data);
    }

    send(packet: Packet): void {
        if (this.currentSecret === undefined) {
            console.log("INTERNAL ERROR!!!", packet);
        }
        else {
            packet.secret = this.currentSecret;
            let data = JSON.stringify(packet);
            console.log("<==", data);
            this.underlying.send(data);
        }
    }

    addOpenedListener( listener: (conn:Connection, message:Event) => void ) {
        this.openListeners.push(listener);
    }
    addClosedListener( listener: (conn:Connection, message:CloseEvent) => void ) {
        this.closeListeners.push(listener);
    }
    addErrorListener( listener: (conn:Connection, message:Event) => void ) {
        this.errorListeners.push(listener);
    }
}
