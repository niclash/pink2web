
use "../../blocktypes"
use "jay"
use "../../web"

class ListMessage
    
  fun apply( connection: WebSocketSender, blocktypes: BlockTypes ) =>
    ComponentMessage( connection, blocktypes )
