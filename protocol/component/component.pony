
use "collections"
use "jay"
use "promises"
use "../../blocktypes"
use "../../web"
use ".."

class ComponentMessage
    
  fun apply( connection: WebSocketSender, blocktypes: BlockTypes, ready:(ReadyNotification|None) = None ) =>
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
      ComponentsReadyMessage.reply(connection, components.size())
      match ready
      | let r:ReadyNotification => r()
      end
    })
    blocktypes.list_types(promise)

