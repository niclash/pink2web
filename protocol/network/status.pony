use "jay"
use "promises"
use "../../web"
use ".."
use "../../graphs"

class StatusMessage

  fun reply( connection: WebSocketSender, graph: String, uptime:I64, started:Bool, running:Bool, debug:Bool ) =>
    let json = JObj 
      + ("graph", graph)
      + ("uptime", uptime)
      + ("running", running)
      + ("started", started)
      + ("debug", debug)
    connection.send_text( Message("network", "status", json ).string() )
