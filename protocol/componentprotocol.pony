
use "../blocktypes"
use "./component"
use "jay"
use "websocket"

class ComponentProtocol is FbpProtocol
  let _blocktypes: BlockTypes
  
  new create( blocktypes: BlockTypes ) =>
    _blocktypes = blocktypes
    
  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    match command
    |   "list" => ListMessage(_blocktypes).execute(connection)
    |   "getsource" => None
    |   "source" => None
    else
      connection.send_text( Message.err( "component", "Unknown command in runtime protocol: " + command ).string() )
    end
