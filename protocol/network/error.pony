use "jay"
use ".."
use "../../web"

primitive ErrorMessage
  fun apply( connection: WebSocketSender, graph_name:(String | None), message: String, log:Bool ) =>
    var json = JObj + ("stack","") + ("message",message)
    match graph_name
      | let g:String => json = json + ("graph", g)
    end
    connection.send_text( Message( "network", "error", json ).string(), log )

