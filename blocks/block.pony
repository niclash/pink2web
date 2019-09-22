use "collections"
use "jay"
use "../system"

trait val BlockFactory
  fun create_block( name: String, context:SystemContext val): Block tag  
  fun val block_type_descriptor(): BlockTypeDescriptor val
  fun val describe(): JObj val

trait Block is AVisitable[JObj val]

  be connect( output: String, to_block: Block tag, to_input: String)
  
  be update[TYPE: Linkable val](input: String, newValue: TYPE  val)

  be refresh()

  be start()

  be stop()

trait BlockTypeDescriptor

  fun val name(): String

  fun val description(): String

  fun val inputs(): Array[InputDescriptor] val
  
  fun val outputs(): Array[OutputDescriptor] val

  fun val describe() : JObj val
