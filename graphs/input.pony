use "collections"
use "jay"
use "../system"

trait Input[TYPE: Linkable val]
  fun ref set( newValue: TYPE)
  fun value() : this->TYPE
  fun description() : String
  fun descriptor() : InputDescriptor[TYPE]
  fun ref set_description( new_description:String )
  fun describe(): JObj val
  
class InputImpl[TYPE: Linkable val] is Input[TYPE]
  let _name: String
  var _value: TYPE
  var _description: String
  let _descriptor:InputDescriptor[TYPE]
  
  new create(container_name: String, descriptor':InputDescriptor[TYPE], initialValue: TYPE, description': String  = "") =>
    _name = container_name + "." + descriptor.name   // TODO is this the best naming system?
    _description = description'
    _descriptor = descriptor'
    _value = consume initialValue

  fun value() : this->TYPE =>
    _value

  fun ref set( newValue: TYPE) =>
    _value = consume newValue

  fun description() : String =>
    if _description == "" then 
      _descriptor.description
    else
      _description
    end

  fun ref set_description( new_description: String ) =>
    _description = new_description
    
  fun descriptor() : InputDescriptor[TYPE] => _descriptor

  fun describe(): JObj val =>
    let j = JObj
      + ("id", _name)
      + ("value", _value.string())
      + ("description", _description )
      + ("descriptor", _descriptor.describe() )
    j

class val InputDescriptor[A:Linkable val]
  let name:String
  let description: String
  let typ: LinkType
  let initial_value: A
  let addressable: Bool
  let required: Bool
  
  new val create( name':String, typ':LinkType, description':String, initial:A, addressable': Bool, required': Bool ) =>
    name = name'
    description = description'
    typ = typ'
    initial_value = initial
    addressable = addressable'
    required = required'
    
  fun describe() : JObj val =>
    let j = JObj
      + ("id", name)
      + ("description", description)
      + ("type", typ.string() )
      + ("initial", initial_value.string() )
      + ("required", required)
      + ("addressable", addressable )
    j
    
