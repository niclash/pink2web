use "jay"
use "promises"
use "websocket"
use ".."
use "../../graphs"

class RemoveNodeMessage

  fun apply( connection: WebSocketConnection, graphs: Graphs, payload: JObj ) =>
    try
      let id = payload("id") as String
      let graph = payload("graph") as String
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        graph.remove_block( id )
      })
      graphs.graph_by_id( graph, promise )
    else
      connection.send_text( Message.err( "graph", "Invalid payload" ).string() )
    end
