use "jay"
use "promises"
use "../../web"
use ".."
use "../../graphs"

class StopMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      let graph = payload("graph") as String
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        graph.stop()
      })
      graphs.graph_by_id( graph, promise )
    else
      ErrorMessage( connection, None, "Invalid 'stop' payload: " + payload.string(), true )
    end
