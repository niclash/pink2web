
use "../blocktypes"
use "./component"
use "./network"
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
      ErrorMessage( connection, None, "Invalid command: " + command, true )
    end
