use "collections"
use "jay"
use "metric"
use "promises"
use "time"
use "../graphs"
use "../system"

interface val CyclicAlgorithm
  fun val apply( block:CyclicBlock, inputs:Map[String,Any val] val, now:U64, last:U64 )

actor CyclicBlock is Block
  var _name: String
  let _descriptor: BlockTypeDescriptor
  let _inputs: Array[Input] = []
  let _outputs: Array[Output] = []
  let _context:SystemContext
  var timer: (Timer tag|None) = None
  var _cycle_ms: U64
  var _last_time: U64
  let _algorithm:CyclicAlgorithm
  var _started:Bool = false
  var _x:I64
  var _y:I64

  new create(name': String, descriptor': CyclicBlockTypeDescriptor val, algo:CyclicAlgorithm, context:SystemContext, x:I64, y:I64 ) =>
    context(Fine) and context.log(Fine, "create("+name'+")")
    _context = context
    _name = name'
    _descriptor = descriptor'
    _algorithm = algo
    _cycle_ms = descriptor'.cycle()
    _last_time = Time.millis()
    _x = x
    _y = y

    for inp in descriptor'.inputs().values() do
      _inputs.push( InputImpl( name', inp, None ) )
    end
    for outp in descriptor'.outputs().values() do
      _outputs.push( OutputImpl( name', outp, None ) )
    end

  be change( x:I64, y:I64 ) =>
    _x = x
    _y = y

  be start() =>
    _context(Fine) and _context.log(Fine, "start()")
    if _started then
      return
    end
    _started = true
    let it:CyclicBlock tag = this
    _last_time = Time.millis()
    let t':Timer iso = Timer( CyclicHandler(it), _cycle_ms, _cycle_ms)
    timer = t'
    _context.timers()(consume t')

  be stop() =>
    _context(Fine) and _context.log(Fine, "stop()")
    if _started then
      _started = false
      match timer
      | let t:Timer tag => _context.timers().cancel(t)
      end
      timer = None
    end

  be connect( output: String, to_block: Block, to_input: String) =>
    try
      let outp = _find_output(output)?
      outp.connect(to_block, to_input)
    end

  be disconnect_block( block: Block, disconnects: LinkRemoveNotify ) =>
    for output in _outputs.values() do
      output.disconnect_block(block, disconnects)
    end

  be disconnect_edge( output:String, dest_block: Block, dest_input: String, disconnects: LinkRemoveNotify ) =>
    try
      let outp = _find_output(output)?
      outp.disconnect_edge( dest_block, dest_input, disconnects )
    end

  be destroy(disconnects: LinkRemoveNotify) =>
    _context(Fine) and _context.log(Fine, "destroy()")
    _started = false
    for outp in _outputs.values() do
      outp.disconnect_all(disconnects)
    end

  be rename( new_name: String ) =>
    _name = new_name

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

  be update(input: String, new_value:Any val) =>
    _context(Fine) and _context.log(Fine, _descriptor.name() + "[ " + _name + "." + input + " = " + try (new_value as Stringable).string() else "" end + " ]")
    try
      let inp = _find_input( input )?
      inp.set( new_value )
    else
      _context(Error) and _context.log(Error, input + " is not an input name of block type " + _descriptor.name() )
    end

  be set_initial(input: String, initial_value: Any val) =>
    _context(Fine) and _context.log(Fine, _descriptor.name() + "[ " + _name + "." + input + " = (initial) = " + try (initial_value as Stringable).string() else "" end + " ]")
    try
      let inp = _find_input( input )?
      inp.set_initial( initial_value )
    else
      _context(Error) and _context.log(Error, input + " is not an input name of block type " + _descriptor.name() )
    end

  be refresh() =>
    if _started then
      let now = Time.millis()
      let inputs' = recover iso Map[String,Any val] end
      for inp in _inputs.values() do
        inputs'( inp.name() ) = inp.value()
      end
      _algorithm(this, consume inputs', now, _last_time)
      _last_time = now
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

class val CyclicBlockTypeDescriptor is BlockTypeDescriptor
  let _inputs:Array[InputDescriptor] val
  let _outputs:Array[OutputDescriptor] val
  let _name:String val
  let _description:String val
  let _cycle_ms:U64

  new val create(name':String, description':String, cycle_ms':U64, inputs':Array[InputDescriptor] val, outputs':Array[OutputDescriptor] val ) =>
    _name = name'
    _description = description'
    _inputs = inputs'
    _outputs = outputs'
    _cycle_ms = cycle_ms'

  fun val cycle(): U64 =>
    _cycle_ms

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

class val CyclicBlockFactory is BlockFactory
  let _descriptor: CyclicBlockTypeDescriptor val
  let _algorithm:CyclicAlgorithm

  new val create(name':String, description':String, algo:CyclicAlgorithm, cycle_ms':U64, inputs':Array[InputDescriptor] val, outputs':Array[OutputDescriptor] val) =>
    _descriptor = CyclicBlockTypeDescriptor(name', description', cycle_ms', inputs', outputs')
    _algorithm = algo

  fun create_block( instance_name: String, context:SystemContext val, x:I64, y:I64):Block =>
    context(Fine) and context.log(Fine, "create " + instance_name)
    CyclicBlock( instance_name, _descriptor, _algorithm, context, x, y )

  fun val block_type_descriptor(): BlockTypeDescriptor =>
    _descriptor

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )


class CyclicHandler is TimerNotify
  let _block:CyclicBlock tag

  new iso create(block:CyclicBlock tag ) =>
    _block = block

  fun ref apply(timer:Timer, count:U64): Bool =>
    _block.refresh()
    true
