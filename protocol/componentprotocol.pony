
use "../blocktypes"
use "./component"
use "jay"
use "websocket"

class ComponentProtocol is FbpProtocol
  let _blocktypes: BlockTypes
  
  new create( blocktypes: BlockTypes ) =>
    _blocktypes = blocktypes
    
  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    @printf[I32](("component protocol: " + command + ", " + payload.string() + "\n").cstring())
    match command
    |   "list" => ListMessage(_blocktypes).execute(connection)
    |   "getsource" => None
    |   "source" => None
    else
      connection.send_text( Error("Unknown command in runtime protocol").string() )
    end
