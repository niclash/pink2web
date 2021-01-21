use "jay"
use "../../web"
use "../"

primitive DataMessage
  fun tag reply( connection:WebSocketSender, graph:String, src_block:String, src_port:String, dest_block:String, dest_port:String, new_value:Any val ) =>
    try
      let src = JObj + ("node", src_block) + ("port", src_port)
      let tgt = JObj + ("node", dest_block) + ("port", dest_port)
      let json = JObj + ("id", "unknown") + ("graph", graph ) + ("src", src) + ("tgt", tgt) + ("data", (new_value as Stringable).string() )
      connection.send_text( Message("network", "data", json ).string() )
    else
      ErrorMessage( connection, graph, "Unable to send Data", true )
    end