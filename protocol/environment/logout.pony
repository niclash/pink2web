use "jay"
use "promises"
use "../../web"
use ".."
use "../network"
use "../../graphs"
use "../../system"

class LogoutMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj, auth: Authorizer, secret:String ) =>
    auth.clearAuthorization(secret)
    let json = JObj
      + ( "protocol", "environment" )
      + ( "command", "logout" )
    connection.send_text( json.string() )
