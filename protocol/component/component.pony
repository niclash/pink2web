
use "../../blocktypes"
use "jay"
use "../../web"

class ComponentMessage
    
  fun apply( connection: WebSocketSender, blocktypes: BlockTypes ) =>
    let components = blocktypes.list_types()
    for descriptor in components.values() do
      let payload: JObj = descriptor.describe()
      let json = JObj 
        + ( "protocol", "component" )
        + ( "command", "component" )
        + ( "payload", payload )
      connection.send_text( json.string() )
    end
    connection.send_text( ComponentsReadyMessage(components.size()) )

