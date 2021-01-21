
use "jay"
use "../web"
use "./network"

class val TraceProtocol
  
  fun execute( connection: WebSocketSender, command: String, payload: JObj ) =>
    match command
    |   "clear" => None
    else
      ErrorMessage( connection, None, "Invalid 'trace' command: " + command, true )
    end

