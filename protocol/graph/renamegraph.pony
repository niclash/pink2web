
use "jay"
use "../../web"
use "../../graphs"
use ".."
use "../network"

primitive RenameGraphMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      (let id, let old_name, let new_name) = _get_name(payload)?
      graphs.rename_graph(id, old_name, new_name)
    else
      ErrorMessage( connection, None, "Invalid 'rename graph' payload: " + payload.string(), true )
    end

  fun _get_name( payload:JObj ): (String,String,String) ? =>
    let id = payload( "id" ) as String
    let from = payload( "from" ) as String
    let to = payload( "to" ) as String
    (id,from,to)
