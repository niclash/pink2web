use "jay"
use "promises"
use "time"
use "websocket"
use ".."
use "../../graphs"
use "../../system"

class StoppedMessage

  fun reply( connection:WebSocketConnection, graph:String, time_started:PosixDate val, uptime:I64, started:Bool, running:Bool, debug:Bool ) =>
    let json = JObj 
            + ("graph", graph)
            + ("time", DateTime.format_iso(time_started))
            + ("uptime", uptime)
            + ("started", started)
            + ("running", running)
            + ("debug", debug)
    connection.send_text( Message("network", "stopped", json ).string() )
