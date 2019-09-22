use "collections"
use "jay"
use "logger"
use "promises"
use "../blocks"
use "../system"

actor AddBlock is Block
  let _name: String val
  let _input1: Input[Number]
  let _input2: Input[Number]
  let _output: Output[F64]
  let _context:SystemContext val
  var _started:Bool = false
  
  new create(name: String, in1:InputDescriptor, in2:InputDescriptor, out:OutputDescriptor, context:SystemContext val ) =>
    context(Fine) and context.log("create("+name+")")
    _context = context
    _name = name
    let zero:F64 = 0.0
    _input1 = InputImpl[Number]( name, in1, zero )
    _input2 = InputImpl[Number]( name, in2, zero )
    _output = OutputImpl[F64]( name, out, zero )

  be start() =>
    _context(Fine) and _context.log("start()")
    _started = true
    
  be stop() =>
    _context(Fine) and _context.log("stop()")
    _started = false
    
  be connect( output: String val, to_block: Block tag, to_input: String val) =>
    if output == "output"  then
      _output.connect(to_block, to_input)
    end
    refresh()

  be update[TYPE: Linkable val](input: String val, newValue: TYPE  val) =>
    _context(Fine) and _context.log("update()")
    match newValue
    | let v: F64 => 
        if input == "input1" then _input1.set( v ) end
        if input == "input2" then _input2.set( v ) end
    end
    refresh()

  be refresh() =>
    _context(Fine) and _context.log("refresh()")
    if _started then
      let value : F64 val = _input1.value().f64() + _input2.value().f64()
      _output.set( value )
    end
    
  be visit( promise:Promise[JObj val] tag ) =>
    _context(Fine) and _context.log("visit")
    let in1 = _input1.visit()
    let in2 = _input2.visit()
    let out = _output.visit()
    let m = JObj
      + ("name", _name )
      + ("started", _started )
      + ("input1", in1 )
      + ("input2", in2 )
      + ("output", out )
    m
    
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
  
  fun val name(): String =>
    "Add"
    
  fun val description(): String =>
    "Adds two input and outputs the sum."
    
  fun val describe() : JObj val =>
      
    var inp = JArr
    for input in inputs().values() do 
      inp = inp + input.describe()
    end
    var outp = JArr
    for output in outputs().values() do 
      outp = outp + output.describe()
    end
    var json6 = JObj
      + ("name", name() )
      + ("description", description() )
      + ("subgraph", false )
      + ("icon", "plus" )
      + ("inports", inp)
      + ("outports", outp )
    json6

class val AddBlockFactory is BlockFactory 
  let _descriptor: AddBlockDescriptor val = recover AddBlockDescriptor end
  
  fun val block_type_descriptor() : BlockTypeDescriptor val^ =>
    _descriptor

  fun create_block( instance_name: String val, context:SystemContext val):Block tag =>
    context(Fine) and context.log("create Add")
    AddBlock( instance_name, _descriptor.in1(), _descriptor.in2(), _descriptor.out(), context )

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )
