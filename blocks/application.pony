use "collections"
use "jay"
use "logger"
use "promises"
use "../blocktypes"
use "../system"

actor Application
  let _blocks: Map[String,Block tag] 
  let _context: SystemContext
  let _types: BlockTypes
  let _block_types: MapIs[Block tag, BlockTypeDescriptor val] 
  
  new create(types: BlockTypes, context: SystemContext) =>
    _context = context
    _types = types
    _blocks = Map[String,Block tag]
    _block_types = MapIs[Block tag,BlockTypeDescriptor val]

  be start() =>
    for block in _blocks.values() do
      block.start()
    end
    
  be stop() =>
    for block in _blocks.values() do
      block.stop()
    end

  be create_block( block_type: String, name: String ) =>
    _context(Info) and _context.log("create_block " + name + " of type " + block_type )
    let factory = _types.get(block_type)
    let block:Block tag = factory.create_block( name, _context )
    _blocks( name ) = block
    _block_types(block) = factory.block_type_descriptor()

  be connect( src_block: String, src_output: String, dest_block: String, dest_input: String ) =>
    try
        let src:Block tag = _blocks(src_block)?
        let dest:Block tag = _blocks(dest_block)?
        src.connect( src_output, dest, dest_input )
        _context(Info) and _context.log("connected:" + src_block + "." + src_output + " ==> " + dest_block + "." + dest_input )
    else
      _context(Error) and _context.log("Unable to connect " + src_block + " to " + dest_block )
    end
    
  be set_value_from_string( block: String, value: String ) =>
    None
    
  be list_blocks( promise: Promise[Map[String, BlockTypeDescriptor val] val] tag ) =>
    let result = recover iso Map[String, BlockTypeDescriptor val] end
    for (blockname, block) in _blocks.pairs() do
      try
        result(blockname) = _block_types(block)?
      end
    end
    promise( consume result )
    
  be describe( promise: Promise[ JArr val ] tag ) =>
    _context(Fine) and _context.log("Application.describe()")
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

