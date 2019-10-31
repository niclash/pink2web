
use "jay"
use "websocket"

class NetworkProtocol is FbpProtocol
  
  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    None
