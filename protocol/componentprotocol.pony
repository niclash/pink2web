
use "../blocktypes"
use "./component"
use "jay"
use "../web"

class val ComponentProtocol
  let _blocktypes: BlockTypes
  
  new val create( blocktypes: BlockTypes ) =>
    _blocktypes = blocktypes
    
  fun execute( connection: WebSocketSender, command: String, payload: JObj ) =>
    match command
    |   "list" => ListMessage(connection, _blocktypes)
    |   "getsource" => GetSourceMessage(connection, _blocktypes, payload )
    else
      connection.send_text( Message.err( "component", "Invalid command: " + command ).string() )
    end
