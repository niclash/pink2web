use "promises"
use "pony-metric"

primitive PNum is Stringable
  fun string(): String iso^ => "number".string()
  
primitive PBoolean is Stringable
  fun string(): String iso^ => "bool".string()

primitive PText is Stringable
  fun string(): String iso^ => "string".string()

type LinkType is (PNum | PBoolean | PText )

primitive LinkTypeList
  fun tag apply(): Array[LinkType] =>
    [PNum; PBoolean; PText]

type Linkable is ( Metric | F64 | Bool | String )

class Link[TYPE: Linkable val]
  let block: Block tag
  let input: String
  
  new create( dest_block: Block tag, dest_input: String ) =>
    block = dest_block
    input = dest_input
    
  fun update( new_value: Linkable ) =>
    block.update(input, new_value )
  
  fun describe( promise: Promise[String] tag ) =>
    let p = Promise[String]
    p.next[None]( { (name: String) =>
      promise( name + "." + input )
    })
    block.name(p)
