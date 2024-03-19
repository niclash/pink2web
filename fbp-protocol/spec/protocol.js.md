---
title: FBP Network Protocol
layout: documentation
permalink: index.html
---
Pink2Web's protocol is derived from the Flow-Based Programming network protocol (*FBP protocol*)
which was designed primarily for flow-based programming interfaces like the [Flowhub](https://flowhub.io)
(gone in Dec 2023) to communicate with various FBP runtimes.

However, this was a Kickstarter project that seems to have fizzled out in 2020. Pink2Web decided to use the
protocol as a starting point, to bootstrap Pink2Web development with the ready-to-use
the [NoFlo](https://noflojs.org) client while developing the backend in Pony language. When Pink2Web's own
client was getting ready, the protocol specification needed more features (such as [graph:list](#graph-list)).

### Deviations in this fork
#### Added
  * [graph:list](#graph-list)
  * [graph:connect](graph-connect)

#### Removed
  * `secret` in `payload` was deprecated prior to the fork and is now removed. 

## Attribution and Honors
The NoFlo project was heavily inspired by J. Paul Morrison's book Flow-Based Programming.
Mr Morrison sadly [passed away June 16th 2022](https://www.legacy.com/ca/obituaries/thestar/name/j-morrison-obituary?pid=202226106),
85 years old, and we hereby acknowledges his contributions and influence in our community.



## Basics

The FBP protocol is a message-based protocol that can be handled using various different transport
mechanisms. The messages are designed to be independent, and not to form a request-response cycle
in order to allow highly asynchronous operations and situations where multiple protocol clients
talk with the same runtime.

Pink2Web implementation uses WebSocket's as the transport, but other implementations (that are not
fully compatible) could use;

* [Web Messaging](http://en.wikipedia.org/wiki/Web_Messaging) (`postMessage`) for communication between different web pages or WebWorkers running inside the same browser instance
* [WebSocket](http://en.wikipedia.org/wiki/WebSocket) for communicating between a browser and a server, or between two server instances
* [WebRTC](http://en.wikipedia.org/wiki/WebRTC) for peer-to-peer communications between a runtime and a client

Different transports can be utilized as needed. It could be interesting to implement the FBP protocol
using [MQTT](http://en.wikipedia.org/wiki/MQ_Telemetry_Transport), for instance.

### Message structure

There are three types of messages in FBP Protocol:

1. Requests sent by client to runtime
2. Responses sent by runtime to client
3. Events sent by runtime to client unrelated to any request

This document describes all messages as the data structures that are passed. The way these are encoded depends on the transport being used. For example, with WebSockets all messages are encoded as stringified JSON.

All messages consist of three parts:

* Sub-protocol (`graph`, `component`, `network`, `runtime` or `trace`)
* Command (for example, `addnode`)
* Payload (a data structure specific to the sub-protocol and command)

Additionally requests made by clients include a unique `requestId` and optionally a `secret`. 
Responses sent by runtime include a `responseTo` referring to a request ID. Runtimes may also 
send messages on events that happen on the runtime without referring to a request ID.

The keys listed in specific messages are for the message `payload`.

An example message sent by a client:

```json
{
  "protocol": "graph",
  "command": "addnode",
  "payload": {
    "component": "canvas/Draw",
    "graph": "hello-canvas-example",
    "id": "draw",
    "metadata": {
      "label": "Draw onto canvas element"
    }
  },
  "secret": "fbp rocks",
  "requestId: "10259710-bc70-4d2c-b0b3-e78075d9b960"
}
```

Response to this could look like:

```json
{
  "protocol": "graph",
  "command": "addnode",
  "payload": {
    "component": "canvas/Draw",
    "graph": "hello-canvas-example",
    "id": "draw",
    "metadata": {
      "label": "Draw onto canvas element"
    }
  },
  "responseTo: "10259710-bc70-4d2c-b0b3-e78075d9b960"
}
```

### Sub-protocols

The FBP protocol is divided into sub-protocols for each of the major resources that can be manipulated:

* [`runtime`](#runtime-protocol): communications about runtime capabilities and its exported ports
* [`graph`](#graph-protocol): communications about graph changes
* [`component`](#component-protocol): communications about available components and changes to them
* [`network`](#network-protocol): communications related to running a FBP graph
* [`trace`](#trace-protocol): communications related to tracing a FBP network

### Capabilities

Not all runtimes implementation supports all features of the protocol. Also, a runtime may restrict
*access* to features, either to all clients based on configuration, or based on the *secret* provided 
in the messages. To support this a set of **capabilities** are defined, which are reported by the 
runtime in the [runtime:runtime](#runtime-runtime) message.

When receiving a message, the runtime should check for the associated capability. If the capability 
is not supported, or the client does not have access to the capability, the runtime should respond 
with an `error` reply on the relevant `protocol`.

A few commands do not require any capabilities: the runtime info request/response 
([runtime:getruntime](#runtime-getruntime) and [runtime:runtime](#runtime-runtime)), 
and the error responses ([runtime:error](#runtime-error), [graph:error](#graph-error), 
[network:error](#network-error), [component:error](#component-error)).

### Runtime discovery

FBP runtimes may advertise their services using 
[DNS Service Discovery](https://tools.ietf.org/html/rfc6763) via Multicast DNS 
(mDNS, also known as Bonjour). In this case the runtime must provide 
[Service (SRV) Records](https://en.wikipedia.org/wiki/SRV_record) and 
[Text (TXT) Records](https://en.wikipedia.org/wiki/TXT_record) describing the FBP protocol
interfaces it provides. The service identifiers are:

* `_fbp-ws._tcp` for FBP Protocol interfaces via WebSocket transport

If the runtime is using DNS Service Discovery, it must also provide the following parameters in
the TXT record:

* `txtvers`: version of the DNS-SD record. Currently needs to be `1`
* `id`: unique identifier (UUID) of the runtime instance
* `type`: the type of the runtime, for example `noflo-nodejs`

Additionally, the TXT record can contain:

* `label`: human-readable label for the runtime instance

<%= messages %>

## Capabilities
Here are all the defined capabilities.

<%= capabilities %>

<%= changelog %>
