
use "../../blocktypes"
use "jay"
use "websocket"
use ".."

class SourceMessage

  fun apply( connection: WebSocketConnection, blocktypes: BlockTypes, payload: JObj ) =>
    let json = JObj 
      + ("language", "json" )
      + ("library", "pink2web" )
      + ("code", "not true" )
      + ("tests", "not false" )
    connection.send_text( Message( "component", "source", json ).string() )

