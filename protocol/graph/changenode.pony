use "jay"
use "promises"
use "../../web"
use ".."
use "../../graphs"

primitive ChangeNodeMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      let node = payload("id") as String
      let metadata = payload("metadata") as JObj
      let x = metadata("x") as I64
      let y = metadata("y") as I64
      let graph = payload("graph") as String
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        graph.change_block( node, x, y )
      })
      graphs.graph_by_id( graph, promise )
    else
      connection.send_text( Message.err( "graph", "Invalid payload" ).string() )
    end

  fun reply( connection:WebSocketSender, graph:String, block:String, x:I64, y:I64 ) =>
    let meta = JObj
      + ("x", x )
      + ("y", y )
      
    let json = JObj
      + ("id", block )
      + ("graph", graph )
      + ("metadata", meta )
    
    connection.send_text( Message("graph", "changenode", json).string() )
      
