use "collections"
use "json"

interface Output[TYPE: Linkable val] is ToJson
  fun ref set( newValue: TYPE val )
  fun value() : this->TYPE
  fun ref connect(destBlock: Block tag, input: String val)
  fun description() : String val

class OutputImpl[TYPE: Linkable val] 
  var _value: TYPE
  var _name: String val
  var _description: String val
  var _dest: List[Link[TYPE] val] ref
  let _descriptor: OutputDescriptor[TYPE] val
  
  new create(container_name: String val, descriptor: OutputDescriptor[TYPE] val, initialValue: TYPE, desc: String val = "") =>
    _name = container_name + "." + descriptor.name  // TODO is this the best naming system?
    _description = desc
    _descriptor = descriptor
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
    if _description == "" then 
      _descriptor.description
    else
      _description
    end

  fun to_json() : JsonObject ref^ =>
    var json:JsonObject = JsonObject
    json.data("name") = _name
    json.data("description") = _description
    json

class val OutputDescriptor[TYPE: Linkable val]
  let name:String val
  let description: String val
  let typ: String val
  let addressable: Bool
  let required: Bool
  
  new create( name':String val, typ':String val, description':String val, addressable': Bool, required': Bool ) =>
    name = name'
    description = description'
    typ = typ'
    addressable = addressable'
    required = required'
    
  fun describe() : JsonObject =>
    let json = JsonObject
    json.data("id") = name
    json.data("description") = description
    json.data("type" ) = typ
    json.data("required" ) = required
    json.data("addressable" ) = addressable
    json
