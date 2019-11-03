
use "jay"
use "websocket"
use "./graph"
use "../graphs"

class val GraphProtocol
  let _graphs: Graphs tag
  
  new val create( graphs: Graphs ) =>
    _graphs = graphs
  
  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    match command
    |   "clear" => ClearMessage(connection, _graphs, payload )
    |   "addnode" => AddNodeMessage(connection, _graphs, payload )
    |   "removenode" => RemoveNodeMessage(connection, _graphs, payload )
    |   "renamenode" => RenameNodeMessage(connection, _graphs, payload )
    |   "changenode" => ChangeNodeMessage(connection, _graphs, payload )
    |   "addedge" => AddEdgeMessage(connection, _graphs, payload )
    |   "removeedge" => RemoveEdgeMessage(connection, _graphs, payload )
    |   "changeedge" => ChangeNodeMessage(connection, _graphs, payload )
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
