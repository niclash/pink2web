
use "jay"
use "../../web"

primitive ComponentsReadyMessage

  fun reply(connection:WebSocketSender, size:USize) =>
    let json = JObj + ( "protocol", "component" ) + ( "command", "componentsready" ) + ("payload", size.i64())
    connection.send_text( json.string() )
