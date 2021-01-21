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
      let promise = Promise[ Graph ]
      let conn = connection
      let context' = _context
      promise.next[None]( { (graph: Graph) =>
        let p = Promise[JObj]
        p.next[None](recover GraphParser(conn, context') end)
        graph.describe(p)
      })
      graphs.graph_by_id( runtime.graph, promise )
    })

    
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
      let timer = Timer( _Pass2Notify.create(_connection, graph, _context), 500_000_000, 500_000_000)
      _context.timers()(consume timer)
    else
      _context(Error) and _context.log(Error, "Unable to send the full 'runtime'")
    end

  fun _get_property( graph:JObj, prop:String): String ? =>
    try
      graph(prop) as String
    else
      ErrorMessage( _connection, None, "'getruntime' can't find: " + prop, true )
      error
    end

class _Pass2Notify is TimerNotify
  let _graph:JObj
  let _connection:WebSocketSender
  let _context:SystemContext

  new iso create(connection':WebSocketSender, graph':JObj, context:SystemContext) =>
    _graph = graph'
    _connection = connection'
    _context = context

  fun apply(timer: Timer, count: U64): Bool =>
    Print("Forwarding Edges.")
    try
      let id = try _graph("id") as String else _context.log(Error, "'id' is not a String"); error end
      let blocks = try _graph("blocks") as JArr else _context.log(Error, "'blocks' is not a JArr'"); error end
      for b' in blocks.values() do
        let b = b' as JObj
        let block_id = try b("name") as String else _context.log(Error, "'name' is not a String"); error end
        let inputs = try b("inputs") as JArr else _context.log(Error, "'inputs' is not a JArr"); error end
        for inp' in inputs.values() do
          let inp = inp' as JObj
          let initial_value = try inp("initial") as String else _context.log(Error, "'initial' is not a String"); error end
          let input_port = try inp("id") as String else _context.log(Error, "Input 'id' is not a String"); error end
          if initial_value != "None" then
            AddInitialMessage.reply(_connection, id, initial_value, block_id, input_port)
          end
        end
        let outputs = b("outputs") as JArr
        for outp in outputs.values() do
          let out = outp as JObj
          let src_id = try out("id") as String else _context.log(Error, "output 'id' is not a String"); error end
          let src = src_id.split(".")
          let src_block = try src(0)? else _context.log(Error, "'src' has wrong naming:" + src_id); error end
          let src_output = try src(1)? else _context.log(Error, "'src' has wrong naming:" + src_id); error end
          let links = try out("links") as JArr else _context.log(Error, "'links' is not a JArr"); error end
          for link in links.values() do
            let link_name = try link as String else _context.log(Error, "'link' is not a String"); error end
            let dest = link_name.split(".")
            let dest_block = try dest(0)? else _context.log(Error, "'dest' has wrong naming:" + link_name ); error end
            let dest_input = try dest(1)? else _context.log(Error, "'dest' has wrong naming:" + link_name ); error end
            AddEdgeMessage.reply(_connection, id, src_block, src_output, dest_block, dest_input)
          end
        end
      end
    end
    false
