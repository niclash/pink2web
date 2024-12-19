use "jay"
use "promises"
use "../../web"
use ".."
use "../network"
use "../../graphs"

class LogoutMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj, auth: Authorizer ) =>
    auth.clearAuthorization()
