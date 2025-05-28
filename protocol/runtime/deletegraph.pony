
use "jay"
use "../../web"
use "../../graphs"
use ".."
use "../network"

primitive DeleteGraphMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      let id = payload( "id" ) as String
      let name = payload( "name" ) as String
      graphs.delete_graph(id, name)
    else
      ErrorMessage( connection, None, "Invalid 'delete graph' payload: " + payload.string(), true )
    end

  fun reply( connection: WebSocketSender, graphid:String, name:String ) =>
    let json = JObj
      + ("graph", graphid)
      + ("name", name)
    connection.send_text( Message( "runtime", "delete_graph", json).string() )
