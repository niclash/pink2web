use "jay"
use "promises"
use "websocket"
use ".."
use "../../graphs"

class RenameNodeMessage

  fun apply( connection: WebSocketConnection, graphs: Graphs, payload: JObj ) =>
    try
      let from = payload("from") as String
      let to = payload("to") as String
      let graph = payload("graph") as String
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        graph.rename_block( from, to )
      })
      graphs.graph_by_id( graph, promise )
    else
      connection.send_text( Message.err( "graph", "Invalid payload" ).string() )
    end

  fun reply(connection: WebSocketConnection, graph:String, from:String, to:String ) =>
    let json = JObj
      + ("graph", graph)
      + ("from", from )
      + ("to", to )
    connection.send_text( Message( "graph", "renamenode", json ).string() )
