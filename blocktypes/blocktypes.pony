use "collections"
use "promises"
use "jay"
use "../blocks"
use "../system"

class val BlockTypes
  let _types: Map[String,BlockFactory] val
  let _context:SystemContext
  let _dummy: BlockFactory val
  
  new val create(context: SystemContext) =>
    _context = context
    _dummy = recover DummyFactory end
    _types = recover 
      let types = Map[String,BlockFactory]
      types("Add") = AddBlockFactory
      types("Assertion") = AssertionFactory
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
  
  fun val input( index: U32 ): InputDescriptor val

  fun val output( index: U32 ): OutputDescriptor val

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
      + ("inports", inps)
      + ("outports", outps )
    json6
