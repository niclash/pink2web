
use "../../blocktypes"
use "jay"
use "../../web"

class GetSourceMessage

  fun apply( connection: WebSocketSender, blocktypes: BlockTypes, payload: JObj ) =>
    SourceMessage( connection, blocktypes, payload )

