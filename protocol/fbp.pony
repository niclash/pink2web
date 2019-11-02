
use "jay"
use "websocket"
use "../graphs"
use "../blocktypes"
use "./runtime"

actor Fbp
  let _runtime_protocol: RuntimeProtocol
  let _network_protocol: NetworkProtocol
  let _graph_protocol: GraphProtocol
  let _component_protocol: ComponentProtocol
  let _trace_protocol: TraceProtocol
  
  new create( uuid:String, graphs:Graphs, blocktypes: BlockTypes) =>
    let label: String = "Pink2Web - flowbased programming engine written in Pony Language"
    let version: String = "0.1.0"
    let all_capabilities: Array[String val] val = [
        "network:status"
        "network:persist"
        "network:data"
        "network:control"
        "protocol:component"
        "protocol:runtime"
        "protocol:graph"
    ]
    let capabilities: Array[String val] val = all_capabilities
    let graph_name: String = ""
    let type': String = "pink2web"
    let namespace: String = "pin2web"
    let repository: String = ""
    let repository_version: String = ""
    let runtime = RuntimeMessage( uuid, label, version, all_capabilities, capabilities, graph_name, type', namespace, repository, repository_version )

    _runtime_protocol = RuntimeProtocol.create(runtime)
    _network_protocol = NetworkProtocol.create()
    _graph_protocol = GraphProtocol.create(graphs)
    _component_protocol = ComponentProtocol.create(blocktypes)
    _trace_protocol = TraceProtocol.create()

  be execute( conn: WebSocketConnection, text: String ) =>
    try
      let jdoc = JParse.from_string( text )? as JObj
      let protocol = jdoc("protocol") as String
      let command = jdoc("command") as String
      let payload = jdoc("payload") as JObj
      match protocol
      | "runtime" => _runtime_protocol.execute( conn, command, payload ) 
      | "network" => _network_protocol.execute( conn, command, payload ) 
      | "graph" => _graph_protocol.execute( conn, command, payload ) 
      | "component" => _component_protocol.execute( conn, command, payload ) 
      | "trace" => _trace_protocol.execute( conn, command, payload ) 
      else
        conn.send_text( Message.err( protocol, "Unknown protocol" ).string() )
      end
    else
      @printf[I32](("parse error\n").cstring())
      conn.send_text( Message.err( "unknown", "Badly formatted request" ).string() )
    end

interface FbpProtocol

  fun execute( connection: WebSocketConnection, command: String, payload: JObj )
