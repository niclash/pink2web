use "collections"
use "debug"
use "files"
use "jay"
use "promises"
use "time"
use "../blocktypes"
use "../collectors"
use "../system"

actor Graph
  let _context: SystemContext
  let _types: BlockTypes
  let _graphs:Graphs
  let _inports: Map[String,Port]
  let _outports: Map[String,Port]
  let _blocks: Map[String,Block tag]
  let _block_types: MapIs[Block tag, BlockTypeDescriptor val] 

  var _descriptor: GraphDescriptor
  var _time_started:PosixDate val= recover val PosixDate end
  var _uptime: I64 = 0  // in seconds
  var _started: Bool = false
  var _running: Bool = false
  var _debug: Bool = false

  new create(graphs:Graphs, id': String, name': String, description':String, icon': String, types: BlockTypes, context: SystemContext) =>
    context(Info) and context.log(Info, "Creating graph: " + name' + ", [" + id' + "], description" )
    _graphs = graphs
    _descriptor = GraphDescriptor( id', name', description', icon' )
    _context = context
    _types = types
    _blocks = Map[String,Block tag]
    _block_types = MapIs[Block tag, BlockTypeDescriptor val]
    _inports = Map[String,Port]
    _outports = Map[String,Port]

  be start() =>
    _context(Info) and _context.log(Info, "Starting graph: " + _descriptor.name )
    _time_started = DateTime.now()
    _started = true
    for block in _blocks.values() do
      block.start()
    end
    _running = true
    _graphs._started(_descriptor.id, _time_started, _started, _running, _debug)
    
  be stop() =>
    _stop()
    
  be persist() =>
    try
      let path:FilePath = _context.filelocations().graph_directory.join(_descriptor.id)?
      let promise = Promise[JObj]
      promise.next[None]({(json: JObj) => Files.write_text_to_path(path, json.string())} )
      describe( promise )
    else
      let msg: String val = "Unable to save graph: " + _descriptor.name + " (" + _descriptor.id + ")"
      _context(Error) and _context.log(Error, msg)
      _graphs.report_error(_descriptor.name, "graph", msg )
    end

  fun ref _stop() =>
    _context(Info) and _context.log(Info, "Stopping graph: " + _descriptor.name )
    _running = false
    for block in _blocks.values() do
      block.stop()
    end
    _graphs._stopped(_descriptor.id, _time_started, _started, _running, _uptime, _debug)
    
  be destroy() =>
    if _running then _stop() end
    _context(Info) and _context.log(Info, "Destroying graph: " + _descriptor.name )
    for block_name in _blocks.keys() do
      remove_block(block_name)
    end
    _blocks.clear()

  be rename( old_name:String, new_name:String ) =>
    if old_name == _descriptor.name then
      _descriptor = GraphDescriptor( _descriptor.id, new_name, _descriptor.description, _descriptor.icon)
    end

  be status() =>
    _graphs._status(_descriptor.id, _descriptor.name, _descriptor.description, _uptime, _running, _started, _debug)
    
  be tick() =>
    if _running then
      _uptime = _uptime + 1
    end
    
  be register_block(block:Block, name':String, blocktype: BlockTypeDescriptor) =>
    _blocks( name' ) = block
    _block_types(block) = blocktype
    _graphs._added_block(_descriptor.id, name', blocktype.name(), 0, 0)
    _context(Fine) and _context.log(Fine, "Available Blocks: " + _available_blocks() )

  be create_block(block_type: String, name': String, x:F64, y:F64) =>
    _context(Info) and _context.log(Info, "create_block " + name' + " of type " + block_type )
    let promise = Promise[BlockFactory]
    let thiss:Graph tag = this
    promise.next[None]( { (factory) =>
      let block:Block tag = factory.create_block( name', _context, x, y )
      thiss.register_block(block, name', factory.block_type_descriptor())
      block.start()
    })
    _types.get(block_type, promise)

  be set_initial( block':String, input:String, initial:Linkable) =>
    try
      let block = _blocks( block' )?
      let promise = Promise[Linkable]
      promise.next[None]( { (old_value:Linkable) =>
          match initial
          | None =>
            block.set_initial( input, None )
            _graphs._removed_initial(_descriptor.id, old_value, block', input )
          | let initial_value:Linkable =>
            block.set_initial( input, initial_value )
            _graphs._removed_initial(_descriptor.id, old_value, block', input )
            _graphs._added_initial(_descriptor.id, initial_value, block', input )
          end
      })
      block.get_input( input, promise )
    else
      _graphs.report_error( _descriptor.name, "graph", "Unknown Node: " + block' )
    end
  
  be change_block( name':String, x:F64, y:F64 ) =>
    try
      let block = _blocks( name' )?
      block.change(x, y)
      _graphs._changed_block(_descriptor.id, name', x, y )
    else
      _graphs.report_error( _descriptor.name, "graph", "Unknown Node" )
    end
  
  be disconnect( src_block: String, src_output: String, dest_block: String, dest_input: String ) =>
    try
      let src:Block tag = _blocks(src_block)?
      let dest:Block tag = _blocks(dest_block)?
      let disconnects:LinkRemoveNotify = { (link) =>
        _graphs._removed_connection(_descriptor.id, link.src_block, link.src_port, link.dest_block, link.dest_port)
        _context(Info) and _context.log(Info, "disconnected:" + link.src_block + "." + link.src_port + " ==> " + link.dest_block + "." + link.dest_port )
      }
      src.disconnect_edge(src_output, dest, dest_input, disconnects)
    else
      _context(Error) and _context.log(Error, "Unable to disconnect " + src_block + "." + src_output + " from " + dest_block + "." + dest_input)
    end

  be remove_block( name': String ) =>
    try
      let block = _blocks( name' )?
      let disconnects:LinkRemoveNotify = { (link) =>
        _context(Info) and _context.log(Info, "disconnected:" + link.src_block + "." + link.src_port + " ==> " + link.dest_block + "." + link.dest_port )
        _graphs._removed_connection(_descriptor.id, link.src_block, link.src_port, link.dest_block, link.dest_port)
      }
      for b in _blocks.values() do
        b.disconnect_block( block, disconnects )
      else
        Debug.out( "No other blocks?" )
      end
      block.stop()
      block.destroy(disconnects)
      try
        _blocks.remove( name' )?
      else
        Debug.out( "Block missing?" )
      end
      try
        _block_types.remove( block )?
      else
        Debug.out( "Block type missing?" )
      end
      _graphs._removed_block(_descriptor.id, name')

    end
    
  be rename_block( from': String, to': String ) =>
    try
      let block = _blocks( from' )?
      try
        _blocks.remove( from' )?
      end
      try
        (let block', let type') = _block_types.remove(block)?
        for b in _blocks.values() do
          b.rename_of(block, from', to')
        end
        block.rename(to')
        _blocks( to' ) = block
        _block_types(block) = type'
        _context(Fine) and _context.log(Fine, "Available Blocks: " + _available_blocks() )
        _graphs._renamed_block(_descriptor.id, from', to')
      end
    end
    
  be connect( src_block: String, src_output: String, dest_block: String, dest_input: String ) =>
    try
        let src:Block tag = _get_block(src_block)?
        let dest:Block tag = _get_block(dest_block)?
        src.connect( src_output, dest, dest_input )
        _graphs._added_connection(_descriptor.id, src_block, src_output, dest_block, dest_input )
        _context(Info) and _context.log(Info, "connected:" + src_block + "." + src_output + " ==> " + dest_block + "." + dest_input )
    else
      _context(Error) and _context.log(Error, "Unable to connect " + src_block + "." + src_output + " to " + dest_block + "." + dest_input )
    end
    
  be get_block( name': String, promise:Promise[Block] ) =>
    try
      promise(_get_block(name')?)
    // else  TODO: if the block doesn't exist, should we do nothing or send ta Dummy block???
    end

  be add_outport(name:String, node:String, port:String) =>
    let outPort = Port(name, _context, F64(0), F64(0))
    _outports(name) = outPort
    let p = Promise[Block]
    try
      let block = _blocks(node)?
      block.connect(port, outPort, "in")
      _graphs._added_outport(_descriptor.id, name, node, port )
    end

  be remove_outport(name:String) =>
    try
      let port = _outports(name)?
      _outports.remove(name)?
      let disconnects:LinkRemoveNotify = { (link) =>
        _graphs._removed_connection(_descriptor.id, link.src_block, link.src_port, link.dest_block, link.dest_port)
      }
      port.disconnect_edge_raw(disconnects)
    end

  be rename_outport(from:String,to:String) =>
    try
      (let key:String, let outport:Port) = _outports.remove(from)?
      outport.rename_to(to)
      _outports(to) = outport
      _graphs._renamed_outport(_descriptor.id, from, to)
    end

  be add_inport(name:String, node:String, port:String) =>
    let inPort = Port(name, _context, F64(0), F64(0))
    _inports(name) = inPort
    try
      let block = _blocks(node)?
      inPort.connect("out", block, port)
      _graphs._added_inport(_descriptor.id, name, node, port )
    end

  be remove_inport(name:String) =>
    try
      let inport = _inports(name)?
      _inports.remove(name)?
      let disconnects:LinkRemoveNotify = { (link) =>
        _graphs._removed_inport(_descriptor.id, name)
      }
      inport.disconnect_edge_raw(disconnects)
    end

  be rename_inport(from:String,to:String) =>
    try
      (let old_name, let inport)  = _inports.remove(from)?
      inport.rename_to(to)
      _inports(to) = inport
      _graphs._renamed_inport(_descriptor.id, from, to)
    end

  fun _get_block( name': String ):Block ? =>
    try
        _blocks(name')?
    else
      _context(Error) and _context.log(Error, "Unable to find block " + name' + "\nAvailable blocks: " + _available_blocks() )
      error
    end
  
  fun _available_blocks():String =>
    var blocks': String val = recover val "[" end
    var first = true
    for identity in _blocks.keys() do
      if not first then blocks' = blocks' + ", " end
      first = false
      blocks' = blocks' + identity
    end
    blocks' + "]"
  
  be set_value_from_string( point: String, value:String ) =>
    try
      (let blockname, let input) = BlockName(point)?
      try
        let block:Block tag = _blocks(blockname)?
        block.update( input, value )
        _context(Fine) and _context.log(Fine, "update: " + blockname + "." + input + "=" + value )
      else
        _context(Error) and _context.log(Error, "Failed update: " + blockname + "." + input + "=" + value )
      end
    else
      _context(Error) and _context.log(Error, "Failed update: " + point + "=" + value )
    end
     
  be list_blocks( promise: Promise[Map[String, BlockTypeDescriptor val] val] tag ) =>
    let result = recover iso Map[String, BlockTypeDescriptor val] end
    for (blockname, block) in _blocks.pairs() do
      try
        result(blockname) = _block_types(block)?
      end
    end
    promise( consume result )
    
  be descriptor( promise: Promise[GraphDescriptor] ) =>
    promise(_descriptor)
    
  be describe( promise: Promise[JObj] tag ) =>
    _context(Fine) and _context.log(Fine, "Graph.describe()")
    let inports_promise: Promise[JObj] = _ports_to_json(_inports.values(), "inports")
    let outports_promise: Promise[JObj] = _ports_to_json(_outports.values(), "outports")
    let blocks_promise = Promise[JObj]
    Collector[Block, JObj]( _blocks.values(), { (blk,promise') => blk.describe(promise') }, { (arr_of_jobjs_of_blocks) =>
      var result = JArr
      for s in arr_of_jobjs_of_blocks.values() do
        result = result + s
      end
      JObj + ("blocks", result)
    })
    let graph_promise = Promise[JObj]
    graph_promise.join([blocks_promise; inports_promise; outports_promise].values())
        .next[None]( {(jarrs:Array[JObj val] val) =>
            var description' = _descriptor.to_json()
            for jobj in jarrs.values() do
              try
                let pairs = jobj.pairs()
                if pairs.has_next() then
                  (let name, let jexpr) = pairs.next()?
                  description' = description' + (name, jexpr)
                end
              end
            end
            promise(description')
        })

  fun _ports_to_json( ports:Iterator[Port], jobj_name:String ): Promise[JObj] =>
    let promise = Promise[JObj]
    Collector[Port,JObj]( ports, { (port',promise') => port'.describe(promise') }, { (arr_of_jobjs_of_ports) =>
      var result = JArr
      for s in arr_of_jobjs_of_ports.values() do
        result = result + s
      end
      JObj + (jobj_name, result)
    })
    promise

  be subscribe_links( subscriptions:Array[LinkSubscription] val) =>
    for subscr in subscriptions.values() do
      try
        let block = _blocks(subscr.dest_block_name)?
        block.subscribe_link(subscr)
      else
        _context(Error) and _context.log(Error, "Can't find block " + subscr.src_block_name )
      end
    end

  be unsubscribe_links( subscriptions:Array[LinkSubscription] val) =>
    for subscr in subscriptions.values() do
      try
        let block = _blocks(subscr.dest_block_name)?
        block.unsubscribe_link(subscr)
      end
    end

class val GraphDescriptor
  let id:String
  let name:String
  let description: String
  let icon: String
  
  new val create( id':String, name':String val, description':String, icon':String ) =>
    id = id'
    name = name'
    description = description'
    icon = icon'

  fun to_json():JObj =>
    JObj + ("id",id) + ("name",name) + ("description",description) + ("icon", icon)
    
