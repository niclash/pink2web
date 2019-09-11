
type Linkable is ( Number | Bool | String )

class Link[TYPE: Linkable val]
  let block: Block tag
  let input: String val
  
  new create( destBlock: Block tag, destInput: String val) =>
    block = destBlock
    input =  destInput
    
  fun update( newValue: TYPE ) =>
    block.update[TYPE](input, newValue )
    
