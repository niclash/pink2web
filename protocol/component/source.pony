
use "../../blocktypes"
use "jay"
use "../../web"
use ".."
use "../network"

class SourceMessage

  fun apply( connection: WebSocketSender, blocktypes: BlockTypes, payload: JObj ) =>
    let json = JObj 
      + ("name", "main2" )
      + ("language", "json" )
      + ("library", "pink2web" )
      + ("code", "" )
      + ("tests", "" )
    connection.send_text( Message( "component", "source", json ).string() )

