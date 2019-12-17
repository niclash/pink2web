use "jay"
use "../../graphs"
use "../../web"
use ".."

/*
{
  "protocol":"network",
  "command":"edges",
  "payload":
  {
    "graph":"main",
    "edges":
    [
      {
        "src":
        {
          "node":"Add_p1n10",
          "port":"output"
        },
        "tgt":
        {
          "node":"Add_96fnw",
          "port":"input1"
        }
      }
    ],
    "secret":"1234"
  }
}
*/

primitive EdgesMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
//     try
//       let graph = payload("graph") as String
//       let edges = payload("edges") as JArr
//       let subscriptions = HashMap[String,String]
      
//       let promise = Promise[ Graph ]
//       promise.next[None]( { (graph: Graph) =>
//         graph.rename_block( from, to )
//       })
//       graphs.graph_by_id( graph, promise )
      connection.send_text( Message( "network", "edges", payload ).string() )
//     else
//       connection.send_text( Message.err( "graph", "Invalid payload" ).string() )
//     end

