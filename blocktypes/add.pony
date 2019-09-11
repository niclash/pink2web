use "collections"
use "json"
use "logger"
use "../blocks"
use "../system"

actor AddBlock is Block
  let _name: String val
  let _input1: Input[Number] ref
  let _input2: Input[Number] ref
  let _output: Output[F64] ref
  let _context:SystemContext val
  var _started:Bool = false
  
  new create(name: String, in1:InputDescriptor[Number], in2:InputDescriptor[Number], out:OutputDescriptor[Number], context:SystemContext val ) =>
    context(Fine) and context.log("create("+name+")")
    _context = context
    _name = name
    _input1 = InputImpl[Number]( name, in1, 0.0)
    _input2 = InputImpl[Number]( name, in2, 0.0)
    _output = OutputImpl[F64]( name, out, 0.0 )

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
      let value : F64 val = _input1.value() + _input2.value()
      _output.set( value )
    end
    
  be visit( lambda:{ (JsonType) } val ) =>
    _context(Fine) and _context.log("visit")
    var json:JsonObject = JsonObject
    json.data("name") = _name
    json.data("started") = _started
    json.data("input1") = _input1.to_json()
    json.data("input2") = _input2.to_json()
    json.data("output") = _output.to_json()
    lambda( json )
    
class val AddBlockFactory is (BlockFactory & BlockTypeDescriptor)
  let _inp:Array[InputDescriptor[Number val] val] val
  let _outp:Array[OutputDescriptor[Number val] val] val
  
  new val create() =>
    _inp = Array[InputDescriptor[Number val] val]
    _outp = Array[OutputDescriptor[Number val] val]
    
    let in1 = InputDescriptor[Number]("input1", "number", "first term in addition", false, true )
    let in2 = InputDescriptor[Number]("input2", "number", "second term in addition", false, true )
    _inp.push( in1 )
    _inp.push( in2 )
    let out = OutputDescriptor[Number]("output", "number", "output=input1+input2", false, true )
    _outp.push( out )

  fun block_type_descriptor() : BlockTypeDescriptor val =>
    this

  fun inputs(): Array[InputDescriptor[Any val] val] val =>
    _inp

  fun outputs(): Array[OutputDescriptor[Any val] val] val =>
    _outp
    
  fun name() =>
    "Add"
    
  fun description() =>
    "Adds two input and outputs the sum."
    
  fun create_block( instance_name: String val, context:SystemContext val):Block tag =>
    context(Fine) and context.log("create Add")
    AddBlock( instance_name, _inp(0), _inp(1), _outp(0), context )
    
