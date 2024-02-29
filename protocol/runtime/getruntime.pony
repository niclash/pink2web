use "collections"
use "jay"
use "promises"
use "time"
use "../../blocktypes"
use "../component"
use "../graph"
use "../../web"
use "../../graphs"
use "../../system"
use ".."
use "../network"

class GetRuntimeMessage
  let _context:SystemContext 
  
  new create(context':SystemContext) =>
    _context = context'

  fun apply(connection: WebSocketSender, graphs:Graphs, blocktypes:BlockTypes, runtime: RuntimeMessage ) =>
    connection.send_text( runtime.string() )
    ComponentMessage( connection, blocktypes, { () =>
      let promise = Promise[ List[Graph] val ]
      let conn = connection
      let context' = _context
      promise.next[None]( { (graphlist: List[Graph] val) =>
        for graph in graphlist.values() do
          graph.status()
        end
      })
      graphs.list( promise )
    })

