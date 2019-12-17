use "jay"
use "promises"
use "../../web"
use ".."
use "../../graphs"

/*
Protocol
{
  "protocol":"graph",
  "command":"addnode",
  "payload":
  {
    "id":"Repeat1",
    "component":"core/Repeat",
    "graph":"another-graph"
  }
}
*/
primitive AddNodeMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      let id = _get_required(payload, "id", connection)?
      let graph = _get_required(payload, "graph", connection)?
      let component = _get_required(payload, "component", connection)?
      let meta = try payload("metadata") as JObj else None end
      ( let x, let y ) = _get_meta( meta )
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        graph.create_block( component, id, x, y )
      })
      graphs.graph_by_id( graph, promise )
    else
      connection.send_text( Message.err( "graph", "Invalid payload" ).string() )
    end

  fun reply( connection: WebSocketSender, graph:String, block:String, component:String, x:I64, y:I64 ) =>
    let meta = JObj + ("x", x) + ("y", y)
    let json = JObj 
      + ("graph", graph)
      + ("component", component)
      + ("id", block)
      + ("metadata", meta )
    connection.send_text( Message( "graph", "addnode", json).string() )

  fun _get_required( payload:JObj, arg:String, connection:WebSocketSender ): String ? =>
    try 
        payload(arg) as String 
    else 
      _send( connection, "No id found: " + payload.string() ) 
      error
    end
    
  fun _send( connection:WebSocketSender, message: String ) =>
    connection.send_text( Message.err( "graph", message ).string() )
      
  fun _get_meta( meta': (JObj|None) ): (I64, I64) =>
    match meta'
    | let meta:None => (0,0)
    | let meta:JObj =>
      let x = try meta("x") as I64 else 0 end
      let y = try meta("y") as I64 else 0 end
      (x,y)
    end
