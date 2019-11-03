use "jay"
use "promises"
use "websocket"
use ".."
use "../../graphs"

class GetStatusMessage

  fun apply( connection: WebSocketConnection, graphs: Graphs, payload: JObj ) =>
    try
      let graph = payload("graph") as String
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        graph.status()
      })
      graphs.graph_by_id( graph, promise )
    else
      connection.send_text( Message.err( "graph", "Invalid payload" ).string() )
    end
