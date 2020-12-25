use "collections"
use "jay"
use "../system"

trait Input is Stringable
  fun ref set( newValue: Any val)
  fun value() : Any val
  fun description() : String
  fun descriptor() : InputDescriptor
  fun ref set_description( new_description:String )
  fun describe(): JObj val
  
class InputImpl is Input
  let _name: String
  var _value: Any val
  var _description: String
  let _descriptor:InputDescriptor
  let _converter:TypeConverter box

  new create(container_name: String, descriptor':InputDescriptor, initialValue: Any val, description': String  = "", converter:TypeConverter = DefaultConverter ) =>
    _name = container_name + "." + descriptor'.name   // TODO is this the best naming system?
    _description = description'
    _descriptor = descriptor'
    _value = initialValue
    _converter = converter

  fun value() : Any val =>
    _value

  fun ref set( newValue: Any val) =>
    _value = newValue

  fun description() : String =>
    if _description == "" then 
      _descriptor.description
    else
      _description
    end

  fun descriptor() : InputDescriptor =>
    _descriptor

  fun ref set_description( new_description: String ) =>
    _description = new_description

  fun string() : String iso^ =>
    _converter.string(_value).clone()

  fun describe(): JObj val =>
    let j = JObj
      + ("id", _name)
      + ("value", string())
      + ("description", _description )
      + ("descriptor", _descriptor.describe() )
    j

class val InputDescriptor
  let name:String
  let description: String
  let typ: String
  let addressable: Bool
  let required: Bool
  
  new val create( name':String, typ':String, description':String, addressable': Bool, required': Bool ) =>
    name = name'
    description = description'
    typ = typ'
    addressable = addressable'
    required = required'
    
  fun describe() : JObj val =>
    let j = JObj
      + ("id", name)
      + ("description", description)
      + ("type", typ )
      + ("required", required)
      + ("addressable", addressable )
    j
    
