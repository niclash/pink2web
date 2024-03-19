import {Protocols} from "@/components/floweditor/protocols/protocols";

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
    protocolListeners!: Record<string, Function[]>;

    constructor(secret: string) {
        console.log("Creating Connection...", secret)
        this.currentSecret = secret;
        this.currentGraph = "";
        this.underlying = new WebSocket('ws://' + location.hostname + ':3569/');
        this.proto = new Protocols(this, secret);
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

    send(packet: Packet): void {
        if (this.currentSecret === undefined)
            console.log("INTERNAL ERROR!!!");
        else {
            packet.secret = this.currentSecret;
            let data = JSON.stringify(packet);
            console.log("<==", data);
            this.underlying.send(data);
        }
    }

    setupListeners(protocolListeners: Record<string, Function[]>): void {
        console.log("setupListeners()", protocolListeners);
        this.protocolListeners = protocolListeners;
        this.proto.component.addListeners( protocolListeners );
        this.proto.graph.addListeners( protocolListeners );
        this.proto.network.addListeners( protocolListeners );
        this.proto.runtime.addListeners( protocolListeners );
        this.proto.trace.addListeners( protocolListeners );
        let c = this;
        this.underlying.onopen = function (event: Event) {
            console.log("Websocket Opened", event);
            c.call("onOpened", c);
        };
        this.underlying.onclose = function (event: CloseEvent) {
            console.log("Websocket Closed", event);
            c.call("onClosed", c);
        };
        this.underlying.onerror = function (event: Event) {
            console.log("Websocket Error", event);
            c.call("onError", c);
        };
        this.underlying.onmessage = (message: MessageEvent) => { this.onMessage(message) };
    }

    private call(callbackName: string, argument: any) {
        let listeners = this.protocolListeners[callbackName];
        if (listeners !== undefined)
            listeners.forEach((fn) => fn(argument));
    }
}
