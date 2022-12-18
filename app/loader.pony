use "../graphs"
use "../blocktypes"
use "../system"
use "collections"
use "files"
use "jay"
use "promises"

actor Loader
  let _blocktypes: BlockTypes
  let _context: SystemContext
  let _graphs: Graphs

  new create( graphs: Graphs, blocktypes: BlockTypes, context:SystemContext val) =>
    _context = context
    _blocktypes = blocktypes
    _graphs = graphs

  be load( pathname: String, promise:Promise[(String, Graph|None)] ) =>
    try
      _context(Fine) and _context.log( Fine, "Loading " + pathname )
      let content: String = Files.read_text_from_pathname(pathname, FileAuth(_context.auth()))?
      let root = JParse.from_string( content )? as JObj
      _parse_root(root, promise)
    else
      promise(("", None))
    end

  be _parse_root( root: JObj val, promise:Promise[(String, Graph|None)] ) =>
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
      let processes: JObj val = root("blocks") as JObj
      var names_to_waitfor = _parse_processes( graph, processes )

      // We must stop and wait for all the blocks to be loaded before we can
      // proceed to wire them up. Hence the rather awkward recursive call sequence
      // of _continue_with_pass2 -> graph.list_blocks -> promise -> _continue_with_pass2
      // but was the only pattern I could figure out.
      _continue_with_pass2( names_to_waitfor, graph, root, id, promise )
    else
      _context(Error) and _context.log( Error, "A 'blocks' object must exist in root object." )
    end

  be _continue_with_pass2( names_to_waitfor:Array[String] val, graph:Graph tag, root: JObj val, id:String val, promise:Promise[(String, Graph|None)] ) =>
    let thiss:Loader tag = this
    let p = Promise[Map[String, BlockTypeDescriptor] val]
    p.next[None]( { (m) =>
      for n in names_to_waitfor.values() do
        if not m.contains(n) then
          thiss._continue_with_pass2( names_to_waitfor, graph, root, id, promise )
          return
        end
      end
      try
        let connections: JArr val = root("connections") as JArr
        thiss._parse_connections( graph, connections )
      else
        _context(Error) and _context.log( Error, "A 'connections' object must exist in root object." )
      end
      promise((id,graph))
    })
    graph.list_blocks(p)

  fun _parse_processes( graph: Graph, connections: JObj box ): Array[String] val =>
    let names_to_waitfor:Array[String] iso = recover Array[String] end
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
        names_to_waitfor.push(name)
      else
        _context(Error) and _context.log( Error, "Component '" + name + "' has invalid structure." )
      end
    end
    consume names_to_waitfor
  
  be _parse_connections( graph: Graph, connections: JArr val ) =>
    _context(Info) and _context.log( Info, "Parsing connections." )
    for value in connections.data.values() do
      try
        let conn:JObj = value as JObj
        (let src_process:(String|NotSet),let src_port:(String|NotSet),let src_data:(J|NotSet)) = _parse_endpoint(conn, "src" )
        (let tgt_process:(String|NotSet),let tgt_port:(String|NotSet),let tgt_dummy:(J|NotSet)) = _parse_endpoint(conn, "tgt" )
        match src_data
        | NotSet =>
          graph.connect( src_process as String, src_port as String, tgt_process as String, tgt_port as String )
        | let d:String =>
          graph.set_initial( tgt_process as String, tgt_port as String, d )
        | let d:Bool =>
          graph.set_initial( tgt_process as String, tgt_port as String, d )
        | let d:I64 =>
          graph.set_initial( tgt_process as String, tgt_port as String, d )
        | let d:F64 =>
          graph.set_initial( tgt_process as String, tgt_port as String, d )
        else
          _context(Error) and _context.log( Error, "Bad 'data' type. Objects and Arrays are not supported." )
        end
      else
        try
          let c:Stringable = value as Stringable
          _context(Error) and _context.log( Error, "Connection "+c.string()+"has invalid structure." )
        end
      end
    end
    
  fun _parse_endpoint( conn: JObj box, endp: String ) : ( (String|NotSet), (String|NotSet), (J|NotSet) ) =>
    try
      let point = conn(endp) as JObj
      let process = point("process") as (String|NotSet)
      let port = point("port") as (String|NotSet)
      let data = point("data")
      (process,port,data)
    else
      ("","","")
    end

