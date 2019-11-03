
use "jay"
use "websocket"
use "./runtime"

class val RuntimeProtocol
  let _runtime: RuntimeMessage
  
  new val create( runtime:RuntimeMessage ) =>
    _runtime = runtime

  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    match command
    |   "getruntime" => GetRuntimeMessage(connection, _runtime)
    else
      connection.send_text( Message.err( "runtime", "Unknown command in runtime protocol: " + command ).string() )
    end
