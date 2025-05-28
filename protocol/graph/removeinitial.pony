use "debug"
use "jay"
use "promises"
use "../../web"
use ".."
use "../../graphs"
use "../../system"
use "../network"


primitive RemoveInitialMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      let graph = try payload("graph") as String else Debug.err("No 'graph' property.") ; error end
      (let block, let input, let index) = Util._parse( payload("tgt") as JObj )?
      let src = payload("src") as JObj
      let initial_value = src("data")
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        // TODO: Add metadata support
        graph.set_initial( block, input, None )
        connection.send_text( Message("graph", "removeinitial", payload).string() )
      })
      graphs.graph_by_id( graph, promise )
    else
      ErrorMessage( connection, None, "Invalid 'removeinitial' payload: " + payload.string(), true )
    end

  fun reply(connection:WebSocketSender, graph:String, value:Linkable, block:String, input:String ) =>
    let src = JObj + ("data", value)
    let tgt = JObj + ("node", block) + ("port", input)
    let payload:JObj = JObj + ("graph", graph) + ("src", src ) + ("tgt", tgt)
    connection.send_text( Message("graph", "removeinitial", payload ).string() )
