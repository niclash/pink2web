use "collections"
use "jay"
use "logger"
use "promises"
use "../blocktypes"
use "../system"

actor Application is AVisitable[JArr val]
  let _types: Map[String,BlockFactory val] val
  let _blocks: Map[String,Block tag] 
  let _block_types: MapIs[Block tag, BlockTypeDescriptor val] 
  let _dummyFactory: BlockFactory val
  let _context: SystemContext
  
  new create(context: SystemContext) =>
    _context = context
    _blocks = Map[String,Block tag]
    _block_types = MapIs[Block tag,BlockTypeDescriptor val]
    _dummyFactory = recover DummyFactory end
    _types = recover 
      let types:Map[String,BlockFactory val] = Map[String,BlockFactory val]
      types("Add") = recover val AddBlockFactory end
      types
    end


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
    let factory = _types.get_or_else(block_type, _dummyFactory)
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
    
  be list_types( promise: Promise[Map[String, BlockTypeDescriptor val] val] tag ) =>
    let result = recover iso Map[String, BlockTypeDescriptor val] end
    for (typename, factory) in _types.pairs() do
      result(typename) = factory.block_type_descriptor()
    end
    promise( consume result )

  be list_block_types( promise: Promise[Map[String, BlockTypeDescriptor val] val] tag ) =>
    let result = recover iso Map[String, BlockTypeDescriptor val] end
    for (blockname, block) in _blocks.pairs() do
      try
        result(blockname) = _block_types(block)?
      end
    end
    promise( consume result )
    
  be describe_type( typename: String, promise: Promise[JObj val] tag) =>
    try
      let factory = _types(typename)?
      promise( factory.describe() )
    end

  be visit( promise: Promise[ JArr val ] tag ) =>
    _context(Fine) and _context.log("Application.visit()")
    let promises = Array[Promise[JObj val] tag]
    for (blockname, block) in _blocks.pairs() do
      let p = Promise[JObj val]
      promises.push( p )
      _context(Fine) and _context.log("Make a visit to " + blockname )
      block.visit(p)
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

class val DummyFactory is BlockFactory
  let descriptor:BlockTypeDescriptor val = recover DummyDescriptor end
  
  fun create_block( container_name: String, context:SystemContext): Block tag =>
    context(Error) and context.log("Unknown type for \"" + container_name + "\". Unable to create.")
    let result:DummyBlock tag = DummyBlock(descriptor.name(), context)
    result
      
  fun block_type_descriptor(): BlockTypeDescriptor val =>
    descriptor
    
  fun describe(): JObj val =>
    recover JObj end

class DummyDescriptor is BlockTypeDescriptor
  fun val inputs():  Array[InputDescriptor] val =>
    recover Array[InputDescriptor] end
    
  fun val outputs():  Array[OutputDescriptor] val =>
    recover Array[OutputDescriptor] end
    
  fun val name(): String =>
    "dummy"
    
  fun val description(): String =>
    "dummy block created when missing type information is found in json files."
    
  fun describe(): JObj val =>
    let result:JObj val = JObj
    result
  
actor DummyBlock is Block
  let _name: String
  let _context:SystemContext
  
  new create( name: String, context:SystemContext) =>
    _name = name
    _context = context
  
  be start() => None  
  
  be stop() => None  
  
  be connect( output: String, to_block: Block tag, to_input: String) =>
    None
  
  be update[TYPE: Linkable val](input: String, newValue: TYPE  val) =>
    None

  be refresh() =>
    None

  be visit( promise:Promise[JObj val] tag ) =>
    _context(Fine) and _context.log("visit")
    var json = JObj
    promise( json )

