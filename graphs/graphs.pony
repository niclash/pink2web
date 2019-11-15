
use "collections"
use "logger"
use "promises"
use "time"
use "../blocktypes"
use "../system"

actor Graphs
  let _graphs_by_id: Map[String, Graph] = Map[String, Graph]
  let _graphs_by_name: Map[String, Graph] = Map[String, Graph]
  let _subscribers: List[GraphNotify] = List[GraphNotify]
  let _context: SystemContext
  let _blocktypes: BlockTypes
  let _timers: Timers = Timers
  
  new create( blocktypes: BlockTypes, context: SystemContext ) =>
    _context = context
    _blocktypes = blocktypes
    
    let timer:Timer iso = Timer(Notify(this), 1_000_000_000, 1_000_000_000)
    _timers(consume timer)

  be tick() =>
    for graph in _graphs_by_id.values() do
      graph.tick()
    end

  be start_all() =>
    _context.log( "start all" )
    for graph in _graphs_by_id.values() do
      graph.start()
    end

  be stop_all() =>
    _stop_all()
    
  fun _stop_all() =>
    _context.log( "stop all" )
    for graph in _graphs_by_id.values() do
      graph.stop()
    end

  be shutdown() =>
    _context.log( "shutdown all" )
    for graph in _graphs_by_id.values() do
      graph.stop()
      graph.destroy()
    end
    _graphs_by_id.clear()
    _graphs_by_name.clear()
    _subscribers.clear()
    
  be list( promise: Promise[List[Graph] val] ) =>
    let result: List[Graph] iso = recover iso List[Graph] end
    for g in _graphs_by_id.values() do 
      result.push(g)    
    end
    promise( consume result )

  be create_graph( id: String, name: String, description: String, library: String, icon: String, main: Bool ) =>
    _context(Fine) and _context.log("Graphs.create(" + id  +"," + name +"," + description + "," + library +","  + icon + "," + main.string() + ")")
    let graph = Graph( this, id, name, description, library, icon, _blocktypes, _context )
    register_graph( id, name, graph )
    
  be register_graph( id:String, name: String, graph: Graph ) =>
    _graphs_by_id(id) = graph
    _graphs_by_name(name) = graph

  be graph_by_id( id': String, promise: Promise[ Graph ] ) =>
    try
      promise( _graphs_by_id( id' )? )
    else
      var graphs: String val = recover val "[" end
      var first = true
      for identity in _graphs_by_id.keys() do
        if not first then graphs = graphs + ", " end
        first = false
        graphs = graphs + identity
      end
      _context(Error) and _context.log( "Graph with id " + id' + " doesn't exist\nAvailable graphs: " + consume graphs + "]" )
    end
    
  be graph_by_name( name': String, promise: Promise[ Graph ] ) =>
    try
      promise( _graphs_by_name( name' )? )
    else
      _context(Error) and _context.log( "Graph with name " + name' + " doesn't exist." )
    end    

  be subscribe( notify:GraphNotify ) =>
    _subscribers.push( notify )
    
  be unsubscribe( notify:GraphNotify ) =>
    for n in _subscribers.nodes() do
      try
        if( n()? == notify ) then
          n.remove()
        end
      end
    end
  
  be _error( type':String, message: String ) =>
    _context.log( "error: " + type' + " : " + message )
    for s in _subscribers.values() do 
      s.err( type', message ) 
    end
    
  be _added(graph: String, block:String, component:String, x:I64, y:I64) =>
    _context.log( "added: " + graph + " : " + block + " : " + component + " : (" + x.string() + "," + y.string() + ")" )
    for s in _subscribers.values() do 
      s.added_block( graph, block, component, x, y ) 
    end
    
  be _removed(graph: String, block:String) =>
    _context.log( "removed: " + graph + " : " + block )
    for s in _subscribers.values() do 
      s.removed_block( graph, block ) 
    end
  
  be _renamed(graph:String, from:String, to:String) =>
    _context.log( "renamed: " + graph + " : " + from + " -> " + to )
    for s in _subscribers.values() do 
      s.renamed_block( graph, from, to ) 
    end

  be _changed(graph: String, block:String, x:I64, y:I64) =>
    _context.log( "changed: " + graph + " : " + block + " : (" + x.string() + "," + y.string() + ")" )
    for s in _subscribers.values() do 
      s.changed_block( graph, block, x, y ) 
    end
    
  be _started(graph: String, time_started:PosixDate val, started':Bool, running:Bool, debug:Bool) =>
    _context.log( "started: " + graph + " : " + started'.string() + " : " + running.string() + " : " + debug.string() )
    for s in _subscribers.values() do 
      s.started(graph, time_started, started', running, debug) 
    end
  
  be _stopped(graph: String, time_started:PosixDate val, started':Bool, running:Bool, uptime:I64, debug:Bool) =>
    _context.log( "stopped: " + graph + " : " + uptime.string() + " : " + started'.string() + " : " + running.string() + " : " + debug.string() )
    for s in _subscribers.values() do 
      s.stopped( graph, time_started, uptime, started', running, debug ) 
    end
  
  be _status(id:String, uptime:I64, running:Bool, started:Bool, debug:Bool) =>
    _context.log( "status: " + id + " : " + uptime.string() + " : " + started.string() + " : " + running.string() + " : " + debug.string() )
    for s in _subscribers.values() do 
      s.status( id, uptime, started, running, debug) 
    end
  
class Notify is TimerNotify
  let _graphs: Graphs tag
  
  new iso create( graphs: Graphs ) =>
    _graphs = graphs
    
  fun ref apply( timer: Timer ref, count: U64 val) : Bool val =>
    _graphs.tick()
    true
