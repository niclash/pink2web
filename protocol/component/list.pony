
use "../../blocktypes"
use "jay"
use "websocket"

class ListMessage
    
  fun apply( connection: WebSocketConnection, blocktypes: BlockTypes ) =>
    ComponentMessage( connection, blocktypes )
