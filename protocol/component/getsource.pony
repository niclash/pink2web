
use "../../blocktypes"
use "jay"
use "websocket"

class GetSourceMessage

  fun apply( connection: WebSocketConnection, blocktypes: BlockTypes, payload: JObj ) =>
    SourceMessage( connection, blocktypes, payload )

