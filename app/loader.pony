use "../blocks"
use "../system"
use "collections"
use "files"
use "jay"
use "logger"

class Loader
  let _ambient:AmbientAuth val
  let _manager: BlockManager tag
  let _context: SystemContext val
  
  new create( manager: BlockManager tag, context:SystemContext val, ambient:AmbientAuth val) =>
    _context = context
    _ambient = ambient
    _manager = manager

  fun load( pathname: String ) ? =>
      let content: String = read_lines(pathname)
//       let root:JsonObject val = recover val 
//         var doc: JsonDoc iso = recover iso JsonDoc end
//         try
//           doc.parse( content )?
//         else 
//           (let code, let msg) = doc.parse_report()
//           _context(Error) and _context.log( "Error parsing " + pathname + " : [" + code.string()+ "] : " + msg )
//         end
//         doc.data as JsonObject
//       end 
      let root = JParse.from_string( content )? as JObj
      parse_root(root)
  
  fun save( path: String ) =>
    None
  
  fun parse_root( root: JObj box ) =>
    try
      let processes: JObj val = root("processes") as JObj
      parse_processes( processes )
    else
      _context(Error) and _context.log( "A 'processes' object must exist in root object." )
    end

    try
      let connections: JArr val = root("connections") as JArr
      parse_connections( connections )
    else
      _context(Error) and _context.log( "A 'connections' object must exist in root object." )
    end


  fun parse_processes( connections: JObj box ) =>
    for name in connections.data.keys() do
      try
        let component = connections(name) as JObj
        let blocktype = component("component") as String
        _manager.create_block( blocktype, name )
      else
        _context(Error) and _context.log( "Component '" + name + "' has invalid structure." )
      end
    end
  
  fun parse_connections( connections: JArr box ) =>
    for value in connections.data.values() do
      try
        let conn:JObj = value as JObj
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
    
  fun read_lines( pathname: String ) : String =>
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
