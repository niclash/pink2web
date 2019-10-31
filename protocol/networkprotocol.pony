
use "jay"
use "websocket"

class NetworkProtocol is FbpProtocol


  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    @printf[I32](("network protocol: " + command + ", " + payload.string() + "\n").cstring())
    match command
    |   "start" => None
    |   "stop" => None
    |   "getstatus" => None
    |   "persist" => None
    |   "debug" => None
    |   "edges" => None
    |   "connect" => None
    |   "disconnect" => None
    |   "begingroup" => None
    |   "endgroup" => None
    |   "data" => None
    else
      connection.send_text( Error("Unknown command in runtime protocol").string() )
    end
