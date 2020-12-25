use "promises"

class val Link
  let block: Block tag
  let input: String

  new create( dest_block': Block tag, dest_input': String ) =>
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
