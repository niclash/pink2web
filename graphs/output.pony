use "debug"
use "collections"
use "jay"
use "promises"
use "../system"

trait Output is Stringable
  fun ref set( newValue: Any val )
  fun value() : Any val
  fun ref connect( dest: Block tag, input: String )
  fun ref disconnect_block( dest: Block tag, disconnects: LinkRemoveNotify )
  fun ref disconnect_edge( dest: Block tag, input: String, disconnects: LinkRemoveNotify )
  fun ref disconnect_all(disconnects: LinkRemoveNotify)
  fun name(): String val
  fun description() : String 
  fun descriptor() : OutputDescriptor
  fun ref set_description( new_description:String )
  fun describe( promise: Promise[JObj val] tag )

class OutputImpl is Output
  var _value: Any val
  var _name: String val
  var _description: String
  var _dest: List[Link]
  let _descriptor: OutputDescriptor
  let _converter:TypeConverter box

  new create(container_name: String, descriptor': OutputDescriptor, initialValue: Any val, desc: String = "", converter:TypeConverter = DefaultConverter) =>
    _name = container_name + "." + descriptor'.name  // TODO is this the best naming system?
    _description = desc
    _descriptor = descriptor'
    _value = initialValue
    _dest = List[Link val]
    _converter = converter

  fun name() : String val =>
    _name

  fun value() : Any val=>
    _value
    
  fun ref set( new_value: Any val ) =>
    for dest in _dest.values() do
      dest.update( new_value )
    end
    _value = new_value

  fun ref connect(dest_block: Block tag, input: String) =>
    var link:Link val = recover Link(dest_block, input) end
    _dest.push(link)

  fun ref disconnect_block( dest: Block, disconnects: LinkRemoveNotify ) =>
    for node in _dest.nodes() do
      try
        let link = node()?
        if dest is link.block then
          let parts = _name.split(".")
          let src_block = parts(0)?
          let src_port = parts(1)?
          let p = Promise[String]
          p.next[None]( { (dest_block) =>
            Debug.out( _name + ".disconnect_block(" + dest_block + "." + link.input + ")" )
            let linkref:LinkReference val = LinkReference(src_block,src_port,dest_block,link.input)
            disconnects(linkref)
          })
          dest.name(p)
          node.remove()
        end
      else
        Debug.out( "Output.disconnect_block: Invalid name: " + _name )
      end
    else
      Debug.out( "Output.disconnect_block: No destinations!" )
    end

  fun ref disconnect_all(disconnects: LinkRemoveNotify) =>
    Debug.out( _name + ".disconnect_all()" )
    for node in _dest.nodes() do
      try
        let link = node()?
        let parts = _name.split( "." )
        let src_block = parts(0)?
        let src_port = parts(1)?
        let p = Promise[String]
        p.next[None]( { (dest_block) =>
          Debug.out( "Output: src_block=" + src_block + ", src_port=" + src_port )
          disconnects( LinkReference( src_block, src_port, dest_block, link.input ) )
        })
        link.block.name(p)
        node.remove()
      else
        Debug.out( "Invalid name: " + _name )
      end
    else
      Debug.out( "Output.disconnect_all: No destinations!" )
    end

  fun ref disconnect_edge( dest: Block, input: String, disconnects: LinkRemoveNotify ) =>
    Debug.out( _name + ".disconnect_edge( dest" + "," + input + ")" )
    for node in _dest.nodes() do
      try
        let n = node()?
        if (dest is n.block) and (input == n.input) then
          let parts = _name.split(".")
          let src_block = parts(0)?
          let src_port = parts(1)?
          let p = Promise[String]
          p.next[None]( { (dest_block) =>
            Debug.out( "Output: src_block=" + src_block + ", src_port=" + src_port )
            disconnects( LinkReference(src_block,src_port,dest_block,input) )
          })
          dest.name(p)
          node.remove()
        end
      else
        Debug.out( "Output.disconnect_edge: What is wrong?" )
      end
    end

  fun description() : String =>
    if _description == "" then 
      _descriptor.description
    else
      _description
    end

  fun descriptor() : OutputDescriptor =>
    _descriptor

  fun ref set_description( new_description: String ) =>
    _description = new_description

  fun string() : String iso^ =>
    _converter.string(_value).clone()

  fun describe( promise: Promise[JObj val] tag ) =>
    let promises = Array[Promise[String val] tag]
    for link in _dest.values() do
      let p = Promise[String val]
      link.describe( p )
      promises.push(p)
    end
    try
      let root = promises.pop()?
      let value':String val = string()
      root.join(promises.values()).next[None]( { (result:Array[String val] val) => 
        var links = JArr
        for out in result.values() do 
          links = links + out 
        end
        let j = JObj
          + ("id", _name )
          + ("value", value' )
          + ("links", links )
          + ("description", _description)
          + ("descriptor", _descriptor.describe() )
        promise(j)
      })
    else
      // there were no output links
      let j = JObj
          + ("id", _name )
          + ("value", string() )
          + ("links", JArr )
          + ("description", _description)
          + ("descriptor", _descriptor.describe() )
      promise(j)
    end
    
class val OutputDescriptor
  let name:String
  let description: String
  let taip: String
  let addressable: Bool
  let source:String  // for NestedBlocks only

  new val create( name':String, typ':String, description':String, addressable': Bool = false, source':String="" ) =>
    name = name'
    description = description'
    taip = typ'
    addressable = addressable'
    source = source'

  fun describe() : JObj val =>
    let j = JObj
      + ("id", name )
      + ("description", description )
      + ("type", taip.string() )
      + ("addressable", addressable )
    j
