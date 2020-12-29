use "jay"
use ".."
use "../../web"

primitive OutputMessage

  fun apply( connection: WebSocketSender, message: String, log:Bool ) =>
    let json = JObj + ("type", "message") + ("message", message)
    connection.send_text( Message( "network", "output", json ).string(), log )

