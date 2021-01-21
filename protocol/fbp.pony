
use "collections"
use "jay"
use "time"
use "../blocktypes"
use "../graphs"
use "../system"
use "../web"
use "./component"
use "./graph"
use "./network"
use "./runtime"

class val Fbp 
  let _graphs:Graphs
  let _runtime_protocol:RuntimeProtocol
  let _network_protocol:NetworkProtocol
  let _graph_protocol:GraphProtocol
  let _component_protocol:ComponentProtocol
  let _trace_protocol:TraceProtocol
  let _context:SystemContext
  let _link_subscribers:SubscribersProxy

  new val create( uuid:String, main_graph:String, graphs:Graphs, blocktypes:BlockTypes, context:SystemContext) =>
    _graphs = graphs
    _link_subscribers = SubscribersProxy(graphs)
    _context = context
    let label: String = "Pink2Web - flowbased programming engine written in Pony Language"
    let version: String = "0.1.0"
    let all_capabilities: Array[String val] val = [
        "network:status"
        "network:persist"
        "network:data"
        "network:control"
        "protocol:component"
        "protocol:runtime"
        "protocol:graph"
    ]
    let capabilities: Array[String val] val = all_capabilities
    let graph_name: String = main_graph
    let type': String = "pink2web"
    let namespace: String = "pink2web"
    let repository: String = ""
    let repository_version: String = ""
    let runtime = RuntimeMessage( uuid, label, version, all_capabilities, capabilities, graph_name, type', namespace, repository, repository_version )

    _runtime_protocol = RuntimeProtocol(runtime, graphs, blocktypes, context)
    _network_protocol = NetworkProtocol.create(graphs)
    _graph_protocol = GraphProtocol.create(graphs)
    _component_protocol = ComponentProtocol.create(blocktypes)
    _trace_protocol = TraceProtocol

  fun val execute( conn: WebSocketSender, text: String ) =>
    try
      let jdoc = JParse.from_string( text )? as JObj
      let protocol = jdoc("protocol") as String
      let command = jdoc("command") as String
      let payload = jdoc("payload") as JObj
      match protocol
      | "runtime" => _runtime_protocol.execute( conn, command, payload )
      | "network" => _network_protocol.execute( conn, this, command, payload )
      | "graph" => _graph_protocol.execute( conn, command, payload )
      | "component" => _component_protocol.execute( conn, command, payload )
      | "trace" => _trace_protocol.execute( conn, command, payload )
      else
        ErrorMessage( conn, None, "Unknown protocol: " +  protocol, true )
      end
    else
      ErrorMessage( conn, None, "Badly formatted request: " + text, true )
    end

  fun subscribe(websocket: WebSocketSender val) =>
    _context.add_remote( websocket )
    let subscriber = Subscription(websocket)
    _graphs.subscribe( subscriber )

  fun subscribe_links( connection:WebSocketSender, graph:String, subscriptions:Array[LinkSubscription] val) =>
    _link_subscribers.subscribe_links( connection, graph, subscriptions )

  fun closing(websocket: WebSocketSender val) =>
    let subscriber = Subscription(websocket)
    _graphs.unsubscribe( subscriber )
    _context.remove_remote( websocket )
    _link_subscribers.close(websocket)

class val Subscription is GraphNotify
  let _connection: WebSocketSender val
  
  new val create(conn: WebSocketSender val) =>
    _connection = conn
    
  fun err( type':String, message:String ) =>
    ErrorMessage(_connection, None, type' + ": " + message, true )
    
  fun added_block( graph:String, block:String, component:String, x:I64, y:I64 ) =>
    AddNodeMessage.reply(_connection, graph, block, component, x, y )
  
  fun renamed_block( graph:String, from:String, to:String ) =>
    RenameNodeMessage.reply(_connection, graph, from, to )

  fun changed_block( graph:String, block:String, x:I64, y:I64 ) =>
    ChangeNodeMessage.reply(_connection, graph, block, x, y )
  
  fun removed_block( graph:String, block:String ) =>
    RemoveNodeMessage.reply(_connection, graph, block )

  fun added_connection(graph:String, from_block:String, from_output:String, to_block:String, to_input:String) =>
    AddEdgeMessage.reply(_connection, graph, from_block, from_output, to_block, to_input )
    
  fun removed_connection(graph:String, from_block:String, from_output:String, to_block:String, to_input:String) =>
    RemoveEdgeMessage.reply(_connection, graph, from_block, from_output, to_block, to_input )
    
  fun started( graph: String, time_started:PosixDate val, started':Bool, running:Bool, debug:Bool) =>
    StartedMessage.reply( _connection, graph, time_started, started', running, debug )
  
  fun stopped( graph: String, time_started:PosixDate val, uptime:I64, started':Bool, running:Bool, debug:Bool  ) =>
    StoppedMessage.reply( _connection, graph, time_started, uptime, started', running, debug )

  fun status( graph: String, uptime:I64, started':Bool, running:Bool, debug:Bool ) =>
    StatusMessage.reply( _connection, graph, uptime, started', running, debug )

  fun box eq(that: GraphNotify): Bool val =>
    if this is that then 
      true
    else
      match that 
      | let t: Subscription =>
        _connection == t._connection
      else
        false
      end
    end

actor SubscribersProxy
  let _link_subscriptions:Map[WebSocketSender, Array[LinkSubscription] val] iso = recover Map[WebSocketSender, Array[LinkSubscription] val] end
  let _graphs:Graphs

  new create( graphs':Graphs ) =>
    _graphs = graphs'

  be subscribe_links( connection:WebSocketSender, graph:String, subscriptions:Array[LinkSubscription] val) =>
    let existing:Array[LinkSubscription] val = try _link_subscriptions(connection)? else recover val Array[LinkSubscription] end end
    _graphs.unsubscribe_links(graph, existing)
    _link_subscriptions( connection ) = subscriptions
    _graphs.subscribe_links(graph, subscriptions)

  be close( connection:WebSocketSender ) =>
    try
      let subscriptions = _link_subscriptions(connection)?
      if subscriptions.size() > 0 then
        let subscr = subscriptions(0)?
        _graphs.unsubscribe_links(subscr.graph, subscriptions)
      end
    end

interface val ReadyNotification
  fun val apply()