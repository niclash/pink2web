use "jay"
use "promises"
use "../../blocktypes"
use "../component"
use "../graph"
use "../../web"
use "../../graphs"
use "../../system"
use ".."

class GetRuntimeMessage
  let _context:SystemContext 
  
  new create(context':SystemContext) =>
    _context = context'

  fun apply(connection: WebSocketSender, graphs:Graphs, blocktypes:BlockTypes, runtime: RuntimeMessage ) =>
    connection.send_text( runtime.string() )
    ComponentMessage( connection, blocktypes )
    let promise = Promise[ Graph ]
    promise.next[None]( { (graph: Graph) =>
      let p = Promise[JObj]
      p.next[None](recover GraphParser(connection,_context) end)
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
        AddNodeMessage.reply(_connection, id, block_id, component, 100, 100 )
      end
      for b' in blocks.values() do
        let b = b' as JObj
        let outputs = b("outputs") as JArr
        for outp in outputs.values() do
          let out = outp as JObj
          let src_id = out("id") as String
          let src = src_id.split(".")
          let src_block = src(0)?
          let src_output = src(1)?
          let links = out("links") as JArr
          for link in links.values() do
            let link_name = link as String
            let dest = link_name.split(".")
            let dest_block = dest(0)?
            let dest_input = dest(1)?
            AddEdgeMessage.reply(_connection, id, src_block, src_output, dest_block, dest_input)
          end
        end
      end
    end
    
  fun _get_property( graph:JObj, prop:String): String ? =>
    try
      graph(prop) as String
    else
      _context(Error) and _context.log(Error, prop + " is not found or is not a string in " + graph.string() )
      _connection.send_text( Message.err( "runtime", "Invalid payload" ).string() )
      error
    end
