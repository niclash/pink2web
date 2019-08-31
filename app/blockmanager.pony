use "collections"
use "json"
use "logger"
use "../blocks"
use "../blocktypes"

actor BlockManager is JsonVisitable
  let _types: Map[String,BlockFactory]
  let _blocks: Map[String,Block tag]
  let _dummyFactory: BlockFactory
  let _log: Logger[String] val
  
  new create(log: Logger[String] val) =>
    _log = log
    _blocks = Map[String,Block tag]
    _dummyFactory = DummyFactory
    _types = Map[String,BlockFactory]
    _types("add") = AddBlockFactory

  be create_block( block_type: String val, name: String val ) =>
    _log(Info) and _log.log("create_block " + name + " of type " + block_type )
    var factory = _types.get_or_else(block_type, _dummyFactory)
    var block:Block tag = factory.createBlock( name )
    _blocks( name ) = block

  be connect( src_block: String val, src_output: String val, dest_block: String val, dest_input: String val ) =>
    try
        let src:Block tag = _blocks(src_block)?
        let dest:Block tag = _blocks(dest_block)?
        src.connect( src_output, dest, dest_input )
        _log(Info) and _log.log("connected:" + src_block + "." + src_output + " ==> " + dest_block + "." + dest_input )
    else
      _log(Error) and _log.log("Unable to connect " + src_block + " to " + dest_block )
    end
    
  be json_visit( visitor:JsonVisitor val ) =>
    let jsn:JsonObject iso = recover JsonObject end
    visitor.got( consume jsn )
    
  be list_types( visitor:JsonVisitor val ) =>
    var names: Array[JsonType] iso = recover Array[JsonType] end
    for name in _types.keys() do
      names.push(name)
    end
    visitor.got( JsonArray.from_array( consume names ) )

  be describe_type( typename: String val, visitor:JsonVisitor val ) =>
    try
      let factory:BlockFactory = _types(typename)?
      
      let jsn:JsonObject iso = recover JsonObject end
      visitor.got( consume jsn )
    else
      let jsn:JsonObject iso = recover JsonObject end
      visitor.got( consume jsn )
    end
    
class DummyFactory is BlockFactory
  
  fun createBlock( name: String val ): Block tag =>
      DummyBlock(name)
      
  fun describe(): JsonObject val =>
    recover JsonObject end
  
  
actor DummyBlock is Block
  let _name: String val
  
  new create( name: String val) =>
    _name = name
  
  be connect( output: String val, to_block: Block tag, to_input: String val) =>
    None
  
  be update[TYPE: Any val](input: String val, newValue: TYPE  val) =>
    None

  be refresh() =>
    None

