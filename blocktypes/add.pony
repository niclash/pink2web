use "logger"

actor AddBlock is Block
  let _input1: Input[F64] ref
  let _input2: Input[F64] ref
  let _output: Output[F64] ref
  let _name: String val
  
  new create(name: String, log:Logger[String val] val) =>
    _name = name
    _input1 = InputImpl[F64]( name + ".input1", 0.0, log)
    _input2 = InputImpl[F64]( name + ".input2", 0.0, log)
    _output = OutputImpl[F64](name + ".output", 0.0, log)

  be connect( output: String val, to_block: Block tag, to_input: String val) =>
    if output == "output"  then
      _output.connect(to_block, to_input)
    end
    refresh()

  be update[TYPE: Any val](input: String val, newValue: TYPE  val) =>
    match newValue
    | let v: F64 => 
        if input == "input1" then _input1.set( v ) end
        if input == "input2" then _input2.set( v ) end
    end
    refresh()

  be refresh() =>
    let value : F64 val = _input1.value() + _input2.value()
    _output.set( value )
    
