
use "jay"
use "websocket"
use "../blocktypes"
use "./runtime"

actor Fbp
  let _runtime_protocol: RuntimeProtocol
  let _network_protocol: NetworkProtocol
  let _graph_protocol: GraphProtocol
  let _component_protocol: ComponentProtocol
  let _trace_protocol: TraceProtocol
  
  new create( uuid:String, blocktypes: BlockTypes) =>
    let label: String = "Pink2Web - flowbased programming engine written in Pony Language"
    let version: String = "0.1.0"
    let all_capabilities: Array[String val] val = [
    ]
    let capabilities: Array[String val] val = all_capabilities
    let graph: String = ""
    let type': String = "pink2web"
    let namespace: String = "pin2web"
    let repository: String = ""
    let repository_version: String = ""
    let runtime = RuntimeMessage( uuid, label, version, all_capabilities, capabilities, graph, type', namespace, repository, repository_version )

    _runtime_protocol = RuntimeProtocol.create(runtime)
    _network_protocol = NetworkProtocol.create()
    _graph_protocol = GraphProtocol.create()
    _component_protocol = ComponentProtocol.create()
    _trace_protocol = TraceProtocol.create()

  be execute( conn: WebSocketConnection, text: String ) =>
    try
      @printf[I32](("parse\n").cstring())
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
        conn.send_text( Error("Unknown protocol").string() )
      end
      conn.send_text(text)
    else
      @printf[I32](("parse error\n").cstring())
      conn.send_text( Error("Badly formatted request").string() )
    end

interface FbpProtocol

  fun execute( connection: WebSocketConnection, command: String, payload: JObj )
