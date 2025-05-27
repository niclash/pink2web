
use "jay"
use "promises"

use "../system"
use "../web"
use "./network"

class val TraceProtocol
  let _authorizer: Authorizer

  new create(authorizer: Authorizer ) =>
    _authorizer = authorizer

  fun execute( connection: WebSocketSender, command: String, payload: JObj, secret:String) =>
    let p = Promise[Bool val]
    p.next[None]({ (valid:Bool val) =>
       if valid then
         match command
         |   "clear" => None
         else
           ErrorMessage( connection, None, "Invalid 'trace' command: " + command, true )
         end
       else
         ErrorMessage( connection, None, "Invalid secret: " + secret, true )
       end
     })
    _authorizer.isValid(secret, p)

