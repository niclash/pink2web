use "collections"
use "debug"
use "promises"
use "jay"
// use "./advanced"
// use "./timing"
use "./process"
use "../graphs"
use "../system"
use "../collectors"

primitive _Helper
  fun _add_component(factory:BlockFactory, types': Map[String,BlockFactory]) =>
    types'(factory.block_type_descriptor().name()) = factory

class val BlockTypes
  let _types: Map[String,BlockFactory] val
  let _context:SystemContext
  let _dummy: BlockFactory val

  new val create(context: SystemContext) =>
    _context = context
    _dummy = recover DummyFactory end
    _types = recover
      let types = Map[String,BlockFactory]
      _Helper._add_component( Function4BlockFactory("math/Add4", "out = in1 + in2 + in3 + in4",
                                 {(in1:Linkable,in2:Linkable,in3:Linkable,in4:Linkable) => FNum(in1) + FNum(in2) + FNum(in3) + FNum(in4)})
                              ,types)
      _Helper._add_component( Function2BlockFactory("math/Add2", "out = in1 + in2",
                                 {(in1:Linkable,in2:Linkable) => FNum(in1) + FNum(in2)})
                              ,types)
      _Helper._add_component( Function2BlockFactory("math/Mult2", "out = in1 * in2",
                                 {(in1:Linkable,in2:Linkable) => FNum(in1) * FNum(in2)})
                              ,types)
      _Helper._add_component( Function2BlockFactory("math/Divide", "out = in1 / in2",
                                 {(in1:Linkable,in2:Linkable) => FNum(in1) * FNum(in2)})
                              ,types)
      _Helper._add_component( Function2BlockFactory("math/Subtract", "out = in1 - in2",
                                 {(in1:Linkable,in2:Linkable) => FNum(in1) - FNum(in2)})
                              ,types)

      _Helper._add_component( Function2BlockFactory("math/Modulo", "out = in1 MOD in2",
                                 {(in1:Linkable,in2:Linkable) => FNum(in1) %% FNum(in2)})
                              ,types)

      _Helper._add_component( Function2BlockFactory("math/Remainder", "out = in1 REMAINDER in2",
                                 {(in1:Linkable,in2:Linkable) => FNum(in1) % FNum(in2)})
                              ,types)

      _Helper._add_component( Function2BlockFactory("math/And2", "out = in1 AND in2",
                                 {(in1:Linkable,in2:Linkable) => INum(in1) and INum(in2)})
                              ,types)
      _Helper._add_component( Function2BlockFactory("math/Or2", "out = in1 OR in2",
                                 {(in1:Linkable,in2:Linkable) => INum(in1) or INum(in2)})
                              ,types)
      _Helper._add_component( Function2BlockFactory("math/Xor", "out = in1 XOR in2",
                                 {(in1:Linkable,in2:Linkable) => INum(in1) xor INum(in2)})
                              ,types)
      _Helper._add_component( Function4BlockFactory("math/And4", "out = in1 AND in2 AND in3 AND in4",
                                 {(in1:Linkable,in2:Linkable,in3:Linkable,in4:Linkable) => INum(in1) and INum(in2) and INum(in3) and INum(in4)})
                              ,types)

      _Helper._add_component( Function4BlockFactory("math/Or4", "out = in1 OR in2 OR in3 OR in4",
                                 {(in1:Linkable,in2:Linkable,in3:Linkable,in4:Linkable) => INum(in1) or INum(in2) or INum(in3) or INum(in4)})
                              ,types)

      _Helper._add_component( Function2BlockFactory("math/Greater", "out = in1 > in2",
                                 {(in1:Linkable,in2:Linkable) => FNum(in1) > FNum(in2)})
                              ,types)
      _Helper._add_component( Function2BlockFactory("math/Less", "out = in1 < in2",
                                 {(in1:Linkable,in2:Linkable) => FNum(in1) < FNum(in2)})
                              ,types)
      _Helper._add_component( Function2BlockFactory("math/Equal", "out = in1 == in2",
                                 {(in1:Linkable,in2:Linkable) => FNum(in1) == FNum(in2)})
                              ,types)
      _Helper._add_component( Function2BlockFactory("math/NotEqual", "out = in1 != in2",
                                 {(in1:Linkable,in2:Linkable) => FNum(in1) != FNum(in2)})
                              ,types)
      _Helper._add_component( Function2BlockFactory("math/LessEqual", "out = in1 <= in2",
                                 {(in1:Linkable,in2:Linkable) => FNum(in1) <= FNum(in2)})
                              ,types)
      _Helper._add_component( Function2BlockFactory("math/GreaterEqual", "out = in1 >= in2",
                                 {(in1:Linkable,in2:Linkable) => FNum(in1) >= FNum(in2)})
                              ,types)

      _Helper._add_component( Function3BlockFactory("process/Linear", "out = k * in + m",
                                 {(inp:Linkable,k:Linkable,m:Linkable) => (FNum(inp) * FNum(k)) + FNum(m)})
                              ,types)
      types
    end


  fun get(typename: String): BlockFactory =>
    _types.get_or_else( typename, _dummy )

  fun list_types(): Map[String, BlockTypeDescriptor val] val =>
    let result = recover iso Map[String, BlockTypeDescriptor val] end
    for (typename, factory) in _types.pairs() do
      result(typename) = factory.block_type_descriptor()
    end
    consume result

  fun describe_type( typename: String ): JObj val =>
    let factory = get(typename)
    factory.describe()


trait val BlockTypeDescriptor

  fun val describe() : JObj val
//  fun val describe() : JObj val =>
//    var inps = JArr
//    for inp in inputs().values() do
//      inps = inps + inp.describe()
//    end
//    var outps = JArr
//    for outp in outputs().values() do
//      outps = outps + outp.describe()
//    end
//    var json6 = JObj
//      + ("name", name() )
//      + ("description", description() )
//      + ("subgraph", false )
//      + ("icon", "plus" )
//      + ("inPorts", inps)
//      + ("outPorts", outps )
//    json6

  fun val name(): String

  fun val description(): String

  fun val inputs(): Array[InputDescriptor[Linkable]] val

  fun val outputs(): Array[OutputDescriptor[Linkable]] val

  fun val input( index: USize ): InputDescriptor[Linkable] val

  fun val output( index: USize ): OutputDescriptor[Linkable] val


primitive BlockDescription[INTYPES: Linkable, OUTTYPES:Linkable]
  fun apply(promise:Promise[JObj], name':String, type':String, started':Bool, inputs': Array[Input[INTYPES]], outputs':Array[Output[OUTTYPES]] ) =>
    var inputs = JArr
    for inp in inputs'.values() do
      inputs = inputs + inp.describe()
    end
    Collector[Output[OUTTYPES],JObj](
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
