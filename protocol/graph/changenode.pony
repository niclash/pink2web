use "jay"
use "promises"
use "websocket"
use ".."
use "../../graphs"

class ChangeNodeMessage

  fun apply( connection: WebSocketConnection, graphs: Graphs, payload: JObj ) =>
    try
      let node = payload("id") as String
      let metadata = payload("metadata") as JObj
      let x = (metadata("x") as Number).u32()
      let y = (metadata("y") as Number).u32()
      let graph = payload("graph") as String
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        // TODO: Add metadata support
        None
      })
      graphs.graph_by_id( graph, promise )
    else
      connection.send_text( Message.err( "graph", "Invalid payload" ).string() )
    end

  fun reply( connection:WebSocketConnection, graph:String, block:String, x:I64, y:I64 ) =>
    let meta = JObj
      + ("x", x )
      + ("y", y )
      
    let json = JObj
      + ("id", block )
      + ("graph", graph )
      + ("metadata", meta )
    
    connection.send_text( Message("graph", "changenode", json).string() )
      
