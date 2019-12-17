use "jay"
use "logger"
use "promises"
use "../../web"
use "../../graphs"
use "../../system"
use ".."

class GetRuntimeMessage
  let _context:SystemContext 
  
  new create(context':SystemContext) =>
    _context = context'

  fun apply(connection: WebSocketSender, graphs:Graphs, runtime: RuntimeMessage ) =>
    connection.send_text( runtime.string() )
    let promise = Promise[ Graph ]
    promise.next[None]( { (graph: Graph) =>
      let p = Promise[JObj]
      p.next[None](recover iso GraphParser(connection,_context) end)
      graph.describe(p)
    })
    graphs.graph_by_id( runtime.graph, promise )

    
class GraphParser
  let _context:SystemContext
  let _connection:WebSocketSender
  
  new create(connection:WebSocketSender, context:SystemContext) =>
    _context = context
    _connection = connection
    
  fun apply(graph: JObj) =>
    try
      let name = _get_property( graph, "name")?
      let id = _get_property( graph, "id")? 
      let description = _get_property( graph, "description" )?
      let icon = _get_property( graph, "icon")? 
      let p = JObj + ("id", id ) + ("name", name) + ("main", true) + ("description", description) + ("icon", icon)
      _connection.send_text( Message( "graph", "clear", p).string() )
      let blocks = graph("blocks") as JArr
      for b' in blocks.values() do
        let b = b' as JObj
        let block_id = b("name") as String
        let component = b("type") as String
        let metadata = JObj
        let block = JObj + ("id",block_id) + ("component", component) + ("metadata", metadata) + ("graph", name) + ("secret","1234")
        _connection.send_text( Message( "graph", "addnode", block).string() )
      end
    end
    
  fun _get_property( graph:JObj, prop:String): String ? =>
    try
      graph(prop) as String
    else
      _context(Error) and _context.log( prop + " is not found or is not a string in " + graph.string() )
      _connection.send_text( Message.err( "runtime", "Invalid payload" ).string() )
      error
    end
