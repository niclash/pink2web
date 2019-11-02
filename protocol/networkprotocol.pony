
use "jay"
use "websocket"

class NetworkProtocol is FbpProtocol


  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
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
      connection.send_text( Message.err( "network", "Unknown command in runtime protocol: " + command).string() )
    end
