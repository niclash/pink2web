
use "jay"
use "promises"

use "../system"
use "../web"
use "./network"
use "../graphs"

class val NetworkProtocol
  let _graphs: Graphs tag
  let _authorizer: Authorizer

  new val create( graphs: Graphs, authorizer: Authorizer ) =>
    _graphs = graphs
    _authorizer = authorizer

  fun execute( connection: WebSocketSender, fbp:Fbp, command: String, payload: JObj, secret:String ) =>
    let p = Promise[Bool val]
    p.next[None]({ (valid:Bool val) =>
      if valid then
        match command
        |   "start" => StartMessage(connection, _graphs, payload )
        |   "stop" => StopMessage(connection, _graphs, payload )
        |   "getstatus" => GetStatusMessage(connection, _graphs, payload )
        |   "persist" => PersistMessage(connection, _graphs, payload )
        |   "debug" => None
        |   "edges" => EdgesMessage(connection, fbp, payload )
        |   "connect" => None
        |   "disconnect" => None
        |   "begingroup" => None
        |   "endgroup" => None
        else
          ErrorMessage( connection, None, "Invalid 'network' command: " + command, true )
        end
      else
        ErrorMessage( connection, None, "Invalid secret: " + secret, true )
      end
    })
    _authorizer.isValid(secret, p)

