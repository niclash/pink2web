
use "jay"
use "websocket"

class TraceProtocol is FbpProtocol
  
  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    None
