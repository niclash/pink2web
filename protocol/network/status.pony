use "jay"
use "promises"
use "../../web"
use ".."
use "../../graphs"
use "debug"

class StatusMessage

  fun reply( connection: WebSocketSender, graphid: String, name':String, descr:String, uptime:I64, started:Bool, running:Bool, debug:Bool ) =>
    let json = JObj 
      + ("graph", graphid)
      + ("name", name')
      + ("description", descr)
      + ("uptime", uptime)
      + ("running", running)
      + ("started", started)
      + ("debug", debug)
    let msg = Message("network", "status", json ).string()
    Debug("Network Status:" + msg.string())
    connection.send_text( msg )
