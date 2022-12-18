use "jay"
use "metric"
use "promises"
use "../../web"
use ".."
use "../../graphs"
use "../../system"
use "../network"


primitive ChangeInitialMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      let graph = try payload("graph") as String else Print("No 'graph' property.") ; error end
      (let block, let input, let index) = Util._parse( payload("tgt") as JObj )?
      let src = payload("src") as JObj
      let initial_value = src("data")
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        graph.set_initial( block, input, initial_value.string() )
      })
      graphs.graph_by_id( graph, promise )
    else
      ErrorMessage( connection, None, "Invalid 'addinitial' payload: " + payload.string(), true )
    end

  fun reply(connection:WebSocketSender, graph:String, oldvalue:(String|I64|F64|Metric|Bool), newvalue:(String|I64|F64|Metric|Bool), block:String, input:String ) =>
    let src = JObj + ("data", oldvalue)
    let tgt = JObj + ("node", block) + ("port", input)
    let payload:JObj = JObj + ("graph", graph) + ("src", src ) + ("tgt", tgt)
    connection.send_text( Message("graph", "removeinitial", payload ).string() )
    let src' = JObj + ("data", newvalue)
    let tgt' = JObj + ("node", block) + ("port", input)
    let payload':JObj = JObj + ("graph", graph) + ("src", src' ) + ("tgt", tgt')
    connection.send_text( Message("graph", "addinitial", payload' ).string() )
