use "jay"
use "promises"
use "../../web"
use ".."
use "../network"
use "../../graphs"

class LoginMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj, auth: Authorizer ) =>
    try
      let user = payload("user") as String
      let pass = payload("password") as String
      let secret = auth.authorize( user, pass )?
      let p: JObj = JObj + ( "secret", secret )
      let json = JObj
        + ( "protocol", "environment" )
        + ( "command", "login" )
        + ( "payload", p )
      connection.send_text( json.string() )
    else
      ErrorMessage( connection, None, "Invalid payload", true )
    end
