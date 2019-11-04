use "jay"
use "promises"
use "websocket"
use ".."
use "../../graphs"

class AddEdgeMessage

  fun apply( connection: WebSocketConnection, graphs: Graphs, payload: JObj ) =>
    try
      (let src_block, let src_output, let src_index) = parse( payload("src") as JObj )?
      (let dest_block, let dest_input, let dest_index) = parse( payload("tgt") as JObj )?
      let graph = payload("graph") as String

//       let metadata = payload("metadata") as JObj
//       let route = (metadata("route") as Number).u64()
//       let schema = metadata("schema") as String
//       let secure = metadata("secure") as Bool
      
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        // TODO: Add metadata support
        graph.connect( src_block, src_output, dest_block, dest_input )
      })
      graphs.graph_by_id( graph, promise )
    else
      connection.send_text( Message.err( "graph", "Invalid payload" ).string() )
    end
    
  fun parse( n: JObj ): (String,String, (I64|None))? =>
    ( n("node") as String, n("port") as String, (n("index") as (I64|None) ) )
