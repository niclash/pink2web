use "collections"
use "jay"
use "promises"
use "../system"

trait Output[TYPE: Linkable val]
  fun ref set( newValue: TYPE )
  fun value() : this->TYPE
  fun ref connect( dest: Block tag, input: String )
  fun ref disconnect_block( dest: Block tag )
  fun ref disconnect_edge( dest: Block tag, input: String )
  fun ref disconnect_all()
  fun description() : String 
  fun ref set_description( new_description:String )
  fun describe( promise: Promise[JObj val] tag )
  
class OutputImpl[TYPE: Linkable val] is Output[TYPE]
  var _value: TYPE
  var _name: String
  var _description: String
  var _dest: List[Link[TYPE] val]
  let _descriptor: OutputDescriptor[TYPE]
  
  new create(container_name: String, descriptor: OutputDescriptor[TYPE], initialValue: TYPE, desc: String = "") =>
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
    var link:Link[TYPE] val = recover Link[TYPE](dest_block, input) end
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

  fun describe( promise: Promise[JObj val] tag ) =>
    let promises = Array[Promise[String val] tag]
    for link in _dest.values() do
      let p = Promise[String val]
      link.describe( p )
      promises.push(p)
    end
    try
      let root = promises.pop()?
      root.join(promises.values()).next[None]( { (result:Array[String val] val) => 
        var links = JArr
        for out in result.values() do 
          links = links + out 
        end
        let j = JObj
          + ("id", _name )
          + ("value", _value.string() )
          + ("links", links )
          + ("description", _description)
          + ("descriptor", _descriptor.describe() )
        promise(j)
      })
    else
      // there were no output links
      let j = JObj
          + ("id", _name )
          + ("value", _value.string() )
          + ("links", JArr )
          + ("description", _description)
          + ("descriptor", _descriptor.describe() )
      promise(j)
    end
    
class val OutputDescriptor[A:Linkable val]
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
    initial_value = inital
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
