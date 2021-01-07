use "../graphs"
use "../blocktypes"
use "../system"
use "collections"
use "files"
use "jay"

class Loader
  let _blocktypes: BlockTypes
  let _context: SystemContext
  let _graphs: Graphs
  
  new create( graphs: Graphs, blocktypes: BlockTypes, context:SystemContext val) =>
    _context = context
    _blocktypes = blocktypes
    _graphs = graphs

  fun load( pathname: String ): (String, Graph) ? =>
      let content: String = Files.read_text_from_pathname(pathname, _context.auth())?
      let root = JParse.from_string( content )? as JObj
      parse_root(root)
  
  fun save( path: String ) =>
    None
  
  fun parse_root( root: JObj box ): (String,Graph) =>
    var name = try root("name") as String else "" end
    var id = try root("id") as String else "" end
    if name == "" then
      if id == "" then
        name = "<unknown>"
        id = "<unknown>"
      else
        name = id
      end
    else
      if id == "" then
        id = name
      end
    end
    let description = try root("description") as String else "<unknown>" end
    let icon = try root("icon") as String else "<unknown>" end
    let graph = Graph( _graphs, id, name, description, icon, _blocktypes, _context )
    _graphs.register_graph( id, name, graph )
    
    try
      let processes: JObj val = root("processes") as JObj
      parse_processes( graph, processes )
    else
      _context(Error) and _context.log( Error, "A 'processes' object must exist in root object." )
    end

    try
      let connections: JArr val = root("connections") as JArr
      parse_connections( graph, connections )
    else
      _context(Error) and _context.log( Error, "A 'connections' object must exist in root object." )
    end

    (id,graph)

  fun parse_processes( graph: Graph, connections: JObj box ) =>
    for name in connections.data.keys() do
      try
        let component = connections(name) as JObj
        let blocktype = component("component") as String
        let meta = try component("metadata") as JObj else JObj end
        
        let x:I64 = if meta is None then 
          50 
        else 
          try meta("x") as I64 else 50 end 
        end
        let y:I64 = if meta is None then 
          50
        else 
          try meta("y") as I64 else 50 end 
        end
        graph.create_block( blocktype, name, x, y )
      else
        _context(Error) and _context.log( Error, "Component '" + name + "' has invalid structure." )
      end
    end
  
  fun parse_connections( graph: Graph, connections: JArr box ) =>
    for value in connections.data.values() do
      try
        let conn:JObj = value as JObj
        let src:(String,String,String) = parse_endpoint(conn, "src" )
        let tgt:(String,String,String) = parse_endpoint(conn, "tgt" )
        graph.connect( src._1, src._2, tgt._1, tgt._2 )
      else
        try
          let c:Stringable = value as Stringable
          _context(Error) and _context.log( Error, "Connection "+c.string()+"has invalid structure." )
        end
      end
    end
    
  fun parse_endpoint( conn: JObj box, endp: String ) : ( String, String, String ) =>
    try
      let point = conn(endp) as JObj
      let process = point("process") as String
      let port = point("port") as String
      let data = point("data") as String
      (process,port,data)
    else
      ("","","")
    end
    
