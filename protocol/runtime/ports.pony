use "jay"
use "promises"
use "../../web"
use "../../graphs"

primitive PortsMessage
    
  fun apply( graph: Graph, conn: WebSocketSender ) =>
    let promise = Promise[GraphDescriptor]
    promise.next[None]( { (descr: GraphDescriptor) => 
        let text = "{ \"graph\": \"" + descr.name +"\"," + 
          "\"inPorts\": [], " + 
          "\"outPorts\": []" + 
        " }\n"
        conn.send_text( text )
    } )
    graph.descriptor( promise )
    
    
    
