
use "../system"
use "../blocktypes"
use "collections"
use "logger"
use "promises"

actor Graphs
  let _graphs_by_id: Map[String, Graph] = Map[String, Graph]
  let _graphs_by_name: Map[String, Graph] = Map[String, Graph]
  let _context: SystemContext
  let _blocktypes: BlockTypes
  
  new create( blocktypes: BlockTypes, context: SystemContext ) =>
    _context = context
    _blocktypes = blocktypes
    
  be list( promise: Promise[List[Graph] val] ) =>
    let result: List[Graph] iso = recover iso List[Graph] end
    for g in _graphs_by_id.values() do 
      result.push(g)    
    end
    promise( consume result )

  be create_graph( id: String, name: String, description: String, library: String, icon: String, main: Bool ) =>
    _context(Fine) and _context.log("Graphs.create(" + id  +"," + name +"," + description + "," + library +","  + icon + "," + main.string() + ")")
    let graph = Graph( id, name, description, library, icon, _blocktypes, _context )
    register_graph( id, name, graph )
    
  be register_graph( id:String, name: String, graph: Graph ) =>
    _graphs_by_id(id) = graph
    _graphs_by_name(name) = graph

  be graph_by_id( id': String, promise: Promise[ Graph ] ) =>
    try
      promise( _graphs_by_id( id' )? )
    else
      _context(Error) and _context.log( "Graph with id " + id' + " doesn't exist." )
    end
    
  be graph_by_name( name': String, promise: Promise[ Graph ] ) =>
    try
      promise( _graphs_by_name( name' )? )
    else
      _context(Error) and _context.log( "Graph with name " + name' + " doesn't exist." )
    end    
