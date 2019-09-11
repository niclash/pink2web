use "json"

interface Input[TYPE: Linkable val]  is ToJson
  fun ref set( newValue: TYPE)
  fun value() : this->TYPE
  fun description() : String val =>
    ""

class InputImpl[TYPE: Linkable val]
  var _name: String val
  var _value: TYPE
  var _description: String val
  let _descriptor:InputDescriptor[TYPE] val
  
  new create(container_name: String val, descriptor:InputDescriptor[TYPE] val, initialValue: TYPE, description': String val  = "") =>
    _name = container_name + "." + descriptor.name()   // TODO is this the best naming system?
    _description = description'
    _descriptor = descriptor
    _value = consume initialValue

  fun value() : this->TYPE =>
    _value

  fun ref set( newValue: TYPE) =>
    _value = consume newValue

  fun description() : String val =>
    if _description == "" then 
      _descriptor.description
    else
      _description
    end

  fun to_json() : JsonObject ref^ =>
    JsonObject

class val InputDescriptor[TYPE]
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
