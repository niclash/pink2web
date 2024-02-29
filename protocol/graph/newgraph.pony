
use "jay"
use uuid = "uuid"
use "../../web"
use "../../graphs"
use ".."
use "../network"

primitive NewGraphMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    (let id, let name) = _get_name(payload)
    let description = try payload( "description" ) as String else "" end
    let icon = try payload( "icon" ) as String else "" end
    graphs.new_graph( id, name, description, icon)

  fun _get_name( payload:JObj ): (String,String) =>
    let id = try payload( "id" ) as String else uuid.UUID.v4().string() end
    let name = try payload( "name" ) as String else "<<new graph>>" end
    (id,name)
