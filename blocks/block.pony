use "collections"
use "jay"
use "../system"

trait val BlockFactory
  fun create_block( name: String val, context:SystemContext val): Block tag  
  fun val block_type_descriptor(): BlockTypeDescriptor val
  fun val describe(): JObj val

trait Block is AVisitable[JObj val]

  be connect( output: String val, to_block: Block tag, to_input: String val)
  
  be update[TYPE: Linkable val](input: String val, newValue: TYPE  val)

  be refresh()

  be start()

  be stop()

trait BlockTypeDescriptor

  fun val name(): String val

  fun val description(): String val

  fun val inputs(): Array[InputDescriptor] val
  
  fun val outputs(): Array[OutputDescriptor] val

  fun val describe() : JObj val
