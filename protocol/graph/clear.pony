
use "jay"
use "websocket"
use "../../graphs"
use ".."

primitive ClearMessage

  fun apply( connection: WebSocketConnection, graphs: Graphs, payload: JObj ) =>
    try
      let id = payload( "id" ) as String
      let name = payload( "name" ) as String
      let description = payload( "description" ) as String
      let library = payload( "library" ) as String
      let icon = payload( "icon" ) as String
      let main = payload( "main" ) as Bool
      graphs.create_graph( id, name, description, library, icon, main )
      connection.send_text( Message( "graph", "clear", payload).string() )
    else
      connection.send_text( Message.err( "graph", "Invalid payload structure." ).string() )
    end
