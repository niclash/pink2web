use "collections"
use "jay"
use "logger"
use "promises"
use "pony-metric"
use ".."
use "../../graphs"
use "../../system"

interface val Algorithm
  fun val apply( inputs:Array[Input[Linkable]], outputs:Array[Output[Linkable]] )

actor GenericBlock is Block
  var _name: String
  let _descriptor: BlockTypeDescriptor
  let _inputs: Array[Input[Linkable]] = []
  let _outputs: Array[Output[Linkable]] = []
  let _context:SystemContext
  let _algorithm:Algorithm
  var _started:Bool = false
  var _x:I64
  var _y:I64
  
  new create(name': String, descriptor': BlockTypeDescriptor, algo:Algorithm, context:SystemContext, x:I64, y:I64 ) =>
    context(Fine) and context.log("create("+name'+")")
    _context = context
    _name = name'
    _descriptor = descriptor'
    _algorithm = algo
    _x = x
    _y = y

    for inp in descriptor'.inputs().values() do
      _inputs.push( InputImpl[Linkable]( inp.name(), inp, inp.initial_value() ) )
    end
    for outp in descriptor'.outputs().values() do
      _outputs.push( OutputImpl[Linkable]( outp.name(), outp, outp.initial_value() ) )
    end

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
    try
      let outp = _find_output(output)
      outp.connect(to_block, to_input)
    end
    refresh()

  be disconnect_block( block: Block ) =>
    for output in _outputs.values() do
      try
        let outp = _find_output(output)
        outp.disconnect_block(block)
      end
    end
    refresh()

  be disconnect_edge( output:String, dest_block: Block, dest_input: String ) =>
    try
      let outp = _find_output(output)
      outp.disconnect_edge( dest_block, dest_input )
    end

  be destroy() =>
    refresh()
    _context(Fine) and _context.log("destroy()")
    _started = false
    for outp in _outputs.values() do
      outp.disconnect_all()
    end
    
  be rename( new_name: String ) =>
    _name = new_name

  fun _find_input( input_name:String ): Input[Linkable] ? =>
    for inp in _inputs.values() do
      if inp.descriptor.name() == input_name then
        return inp
      end
    end
    error

  fun _find_output( output_name:String ): Output[Linkable] ? =>
    for outp in _outputs.values() do
      if outp.descriptor.name() == output_name then
        return outp
      end
    end
    error

  be update(input: String, new_value:Linkable) =>
    _context(Fine) and _context.log( descriptor.name + "[ " + _name + "." + input + " = " + new_value.string() + " ]")
    try
      let inp = _find_input( input )
      match inp.descriptor().linktype()
      | let t:Float => inp.set( new_value.f64() )
      | let t:Signed => inp.set( new_value.i64 )
      | let t:Metric => try inp.set( new_value as Metric ) end
      | let t:Bool =>  inp.set( try new_value as Bool else new_value.i64() != 0 end )
      | let t:String => inp.set( new_value.string() )
      | let t:None => None
      end
    else
      _context(Error) and _context.log( input + " is not an input name of block type " + descriptor.name() )
    end
    refresh()

  be refresh() =>
    if _started then
      _algorithm(_inputs, _outputs)
    end
    
  be name( promise: Promise[String] tag ) =>
    promise(_name)

  be descriptor( promise: Promise[BlockTypeDescriptor] tag ) =>
    promise(_descriptor)

  be describe( promise:Promise[JObj val] tag ) =>
    BlockDescription[F64,F64](promise, _name, _descriptor.name(), _started, _inputs, _outputs )

class val GenericBlockFactory is (BlockFactory & BlockTypeDescriptor)
  let _inputs:Array[InputDescriptor[Linkable]] val
  let _outputs:Array[OutputDescriptor[Linkable]] val
  let _name:String val
  let _description:String val

  new val create(name':String, description':String, inputs':Array[InputDescriptor[Linkable]] val, outputs':Array[OutputDescriptor[Linkable]] val ) =>
    _name = name'
    _description = description'
    _inputs = inputs'
    _outputs = outputs'

  fun val inputs(): Array[InputDescriptor[Linkable]] val =>
    inputs

  fun val outputs(): Array[OutputDescriptor[Linkable]] val =>
    outputs

  fun val input( index: USize ): InputDescriptor[Linkable] val =>
    try
      inputs(index)
    else
      InputDescriptor( "INVALID", PReal, "INVALID", false, false)
    end

  fun val output( index: USize ): OutputDescriptor[Linkable] val =>
    try
      outputs(index)
    else
      OutputDescriptor( "INVALID", PReal, "INVALID", false, false)
    end

  fun val block_type_descriptor() : BlockTypeDescriptor val^ =>
    this

  fun create_block( instance_name: String, context:SystemContext val, x:I64, y:I64):Block =>
    context(Fine) and context.log("create " + _name)
    GenericBlock( instance_name, this, context, x, y )

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
