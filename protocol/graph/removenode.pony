use "jay"
use "promises"
use "../../web"
use ".."
use "../../graphs"
use "../network"

class RemoveNodeMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      let id = payload("id") as String
      let graph = payload("graph") as String
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        graph.remove_block( id )
      })
      graphs.graph_by_id( graph, promise )
    else
      ErrorMessage( connection, None, "Invalid 'removenode' payload: " + payload.string(), true )
    end

  fun reply( connection:WebSocketSender, graph:String, block:String ) =>
    let json = JObj
      + ("id", block )
      + ("graph", graph )
    connection.send_text( Message("graph", "removenode", json ).string() )
