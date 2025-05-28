use "collections"
use "jay"
use "metric"
use "promises"
use "time"
use ".."
use "../../graphs"
use "../../system"

actor DigitalOutput is Block
  var _name: String
  let _descriptor: BlockTypeDescriptor
  let _input: Input
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
    _input = InputImpl( _name, _descriptor.input(0) )

  be get_input(input: String, promise:Promise[(String|I64|F64|Metric|Bool)]) =>
    match input
    | "input" => promise(_input.value())
    else
      _context(Warn) and _context.log( Warn, "Unknown input: " + _name + "." + input )
      false
    end

  be get_output(output: String, promise:Promise[(String|I64|F64|Metric|Bool)]) =>
    None

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
    None

  be disconnect_block( block: Block, disconnects: LinkRemoveNotify ) =>
    None

  be disconnect_edge( output:String, dest_block: Block, dest_input: String, disconnects: LinkRemoveNotify ) =>
    None

  be destroy(disconnects: LinkRemoveNotify) =>
    refresh()
    _context(Fine) and _context.log(Fine, "destroy()")
    _started = false

  be rename( new_name: String ) =>
    _name = new_name

  be rename_of( block: Block, old_name: String, new_name: String ) =>
    _input.rename_of_block( block, old_name, new_name )

  be update(input: String, new_value:(String|I64|F64|Metric|Bool)) =>
    _context(Fine) and _context.log(Fine, "DigitalOutput[ " + _name + "." + input + " = " + new_value.string() + " ]")
    _eventcounter = _eventcounter + 1
    match input
    | "input" => _input.set( new_value )
    end
    refresh()

  be stats_update() =>
    let now = PosixDate.time()
    let interval_in_seconds = now - _time_since_last_eventrate_update
    _eventrate = _eventcounter.f32() / interval_in_seconds.f32()
    _time_since_last_eventrate_update = now

  be set_initial(input: String, initial_value:(String|I64|F64|Metric|Bool|None)) =>
    _context(Fine) and _context.log(Fine, "DigitalOutput[ " + _name + "." + input + " = (initial) = " + initial_value.string() + " ]")
    match input
    | "input" => _input.set_initial( initial_value )
    end
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
    BlockDescription(promise, _name, _descriptor.name(), _x, _y, _started, [_input], [] )

  be subscribe_link( subscription:LinkSubscription ) =>
    match subscription.dest_port
    | "input" => _input.subscribe(subscription)
    end
    refresh()

  be unsubscribe_link( subscription:LinkSubscription ) =>
    match subscription.dest_port
    | "input" => _input.unsubscribe(subscription)
    end
    refresh()

class val DigitalOutputBlockDescriptor is BlockTypeDescriptor
  let _input:InputDescriptor

  new val create() =>
      _input = InputDescriptor("input", "bool", "Logical Value that can be mapped to physical output", false )

  fun val inputs(): Array[InputDescriptor] val =>
    [ _input ]

  fun val outputs(): Array[OutputDescriptor] val =>
    []

  fun input1(): InputDescriptor => _input

  fun val input( index: USize ): InputDescriptor val =>
    match index
    | 0 => _input
    else
      InputDescriptor( "INVALID", "INVALID", "INVALID", false)
    end

  fun val output( index: USize ): OutputDescriptor val =>
    OutputDescriptor( "INVALID", "INVALID", "INVALID", false)

  fun val name(): String =>
    "io/DigitalOutput"

  fun val icon(): String =>
    "digital-output.svg"

  fun val description(): String =>
    "Logical Digital Output, which can be mapped to a physical output in the runtime environment."


  fun val describe() : JObj val =>
    var inps = JArr
    for inp in inputs().values() do
      inps = inps + inp.describe()
    end
    var outps = JArr
    JObj
      + ("name", name() )
      + ("description", description() )
      + ("subgraph", false )
      + ("icon", icon() )
      + ("inPorts", inps)
      + ("outPorts", outps )

class val DigitalOutputBlockFactory is BlockFactory
  let _descriptor: DigitalOutputBlockDescriptor val = DigitalOutputBlockDescriptor

  fun val block_type_descriptor() : BlockTypeDescriptor val^ =>
    _descriptor

  fun create_block( instance_name: String, context:SystemContext val, x:F64, y:F64):Block =>
    context(Fine) and context.log(Fine, "create DigitalOutput")
    DigitalOutput( instance_name, _descriptor, context, x, y )

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )
