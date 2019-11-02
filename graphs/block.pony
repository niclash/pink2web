use "collections"
use "debug"
use "jay"
use "promises"
use "../system"
use "../blocktypes"

trait val BlockFactory
  fun create_block( name: String, context:SystemContext val): Block tag
  
  fun val block_type_descriptor(): BlockTypeDescriptor
  
  fun val describe(): JObj val

trait tag Block

  be connect( output: String, to_block: Block, to_input: String)
  
  be disconnect_block( to_block: Block )
  
  be update(input: String, new_value: Linkable)

  be destroy()
  
  be refresh()

  be start()

  be stop()
  
  be describe( promise: Promise[JObj] tag )
  
  be descriptor( promise: Promise[BlockTypeDescriptor] tag )
  
primitive BlockName
  fun apply( fullname: String box ): (String val, String val )? =>
    let last_index = fullname.rfind(".")?
    let blockname:String = recover fullname.substring(0, last_index) end
    let pointname:String = recover fullname.substring(last_index+1) end
    (blockname, pointname)

