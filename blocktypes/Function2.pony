use "collections"
use "jay"
use "metric"
use "promises"
use "time"
use ".."
use "../graphs"
use "../system"

interface val Function2
  fun val apply( in1:(String|I64|F64|Metric|Bool), in2:(String|I64|F64|Metric|Bool) ):(String|I64|F64|Metric|Bool)

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
  var _time_since_last_eventrate_update:I64 = PosixDate.time()
  var _eventcounter: I32 = 0
  var _eventrate: F32 = -1

  new create(name': String, descriptor': BlockTypeDescriptor, function':Function2, context:SystemContext, x:I64, y:I64 ) =>
    context(Fine) and context.log(Fine, "create("+name'+")")
    _context = context
    _function = function'
    _name = name'
    _descriptor = descriptor'
    _x = x
    _y = y
    let zero:F64 = 0.0
    _input1 = InputImpl( _name, _descriptor.input(0) )
    _input2 = InputImpl( _name, _descriptor.input(1) )
    _output = OutputImpl( _name, _descriptor.output(0) )

  be get_input(input: String, promise:Promise[(String|I64|F64|Metric|Bool)]) =>
    match input
    | "in1" => promise(_input1.value())
    | "in2" => promise(_input2.value())
    else
      _context(Warn) and _context.log( Warn, "Unknown input: " + _name + "." + input )
      false
    end

  be get_output(output: String, promise:Promise[(String|I64|F64|Metric|Bool)]) =>
    if output == "out"  then
      promise(_output.value())
    else
      _context(Error) and _context.log(Error, output + " is not an output name of block type " + _descriptor.name() )
      false
    end

  be change( x:I64, y:I64 ) =>
    _x = x
    _y = y

  be start() =>
    _context(Fine) and _context.log(Fine, "start()")
    _started = true
    refresh()

  be stop() =>
    refresh()
    _context(Fine) and _context.log(Fine, "stop()")
    _started = false

  be connect( output: String, to_block: Block, to_input: String) =>
    if output == "out"  then
      _output.connect(to_block, to_input)
      refresh()
    end

  be disconnect_block( block: Block, disconnects: LinkRemoveNotify ) =>
    _output.disconnect_block( block, disconnects )

  be disconnect_edge( output:String, dest_block: Block, dest_input: String, disconnects: LinkRemoveNotify ) =>
    match output
    | "out" => _output.disconnect_edge( dest_block, dest_input, disconnects )
    end

  be destroy(disconnects: LinkRemoveNotify) =>
    refresh()
    _context(Fine) and _context.log(Fine, "destroy()")
    _started = false
    _output.disconnect_all(disconnects)

  be rename( new_name: String ) =>
    _output.rename_of_block( this, _name, new_name )
    _name = new_name

  be rename_of( block: Block, old_name: String, new_name: String ) =>
    _input1.rename_of_block( block, old_name, new_name )
    _input2.rename_of_block( block, old_name, new_name )
    _output.rename_of_block( block, old_name, new_name )

  be update(input: String, new_value:(String|I64|F64|Metric|Bool)) =>
    _context(Fine) and _context.log(Fine, "Function2[ " + _name + "." + input + " = " + new_value.string() + " ]")
    _eventcounter = _eventcounter + 1
    match input
    | "in1" => _input1.set( new_value )
    | "in2" => _input2.set( new_value )
    end
    refresh()

  be stats_update() =>
    let now = PosixDate.time()
    let interval_in_seconds = now - _time_since_last_eventrate_update
    _eventrate = _eventcounter.f32() / interval_in_seconds.f32()
    _time_since_last_eventrate_update = now

  be set_initial(input: String, initial_value:(String|I64|F64|Metric|Bool|None)) =>
    _context(Fine) and _context.log(Fine, "Function2[ " + _name + "." + input + " = (initial) = " + initial_value.string() + " ]")
    match input
    | "in1" => _input1.set_initial( initial_value )
    | "in2" => _input2.set_initial( initial_value )
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

  be subscribe_link( subscription:LinkSubscription ) =>
    match subscription.dest_port
    | "in1" => _input1.subscribe(subscription)
    | "in2" => _input2.subscribe(subscription)
    end
    refresh()

  be unsubscribe_link( subscription:LinkSubscription ) =>
    match subscription.dest_port
    | "in1" => _input1.unsubscribe(subscription)
    | "in2" => _input2.unsubscribe(subscription)
    end
    refresh()

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
      _in1 = InputDescriptor(name1, type1, descr1, false )
      _in2 = InputDescriptor(name2, type2, descr2, false )
      _out = OutputDescriptor("out", output_type, outdescr, false )

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
      InputDescriptor( "INVALID", "INVALID", "INVALID", false)
    end

  fun val output( index: USize ): OutputDescriptor val =>
    match index
    | 0 => _out
    else
      OutputDescriptor( "INVALID", "INVALID", "INVALID", false)
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
    context(Fine) and context.log(Fine, "create Add")
    Function2Block( instance_name, _descriptor, _function, context, x, y )

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )
