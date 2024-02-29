use "jay"
use "promises"
use "../../web"
use "../../system"
use "../../graphs"
use ".."
use "../network"

class ConnectGraphMessage
  let _context:SystemContext
  let _fbp: Fbp val

  new create(context':SystemContext, fbp:Fbp val) =>
    _context = context'
    _fbp = fbp

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      let id = payload( "id" ) as String
      _fbp.subscribe_graph( connection, id )
      let promise = Promise[ Graph ]
      let conn = connection
      let context' = _context
      promise.next[None]( { (graph: Graph) =>
        let p = Promise[JObj]
        p.next[None](recover GraphParser(conn, context') end)
        graph.describe(p)
      })
      graphs.graph_by_id( id, promise )
    else
      ErrorMessage( connection, None, "Invalid 'connect' payload: " + payload.string(), true )
    end
