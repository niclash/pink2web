use "collections"
use "json"

interface Output[TYPE: Any val] is ToJson
  fun ref set( newValue: TYPE val )
  fun value() : this->TYPE
  fun ref connect(destBlock: Block tag, input: String val)
  fun description() : String val

class OutputImpl[TYPE: Any val] 
  var _value: TYPE
  var _name: String val
  var _description: String val
  var _dest: List[Link[TYPE] val] ref
  
  new create(name: String val, initialValue: TYPE, desc: String val) =>
    _name = name
     _description = desc
   _value = initialValue
    _dest = List[Link[TYPE] val]

  fun value() : this->TYPE =>
    _value
    
  fun ref set( newValue: TYPE val ) =>
    for dest in _dest.values() do
      dest.update( newValue )
    end
    _value = newValue

  fun ref connect(destBlock: Block tag, input: String val) =>
    var link:Link[TYPE] val = recover Link[TYPE](destBlock, input) end
    _dest.push(link)

  fun description() : String val =>
    _description

  fun to_json() : JsonObject ref^ =>
    var json:JsonObject = JsonObject
    json.data("name") = _name
    json.data("description") = _description
    json
