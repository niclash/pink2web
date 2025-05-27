use "jay"
use "promises"
use "../../web"
use ".."
use "../network"
use "../../graphs"
use "../../system"

class LoginMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj, auth: Authorizer ) =>
    try
      let user = payload("user") as String
      let pass = payload("password") as String
      let resp = Promise[(String|None)]
      resp.next[None]({ (resp:(String|None)) =>
        match resp
        | let secret: String =>
          let p: JObj = JObj + ( "secret", secret )
          let json = JObj
            + ( "protocol", "environment" )
            + ( "command", "login" )
            + ( "payload", p )
          connection.send_text( json.string() )
        else
          ErrorMessage( connection, None, "Bad Login", true )
        end
      })
      auth.authorize( user, pass, resp )
    else
      ErrorMessage( connection, None, "Invalid payload", true )
    end
