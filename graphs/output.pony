use "collections"
use "jay"
use "../system"

trait Output[TYPE: Linkable val]
  fun ref set( newValue: TYPE val )
  fun value() : this->TYPE
  fun ref connect( dest: Block tag, input: String )
  fun ref disconnect_block( dest: Block tag )
  fun ref disconnect_edge( dest: Block tag, input: String )
  fun ref disconnect_all()
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

  fun ref connect(dest_block: Block tag, input: String) =>
    var link:Link[TYPE] val = recover Link[TYPE]( dest_block, input ) end
    _dest.push(link)

  fun ref disconnect_block( dest: Block ) =>
    for node in _dest.nodes() do
      try
        if dest is node()?.block then
          node.remove()
        end
      end
    end
    
  fun ref disconnect_all() =>
    _dest.clear()

  fun ref disconnect_edge( dest: Block, input: String ) =>
    for node in _dest.nodes() do
      try
        let n = node()?
        if (dest is n.block) and (input == n.input) then
          node.remove()
        end
      end
    end
  
    
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
