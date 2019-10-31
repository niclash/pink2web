
use "../../blocktypes"
use "jay"
use "websocket"

class ListMessage
  let _blocktypes: BlockTypes
  
  new create( blocktypes: BlockTypes ) =>
    _blocktypes = blocktypes
    
  fun execute( connection: WebSocketConnection ) =>
    let components = _blocktypes.list_types()
    for descriptor in components.values() do
      let payload: JObj = descriptor.describe()
      let json = JObj 
        + ( "protocol", "component" )
        + ( "command", "component" )
        + ( "payload", payload )
      connection.send_text( json.string() )
    end
    connection.send_text( ComponentsReadyMessage.string() )

