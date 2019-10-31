
use "jay"
use "websocket"
use "./runtime"

class RuntimeProtocol is FbpProtocol
  let _runtime: RuntimeMessage
  
  new create( runtime:RuntimeMessage ) =>
    _runtime = runtime

  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    @printf[I32](("runtime protocol: " + command + ", " + payload.string() + "\n").cstring())
    match command
    |  
        "getruntime" => connection.send_text( _runtime.string() )
    else
      None
    end
