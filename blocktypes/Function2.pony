use "collections"
use "jay"
use "logger"
use "promises"
use ".."
use "../graphs"
use "../system"

interface val Function2
  fun val apply( in1:Any val, in2:Any val ):Any val

actor Function2Block is Block
  var _name: String
  let _descriptor: BlockTypeDescriptor
  let _input1: Input
  let _input2: Input
  let _output: Output
  let _context:SystemContext
  let _function:Function2
  var _started:Bool = false
  var _x:I64
  var _y:I64

  new create(name': String, descriptor': BlockTypeDescriptor, function':Function2, context:SystemContext, x:I64, y:I64 ) =>
    context(Fine) and context.log("create("+name'+")")
    _context = context
    _function = function'
    _name = name'
    _descriptor = descriptor'
    _x = x
    _y = y
    let zero:F64 = 0.0
    _input1 = InputImpl( _name, _descriptor.input(0), zero )
    _input2 = InputImpl( _name, _descriptor.input(1), zero )
    _output = OutputImpl( _name, _descriptor.output(0), zero )

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

  be update(input: String, new_value:Any val) =>
    _context(Fine) and _context.log("Function2[ " + _name + "." + input + " = " + try (new_value as Stringable).string() else "<not stringable>" end + " ]")
    match input
    | "in1" => _input1.set( new_value )
    | "in2" => _input2.set( new_value )
    end
    refresh()

  be refresh() =>
    if _started then
      let value = _function(_input1.value(), _input2.value())
      _output.set( value )
    end

  be name( promise: Promise[String] tag ) =>
    promise(_name)

  be descriptor( promise: Promise[BlockTypeDescriptor] tag ) =>
    promise(_descriptor)

  be describe( promise:Promise[JObj val] tag ) =>
    BlockDescription(promise, _name, _descriptor.name(), _started, [_input1; _input2], [_output] )


class val Function2BlockDescriptor is BlockTypeDescriptor
  let _in1:InputDescriptor
  let _in2:InputDescriptor
  let _out:OutputDescriptor
  let _name:String
  let _description:String

  new val create(blockname:String, block_description:String,
                 outdescr:String, output_type:String,
                 name1:String, type1:String, descr1:String,
                 name2:String, type2:String, descr2:String) =>
      _name = blockname
      _description = block_description
      _in1 = InputDescriptor(name1, type1, descr1, false, true )
      _in2 = InputDescriptor(name2, type2, descr2, false, true )
      _out = OutputDescriptor("output", output_type, outdescr, false, true )

  fun val inputs(): Array[InputDescriptor] val =>
    [ _in1; _in2 ]

  fun val outputs(): Array[OutputDescriptor] val =>
    [ _out ]

  fun in1(): InputDescriptor => _in1

  fun in2(): InputDescriptor => _in2

  fun out(): OutputDescriptor => _out

  fun val input( index: USize ): InputDescriptor val =>
    match index
    | 0 => _in1
    | 1 => _in2
    else
      InputDescriptor( "INVALID", "INVALID", "INVALID", false, false)
    end

  fun val output( index: USize ): OutputDescriptor val =>
    match index
    | 0 => _out
    else
      OutputDescriptor( "INVALID", "INVALID", "INVALID", false, false)
    end

  fun val name(): String =>
    _name

  fun val description(): String =>
    _description

  fun val describe() : JObj val =>
    var inps = JArr
    for inp in inputs().values() do
      inps = inps + inp.describe()
    end
    var outps = JArr
    for outp in outputs().values() do
      outps = outps + outp.describe()
    end
    JObj
      + ("name", name() )
      + ("description", description() )
      + ("subgraph", false )
      + ("icon", "plus" )
      + ("inPorts", inps)
      + ("outPorts", outps )

class val Function2BlockFactory is BlockFactory
  let _descriptor: Function2BlockDescriptor val
  let _function:Function2

  new val create( blockname:String, block_description:String, fn:Function2 ) =>
    _function = fn
    _descriptor = recover
      Function2BlockDescriptor(blockname, block_description,
                               "output of function", "number",
                               "in1", "number", "input1",
                               "in2", "number", "input2" )
    end

  new val typed( blockname:String, block_description:String, types:Array[String] val, fn:Function2 )? =>
    _function = fn
    _descriptor = recover
      Function2BlockDescriptor(blockname, block_description,
                               "output of function", types(0)?,
                               "in1", types(1)?, "input1",
                               "in2", types(2)?, "input2" )
    end

  new val named( blockname:String, block_description:String, types:Array[String] val, names:Array[String] val, fn:Function2 )? =>
    _function = fn
    _descriptor = recover
      Function2BlockDescriptor(blockname, block_description,
                               "output of function", types(0)?,
                               names(0)?, types(1)?, "input1",
                               names(1)?, types(2)?, "input2")
    end

  fun val block_type_descriptor() : BlockTypeDescriptor val^ =>
    _descriptor

  fun create_block( instance_name: String, context:SystemContext val, x:I64, y:I64):Block =>
    context(Fine) and context.log("create Add")
    Function2Block( instance_name, _descriptor, _function, context, x, y )

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )
