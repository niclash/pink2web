
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

type Linkable is ( Number | Bool | String )

class Link[TYPE: Linkable val]
  let block: Block tag
  let input: String
  
  new create( destBlock: Block tag, destInput: String ) =>
    block = destBlock
    input =  destInput
    
  fun update( new_value: Linkable ) =>
    block.update(input, new_value )
  
  fun describe(): (String,Block tag) =>
    (input, block)
