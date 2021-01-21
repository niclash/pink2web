use "collections"
use "jay"
use "promises"
use "../graphs"
use "../system"

actor NestedBlock is Block
  var _name: String
  let _descriptor: NestedBlockDescriptor val
  let _inputs: Map[String, (Block,String)] = Map[String, (Block,String)]
  let _outputs: Map[String, (Block,String)] = Map[String, (Block,String)]
  let _blocks: Map[String,Block] = Map[String,Block]
  let _context:SystemContext
  var _started:Bool = false
  var _x:I64
  var _y:I64

  new create(name': String, descriptor': NestedBlockDescriptor val, blocktypes:BlockTypes, context:SystemContext, x:I64, y:I64 ) =>
    try
      for (blockname',blockfactory) in descriptor'.factories().pairs() do
        let block:Block tag = blockfactory.create_block( blockname', context, x, y )
        _blocks.add( blockname', block )
      end

      for inp in descriptor'.inputs().values() do
        (let block', let inputname) = BlockName(inp.target)?
        let target_block = _blocks(block')?
        _inputs.add(inp.name, (target_block, inputname ) )
      end

      for outp in descriptor'.outputs().values() do
        (let block', let outputname) = BlockName(outp.source)?
        let source_block = _blocks(block')?
        _outputs.add(outp.name, (source_block, outputname ) )
      end

      for init in descriptor'.initials().values() do
        let block:Block = _blocks(init.target_blockname())?
        block.update( init.target_input(), init.source() )
      end

      for (src,tgt) in descriptor'.edges().values() do
          (let src_block, let src_port) = BlockName(src)?
          (let dest_block, let dest_port) = BlockName(tgt)?
          let source = _blocks(src_block)?
          let dest = _blocks(dest_block)?
          source.connect( src_port, dest, dest_port )
      end
    end
    _name = name'
    _descriptor = descriptor'
    _x = x
    _y = y
    _context = context

  be change( x:I64, y:I64 ) =>
    _x = x
    _y = y

  be start() =>
    _context(Fine) and _context.log(Fine, "start()")
    if not _started then
      _started = true
    end

  be stop() =>
    _context(Fine) and _context.log(Fine, "stop()")
    if _started then
      _started = false
    end

  be connect( outputname: String, to_block: Block, to_input: String) =>
    try
      (let block, let output) = _outputs(outputname)?
      block.connect(output, to_block, to_input )
      refresh()
    end

  be disconnect_block( block: Block ) =>
    for (b, output) in _outputs.values() do
      b.disconnect_block(block)
    end
    refresh()

  be disconnect_edge( outputname:String, dest_block: Block, dest_input: String ) =>
    try
      (let block, let output) = _outputs(outputname)?
      block.disconnect_edge(output, dest_block, dest_input )
      refresh()
    end

  be destroy() =>
    refresh()
    _context(Fine) and _context.log(Fine, "destroy()")
    _started = false
    for (b, output) in _outputs.values() do
      b.destroy()
    end

  be rename( new_name: String ) =>
    _name = new_name

  be update(inputname: String, new_value:Any val) =>
    try
      (let block, let input) = _inputs(inputname)?
      block.update(input, new_value)
    end

  be set_initial(inputname: String, initial_value:Any val) =>
    try
      (let block, let input) = _inputs(inputname)?
      block.set_initial(input, initial_value)
    end

  be refresh() =>
    for (b, output) in _outputs.values() do
      b.refresh()
    end

  be name( promise: Promise[String] tag ) =>
    promise(_name)

  be descriptor( promise: Promise[BlockTypeDescriptor] tag ) =>
    promise(_descriptor)

  be describe( promise:Promise[JObj val] tag ) =>
    let inps:Array[Input] = Array[Input]
    for inp in _descriptor.inputs().values() do
      inps.push( InputImpl( _name, inp, None ) )
    end
    let outps:Array[Output] = Array[Output]
    for outp in _descriptor.outputs().values() do
      outps.push( OutputImpl( _name, outp, None ) )
    end
    BlockDescription(promise, _name, _descriptor.name(), _started, inps, outps )

  be subscribe_link( subscription:LinkSubscription ) =>
    for (n, sub) in _inputs.pairs() do
      if n == subscription.dest_port then
        sub._1.subscribe_link(subscription)
      end
    end

  be unsubscribe_link( subscription:LinkSubscription ) =>
    for (n, sub) in _inputs.pairs() do
      if n == subscription.dest_port then
        sub._1.unsubscribe_link(subscription)
      end
    end

class val NestedBlockFactory is BlockFactory
  let _descriptor: NestedBlockDescriptor val
  let _blocktypes:BlockTypes

  new val create(descriptor': NestedBlockDescriptor val, blocktypes':BlockTypes ) =>
    _descriptor = descriptor'
    _blocktypes = blocktypes'

  fun create_block( instance_name': String, context:SystemContext val, x:I64, y:I64):Block =>
    context(Fine) and context.log(Fine, "create " + instance_name')
    NestedBlock(instance_name', _descriptor, _blocktypes, context, x, y )

  fun val block_type_descriptor(): BlockTypeDescriptor =>
    _descriptor

  fun val describe(): JObj val =>
    JObj + ("descriptor", _descriptor.describe() )

actor NestedBlockTypeBuilder
    """
    ```json
    {
        "name": "Example Block",
        "description": "Showcasing the nested block feature.",
        "blocks": [
          { "name":"Add1", "type": "Math/Add" },
          { "name":"Add2", "type": "Math/Add" },
          { "name":"Add3", "type": "Math/Add" }
        ],
        "edges": [
          { "src": "Add1.out", "tgt": "Add3.in1" },
          { "src": "Add2.out", "tgt": "Add3.in2" }
        ],
        "initials": [
          { "src": 23.5, "tgt": "Add1.in2" },
          { "src": 42, "tgt": "Add2.in2" }
        ],
        "inports": [
          { "name": "in1", "tgt": "Add1.in3", "type": "number" },
          { "name": "in2", "tgt": "Add2.in3", "type": "number" }
        ],
        "outports": [
          { "name": "out", "src": "Add3.out" }
        ]
    }
    ```
    """
  var _blocks:Map[String val, BlockFactory] iso = recover Map[String val, BlockFactory] end
  var _name:String = ""
  var _description:String = ""
  var _inports:Array[InputDescriptor] val = recover Array[InputDescriptor] end
  var _outports:Array[OutputDescriptor] val = recover Array[OutputDescriptor] end
  var _edges:Array[(String val, String val)] val = recover Array[(String val, String val)] end
  var _initials:Array[InitialDescriptor] val = recover Array[InitialDescriptor] end
  var _blocktypes:(BlockTypes|None) = None

  be from_json(descriptor':JObj, blocktypes':BlockTypes) =>
    try
      _blocktypes = blocktypes'
      _name = descriptor'("name") as String
      _description = descriptor'("description") as String
      _inports = _parse_inports(descriptor'("inports") as JArr)?
      _outports = _parse_outports(descriptor'("outports") as JArr)?
      _edges = _parse_edges(descriptor'("edges") as JArr)?
      _initials = _parse_initials(descriptor'("initials") as JArr)?

      let ps = _parse_blocks(descriptor'("blocks") as JArr, blocktypes')?
      let promises:Promise[Array[BlockFactory] val] = Promises[BlockFactory].join(ps.values())
      let thiss:NestedBlockTypeBuilder tag = this
      promises.next[None]({(factories: Array[BlockFactory] val) =>
        thiss.build(factories)
      })
    end

  be build(factories: Array[BlockFactory] val) =>
    try
      if factories.size() != _blocks.size() then
        Print("ERROR!!!!")
      end
      let blocks = _blocks = recover Map[String val, BlockFactory] end
      let blocktypedescriptor = NestedBlockDescriptor(_name, _description, _inports, _outports, _edges, _initials, consume blocks)
      let factory = NestedBlockFactory(blocktypedescriptor, _blocktypes as BlockTypes)
      (_blocktypes as BlockTypes).add_user_blocktype( factory )
    end

  fun _parse_blocks( arr':JArr, blocktypes:BlockTypes ): Array[Promise[BlockFactory]] val ? =>
    recover val
      let ps = Array[(String, Promise[BlockFactory])]
      for b in arr'.values() do
        let thiss:NestedBlockTypeBuilder tag = this
        let block = b as JObj
        let blocktype:String = block("type") as String
        let promise = Promise[BlockFactory]
        ps.push((blocktype,promise))
        promise.next[None]( thiss~add_factory(block("name") as String) )
      end
      let promises = Array[Promise[BlockFactory]]
      for (bt,p) in ps.values() do
        blocktypes.get(bt, p)
        promises.push(p)
      end
      promises
    end

  be add_factory(name':String, blockfactory:BlockFactory) =>
    _blocks(name') = blockfactory

  fun _parse_initials( initials':JArr ): Array[InitialDescriptor] val ? =>
    recover
      let inits = Array[InitialDescriptor]
      for i in initials'.values() do
        let init = i as JObj
        let src = init("src")
        let tgt = init("tgt") as String
        inits.push( InitialDescriptor(src, tgt)? )
      end
      inits
    end

  fun _parse_edges( edges':JArr ): Array[(String val, String val)] val ? =>
    recover
      let wires = Array[(String,String)]
      for e in edges'.values() do
        let edge = e as JObj
        let src = edge("src") as String
        let tgt = edge("tgt") as String
        wires.push((src, tgt))
      end
      wires
    end

  fun _parse_inports( ports:JArr ): Array[InputDescriptor] val ? =>
    recover
      let inports = Array[InputDescriptor val]
      for i in ports.values() do
        let inp = i as JObj
        let name' = inp("name") as String
        let inport = InputDescriptor( name', inp("description") as String, inp("type") as String, inp("addressable") as Bool, inp("tgt") as String )
        inports.push(inport)
      end
      inports
    end

  fun _parse_outports( ports:JArr ): Array[OutputDescriptor] val ? =>
    recover
      let outports = Array[OutputDescriptor val]
      for x in ports.values() do
        let outp = x as JObj
        let name' = outp("name") as String
        let outport = OutputDescriptor( name', outp("description") as String, outp("type") as String, outp("addressable") as Bool, outp("src") as String )
        outports.push(outport)
      end
      outports
    end

class val NestedBlockDescriptor is BlockTypeDescriptor
  let _name:String val
  let _description:String val
  let _inports:Array[InputDescriptor val] val
  let _outports:Array[OutputDescriptor val] val
  let _edges:Array[(String,String)] val
  let _initials:Array[InitialDescriptor val] val
  let _blocks:Map[String val, BlockFactory val] val

  new val create( name':String val, description':String val, inports':Array[InputDescriptor val] val, outports':Array[OutputDescriptor val] val,
                  edges':Array[(String,String)] val, initials':Array[InitialDescriptor val] val, blocks':Map[String val, BlockFactory val] val ) =>
    _name=name'
    _description=description'
    _inports=inports'
    _outports=outports'
    _edges=edges'
    _initials=initials'
    _blocks=blocks'

  fun inputs(): Array[InputDescriptor] val => _inports
  fun outputs(): Array[OutputDescriptor] val => _outports
  fun input( index: USize ): InputDescriptor val => try _inports(index)? else InputDescriptor( "INVALID", "number", "INVALID", false) end
  fun output( index: USize ): OutputDescriptor val => try _outports(index)? else OutputDescriptor( "INVALID", "number", "INVALID", false) end
  fun factories(): Map[String,BlockFactory] val => _blocks
  fun edges(): Array[(String,String)] val => _edges
  fun initials(): Array[InitialDescriptor val] val => _initials
  fun name(): String => _name
  fun description(): String => _description


