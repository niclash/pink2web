
use "jay"
use "../../web"
use "../../graphs"
use ".."
use "../network"

primitive ClearMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      let id = payload( "id" ) as String
      let main = payload( "main" ) as Bool
      var name = _get_name(payload)
      let description = try payload( "description" ) as String else "" end
      let library = try payload( "library" ) as String else "" end
      let icon = try payload( "icon" ) as String else "" end
      graphs.create_graph( id, name, description, icon, main )
      connection.send_text( Message( "graph", "clear", JObj + ("id", id)).string() )
    else
      ErrorMessage( connection, None, "Invalid 'clear' payload: " + payload.string(), true )
    end

  fun _get_name( payload:JObj ): String =>
    try 
      let name = payload( "name" ) as String 
      if name == "" then 
        "Pinkflow runtime" 
      else 
        name
      end
    else 
      "Pinkflow runtime" 
    end
