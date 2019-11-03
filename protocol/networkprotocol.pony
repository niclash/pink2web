
use "jay"
use "websocket"
use "./network"
use "../graphs"

class val NetworkProtocol
  let _graphs: Graphs tag
  
  new val create( graphs: Graphs ) =>
    _graphs = graphs
  
  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    match command
    |   "start" => None
    |   "stop" => None
    |   "getstatus" => GetStatusMessage(connection, _graphs, payload )
    |   "persist" => None
    |   "debug" => None
    |   "edges" => None
    |   "connect" => None
    |   "disconnect" => None
    |   "begingroup" => None
    |   "endgroup" => None
    else
      connection.send_text( Message.err( "network", "Unknown command in runtime protocol: " + command).string() )
    end

