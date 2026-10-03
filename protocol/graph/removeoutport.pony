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
  "command":"removeoutport",
  "payload":
  {
    "public": "This Is a Port Name,
    "graph":"foo"
  }
}
*/

primitive RemoveOutportMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      let graph = try payload("graph") as String else Debug.err("No 'graph' property.") ; error end
      let name = try payload("public") as String else Debug.err("No 'public' property.") ; error end

      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        // TODO: Add metadata support
        graph.remove_outport(name)
      })
      graphs.graph_by_id( graph, promise )
    else
      ErrorMessage( connection, None, "Invalid 'removeoutport' payload: " + payload.string(), true )
    end

  fun reply(connection:WebSocketSender, graph:String, name:String) =>
    let payload:JObj = JObj + ("graph", graph) + ("name", name)
    connection.send_text( Message("graph", "removeoutport", payload ).string() )

