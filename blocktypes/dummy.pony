use "jay"
use "logger"
use "promises"
use "../graphs"
use "../system"

class val DummyFactory is BlockFactory
  let descriptor:BlockTypeDescriptor val = recover DummyDescriptor end
  
  fun create_block( container_name: String, context:SystemContext, x:I64, y:I64): Block tag =>
    context(Error) and context.log("Unknown type for \"" + container_name + "\". Unable to create.")
    let result:DummyBlock tag = DummyBlock(descriptor.name(), descriptor, context)
    result
      
  fun block_type_descriptor(): BlockTypeDescriptor val =>
    descriptor
    
  fun describe(): JObj val =>
    recover JObj end
    
class DummyDescriptor is BlockTypeDescriptor

  fun val inputs(): Array[InputDescriptor[None]] val =>
    recover val Array[InputDescriptor[None]] end

  fun val outputs(): Array[OutputDescriptor[None]] val =>
    recover val Array[OutputDescriptor[None]] end

  fun val input( index: USize ): InputDescriptor[None] val =>
    InputDescriptor[None]( "INVALID", PReal, "INVALID", None, false, false)
    
  fun val output( index: USize ): OutputDescriptor[None] val =>
    OutputDescriptor[None]( "INVALID", PReal, "INVALID", None, false, false)

  fun val name(): String =>
    "tests/dummy"
    
  fun val description(): String =>
    "dummy block created when missing type information is found in json files."
    
  fun val describe(): JObj val =>
    let result:JObj val = JObj
    result

actor DummyBlock is Block
  var _name: String
  let _context:SystemContext
  let _descriptor:BlockTypeDescriptor
  
  new create( name': String, descriptor':BlockTypeDescriptor, context:SystemContext) =>
    _name = name'
    _descriptor = descriptor'
    _context = context
  
  be change( x:I64, y:I64 ) => None

  be disconnect_block( block: Block ) =>  None

  be disconnect_edge( output:String, dest_block: Block, dest_input: String ) => None
  
  be destroy() => None
  
  be start() => None  
  
  be stop() => None  
  
  be connect( output: String, to_block: Block tag, to_input: String) =>
    None

  be rename( new_name: String ) => 
    _name = new_name
  
  be update(input: String, new_value: Linkable val) =>
    None

  be refresh() =>
    None

  be name( promise: Promise[String] tag ) =>
    promise(_name)

  be describe( promise:Promise[JObj val] tag ) =>
    _context(Fine) and _context.log("describe")
    var json = JObj
    promise( json )

  be descriptor( promise:Promise[BlockTypeDescriptor] tag ) =>
    promise(_descriptor)
