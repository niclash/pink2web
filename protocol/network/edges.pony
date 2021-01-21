use "jay"
use "promises"
use "../../graphs"
use "../../system"
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

  fun apply( connection: WebSocketSender val, fbp: Fbp, payload: JObj ) =>
    try
      let graph = try payload("graph") as String else Print("No 'graph' property.") ; error end
      let edges = payload("edges") as JArr
      let links = recover val
        let result = Array[(String,String,String,String)]
        for e in edges.values() do
          let edge = e as JObj
          let src = edge("src") as JObj
          let dest = edge("tgt") as JObj
          let src_block = src("node") as String
          let src_port = src("port") as String
          let dest_block = dest("node") as String
          let dest_port = dest("port") as String
          result.push((src_block,src_port,dest_block,dest_port))
        end
        result
      end
      let subscriptions = recover val
        let s = Array[LinkSubscription]
        for link in links.values() do
          let subscription = LinkSubscription( graph, link._1, link._2, link._3, link._4, { (g,s,v) =>
            DataMessage.reply(connection, g, s.src_block_name, s.src_port, s.dest_block_name, s.dest_port, v )
          })
          s.push(subscription)
        end
        s
      end
      fbp.subscribe_links(connection, graph, subscriptions)
      reply(connection, payload)
    else
      ErrorMessage( connection, None, "Invalid 'addedge' payload: " + payload.string(), true )
    end

  fun reply( connection: WebSocketSender, payload: JObj ) =>
    connection.send_text( Message( "network", "edges", payload + ("secret", NotSet) ).string() )

