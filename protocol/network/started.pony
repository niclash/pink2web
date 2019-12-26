
use "jay"
use "promises"
use "time"
use "../../web"
use ".."
use "../../graphs"
use "../../system"

class StartedMessage

  fun reply( connection:WebSocketSender, graph:String, time_started:PosixDate val, started:Bool, running:Bool, debug:Bool ) =>
    let json = JObj 
      + ("graph", graph)
      + ("time", DateTime.format_iso( time_started ))
      + ("started", started)
      + ("running", running)
      + ("debug", debug)
    connection.send_text( Message("network", "started", json ).string() )
