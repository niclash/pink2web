
use "collections"
use "debug"
use "jay"
use "metric"
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
  let _environment_protocol:EnvironmentProtocol
  let _context:SystemContext
  let _link_subscribers:SubscribersProxy

  new val create( uuid:String, graphs:Graphs, blocktypes:BlockTypes, authorizer': Authorizer, context:SystemContext) =>
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
    let type': String = "pink2web"
    let namespace: String = "pink2web"
    let repository: String = ""
    let repository_version: String = ""
    let runtime = RuntimeMessage( uuid, label, version, all_capabilities, capabilities, type', namespace, repository, repository_version )

    _runtime_protocol = RuntimeProtocol(runtime, graphs, blocktypes, context, authorizer')
    _network_protocol = NetworkProtocol.create(graphs, authorizer')
    _graph_protocol = GraphProtocol.create(graphs, _context, authorizer')
    _component_protocol = ComponentProtocol.create(blocktypes, authorizer')
    _trace_protocol = TraceProtocol(authorizer')
    _environment_protocol = EnvironmentProtocol(graphs, authorizer')

  fun val execute( conn: WebSocketSender, text: String ) =>
    try
      let jdoc = JParse.from_string( text )? as JObj
      let protocol = jdoc("protocol") as String
      let command = jdoc("command") as String
      let payload = jdoc("payload") as JObj
      let secret:String = jdoc("secret") as String
      match protocol
      | "environment" => _environment_protocol.execute( conn, command, payload, secret )
      | "runtime" => _runtime_protocol.execute( conn, command, payload, secret )
      | "network" => _network_protocol.execute( conn, this, command, payload, secret )
      | "graph" => _graph_protocol.execute( conn, this, command, payload, secret )
      | "component" => _component_protocol.execute( conn, command, payload, secret )
      | "trace" => _trace_protocol.execute( conn, command, payload, secret )
      else
        ErrorMessage( conn, None, "Unknown protocol: " +  protocol, true )
      end
    else
      ErrorMessage( conn, None, "Badly formatted request: " + text, true )
    end

  fun subscribe_graph(websocket: WebSocketSender val, graphid:String) =>
    let subscription = Subscription(websocket)
    _graphs.unsubscribe(subscription)
    _graphs.subscribe(GraphFilterSubscription(graphid,subscription))

  fun subscribe(websocket: WebSocketSender val) =>
    _context.add_remote( websocket )
    let subscription = Subscription(websocket)
    _graphs.subscribe( subscription )

  fun subscribe_links( connection:WebSocketSender, graph:String, subscriptions:Array[LinkSubscription] val) =>
    _link_subscribers.subscribe_links( connection, graph, subscriptions )

  fun closing(websocket: WebSocketSender val) =>
    let subscriber = Subscription(websocket)
    _graphs.unsubscribe( subscriber )
    _context.remove_remote( websocket )
    _link_subscribers.close(websocket)

class val GraphFilterSubscription is GraphNotify
  let _underlying: GraphNotify
  let _graphid:String

  new val create(graphid:String, underlying: GraphNotify) =>
    _underlying = underlying
    _graphid = graphid

  fun err( type':String, message:String ) =>
    _underlying.err(type', message )

  fun added_block( graph:String, block:String, component:String, x:F64, y:F64 ) =>
    if graph == _graphid then
      _underlying.added_block( graph, block, component, x, y )
    end

  fun renamed_block( graph:String, from:String, to:String ) =>
    if graph == _graphid then
      _underlying.renamed_block( graph, from, to )
    end

  fun changed_block( graph:String, block:String, x:F64, y:F64 ) =>
    if graph == _graphid then
      _underlying.changed_block( graph, block, x, y )
    end

  fun removed_block( graph:String, block:String ) =>
    if graph == _graphid then
      _underlying.removed_block( graph, block )
    end

  fun added_connection(graph:String, from_block:String, from_output:String, to_block:String, to_input:String) =>
    if graph == _graphid then
      _underlying.added_connection(graph, from_block, from_output, to_block, to_input)
    end

  fun removed_connection(graph:String, from_block:String, from_output:String, to_block:String, to_input:String) =>
    if graph == _graphid then
      _underlying.removed_connection(graph, from_block, from_output, to_block, to_input)
    end

  fun added_initial(graph:String, initial_value:(String|I64|F64|Metric|Bool), to_block:String, to_input:String) =>
    if graph == _graphid then
      _underlying.added_initial(graph, initial_value, to_block, to_input)
    end

  fun removed_initial(graph:String, initial_value:(String|I64|F64|Metric|Bool), to_block:String, to_input:String) =>
    if graph == _graphid then
      _underlying.removed_initial(graph, initial_value, to_block, to_input)
    end

  fun created_graph(name:String, description:String, graphid:String, icon:String) =>
    _underlying.created_graph(name, description, graphid, icon)

  fun deleted_graph(graphid:String, name:String) =>
    _underlying.deleted_graph(graphid, name)

  fun started( graph: String, time_started:PosixDate val, started':Bool, running:Bool, debug:Bool) =>
    if graph == _graphid then
      _underlying.started( graph, time_started, started', running, debug)
    end

  fun stopped( graph: String, time_started:PosixDate val, uptime:I64, started':Bool, running:Bool, debug:Bool  ) =>
    if graph == _graphid then
      _underlying.stopped( graph, time_started, uptime, started', running, debug  )
    end

  fun status( graphid: String, name':String, descr:String, uptime:I64, started':Bool, running:Bool, debug:Bool ) =>
    _underlying.status( graphid, name', descr, uptime, started', running, debug )

  fun box eq(that: GraphNotify): Bool val =>
    if this is that then
      true
    else
      _underlying.eq( that )
    end

class val Subscription is GraphNotify
  let _connection: WebSocketSender val
  
  new val create(conn: WebSocketSender val) =>
    _connection = conn
    
  fun err( type':String, message:String ) =>
    ErrorMessage(_connection, None, type' + ": " + message, true )
    
  fun added_block( graph:String, block:String, component:String, x:F64, y:F64 ) =>
    AddNodeMessage.reply(_connection, graph, block, component, x, y )
  
  fun renamed_block( graph:String, from:String, to:String ) =>
    RenameNodeMessage.reply(_connection, graph, from, to )

  fun changed_block( graph:String, block:String, x:F64, y:F64 ) =>
    ChangeNodeMessage.reply(_connection, graph, block, x, y )
  
  fun removed_block( graph:String, block:String ) =>
    RemoveNodeMessage.reply(_connection, graph, block )

  fun added_connection(graph:String, from_block:String, from_output:String, to_block:String, to_input:String) =>
    AddEdgeMessage.reply(_connection, graph, from_block, from_output, to_block, to_input )
    
  fun removed_connection(graph:String, from_block:String, from_output:String, to_block:String, to_input:String) =>
    RemoveEdgeMessage.reply(_connection, graph, from_block, from_output, to_block, to_input)
    
  fun added_initial(graph:String, initial_value:(String|I64|F64|Metric|Bool), to_block:String, to_input:String) =>
    AddInitialMessage.reply(_connection, graph, initial_value, to_block, to_input)

  fun removed_initial(graph:String, initial_value:(String|I64|F64|Metric|Bool), to_block:String, to_input:String) =>
    RemoveInitialMessage.reply(_connection, graph, initial_value, to_block, to_input)

  fun created_graph(name:String, description:String, graphid:String, icon:String) =>
    NewGraphMessage.reply(_connection, graphid, name, description, icon)

  fun deleted_graph(graphid:String, name:String) =>
    DeleteGraphMessage.reply(_connection, graphid, name)

  fun started( graph: String, time_started:PosixDate val, started':Bool, running:Bool, debug:Bool) =>
    StartedMessage.reply( _connection, graph, time_started, started', running, debug)
  
  fun stopped( graph: String, time_started:PosixDate val, uptime:I64, started':Bool, running:Bool, debug:Bool  ) =>
    StoppedMessage.reply( _connection, graph, time_started, uptime, started', running, debug)

  fun status( graphid: String, name':String, descr:String, uptime:I64, started':Bool, running:Bool, debug:Bool ) =>
    StatusMessage.reply( _connection, graphid, name', descr, uptime, started', running, debug)

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
