
use "../../blocktypes"
use "jay"
use "websocket"
use ".."

class SourceMessage

  fun apply( connection: WebSocketConnection, blocktypes: BlockTypes, payload: JObj ) =>
    let json = JObj 
      + ("name", "main2" )
      + ("language", "json" )
      + ("library", "pink2web" )
      + ("code", "" )
      + ("tests", "" )
    connection.send_text( Message( "component", "source", json ).string() )
//     connection.send_text( Message.err("component", "getsource is not supported.").string() )

