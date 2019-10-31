use "../graphs"
use "../blocktypes"
use "../system"
use "collections"
use "files"
use "jay"
use "logger"

class Loader
  let _blocktypes: BlockTypes
  let _context: SystemContext
  
  new create( blocktypes: BlockTypes, context:SystemContext val) =>
    _context = context
    _blocktypes = blocktypes

  fun load( pathname: String ): Graph ? =>
      let content: String = Files.read_lines_from_pathname(pathname, _context.auth())?
      let root = JParse.from_string( content )? as JObj
      parse_root(root)
  
  fun save( path: String ) =>
    None
  
  fun parse_root( root: JObj box ): Graph =>
    let name = try root("name") as String else "<unknown>" end
    let graph = Graph( name, _blocktypes, _context )
    try
      let processes: JObj val = root("processes") as JObj
      parse_processes( graph, processes )
    else
      _context(Error) and _context.log( "A 'processes' object must exist in root object." )
    end

    try
      let connections: JArr val = root("connections") as JArr
      parse_connections( graph, connections )
    else
      _context(Error) and _context.log( "A 'connections' object must exist in root object." )
    end

    graph


  fun parse_processes( graph: Graph, connections: JObj box ) =>
    for name in connections.data.keys() do
      try
        let component = connections(name) as JObj
        let blocktype = component("component") as String
        graph.create_block( blocktype, name )
      else
        _context(Error) and _context.log( "Component '" + name + "' has invalid structure." )
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
          _context(Error) and _context.log( "Connection "+c.string()+"has invalid structure." )
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
    
