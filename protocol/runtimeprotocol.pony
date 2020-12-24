
use "jay"
use "../blocktypes"
use "../graphs"
use "../system"
use "../web"
use "./runtime"

class val RuntimeProtocol
  let _runtime:RuntimeMessage
  let _getruntime:GetRuntimeMessage
  let _graphs:Graphs
  let _blocktypes:BlockTypes
  
  new val create( runtime:RuntimeMessage, graphs:Graphs, blocktypes:BlockTypes, context:SystemContext ) =>
    _runtime = runtime
    _graphs = graphs
    _blocktypes = blocktypes
    _getruntime = GetRuntimeMessage(context)

  fun execute( connection: WebSocketSender, command: String, payload: JObj ) =>
    match command
    |   "getruntime" => _getruntime(connection, _graphs, _blocktypes, _runtime)
    else
      connection.send_text( Message.err( "runtime", "Invalid command: " + command ).string() )
    end
