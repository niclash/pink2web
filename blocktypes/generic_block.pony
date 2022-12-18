
use "collections"
use "debug"
use "jay"
use "promises"
use "metric"
use "time"
use "../graphs"
use "../system"

interface val Algorithm
  fun val apply( block:GenericBlock, inputs:Map[String,(String|I64|F64|Metric|Bool)] val )

actor GenericBlock is Block
  var _name: String
  let _descriptor: BlockTypeDescriptor
  let _inputs: Array[Input] = []
  let _outputs: Array[Output] = []
  let _context:SystemContext
  let _algorithm:Algorithm
  var _started:Bool = false
  var _x:I64
  var _y:I64
  var _time_since_last_eventrate_update:I64 = PosixDate.time()
  var _eventcounter: I32 = 0
  var _eventrate: F32 = -1

  new create(name': String, descriptor': BlockTypeDescriptor val, algo:Algorithm, context:SystemContext, x:I64, y:I64 ) =>
    context(Fine) and context.log(Fine, "create("+name'+")")
    _context = context
    _name = name'
    _descriptor = descriptor'
    _algorithm = algo
    _x = x
    _y = y

    for inp in descriptor'.inputs().values() do
      _inputs.push( InputImpl( name', inp ) )
    end
    for outp in descriptor'.outputs().values() do
      _outputs.push( OutputImpl( name', outp ) )
    end

  be change( x:I64, y:I64 ) =>
    _x = x
    _y = y
    
  be get_input(input: String, promise:Promise[(String|I64|F64|Metric|Bool)]) =>
    try
      let inp = _find_input( input )?
      promise(inp.value())
    else
      _context(Error) and _context.log(Error, input + " is not an input name of block type " + _descriptor.name() )
      false
    end

  be get_output(output: String, promise:Promise[(String|I64|F64|Metric|Bool)]) =>
    try
      let outp = _find_output( output )?
      promise(outp.value())
    else
      _context(Error) and _context.log(Error, output + " is not an output name of block type " + _descriptor.name() )
      false
    end

  be start() =>
    _context(Fine) and _context.log(Fine, "start()")
    _started = true
    refresh()

  be stop() =>
    refresh()
    _context(Fine) and _context.log(Fine, "stop()")
    _started = false
    
  be connect( output: String, to_block: Block, to_input: String) =>
    try
      let outp = _find_output(output)?
      outp.connect(to_block, to_input)
    end
    refresh()

  be disconnect_block( block: Block, disconnects: LinkRemoveNotify ) =>
    for output in _outputs.values() do
      output.disconnect_block( block, disconnects )
    end
    refresh()

  be disconnect_edge( output:String, dest_block: Block, dest_input: String, disconnects: LinkRemoveNotify ) =>
    try
      let outp = _find_output(output)?
      outp.disconnect_edge( dest_block, dest_input, disconnects )
    end

  be destroy(disconnects: LinkRemoveNotify) =>
    refresh()
    Debug.out( "GenericBlock.destroy()" )
    _context(Fine) and _context.log(Fine, "destroy()")
    _started = false
    for outp in _outputs.values() do
      outp.disconnect_all(disconnects)
    end
    
  be rename( new_name: String ) =>
    for outp in _outputs.values() do
      outp.rename_of_block( this, _name, new_name )
    end
    _name = new_name

  be rename_of( block: Block, old_name: String, new_name: String ) =>
    for inp in _inputs.values() do
      inp.rename_of_block( block, old_name, new_name )
    end

  fun _find_input( input_name:String ): this->Input  ? =>
    for inp in _inputs.values() do
      if inp.descriptor().name == input_name then
        return inp
      end
    end
    error

  fun _find_output( output_name:String ): this->Output ? =>
    for outp in _outputs.values() do
      if outp.descriptor().name == output_name then
        return outp
      end
    end
    error

  be update(input: String, new_value:(String|I64|F64|Metric|Bool)) =>
    _context(Fine) and _context.log(Fine, _descriptor.name() + "[ " + _name + "." + input + " = " + new_value.string() + " ]")
    _eventcounter = _eventcounter + 1
    try
      let inp = _find_input( input )?
      inp.set( new_value )
    else
      _context(Error) and _context.log(Error, input + " is not an input name of block type " + _descriptor.name() )
    end
    refresh()

  be stats_update() =>
    let now = PosixDate.time()
    let interval_in_seconds = now - _time_since_last_eventrate_update
    _eventrate = _eventcounter.f32() / interval_in_seconds.f32()
    _time_since_last_eventrate_update = now

  be set_initial(input: String, initial_value: (String|I64|F64|Metric|Bool|None)) =>
    _context(Fine) and _context.log(Fine, _descriptor.name() + "[ " + _name + "." + input + " = (initial) = " + initial_value.string() + " ]")
    try
      let inp = _find_input( input )?
      inp.set_initial( initial_value )
    else
      _context(Error) and _context.log(Error, input + " is not an input name of block type " + _descriptor.name() )
    end
    refresh()

  be refresh() =>
    if _started then
      let inputs' = recover iso Map[String,(String|I64|F64|Metric|Bool)] end
      for inp in _inputs.values() do
        inputs'( inp.name() ) = inp.value()
      end
      _algorithm(this, consume inputs')
    end
    
  be name( promise: Promise[String] tag ) =>
    promise(_name)

  be descriptor( promise: Promise[BlockTypeDescriptor] tag ) =>
    promise(_descriptor)

  be describe( promise:Promise[JObj val] tag ) =>
    BlockDescription(promise, _name, _descriptor.name(), _started, _inputs, _outputs )

  be subscribe_link( subscription:LinkSubscription ) =>
    for inp in _inputs.values() do
      if inp.name() == subscription.dest_port then
        inp.subscribe(subscription)
      end
    end

  be unsubscribe_link( subscription:LinkSubscription ) =>
    for inp in _inputs.values() do
      if inp.name() == subscription.dest_port then
        inp.unsubscribe(subscription)
      end
    end

class val GenericBlockTypeDescriptor is BlockTypeDescriptor
  let _inputs:Array[InputDescriptor] val
  let _outputs:Array[OutputDescriptor] val
  let _name:String val
  let _description:String val

  new val create(name':String, description':String, inputs':Array[InputDescriptor] val, outputs':Array[OutputDescriptor] val ) =>
    _name = name'
    _description = description'
    _inputs = inputs'
    _outputs = outputs'

  fun val inputs(): Array[InputDescriptor] val =>
    _inputs

  fun val outputs(): Array[OutputDescriptor] val =>
    _outputs

  fun val input( index: USize ): InputDescriptor val =>
    try
      _inputs(index)?
    else
      InputDescriptor( "INVALID", "INVALID", "INVALID", false)
    end

  fun val output( index: USize ): OutputDescriptor val =>
    try
      _outputs(index)?
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
    var json6 = JObj
      + ("name", name() )
      + ("description", description() )
      + ("subgraph", false )
      + ("icon", "plus" )
      + ("inPorts", inps)
      + ("outPorts", outps )
    json6

class val GenericBlockFactory is BlockFactory
  let _descriptor: BlockTypeDescriptor val
  let _algorithm:Algorithm

  new val create(name':String, description':String, algo:Algorithm, inputs':Array[InputDescriptor] val, outputs':Array[OutputDescriptor] val) =>
    _descriptor = GenericBlockTypeDescriptor(name', description', inputs', outputs')
    _algorithm = algo

  fun create_block( instance_name: String, context:SystemContext val, x:I64, y:I64):Block =>
    context(Fine) and context.log(Fine, "create " + instance_name)
    GenericBlock( instance_name, _descriptor, _algorithm, context, x, y )

  fun val block_type_descriptor(): BlockTypeDescriptor =>
    _descriptor

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )

