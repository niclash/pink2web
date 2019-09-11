use "../blocks"
use "../system"
use "collections"
use "files"
use "json"
use "logger"

class Loader
  let _ambient:AmbientAuth val
  let _manager: BlockManager tag
  let _context: SystemContext val
  
  new create( manager: BlockManager tag, context:SystemContext val, ambient:AmbientAuth val) =>
    _context = context
    _ambient = ambient
    _manager = manager

  fun load( pathname: String ) =>
    var doc: JsonDoc = JsonDoc
    try
      let content: String val = read_lines(pathname)
      doc.parse( content )?
      let root:JsonObject = doc.data as JsonObject
      parse_root(root)
    else 
      (let code, let msg) = doc.parse_report()
      _context(Error) and _context.log( "Error parsing " + pathname + " : [" + code.string()+ "] : " + msg )
    end
  
  fun save( path: String ) =>
    None
  
  fun parse_root( root: JsonObject ) =>
    try
      let processes: JsonObject = root.data("processes")? as JsonObject
      parse_processes( processes )
    else
      _context(Error) and _context.log( "A 'processes' object must exist in root object." )
    end

    try
      let connections: JsonArray = root.data("connections")? as JsonArray
      parse_connections( connections )
    else
      _context(Error) and _context.log( "A 'connections' object must exist in root object." )
    end


  fun parse_processes( connections: JsonObject ) =>
    for name in connections.data.keys() do
      try
        let component = connections.data(name)? as JsonObject
        let blocktype = component.data("component")? as String
        _manager.create_block( blocktype, name )
      else
        _context(Error) and _context.log( "Component '" + name + "' has invalid structure." )
      end
    end
  
  fun parse_connections( connections: JsonArray ) =>
    for value in connections.data.values() do
      try
        let conn:JsonObject = value as JsonObject
        let src:(String,String,String) = parse_endpoint(conn, "src" )
        let tgt:(String,String,String) = parse_endpoint(conn, "tgt" )
        _manager.connect( src._1, src._2, tgt._1, tgt._2 )
      else
        try
          let c:Stringable = value as Stringable
          _context(Error) and _context.log( "Connection "+c.string()+"has invalid structure." )
        end
      end
    end
    
  fun parse_endpoint( conn: JsonObject, endp: String ) : ( String, String, String ) =>
    try
      let point = conn.data(endp)? as JsonObject
      let process = point.data("process")? as String
      let port = point.data("port")? as String
      let data = point.data("data")? as String
      (process,port,data)
    else
      ("","","")
    end
    
  fun read_lines( pathname: String val ) : String val =>
    let caps = recover val FileCaps.>set(FileRead).>set(FileStat) end
    var result:String iso = recover iso String end
    try
      with file = OpenFile(
        FilePath(_ambient, pathname, caps)?) as File
      do
        for line in file.lines() do
          result.append( consume line )
        end
      end
    else
      _context(Error) and _context.log("Couldn't open " + pathname)
    end
    consume result
