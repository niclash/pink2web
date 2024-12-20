use "jay"
use "promises"
use "../../web"
use ".."
use "../network"
use "../../graphs"

class LogoutMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj, auth: Authorizer ) =>
    auth.clearAuthorization()
    let json = JObj
      + ( "protocol", "environment" )
      + ( "command", "logout" )
    connection.send_text( json.string() )
