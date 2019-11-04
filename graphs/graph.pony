use "collections"
use "debug"
use "jay"
use "logger"
use "promises"
use "time"
use "../blocktypes"
use "../system"

actor Graph
  let _context: SystemContext
  let _types: BlockTypes
  let _graphs:Graphs
  let _blocks: Map[String,Block tag] 
  let _block_types: MapIs[Block tag, BlockTypeDescriptor val] 
  
  let _id: String
  let _name: String
  let _description: String
  let _icon: String
  let _library: String
  var _time_started:PosixDate val= recover val PosixDate end
  var _started: Bool = false
  var _running: Bool = false
  var _debug: Bool = false
  var _uptime: I64 = 0  // in seconds
  
  new create(graphs:Graphs, id': String, name': String, description':String, library': String, icon': String, types: BlockTypes, context: SystemContext) =>
    _graphs = graphs
    _id = id'
    _name = name'
    _description = description'
    _library = library'
    _icon = icon'
    _context = context
    _types = types
    _blocks = Map[String,Block tag]
    _block_types = MapIs[Block tag, BlockTypeDescriptor val]

  be start() =>
    _time_started = DateTime.now()
    _started = true
    for block in _blocks.values() do
      block.start()
    end
    _running = true
    _graphs._started( _id, _time_started, _started, _running, _debug )
    
  be stop() =>
    _running = false
    for block in _blocks.values() do
      block.stop()
    end
    _graphs._stopped(_id, _time_started, _started, _running, _uptime, _debug)
    
  be status() =>
    _graphs._status( _id, _uptime, _running, _started, _debug )
    
  be tick() =>
    if _running then
      _uptime = _uptime + 1
    end
    
  be create_block(block_type: String, name': String, x:I64, y:I64) =>
    _context(Info) and _context.log("create_block " + name' + " of type " + block_type )
    let factory = _types.get(block_type)
    let block:Block tag = factory.create_block( name', _context, x, y )
    _register_block(block, name', factory.block_type_descriptor())

  be register_block(block:Block, name':String, blocktype: BlockTypeDescriptor) =>
    _register_block(block, name', blocktype)
    
  fun ref _register_block(block:Block tag, name':String, blocktype: BlockTypeDescriptor) =>
    _blocks( name' ) = block
    _block_types(block) = blocktype
    _graphs._added(_id, name', blocktype.name(), 0, 0)
    _context(Info) and _context.log("Available Blocks: " + _available_blocks() )

  be change_block( name':String, x:I64, y:I64 ) =>
    try
      let block = _blocks( name' )?
      block.change(x, y)
      _graphs._changed( _id, name', x, y )
    else
      _graphs._error( "graph", "Unknown Node" )
    end
  
  be remove_block( name': String ) =>
    try
      let block = _blocks( name' )?
      for b in _blocks.values() do
        b.disconnect_block( block )
      end
      block.destroy()
      try
        _blocks.remove( name' )?
      end
      try
        _block_types.remove( block )?
      end
      _graphs._removed(_id, name')
    end
    
  be rename_block( from': String, to': String ) =>
    try
      let block = _blocks( from' )?
      try
        _blocks.remove( from' )?
      end
      try
        (let block', let type') = _block_types.remove(block)?
        block.rename(to')
        register_block(block, to', type')
        _graphs._renamed(_id, from', to')
      end
    end
    
  be connect( src_block: String, src_output: String, dest_block: String, dest_input: String ) =>
    try
        let src:Block tag = _get_block(src_block)?
        let dest:Block tag = _get_block(dest_block)?
        src.connect( src_output, dest, dest_input )
        _context(Info) and _context.log("connected:" + src_block + "." + src_output + " ==> " + dest_block + "." + dest_input )
    else
      _context(Error) and _context.log("Unable to connect " + src_block + "." + src_output + " to " + dest_block + "." + dest_input )
    end
    
  fun _get_block( name': String ):Block ? =>
    try
        _blocks(name')?
    else
      _context(Error) and _context.log("Unable to find block " + name' + "\nAvailable blocks: " + _available_blocks() )
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
  
  be disconnect( src_block: String, src_output: String, dest_block: String, dest_input: String ) =>
    try
        let src:Block tag = _blocks(src_block)?
        let dest:Block tag = _blocks(dest_block)?
        src.disconnect_edge( src_output, dest, dest_input )
        _context(Info) and _context.log("connected:" + src_block + "." + src_output + " ==> " + dest_block + "." + dest_input )
    else
      _context(Error) and _context.log("Unable to connect " + src_block + "." + src_output + " to " + dest_block )
    end

  be set_value_from_string( point: String, value:String ) =>
    try
      (let blockname, let input) = BlockName(point)?
      try
        let block:Block tag = _blocks(blockname)?
        block.update( input, value )
        _context(Fine) and _context.log("update: " + blockname + "." + input + "=" + value )
      else
        _context(Error) and _context.log("Failed update: " + blockname + "." + input + "=" + value )
      end
    else
      _context(Error) and _context.log("Failed update: " + point + "=" + value )
    end
     
  be list_blocks( promise: Promise[Map[String, BlockTypeDescriptor val] val] tag ) =>
    let result = recover iso Map[String, BlockTypeDescriptor val] end
    for (blockname, block) in _blocks.pairs() do
      try
        result(blockname) = _block_types(block)?
      end
    end
    promise( consume result )
    
  be name( promise: Promise[String val] ) =>
    promise(_name)
    
  be describe( promise: Promise[ JArr val ] tag ) =>
    _context(Fine) and _context.log("Graph.describe()")
    let promises = Array[Promise[JObj val] tag]
    for (blockname, block) in _blocks.pairs() do
      let p = Promise[JObj val]
      promises.push( p )
      _context(Fine) and _context.log("Make a describe to " + blockname )
      block.describe(p)
    end
    let root = Promise[JObj val]
    root.join(promises.values()).next[None]( 
      {
        (a: Array[JObj val] val) =>
          _context(Fine) and _context.log("Blocks are done..." )
        
          var result = JArr
          for s in a.values() do
            _context(Fine) and _context.log("Block is reporting " + s.string() )
            result = result + s
          end
          promise( result )
      }      
    )
    root(JObj)

