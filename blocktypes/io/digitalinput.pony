use "collections"
use "jay"
use "promises"
use "time"
use ".."
use "../../graphs"
use "../../system"

actor DigitalInput is Block
  var _name: String
  let _descriptor: BlockTypeDescriptor
  let _output: Output
  let _context:SystemContext
  var _started:Bool = false
  var _x:F64
  var _y:F64
  var _time_since_last_eventrate_update:I64 = PosixDate.time()
  var _eventcounter: I32 = 0
  var _eventrate: F32 = -1

  new create(name': String, descriptor': BlockTypeDescriptor, context:SystemContext, x:F64, y:F64 ) =>
    context(Fine) and context.log(Fine, "create("+name'+")")
    _context = context
    _name = name'
    _descriptor = descriptor'
    _x = x
    _y = y
    _output = OutputImpl( _name, _descriptor.output(0) )

  be get_input(input: String, promise:Promise[Linkable]) =>
    _context(Warn) and _context.log( Warn, "Unknown input: " + _name + "." + input )

  be get_output(output: String, promise:Promise[Linkable]) =>
    if output == "out"  then
      promise(_output.value())
    else
      _context(Error) and _context.log(Error, output + " is not an output name of block type " + _descriptor.name() )
      false
    end

  be change( x:F64, y:F64 ) =>
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
    _output.rename_of_block( block, old_name, new_name )

  be update(input: String, new_value:Linkable) =>
    _context(Fine) and _context.log(Fine, "DigitalInput[" + _name + "." + input + "].update() --> no effect")
    _eventcounter = _eventcounter + 1
    refresh()

  be stats_update() =>
    let now = PosixDate.time()
    let interval_in_seconds = now - _time_since_last_eventrate_update
    _eventrate = _eventcounter.f32() / interval_in_seconds.f32()
    _time_since_last_eventrate_update = now

  be set_initial(input: String, initial_value:Linkable) =>
    _context(Fine) and _context.log(Fine, "DigitalInput[ " + _name + "." + input + "].setInitial() --> no effect")
    refresh()

  be refresh() =>
    if _started then
      // TODO, connect to IoMapping system
      None
    end

  be name( promise: Promise[String] tag ) =>
    promise(_name)

  be descriptor( promise: Promise[BlockTypeDescriptor] tag ) =>
    promise(_descriptor)

  be describe( promise:Promise[JObj val] tag ) =>
    BlockDescription(promise, _name, _descriptor.name(), _x, _y, _started, [], [_output] )

  be subscribe_link( subscription:LinkSubscription ) =>
    None

  be unsubscribe_link( subscription:LinkSubscription ) =>
    None

class val DigitalInputBlockDescriptor is BlockTypeDescriptor
  let _out:OutputDescriptor

  new val create() =>
      _out = OutputDescriptor("out", "bool", "Logical Value that can be mapped to physical input", false )

  fun val inputs(): Array[InputDescriptor] val =>
    []

  fun val outputs(): Array[OutputDescriptor] val =>
    [ _out ]

  fun out(): OutputDescriptor => _out

  fun val input( index: USize ): InputDescriptor val =>
    InputDescriptor( "INVALID", "INVALID", "INVALID", false)

  fun val output( index: USize ): OutputDescriptor val =>
    match index
    | 0 => _out
    else
      OutputDescriptor( "INVALID", "INVALID", "INVALID", false)
    end

  fun val name(): String =>
    "io/DigitalInput"

  fun val icon(): String =>
    "digital-input.svg"

  fun val description(): String =>
    "Logical Digital Input, which can be mapped to a physical input in the runtime environment."


  fun val describe() : JObj val =>
    var inps = JArr
    var outps = JArr
    for outp in outputs().values() do
      outps = outps + outp.describe()
    end
    JObj
      + ("name", name() )
      + ("description", description() )
      + ("subgraph", false )
      + ("icon", icon() )
      + ("inPorts", inps)
      + ("outPorts", outps )

class val DigitalInputBlockFactory is BlockFactory
  let _descriptor: DigitalInputBlockDescriptor val = DigitalInputBlockDescriptor

  fun val block_type_descriptor() : BlockTypeDescriptor val^ =>
    _descriptor

  fun create_block( instance_name: String, context:SystemContext val, x:F64, y:F64):Block =>
    DigitalInput( instance_name, _descriptor, context, x, y )

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )
