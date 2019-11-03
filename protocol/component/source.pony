
use "../../blocktypes"
use "jay"
use "websocket"
use ".."

class SourceMessage

  fun apply( connection: WebSocketConnection, blocktypes: BlockTypes, payload: JObj ) =>
    connection.send_text( Message.err( "component", "Source code is not available" ).string() )

