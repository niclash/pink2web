use "collections"
use "jay"
use "../system"

trait Output[TYPE: Linkable val]
  fun ref set( newValue: TYPE val )
  fun value() : this->TYPE
  fun ref connect( destBlock: Block tag, input: String )
  fun description() : String 
  fun ref set_description( new_description:String )
  fun describe(): JObj val
  
class OutputImpl[TYPE: Linkable val] is Output[TYPE]
  var _value: TYPE
  var _name: String
  var _description: String
  var _dest: List[Link[TYPE] val]
  let _descriptor: OutputDescriptor
  
  new create(container_name: String, descriptor: OutputDescriptor, initialValue: TYPE, desc: String = "") =>
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

  fun ref connect(destBlock: Block tag, input: String) =>
    var link:Link[TYPE] val = recover Link[TYPE](destBlock, input) end
    _dest.push(link)

  fun description() : String =>
    if _description == "" then 
      _descriptor.description
    else
      _description
    end

  fun ref set_description( new_description: String ) =>
    _description = new_description

  fun describe(): JObj val =>
    let json = JObj
      + ("id", _name )
      + ("description", _description)
      + ("descriptor", _descriptor.describe() )
    json
    
class val OutputDescriptor
  let name:String
  let description: String
  let typ: LinkType
  let addressable: Bool
  let required: Bool
  
  new val create( name':String, typ':LinkType, description':String, addressable': Bool, required': Bool ) =>
    name = name'
    description = description'
    typ = typ'
    addressable = addressable'
    required = required'
    
  fun describe() : JObj val =>
    let j = JObj
      + ("id", name )
      + ("description", description )
      + ("type", typ.string() )
      + ("required", required )
      + ("addressable", addressable )
    j
