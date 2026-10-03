use "debug"
use "jay"
use "promises"
use ".."
use "../../graphs"
use "../../system"
use "../../web"
use "../network"

/*
Protocol Spec
{
  "protocol":"graph",
  "command":"renameoutport",
  "payload":
  {
    "from": "old name",
    "to":"new name",
    "graph":"foo"
  }
}
*/

primitive RenameOutportMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      let graph = try payload("graph") as String else Debug.err("No 'graph' property.") ; error end
      let from = try payload("from") as String else Debug.err("No 'from' property.") ; error end
      let to = try payload("to") as String else Debug.err("No 'to' property.") ; error end

      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        // TODO: Add metadata support
        graph.rename_outport(from, to)
      })
      graphs.graph_by_id( graph, promise )
    else
      ErrorMessage( connection, None, "Invalid 'renameoutport' payload: " + payload.string(), true )
    end

  fun reply(connection:WebSocketSender, graph:String, from:String, to:String ) =>
    let payload:JObj = JObj + ("graph", graph) + ("from", from) + ("to", to)
    connection.send_text( Message("graph", "renameoutport", payload ).string() )

