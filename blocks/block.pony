use "json"

interface Block is JsonVisitable

  be connect( output: String val, to_block: Block tag, to_input: String val)
  
  be update[TYPE: Linkable val](input: String val, newValue: TYPE  val)

  be refresh()

  be start()

  be stop()

trait BlockTypeDescriptor

fun name(): String

fun description(): String

fun inputs(): Array[InputDescriptor[Any val] val] val

fun outputs(): Array[OutputDescriptor[Any val] val] val

fun describe() : JsonObject ref^ =>
  var json = JsonObject
  let inp = JsonArray
  json.data("name") = name()
  json.data("description") = description()
  for input in inputs().values() do 
    inp.data.push(input.describe())
  end
  let outp = JsonArray
  for output in outputs().values() do 
    outp.data.push(output.describe())
  end
  json.data("subgraph") = false
  json.data("icon") = "plus"
  json.data("inports") = inp
  json.data("outports") = outp
  json
