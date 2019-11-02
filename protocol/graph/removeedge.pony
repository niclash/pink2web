use "jay"
use "promises"
use "websocket"
use ".."
use "../../graphs"

class RemoveEdgeMessage
  fun apply( connection: WebSocketConnection, graphs: Graphs, payload: JObj ) =>
    try
      (let src_block, let src_output, let src_index) = parse( payload("src") as JObj )?
      (let dest_block, let dest_input, let dest_index) = parse( payload("tgt") as JObj )?
      let graph = payload("graph") as String
      
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        graph.disconnect( src_block, src_output, dest_block, dest_input )
      })
      graphs.graph_by_id( graph, promise )
    else
      connection.send_text( Message.err( "graph", "Invalid payload" ).string() )
    end
    
  fun parse( n: JObj ): (String,String, U64)? =>
    ( n("node") as String, n("port") as String, (n("index") as Number).u64() )
