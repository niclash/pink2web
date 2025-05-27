
use "jay"
use "promises"

use "../blocktypes"
use "../graphs"
use "../system"
use "../web"
use "./runtime"
use "./network"

class val RuntimeProtocol
  let _runtime:RuntimeMessage
  let _getruntime:GetRuntimeMessage val
  let _graphs:Graphs
  let _blocktypes:BlockTypes
  let _authorizer: Authorizer

  new val create( runtime:RuntimeMessage, graphs:Graphs, blocktypes:BlockTypes, context:SystemContext, authorizer: Authorizer ) =>
    _runtime = runtime
    _graphs = graphs
    _blocktypes = blocktypes
    _getruntime = GetRuntimeMessage(context)
    _authorizer = authorizer

  fun execute( connection: WebSocketSender, command: String, payload: JObj, secret:String ) =>
    let p = Promise[Bool val]
    p.next[None]({ (valid:Bool val) =>
      if valid then
        match command
        |   "getruntime" => _getruntime(connection, _graphs, _blocktypes, _runtime)
        else
          ErrorMessage( connection, None, "Invalid 'runtime' command: " + command, true )
        end
      else
        ErrorMessage( connection, None, "Invalid secret: " + secret, true )
      end
    })
    _authorizer.isValid(secret, p)
