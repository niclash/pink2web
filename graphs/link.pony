use "metric"
use "promises"
use "../system"

class val LinkReference
  let src_block: String val
  let src_port: String val
  let dest_block: String val
  let dest_port: String val

  new val create( src_block': String val, src_port': String val, dest_block': String val, dest_port': String val ) =>
    src_block = src_block'
    src_port = src_port'
    dest_block = dest_block'
    dest_port = dest_port'

interface val LinkRemoveNotify
  fun apply( link: LinkReference val )

class val Link
  let block:Block
  let input:String

  new create( dest_block':Block, dest_input':String ) =>
    block = dest_block'
    input = dest_input'

  fun update( new_value: (String|I64|F64|Metric|Bool) ) =>
    block.update(input, new_value )
  
  fun describe( promise: Promise[String] tag ) =>
    let p = Promise[String]
    p.next[None]( { (name: String) =>
      promise( name + "." + input )
    })
    block.name(p)

interface val LinkNotify
  fun val apply( graph:String, subscription:LinkSubscription, new_value:(String|I64|F64|Metric|Bool) )

class val LinkSubscription is Stringable
  let src_block_name:String
  let src_port:String
  let dest_block_name:String
  let dest_port:String
  let callback:LinkNotify
  let graph:String

  new val create( graph':String,
                  src_block_name':String, src_port':String,
                  dest_block_name':String, dest_port':String,
                  callback':LinkNotify) =>
    src_block_name = src_block_name'
    src_port = src_port'
    dest_block_name = dest_block_name'
    dest_port = dest_port'
    graph = graph'
    callback = callback'

  fun val apply( new_value:(String|I64|F64|Metric|Bool)) =>
    callback( graph, this, new_value )

  fun box string(): String iso^ =>
    ("[" + src_block_name + "." + src_port + "==>" + dest_block_name + "." + dest_port + "]").clone()
