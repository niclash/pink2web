
use "jay"
use "../web"
use "./network"
use "../graphs"

class val NetworkProtocol
  let _graphs: Graphs tag

  new val create( graphs: Graphs ) =>
    _graphs = graphs

  fun execute( connection: WebSocketSender, fbp:Fbp, command: String, payload: JObj ) =>
    match command
    |   "start" => StartMessage(connection, _graphs, payload )
    |   "stop" => StopMessage(connection, _graphs, payload )
    |   "getstatus" => GetStatusMessage(connection, _graphs, payload )
    |   "persist" => None
    |   "debug" => None
    |   "edges" => EdgesMessage(connection, fbp, payload )
    |   "connect" => None
    |   "disconnect" => None
    |   "begingroup" => None
    |   "endgroup" => None
    else
      ErrorMessage( connection, None, "Invalid 'network' command: " + command, true )
    end

