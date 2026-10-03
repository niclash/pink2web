
use "jay"
use "promises"
use "../system"

/*
  A Port is a gateway to/from other Graphs from/to 'this' Graph.

  They essentially behave like a Block on the inside, and behaves like a Port on a Block, viewed from
  the outside, for instance imagining a Graph to be a Block.
*/

actor Port is (Connectable & Updateable)
  var _name:String
  let _context:SystemContext
  var _dest_node:(Updateable | None) = None
  var _dest_port:String = ""
  let _output:OutputImpl
  let _x:F64
  let _y:F64

  new create(name': String, context:SystemContext, x:F64, y:F64 ) =>
    context(Fine) and context.log(Fine, "create port: "+name')
    _name = name'
    _context = context
    _x = x
    _y = y
    _output = OutputImpl(_name, OutputDescriptor("out", "link", ""))

  be describe( desc:Promise[JObj] ) =>
    match _dest_node
    | let d:Updateable =>
        let promise = Promise[String]
        promise.next[None]( { (node_name) =>
          var result = JObj
          result = result + ("name", _name)
          result = result + ("node", node_name)
          result = result + ("port", _dest_port)
          desc( result )
        })
        d.name( promise )
    end

  be connect( output: String, to_block: Updateable, to_input: String) =>
    _dest_node = to_block
    _dest_port = to_input
    _output.connect(to_block, to_input)

  be disconnect_edge( output:String, dest_block: Updateable, dest_input: String, disconnects: LinkRemoveNotify ) =>
    if dest_block is _dest_node then
      if dest_input == _dest_port then
        _output.disconnect_edge( dest_block, dest_input, disconnects )
      end
    end

  be disconnect_edge_raw( disconnects: LinkRemoveNotify ) =>
    match _dest_node
    | let node:Updateable =>
        _output.disconnect_edge( node, _dest_port, disconnects )
    | None => None
    end

  be disconnect_block( to_block: Updateable, disconnects: LinkRemoveNotify ) =>
    _output.disconnect_block( to_block, disconnects )

  be update(input: String, new_value: Linkable) =>
    _output.set(new_value)

  be name( promise: Promise[String] tag ) =>
    promise(_name)

  be rename_to(new_name:String) =>
    _name = new_name