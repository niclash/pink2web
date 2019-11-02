use "collections"
use "debug"
use "jay"
use "logger"
use "promises"
use "../blocktypes"
use "../system"

actor Graph
  let _blocks: Map[String,Block tag] 
  let _context: SystemContext
  let _types: BlockTypes
  let _name: String
  let _block_types: MapIs[Block tag, BlockTypeDescriptor val] 
  let _description: String
  let _icon: String
  let _library: String
  let _id: String
  
  new create(id': String, name': String, description':String, library': String, icon': String, types: BlockTypes, context: SystemContext) =>
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
    for block in _blocks.values() do
      block.start()
    end
    
  be stop() =>
    for block in _blocks.values() do
      block.stop()
    end

  be create_block( block_type: String, name': String ) =>
    _context(Info) and _context.log("create_block " + name' + " of type " + block_type )
    let factory = _types.get(block_type)
    let block:Block tag = factory.create_block( name', _context )
    _blocks( name' ) = block
    _block_types(block) = factory.block_type_descriptor()

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
    end
    
  be register_block( block:Block, name':String, blocktype: BlockTypeDescriptor ) =>
    _blocks( name' ) = block
    _block_types(block) = blocktype
    
  be connect( src_block: String, src_output: String, dest_block: String, dest_input: String ) =>
    try
        let src:Block tag = _blocks(src_block)?
        let dest:Block tag = _blocks(dest_block)?
        src.connect( src_output, dest, dest_input )
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

