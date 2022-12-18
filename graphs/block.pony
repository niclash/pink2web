use "collections"
use "debug"
use "jay"
use "metric"
use "promises"
use "../collectors"
use "../system"
use "../blocktypes"

trait val BlockFactory
  fun create_block( name': String, context:SystemContext val, x:I64, y:I64): Block tag
  
  fun val block_type_descriptor(): BlockTypeDescriptor
  
  fun val describe(): JObj val

trait tag Block

  be connect( output: String, to_block: Block, to_input: String)
  
  be disconnect_block( to_block: Block, disconnects: LinkRemoveNotify )
  
  be disconnect_edge( output:String, dest_block: Block, dest_input: String, disconnects: LinkRemoveNotify )

  be set_initial(input: String, initial_value: (String|I64|F64|Metric|Bool|None))

  be update(input: String, new_value: (String|I64|F64|Metric|Bool))

  be get_input(input: String, promise:Promise[(String|I64|F64|Metric|Bool)])

  be get_output(output: String, promise:Promise[(String|I64|F64|Metric|Bool)])

  be rename( new_name: String )

  be rename_of( block: Block, old_name: String, new_name: String )

  be change( x:I64, y:I64 )
  
  be destroy(disconnects: LinkRemoveNotify)
  
  be refresh()

  be start()

  be stop()

  be stats_update()

  be name( promise: Promise[String] tag )
  
  be describe( promise: Promise[JObj] tag )
  
  be descriptor( promise: Promise[BlockTypeDescriptor] tag )

  be subscribe_link( subscription:LinkSubscription )

  be unsubscribe_link( subscription:LinkSubscription )

primitive BlockName
  fun apply( fullname: String box ): (String val, String val )? =>
    let last_index = fullname.rfind(".")?
    let blockname:String = recover fullname.substring(0, last_index) end
    let pointname:String = recover fullname.substring(last_index+1) end
    (blockname, pointname)

