use "collections"
use "json"
use "logger"
use "../blocks"

actor AddBlock is Block
  let _input1: Input[F64] ref
  let _input2: Input[F64] ref
  let _output: Output[F64] ref
  let _name: String val
  let _log:Logger[String] 
  var _started:Bool = false
  
  new create(name: String, logger:Logger[String] ) =>
    logger(Fine) and logger.log("create("+name+")")
    _name = name
    _log = logger
    _input1 = InputImpl[F64]( name + ".input1", 0.0, "Input 1")
    _input2 = InputImpl[F64]( name + ".input2", 0.0, "Input 2")
    _output = OutputImpl[F64](name + ".output", 0.0, "Output")

  be start() =>
    _log(Fine) and _log.log("start()")
    _started = true
    
  be stop() =>
    _log(Fine) and _log.log("stop()")
    _started = false
    
  be connect( output: String val, to_block: Block tag, to_input: String val) =>
    if output == "output"  then
      _output.connect(to_block, to_input)
    end
    refresh()

  be update[TYPE: Any val](input: String val, newValue: TYPE  val) =>
    _log(Fine) and _log.log("update()")
    match newValue
    | let v: F64 => 
        if input == "input1" then _input1.set( v ) end
        if input == "input2" then _input2.set( v ) end
    end
    refresh()

  be refresh() =>
    _log(Fine) and _log.log("refresh()")
    if _started then
      let value : F64 val = _input1.value() + _input2.value()
      _output.set( value )
    end
    
  be visit( lambda:{ (JsonType) } val ) =>
    _log(Fine) and _log.log("visit")
    var json:JsonObject = JsonObject
    json.data("name") = _name
    json.data("started") = _started
    json.data("input1") = _input1.to_json()
    json.data("input2") = _input2.to_json()
    json.data("output") = _output.to_json()
    lambda( json )
    
class AddBlockFactory is BlockFactory
  fun createBlock( name: String val, logger:Logger[String]  ):Block tag =>
    logger(Fine) and logger.log("create Add")
    AddBlock( name, logger )
    
  fun describe() : JsonObject ref^ =>
    var json = JsonObject
    let inp = JsonArray
    inp.data.push( port("input1", "number", "input 1", false, false ) )
    inp.data.push( port("input2", "number", "input 2", false, false ) )
    let outp = JsonArray
    outp.data.push( port("output", "number", "output", false, false ) )
    json.data("name") = "add"
    json.data("description") = "[output] = [input1] + [input2]"
    json.data("subgraph") = false
    json.data("icon") = "plus"
    json.data("inports") = inp
    json.data("outports") = outp
    json

  fun port( id: String, typ: String, description:String, addressable:Bool, required:Bool ): JsonObject ref^ =>
    let json = JsonObject
    json.data("id") = id
    json.data("type") = typ
    json.data("description") = description
    json.data("addressable") = addressable
    json.data("required") = required
    json
