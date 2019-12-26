
use "jay"
use "../../web"
use "../../graphs"
use ".."

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
      let p = payload("name") = name
      connection.send_text( Message( "graph", "clear", p).string() )
    else
      connection.send_text( Message.err( "graph", "Invalid payload structure." ).string() )
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
