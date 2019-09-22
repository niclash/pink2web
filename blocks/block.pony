use "collections"
use "jay"
use "promises"
use "../system"
use "../blocktypes"

trait val BlockFactory
  fun create_block( name: String, context:SystemContext val): Block tag  
  fun val block_type_descriptor(): BlockTypeDescriptor
  fun val describe(): JObj val

trait Block

  be connect( output: String, to_block: Block tag, to_input: String)
  
  be update[TYPE: Linkable val](input: String, newValue: TYPE  val)

  be refresh()

  be start()

  be stop()
  
  be describe( promise: Promise[JObj] tag )
  
  be descriptor( promise: Promise[BlockTypeDescriptor] tag )
  

