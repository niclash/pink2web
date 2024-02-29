
use "jay"
use "../../web"
use "../../graphs"
use ".."
use "../network"

primitive DeleteGraphMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      (let id, let name) = _get_name(payload)?
      graphs.delete_graph(id, name)
    else
      ErrorMessage( connection, None, "Invalid 'delete graph' payload: " + payload.string(), true )
    end

  fun _get_name( payload:JObj ): (String,String) ? =>
    let id = payload( "id" ) as String
    let name = payload( "name" ) as String
    (id,name)
