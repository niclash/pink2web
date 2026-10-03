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
  "command":"addinport",
  "payload":
  {
    "public": "This Is a Port Name,
    "node":"Repeat1",
    "port":"out"
    "metadata":
    {
      "x":5
      "y":5
    },
    "graph":"foo"
  }
}
*/

primitive AddInportMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      let graph = try payload("graph") as String else Debug.err("No 'graph' property.") ; error end
      let node = try payload("node") as String else Debug.err("No 'node' property.") ; error end
      let port = try payload("port") as String else Debug.err("No 'port' property.") ; error end
      let name = try payload("public") as String else Debug.err("No 'public' property.") ; error end

      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        // TODO: Add metadata support
        graph.add_inport(name, node, port)
      })
      graphs.graph_by_id( graph, promise )
    else
      ErrorMessage( connection, None, "Invalid 'addinport' payload: " + payload.string(), true )
    end

  fun reply(connection:WebSocketSender, graph:String, name:String, node:String, port:String ) =>
    let payload:JObj = JObj + ("graph", graph) + ("name", name) + ("node", node) + ("port", port)
    connection.send_text( Message("graph", "addinport", payload ).string() )

