use "collections"
use "jay"
use "logger"
use "promises"
use ".."
use "../graphs"
use "../system"

interface val Function4
  fun val apply( in1:Linkable, in2:Linkable, in3:Linkable, in4:Linkable ):Linkable val

actor Function4Block is Block
  var _name: String
  let _descriptor: BlockTypeDescriptor
  let _input1: Input[Linkable]
  let _input2: Input[Linkable]
  let _input3: Input[Linkable]
  let _input4: Input[Linkable]
  let _output: Output[Linkable]
  let _context:SystemContext
  let _function:Function4
  var _started:Bool = false
  var _x:I64
  var _y:I64
  
  new create(name': String, descriptor': BlockTypeDescriptor, function':Function4, context:SystemContext, x:I64, y:I64 ) =>
    context(Fine) and context.log("create("+name'+")")
    _context = context
    _function = function'
    _name = name'
    _descriptor = descriptor'
    _x = x
    _y = y
    let zero:F64 = 0.0
    _input1 = InputImpl[Linkable]( _name, _descriptor.input(0), zero )
    _input2 = InputImpl[Linkable]( _name, _descriptor.input(1), zero )
    _input3 = InputImpl[Linkable]( _name, _descriptor.input(2), zero )
    _input4 = InputImpl[Linkable]( _name, _descriptor.input(3), zero )
    _output = OutputImpl[Linkable]( _name, _descriptor.output(0), zero )

  be change( x:I64, y:I64 ) =>
    _x = x
    _y = y
    
  be start() =>
    _context(Fine) and _context.log("start()")
    _started = true
    refresh()

  be stop() =>
    refresh()
    _context(Fine) and _context.log("stop()")
    _started = false
    
  be connect( output: String, to_block: Block, to_input: String) =>
    if output == "output"  then
      _output.connect(to_block, to_input)
    end
    refresh()

  be disconnect_block( block: Block ) =>
    _output.disconnect_block( block )

  be disconnect_edge( output:String, dest_block: Block, dest_input: String ) =>
    match output
    | "output" => _output.disconnect_edge( dest_block, dest_input )
    end

  be destroy() =>
    refresh()
    _context(Fine) and _context.log("destroy()")
    _started = false
    _output.disconnect_all()
    
  be rename( new_name: String ) =>
    _name = new_name
    
  be update(input: String, new_value:Linkable) =>
    _context(Fine) and _context.log("Function4[ " + _name + "." + input + " = " + new_value.string() + " ]")
    if input == "in1" then _input1.set( new_value ) end
    if input == "in2" then _input2.set( new_value ) end
    if input == "in3" then _input3.set( new_value ) end
    if input == "in4" then _input4.set( new_value ) end
    refresh()

  be refresh() =>
    if _started then
      let value = _function(_input1.value(), _input2.value(), _input3.value(), _input4.value())
      _output.set( value )
    end
    
  be name( promise: Promise[String] tag ) =>
    promise(_name)

  be descriptor( promise: Promise[BlockTypeDescriptor] tag ) =>
    promise(_descriptor)

  be describe( promise:Promise[JObj val] tag ) =>
    BlockDescription[Linkable,Linkable](promise, _name, _descriptor.name(), _started, [_input1; _input2; _input3; _input4], [_output] )

    
class val Function4BlockDescriptor is BlockTypeDescriptor
  let _in1:InputDescriptor[Number]
  let _in2:InputDescriptor[Number]
  let _in3:InputDescriptor[Number]
  let _in4:InputDescriptor[Number]
  let _out:OutputDescriptor[Number]
  let _name:String
  let _description:String

  new val create(blockname:String, block_description:String,
                 outdescr:String,
                 name1:String, name2:String, name3:String, name4:String,
                 descr1:String, descr2:String, descr3:String, descr4:String) =>
      _name = blockname
      _description = block_description
      _in1 = InputDescriptor(name1, PReal, descr1, false, true )
      _in2 = InputDescriptor(name2, PReal, descr2, false, true )
      _in3 = InputDescriptor(name3, PReal, descr3, false, true )
      _in4 = InputDescriptor(name4, PReal, descr4, false, true )
      _out = OutputDescriptor("output", PReal, outdescr, false, true )

  fun val inputs(): Array[InputDescriptor[Number]] val =>
    [ _in1; _in2; _in3; _in4 ]

  fun val outputs(): Array[OutputDescriptor[Number]] val =>
    [ _out ]
    
  fun in1(): InputDescriptor[Number] => _in1
  
  fun in2(): InputDescriptor[Number] => _in2

  fun in3(): InputDescriptor[Number] => _in3

  fun in4(): InputDescriptor[Number] => _in4

  fun out(): OutputDescriptor[Number] => _out
  
  fun val input( index: USize ): InputDescriptor[Number] val =>
    match index
    | 0 => _in1
    | 1 => _in2
    | 2 => _in3
    | 3 => _in4
    else
      InputDescriptor( "INVALID", PReal, "INVALID", false, false)
    end
    
  fun val output( index: USize ): OutputDescriptor[Number] val =>
    match index
    | 0 => _out
    else
      OutputDescriptor( "INVALID", PReal, "INVALID", false, false)
    end
    
  fun val name(): String =>
    _name
    
  fun val description(): String =>
    _description

class val Function4BlockFactory is BlockFactory
  let _descriptor: Function4BlockDescriptor val
  let _function:Function4

  new val create( blockname:String, block_description:String, fn:Function4 ) =>
    _function = fn
    _descriptor = recover
      Function4BlockDescriptor(blockname, block_description,
                               "output of function",
                               "in1", "in2", "in3", "in4",
                               "input1", "input2", "input3", "input4" )
    end

  fun val block_type_descriptor() : BlockTypeDescriptor val^ =>
    _descriptor

  fun create_block( instance_name: String, context:SystemContext val, x:I64, y:I64):Block =>
    context(Fine) and context.log("create Add")
    AddBlock( instance_name, _descriptor, context, x, y )

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )
