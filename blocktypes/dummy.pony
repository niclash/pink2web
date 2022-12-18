use "jay"
use "metric"
use "promises"
use "time"
use "../graphs"
use "../system"

class val DummyFactory is BlockFactory
  let descriptor:BlockTypeDescriptor val = recover DummyDescriptor end
  
  fun create_block( container_name: String, context:SystemContext, x:I64, y:I64): Block tag =>
    context(Error) and context.log(Error, "Unknown type for \"" + container_name + "\". Unable to create.")
    let result:DummyBlock tag = DummyBlock(descriptor.name(), descriptor, context)
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

  fun val input( index: USize ): InputDescriptor val =>
    InputDescriptor( "INVALID", "number", "INVALID", false)
    
  fun val output( index: USize ): OutputDescriptor val =>
    OutputDescriptor( "INVALID", "INVALID", "INVALID", false)

  fun val name(): String =>
    "tests/dummy"
    
  fun val description(): String =>
    "dummy block created when missing type information is found in json files."
    
  fun describe(): JObj val =>
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

  be get_input(input: String, promise:Promise[(String|I64|F64|Metric|Bool)]) =>
    false

  be get_output(output: String, promise:Promise[(String|I64|F64|Metric|Bool)]) =>
    false


  be change( x:I64, y:I64 ) => None

  be disconnect_block( block: Block, disconnects: LinkRemoveNotify ) =>  None

  be disconnect_edge( output:String, dest_block: Block, dest_input: String, disconnects: LinkRemoveNotify ) => None
  
  be destroy(disconnects: LinkRemoveNotify) => None
  
  be start() => None  
  
  be stop() => None  
  
  be connect( output: String, to_block: Block tag, to_input: String) =>
    None

  be rename( new_name: String ) => 
    _name = new_name
  
  be rename_of( block: Block, old_name: String, new_name: String ) =>
    None

  be update(input: String, new_value: (String|I64|F64|Metric|Bool)) =>
    None

  be stats_update() =>
    None

  be set_initial(input: String, new_value: (String|I64|F64|Metric|Bool|None)) =>
    None

  be refresh() =>
    None

  be name( promise: Promise[String] tag ) =>
    promise(_name)

  be describe( promise:Promise[JObj val] tag ) =>
    _context(Fine) and _context.log(Fine, "describe")
    var json = JObj
    promise( json )

  be descriptor( promise:Promise[BlockTypeDescriptor] tag ) =>
    promise(_descriptor)

  be subscribe_link( subscription:LinkSubscription ) => None

  be unsubscribe_link( subscription:LinkSubscription ) => None
