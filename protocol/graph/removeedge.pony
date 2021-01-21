use "jay"
use "promises"
use "../../web"
use ".."
use "../../graphs"
use "../network"

class RemoveEdgeMessage
  fun apply( connection: WebSocketSender, graphs: Graphs, payload: JObj ) =>
    try
      (let src_block, let src_output, let src_index) = Util._parse( payload("src") as JObj )?
      (let dest_block, let dest_input, let dest_index) = Util._parse( payload("tgt") as JObj )?
      let graph = payload("graph") as String
      
      let promise = Promise[ Graph ]
      promise.next[None]( { (graph: Graph) =>
        graph.disconnect( src_block, src_output, dest_block, dest_input )
      })
      graphs.graph_by_id( graph, promise )
    else
      ErrorMessage( connection, None, "Invalid 'removeedge' payload: " + payload.string(), true )
    end
    
  fun reply(connection:WebSocketSender, graph:String, from_block:String, from_output:String, to_block:String, to_input:String ) =>
    let src = JObj + ("node", from_block) + ("port", from_output) 
    let tgt = JObj + ("node", to_block) + ("port", to_input) 
    let payload:JObj = JObj 
      + ("graph", graph) 
      + ("src", src ) 
      + ("tgt", tgt)
    connection.send_text( Message("graph", "removeedge", payload ).string() )
