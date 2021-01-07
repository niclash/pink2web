
use "collections"
use "jay"
use "promises"
use "../../blocktypes"
use "../../web"

class ComponentMessage
    
  fun apply( connection: WebSocketSender, blocktypes: BlockTypes ) =>
    let promise = Promise[Map[String, BlockTypeDescriptor val] val]
    promise.next[None]({ (components) =>
      for descriptor in components.values() do
        let payload: JObj = descriptor.describe()
        let json = JObj
          + ( "protocol", "component" )
          + ( "command", "component" )
          + ( "payload", payload )
        connection.send_text( json.string() )
      end
      connection.send_text( ComponentsReadyMessage(components.size()) )
    })
    blocktypes.list_types(promise)

