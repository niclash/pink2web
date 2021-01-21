use "promises"
use "../system"

class val Link
  let block:Block
  let input:String

  new create( dest_block':Block, dest_input':String ) =>
    block = dest_block'
    input = dest_input'

  fun update( new_value: Any val ) =>
    block.update(input, new_value )
  
  fun describe( promise: Promise[String] tag ) =>
    let p = Promise[String]
    p.next[None]( { (name: String) =>
      promise( name + "." + input )
    })
    block.name(p)

interface val LinkNotify
  fun val apply( graph:String, subscription:LinkSubscription, new_value:Any val )

class val LinkSubscription is Stringable
  let src_block_name:String
  let src_port:String
  let dest_block_name:String
  let dest_port:String
  let _callback:LinkNotify
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
    _callback = callback'

  fun val apply( new_value:Any val) =>
    _callback( graph, this, new_value )

  fun box string(): String iso^ =>
    ("[" + src_block_name + "." + src_port + "==>" + dest_block_name + "." + dest_port + "]").clone()