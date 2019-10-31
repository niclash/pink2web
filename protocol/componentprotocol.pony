use "jay"
use "websocket"

class ComponentProtocol is FbpProtocol

  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    None
