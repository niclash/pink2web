use "jay"
use "promises"
use "websocket"
use "../../graphs"

primitive PortsMessage
    
  fun apply( graph: Graph, conn: WebSocketConnection ) =>
    let promise = Promise[String]
    promise.next[None]( { (name: String) => 
        let text = "{ \"graph\": \"" + name +"\"," + 
          "\"inPorts\": [], " + 
          "\"outPorts\": []" + 
        " }\n"
        conn.send_text( text )
    } )
    graph.name( promise )
    
    
    