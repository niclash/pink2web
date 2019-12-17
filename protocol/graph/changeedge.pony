use "jay"
use "promises"
use "../../web"
use ".."
use "../../graphs"

/*
  {
    "protocol":"graph",
    "command":"changeedge",
    "payload":
    {
      "src":
      {
        "node":"Add_njzod",
        "port":"output"
      },
      "tgt":
      {
        "node":"Add_iw6be",
        "port":"input1"
      },
      "metadata":
      {
        "route":1
      },
      "graph":"main",
      "secret":"1234"
    }
  }
*/
class ChangeEdgeMessage

  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      (let src_block, let src_output, let src_index) = Util._parse( payload("src") as JObj )?
      (let dest_block, let dest_input, let dest_index) = Util._parse( payload("tgt") as JObj )?
      let graph = payload("graph") as String
      let metadata' = payload("metadata") as (JObj|NotSet)
      var secure:(Bool|NotSet) = NotSet
      var schema:(String|NotSet) = NotSet
      var route:I64 = 0
      match metadata'
      | let metadata: JObj => 
          let r = metadata("route") as (Number|NotSet)
          route = match r | let rt:Number => rt.i64() else route end
          secure = metadata("secure") as (Bool|NotSet)
          schema = metadata("schema") as (String|NotSet)
      end
      
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        // TODO: Add support for (meta-)data on edges
        None
      })
      graphs.graph_by_id( graph, promise )
      connection.send_text( Message("graph", "changeedge", payload).string() )
    else
      connection.send_text( Message.err( "graph", "Invalid payload..." ).string() )
    end
