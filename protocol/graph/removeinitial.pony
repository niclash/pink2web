use "jay"
use "promises"
use "../../web"
use ".."
use "../../graphs"


primitive RemoveInitialMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      let graph = try payload("graph") as String else @printf[I32]("No 'graph' property.".cstring()) ; error end
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
      connection.send_text( Message.err( "graph", "Invalid payload." ).string() )
    end

