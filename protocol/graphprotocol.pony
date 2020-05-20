
use "jay"
use "../web"
use "./graph"
use "../graphs"

class val GraphProtocol
  let _graphs: Graphs tag
  
  new val create( graphs: Graphs ) =>
    _graphs = graphs
  
  fun execute( connection: WebSocketSender, command: String, payload: JObj ) =>
    match command
    |   "clear" => ClearMessage(connection, _graphs, payload)
    |   "addnode" => AddNodeMessage(connection, _graphs, payload)
    |   "removenode" => RemoveNodeMessage(connection, _graphs, payload)
    |   "renamenode" => RenameNodeMessage(connection, _graphs, payload)
    |   "changenode" => ChangeNodeMessage(connection, _graphs, payload)
    |   "addedge" => AddEdgeMessage(connection, _graphs, payload)
    |   "removeedge" => RemoveEdgeMessage(connection, _graphs, payload)
    |   "changeedge" => ChangeEdgeMessage(connection, _graphs, payload)
    |   "addinitial" => AddInitialMessage(connection, _graphs, payload)
    |   "removeinitial" => RemoveInitialMessage(connection, _graphs, payload)
    |   "addinport" => None
    |   "removeinport" => None
    |   "renameinport" => None
    |   "addoutport" => None
    |   "removeoutport" => None
    |   "renameoutport" => None
    |   "addgroup" => AddGroupMessage(connection, _graphs, payload)
    |   "removegroup" => RemoveGroupMessage(connection, _graphs, payload)
    |   "renamegroup" => RenameGroupMessage(connection, _graphs, payload)
    |   "changegroup" => ChangeGroupMessage(connection, _graphs, payload)
    else
      connection.send_text( Message.err( "graph", "Invalid command: " + command).string() )
    end
