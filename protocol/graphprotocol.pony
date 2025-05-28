
use "jay"
use "promises"

use "../web"
use "../system"
use "./graph"
use "../graphs"
use "./network"

class val GraphProtocol
  let _graphs: Graphs tag
  let _context: SystemContext
  let _authorizer: Authorizer

  new val create( graphs: Graphs, context':SystemContext, authorizer: Authorizer ) =>
    _graphs = graphs
    _context = context'
    _authorizer = authorizer

  fun execute( connection: WebSocketSender, fbp:Fbp, command: String, payload: JObj, secret:String ) =>
    let p = Promise[Bool val]
    p.next[None]({ (valid:Bool val) =>
      if valid then
        match command
        |   "list" => ListGraphsMessage(connection, _graphs, payload )
        |   "connect" => ConnectGraphMessage.create(_context,fbp)(connection, _graphs, payload )
        |   "rename" => RenameGraphMessage(connection, _graphs, payload )
        |   "addnode" => AddNodeMessage(connection, _graphs, payload )
        |   "removenode" => RemoveNodeMessage(connection, _graphs, payload )
        |   "renamenode" => RenameNodeMessage(connection, _graphs, payload )
        |   "changenode" => ChangeNodeMessage(connection, _graphs, payload )
        |   "addedge" => AddEdgeMessage(connection, _graphs, payload )
        |   "removeedge" => RemoveEdgeMessage(connection, _graphs, payload )
        |   "changeedge" => ChangeEdgeMessage(connection, _graphs, payload )
        |   "addinitial" => AddInitialMessage(connection, _graphs, payload )
        |   "changeinitial" => ChangeInitialMessage(connection, _graphs, payload )
        |   "removeinitial" => RemoveInitialMessage(connection, _graphs, payload )
        |   "addinport" => None
        |   "removeinport" => None
        |   "renameinport" => None
        |   "addoutport" => None
        |   "removeoutport" => None
        |   "renameoutport" => None
        |   "addgroup" => None
        |   "removegroup" => None
        |   "renamegroup" => None
        |   "changegroup" => None
        else
          ErrorMessage( connection, None, "Invalid 'graph' command: " + command, true )
        end
      else
        ErrorMessage( connection, None, "Invalid secret: " + secret, true )
      end
    })
    _authorizer.isValid(secret, p)
