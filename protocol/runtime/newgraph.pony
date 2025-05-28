
use "jay"
use uuid = "uuid"
use "../../web"
use "../../graphs"
use ".."
use "../network"

primitive NewGraphMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    let id = try payload( "id" ) as String else uuid.UUID.v4().string() end
    let name = try payload( "name" ) as String else "<<new graph>>" end
    let description = try payload( "description" ) as String else "" end
    let icon = try payload( "icon" ) as String else "" end
    graphs.new_graph( id, name, description, icon)

  fun reply( connection: WebSocketSender, graphid:String, name:String, description:String, icon:String ) =>
    let json = JObj
      + ("graph", graphid)
      + ("name", name)
      + ("description", description)
      + ("icon", icon)
    connection.send_text( Message( "runtime", "new_graph", json).string() )

