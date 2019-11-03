
use "../blocktypes"
use "./component"
use "jay"
use "websocket"

class val ComponentProtocol
  let _blocktypes: BlockTypes
  
  new val create( blocktypes: BlockTypes ) =>
    _blocktypes = blocktypes
    
  fun execute( connection: WebSocketConnection, command: String, payload: JObj ) =>
    match command
    |   "list" => ListMessage(connection, _blocktypes)
    |   "getsource" => GetSourceMessage(connection, _blocktypes, payload )
    |   "source" => None
    else
      connection.send_text( Message.err( "component", "Unknown command in runtime protocol: " + command ).string() )
    end
