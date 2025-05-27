
use "jay"
use "../web"
use "./environment"
use "../graphs"
use "./network"
use "../system"

class val EnvironmentProtocol
  let _graphs: Graphs tag
  let _authorizer: Authorizer

  new val create( graphs: Graphs, authorizer: Authorizer ) =>
    _graphs = graphs
    _authorizer = authorizer

  fun execute( connection: WebSocketSender, command: String, payload: JObj, secret:String ) =>
    match command
    | "login" => LoginMessage(connection, _graphs, payload, _authorizer )
    | "logout" => LogoutMessage(connection, _graphs, payload, _authorizer, secret )
    else
      ErrorMessage( connection, None, "Invalid 'environment' command: " + command, true )
    end

