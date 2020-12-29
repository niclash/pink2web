use "collections"
use "debug"
use "promises"
use "jay"
// use "./advanced"
// use "./math"
use "./process"
use "./timing"
use "../graphs"
use "../system"
use "../collectors"

primitive _Helper
  fun _add_component(factory:BlockFactory, types': Map[String,BlockFactory]) =>
    types'(factory.block_type_descriptor().name()) = factory

class val BlockTypes
  let _intrinsic_types: Map[String,BlockFactory] val
  let _user_types: Map[String,BlockFactory] val = recover Map[String,BlockFactory] end     // not implemented yet
  let _context:SystemContext
  let _dummy: BlockFactory val
  
  new val create(context: SystemContext) =>
    _context = context
    _dummy = recover DummyFactory end
    _intrinsic_types = recover
      let types = Map[String,BlockFactory]
      try
        _MathBlocks(types)
        _TimingBlocks(types)
        _ProcessBlocks(types)?
      else
        context.internal_error()
        Fail()
      end
      types
    end

  fun get(typename: String): BlockFactory =>
    _intrinsic_types.get_or_else( typename, _user_types.get_or_else( typename, _dummy ))
    
  fun list_types(): Map[String, BlockTypeDescriptor val] val =>
    let result = recover iso Map[String, BlockTypeDescriptor val] end
    for (typename, factory) in _intrinsic_types.pairs() do
      result(typename) = factory.block_type_descriptor()
    end
    for (typename, factory) in _user_types.pairs() do
      result(typename) = factory.block_type_descriptor()
    end
    consume result

  fun describe_type( typename: String ): JObj val =>
    let factory = get(typename)
    factory.describe()

    
trait val BlockTypeDescriptor

  fun val name(): String

  fun val description(): String

  fun val inputs(): Array[InputDescriptor] val
  
  fun val outputs(): Array[OutputDescriptor] val
  
  fun val input( index: USize ): InputDescriptor val

  fun val output( index: USize ): OutputDescriptor val

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

primitive BlockDescription
  fun apply(promise:Promise[JObj], name':String, type':String, started':Bool, inputs': Array[Input], outputs':Array[Output] ) =>
    var inputs = JArr
    for inp in inputs'.values() do
      inputs = inputs + inp.describe()
    end
    Collector[Output,JObj](
        outputs'.values(), 
        { (out, p) => out.describe(p) },
        { (result) =>
            var outputs = JArr
            for out in result.values() do outputs = outputs + out end
            let json = JObj
            + ("name", name' )
            + ("type", type' )
            + ("started", started' )
            + ("inputs", inputs )
            + ("outputs", outputs )
            promise( json )
        }
    )

primitive _ProcessBlocks
  fun apply(types:Map[String,BlockFactory])? =>
    _Helper._add_component( Function3BlockFactory.named("process/Linear", "out = k * in + m",
                            ["number"; "number"; "number"; "number" ],
                            ["in"; "k"; "m"],
                            {(inp:Any val,k:Any val,m:Any val) => (ToF64(inp) * ToF64(k)) + ToF64(m)})?
                            ,types)

primitive _TimingBlocks
  fun apply(types:Map[String,BlockFactory]) =>
    _Helper._add_component( IntervalTimerBlockFactory,types)

primitive _MathBlocks
  fun apply(types:Map[String,BlockFactory]) =>
    _Helper._add_component( Function4BlockFactory("math/Add4", "out = in1 + in2 + in3 + in4",
                               {(in1:Any val,in2:Any val,in3:Any val,in4:Any val) => ToF64(in1) + ToF64(in2) + ToF64(in3) + ToF64(in4)})
                            ,types)
    _Helper._add_component( Function2BlockFactory("math/Add2", "out = in1 + in2",
                               {(in1:Any val,in2:Any val) => ToF64(in1) + ToF64(in2)})
                            ,types)
    _Helper._add_component( Function2BlockFactory("math/Mult2", "out = in1 * in2",
                               {(in1:Any val,in2:Any val) => ToF64(in1) * ToF64(in2)})
                            ,types)
    _Helper._add_component( Function2BlockFactory("math/Divide", "out = in1 / in2",
                               {(in1:Any val,in2:Any val) => ToF64(in1) * ToF64(in2)})
                            ,types)
    _Helper._add_component( Function2BlockFactory("math/Subtract", "out = in1 - in2",
                               {(in1:Any val,in2:Any val) => ToF64(in1) - ToF64(in2)})
                            ,types)

    _Helper._add_component( Function2BlockFactory("math/Modulo", "out = in1 MOD in2",
                               {(in1:Any val,in2:Any val) => ToF64(in1) %% ToF64(in2)})
                            ,types)

    _Helper._add_component( Function2BlockFactory("math/Remainder", "out = in1 REMAINDER in2",
                               {(in1:Any val,in2:Any val) => ToF64(in1) % ToF64(in2)})
                            ,types)

    _Helper._add_component( Function2BlockFactory("math/And2", "out = in1 AND in2",
                               {(in1:Any val,in2:Any val) => ToI64(in1) and ToI64(in2)})
                            ,types)
    _Helper._add_component( Function2BlockFactory("math/Or2", "out = in1 OR in2",
                               {(in1:Any val,in2:Any val) => ToI64(in1) or ToI64(in2)})
                            ,types)
    _Helper._add_component( Function2BlockFactory("math/Xor", "out = in1 XOR in2",
                               {(in1:Any val,in2:Any val) => ToI64(in1) xor ToI64(in2)})
                            ,types)
    _Helper._add_component( Function4BlockFactory("math/And4", "out = in1 AND in2 AND in3 AND in4",
                               {(in1:Any val,in2:Any val,in3:Any val,in4:Any val) => ToI64(in1) and ToI64(in2) and ToI64(in3) and ToI64(in4)})
                            ,types)

    _Helper._add_component( Function4BlockFactory("math/Or4", "out = in1 OR in2 OR in3 OR in4",
                               {(in1:Any val,in2:Any val,in3:Any val,in4:Any val) => ToI64(in1) or ToI64(in2) or ToI64(in3) or ToI64(in4)})
                            ,types)

    _Helper._add_component( Function2BlockFactory("math/Greater", "out = in1 > in2",
                               {(in1:Any val,in2:Any val) => ToF64(in1) > ToF64(in2)})
                            ,types)
    _Helper._add_component( Function2BlockFactory("math/Less", "out = in1 < in2",
                               {(in1:Any val,in2:Any val) => ToF64(in1) < ToF64(in2)})
                            ,types)
    _Helper._add_component( Function2BlockFactory("math/Equal", "out = in1 == in2",
                               {(in1:Any val,in2:Any val) => ToF64(in1) == ToF64(in2)})
                            ,types)
    _Helper._add_component( Function2BlockFactory("math/NotEqual", "out = in1 != in2",
                               {(in1:Any val,in2:Any val) => ToF64(in1) != ToF64(in2)})
                            ,types)
    _Helper._add_component( Function2BlockFactory("math/LessEqual", "out = in1 <= in2",
                               {(in1:Any val,in2:Any val) => ToF64(in1) <= ToF64(in2)})
                            ,types)
    _Helper._add_component( Function2BlockFactory("math/GreaterEqual", "out = in1 >= in2",
                               {(in1:Any val,in2:Any val) => ToF64(in1) >= ToF64(in2)})
                            ,types)

