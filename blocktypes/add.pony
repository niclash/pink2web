use "collections"
use "jay"
use "logger"
use "promises"
use "../blocks"
use "../system"

actor AddBlock is Block
  let _name: String
  let _descriptor: BlockTypeDescriptor
  let _input1: Input[Number]
  let _input2: Input[Number]
  let _output: Output[F64]
  let _context:SystemContext val
  var _started:Bool = false
  
  new create(name: String, descriptor': BlockTypeDescriptor, context:SystemContext val ) =>
    context(Fine) and context.log("create("+name+")")
    _context = context
    _name = name
    _descriptor = descriptor'
    
    let zero:F64 = 0.0
    _input1 = InputImpl[Number]( name, _descriptor.input(0), zero )
    _input2 = InputImpl[Number]( name, _descriptor.input(1), zero )
    _output = OutputImpl[F64]( name, _descriptor.output(0), zero )

  be start() =>
    _context(Fine) and _context.log("start()")
    _started = true
    refresh()
    
  be stop() =>
    refresh()
    _context(Fine) and _context.log("stop()")
    _started = false
    
  be connect( output: String, to_block: Block tag, to_input: String) =>
    if output == "output"  then
      _output.connect(to_block, to_input)
    end
    refresh()

  be update[TYPE: Linkable val](input: String, newValue: TYPE  val) =>
    _context(Fine) and _context.log("update()")
    match newValue
    | let v: F64 => 
        if input == "input1" then _input1.set( v ) end
        if input == "input2" then _input2.set( v ) end
    end
    refresh()

  be refresh() =>
    if _started then
      _context(Fine) and _context.log("refresh()")
      let value : F64 val = _input1.value().f64() + _input2.value().f64()
      _output.set( value )
    end
    
  be descriptor( promise: Promise[BlockTypeDescriptor] tag ) =>
    promise(_descriptor)

  be describe( promise:Promise[JObj val] tag ) =>
    _context(Fine) and _context.log("describe")
    let in1 = _input1.describe()
    let in2 = _input2.describe()
    let out = _output.describe()
    let m = JObj
      + ("name", _name )
      + ("started", _started )
      + ("input1", in1 )
      + ("input2", in2 )
      + ("output", out )
    _context(Fine) and _context.log( "Reporting " + m.string() )
    promise(m)
    
class val AddBlockDescriptor is BlockTypeDescriptor
  let _in1:InputDescriptor
  let _in2:InputDescriptor
  let _out:OutputDescriptor

  new val create() =>
      _in1 = InputDescriptor("input1", Num, "first term in addition", false, true )
      _in2 = InputDescriptor("input2", Num, "second term in addition", false, true )
      _out = OutputDescriptor("output", Num, "output=input1+input2", false, true )

  fun val inputs(): Array[InputDescriptor] val =>
    [ _in1; _in2 ]

  fun val outputs(): Array[OutputDescriptor] val =>
    [ _out ]
    
  fun in1(): InputDescriptor => _in1
  
  fun in2(): InputDescriptor => _in2
  
  fun out(): OutputDescriptor => _out
  
  fun val input( index: U32 ): InputDescriptor val =>
    match index
    | 0 => _in1
    | 1 => _in2
    else
      InputDescriptor( "INVALID", Num, "INVALID", false, false)
    end
    
  fun val output( index: U32 ): OutputDescriptor val =>
    match index
    | 0 => _out
    else
      OutputDescriptor( "INVALID", Num, "INVALID", false, false)
    end
    
  fun val name(): String =>
    "Add"
    
  fun val description(): String =>
    "Adds two input and outputs the sum."
    

class val AddBlockFactory is BlockFactory 
  let _descriptor: AddBlockDescriptor val = recover AddBlockDescriptor end
  
  fun val block_type_descriptor() : BlockTypeDescriptor val^ =>
    _descriptor

  fun create_block( instance_name: String, context:SystemContext val):Block tag =>
    context(Fine) and context.log("create Add")
    AddBlock( instance_name, _descriptor, context )

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )
