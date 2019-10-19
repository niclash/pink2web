use "../blocks"
use "../system"
use "collections"
use "jay"
use "logger"
use "promises"

actor Assertion is Block
  let _name: String
  let _descriptor: BlockTypeDescriptor
  let _equality: Input[Linkable]
  let _context:SystemContext
  
  new create(name: String, descriptor': BlockTypeDescriptor, context:SystemContext ) =>
    context(Fine) and context.log("create("+name+")")
    _context = context
    _name = name
    _descriptor = descriptor'
    let zero = "0"
    _equality = InputImpl[Linkable]( name, _descriptor.input(0), zero )

  be start() =>
    _context(Fine) and _context.log("start()")
    
  be stop() =>
    _context(Fine) and _context.log("stop()")
    
  be connect( output: String, to_block: Block, to_input: String) =>
    None
    
  be update[TYPE: Linkable](input: String, newValue: TYPE) =>
    None
    
  be refresh() =>
    None
    
  be descriptor( promise: Promise[BlockTypeDescriptor] tag ) =>
    promise(_descriptor)

  be describe( promise:Promise[JObj val] tag ) =>
    _context(Fine) and _context.log("describe")
    let equality = _equality.describe()
    let m = JObj
      + ("name", _name )
      + ("equality", equality )
    _context(Fine) and _context.log( "Reporting " + m.string() )
    promise(m)

class val AssertionDescriptor is BlockTypeDescriptor
  let _equality:InputDescriptor

  new val create() =>
      _equality = InputDescriptor("input1", Num, "value to assert", false, true )

  fun val inputs(): Array[InputDescriptor] val =>
    [ _equality ]

  fun val outputs(): Array[OutputDescriptor] val =>
    []
    
  fun equality(): InputDescriptor => _equality
  
  fun val input( index: U32 ): InputDescriptor val =>
    match index
    | 0 => _equality
    else
      InputDescriptor( "INVALID", Num, "INVALID", false, false)
    end
    
  fun val output( index: U32 ): OutputDescriptor val =>
    OutputDescriptor( "INVALID", Num, "INVALID", false, false)
    
  fun val name(): String =>
    "Assertion"
    
  fun val description(): String =>
    "Asserts that a list of expected values arrive on its 'equality' input."
    

class val AssertionFactory is BlockFactory 
  let _descriptor: AssertionDescriptor val = recover AssertionDescriptor end
  
  new val create() => None

  fun val block_type_descriptor() : BlockTypeDescriptor val^ =>
    _descriptor

  fun create_block( instance_name: String, context:SystemContext val):Block =>
    context(Fine) and context.log("create Assertion")
    Assertion( instance_name, _descriptor, context )

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )
