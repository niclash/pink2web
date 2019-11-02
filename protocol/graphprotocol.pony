
use "jay"
use "websocket"
use "./graph"
use "../graphs"

class GraphProtocol is FbpProtocol
  let _graphs: Graphs
  
  new create( graphs: Graphs ) =>
    _graphs = graphs
  
  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    match command
    |   "clear" => ClearMessage(connection, _graphs, payload )
    |   "addnode" => AddNodeMessage(connection, _graphs, payload )
    |   "removenode" => None
    |   "renamenode" => None
    |   "changenode" => None
    |   "addedge" => None
    |   "removeedge" => None
    |   "changeedge" => None
    |   "addinitial" => None
    |   "removeinitial" => None
    |   "addinport" => None
    |   "removeinport" => None
    |   "renameinport" => None
    |   "addoutport" => None
    |   "removeoutport" => None
    |   "renameoutport" => None
    |   "addgroup" => None
    |   "removegroup" => None
    |   "renamegroup" => None
    |   "changegroup" => None
    else
      connection.send_text( Message.err( "graph", "Unknown command in runtime protocol: " + command).string() )
    end
