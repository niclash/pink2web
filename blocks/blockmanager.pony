use "collections"
use "json"
use "logger"
use "../blocktypes"
use "../system"

actor BlockManager is JsonVisitable
  let _types: Map[String,BlockFactory]
  let _blocks: Map[String,Block tag] 
  let _dummyFactory: BlockFactory val
  let _context: SystemContext val
  
  new create(context: SystemContext val) =>
    _context = context
    _blocks = Map[String,Block tag]
    _dummyFactory = recover DummyFactory end
    _types = Map[String,BlockFactory]
    _types("Add") = AddBlockFactory

  be start() =>
    for block in _blocks.values() do
      block.start()
    end
    
  be stop() =>
    for block in _blocks.values() do
      block.stop()
    end
    

  be create_block( block_type: String val, name: String val ) =>
    _context(Info) and _context.log("create_block " + name + " of type " + block_type )
    let factory = _types.get_or_else(block_type, _dummyFactory)
    let block:Block tag = factory.create_block( name, _context )
    _blocks( name ) = block

  be connect( src_block: String val, src_output: String val, dest_block: String val, dest_input: String val ) =>
    try
        let src:Block tag = _blocks(src_block)?
        let dest:Block tag = _blocks(dest_block)?
        src.connect( src_output, dest, dest_input )
        _context(Info) and _context.log("connected:" + src_block + "." + src_output + " ==> " + dest_block + "." + dest_input )
    else
      _context(Error) and _context.log("Unable to connect " + src_block + " to " + dest_block )
    end
    
  be visit( lambda:{ (JsonType) } val ) =>
    let jsn:JsonObject iso = recover JsonObject end
    lambda( consume jsn )
    
  be list_types( lambda:{ (JsonType) } val ) =>
    var names: Array[JsonType] iso = recover Array[JsonType] end
    for name in _types.keys() do
      names.push(name)
    end
    lambda( JsonArray.from_array( consume names ) )

  be describe_topology( lambda:{ (JsonType) } val ) =>
    let root = JsonObject
    for (name,block) in _blocks.pairs() do
      let typename = block.visit( { (res) => 
        let node = JsonObject
        node.data("name") = name
        node.data("descriptor") = res 
        lambda( consume node )
      } )
    end
    
    
  be describe_type( typename: String val, lambda:{ (JsonType) } val) =>
    try
      let factory:BlockFactory = _types(typename)?
      lambda( factory.describe() )
    else
      let json:JsonObject = JsonObject
      json.data("error") = "unknown type " + typename
      lambda( json )
    end


class DummyFactory is (BlockFactory & BlockTypeDescriptor)
  
  fun create_block( container_name: String val, context:SystemContext val): Block tag =>
    context(Error) and context.log("Unknown type for \"" + container_name + "\". Unable to create.")
    DummyBlock(name, context)
      
  fun inputs():  Array[InputDescriptor[Any val] val] val =>
    Array[InputDescriptor[Any]](0)
    
  fun outputs():  Array[OutputDescriptor[Any val] val] val =>
    Array[OutputDescriptor[Any]](0)
    
  fun name() =>
    "dummy"
    
  fun description() =>
    "dummy block created when missing type information is found in json files."
    
  fun block_type_descriptor() =>
    this
    
  fun describe(): JsonObject ref^ =>
    recover JsonObject end
  
  
actor DummyBlock is Block
  let _name: String val
  let _context:SystemContext val
  
  new create( name: String val, context:SystemContext val) =>
    _name = name
    _context = context
  
  be start() => None  
  
  be stop() => None  
  
  be connect( output: String val, to_block: Block tag, to_input: String val) =>
    None
  
  be update[TYPE: Linkable val](input: String val, newValue: TYPE  val) =>
    None

  be refresh() =>
    None

  be visit( lambda:{ (JsonType) } val ) =>
    _context(Fine) and _context.log("visit")
    var json:JsonObject = JsonObject
    lambda( json )

