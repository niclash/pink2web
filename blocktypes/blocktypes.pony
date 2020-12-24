use "collections"
use "debug"
use "promises"
use "jay"
use "./math"
// use "./advanced"
// use "./timing"
// use "./process"
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
      _Helper._add_component(AddBlockFactory,types)
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
    var json6 = JObj
      + ("name", name() )
      + ("description", description() )
      + ("subgraph", false )
      + ("icon", "plus" )
      + ("inPorts", inps)
      + ("outPorts", outps )
    json6

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
