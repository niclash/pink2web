
primitive Num is Stringable
  fun string(): String iso^ => "number".string()
  
primitive Boolean is Stringable
  fun string(): String iso^ => "bool".string()

primitive Text is Stringable
  fun string(): String iso^ => "string".string()

type LinkType is (Num | Boolean | Text )

primitive LinkTypeList
  fun tag apply(): Array[LinkType] =>
    [Num; Boolean; Text]

type Linkable is ( Number | Bool | String )

class Link[TYPE: Linkable val]
  let block: Block tag
  let input: String
  
  new create( destBlock: Block tag, destInput: String ) =>
    block = destBlock
    input =  destInput
    
  fun update( newValue: TYPE ) =>
    block.update[TYPE](input, newValue )
    
