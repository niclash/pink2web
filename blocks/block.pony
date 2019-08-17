
interface Block

  be connect( output: String val, to_block: Block tag, to_input: String val)
  
  be update[TYPE: Any val](input: String val, newValue: TYPE  val)

  be refresh()
