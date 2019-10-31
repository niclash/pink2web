
use "jay"
use "websocket"
use "./runtime"
use "../graphs"

class RuntimeProtocol is FbpProtocol
  let _runtime: RuntimeMessage
  let _graph: Graph
  
  new create( graph: Graph, runtime:RuntimeMessage ) =>
    _runtime = runtime
    _graph = graph

  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    @printf[I32](("runtime protocol: " + command + ", " + payload.string() + "\n").cstring())
    match command
    |   "getruntime" => connection.send_text( _runtime.string() )
    else
      connection.send_text( Error("Unknown command in runtime protocol").string() )
    end
