
use "jay"
use "../web"

class val TraceProtocol
  
  fun execute( connection: WebSocketSender, command: String, payload: JObj ) =>
    match command
    |   "clear" => None
    else
      connection.send_text( Message.err( "trace", "Invalid command: " + command ).string() )
    end

