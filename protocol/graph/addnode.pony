use "jay"
use "promises"
use "websocket"
use ".."
use "../../graphs"

class AddNodeMessage

  fun apply( connection: WebSocketConnection, graphs: Graphs, payload: JObj ) =>
    try
      let id = payload("id") as String
      let graph = payload("graph") as String
      let component = payload("component") as String
      let meta = payload("metadata") as JObj
      let x = meta("x") as I64
      let y = meta("y") as I64
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        graph.create_block( component, id, x, y )
      })
      graphs.graph_by_id( graph, promise )
    else
      connection.send_text( Message.err( "graph", "Invalid payload" ).string() )
    end

  fun reply( connection: WebSocketConnection, graph:String, block:String, component:String, x:I64, y:I64 ) =>
    let meta = JObj + ("x", x) + ("y", y)
    let json = JObj 
      + ("graph", graph)
      + ("component", component)
      + ("id", block)
      + ("metadata", meta )
    connection.send_text( Message( "graph", "addnode", json).string() )
