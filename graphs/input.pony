use "collections"
use "debug"
use "jay"
use "metric"
use "../system"

trait Input is Stringable
  fun ref set( new_value: (String|I64|F64|Metric|Bool))
  fun ref set_initial( initial_value: (String|I64|F64|Metric|Bool|None))
  fun value() : (String|I64|F64|Metric|Bool)
  fun name() : String
  fun description() : String
  fun descriptor() : InputDescriptor
  fun ref rename_of_block( block: Block, old_name: String, new_name: String )
  fun ref set_description( new_description:String )
  fun describe(): JObj val
  fun ref subscribe( subscription:LinkSubscription )
  fun ref unsubscribe( subscription:LinkSubscription )

class InputImpl is Input
  let _name: String
  var _value: (String|I64|F64|Metric|Bool)
  var _initial: (String|I64|F64|Metric|Bool|None)
  var _description: String
  let _descriptor:InputDescriptor
  let _converter:TypeConverter box
  var _subscriptions: List[LinkSubscription] = List[LinkSubscription]

  new create(container_name: String, descriptor':InputDescriptor, description': String  = "", converter:TypeConverter = DefaultConverter ) =>
    _name = descriptor'.name
    _description = description'
    _descriptor = descriptor'
    _value = DefaultValue(descriptor'.typ)
    _converter = converter
    _initial = None

  fun value() : (String|I64|F64|Metric|Bool) =>
    _value

  fun name() : String =>
    _name

  fun ref set( new_value: (String|I64|F64|Metric|Bool)) =>
    _value = new_value
    for subscr in _subscriptions.values() do
      subscr(new_value)
    end

  fun ref set_initial( initial_value: (String|I64|F64|Metric|Bool|None)) =>
    match initial_value
    | None =>
      _value = DefaultValue(_descriptor.typ)
      _initial = None
    | let init:(String|I64|F64|Metric|Bool) =>
      _value = init
      _initial = init
    end

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
      + ("initial", _converter.string(_initial).clone())
      + ("description", _description )
      + ("descriptor", _descriptor.describe() )
    j

  fun ref rename_of_block( block: Block, old_name: String, new_name: String ) =>
    for node in _subscriptions.nodes() do
      try
        let sub = node()?
        Debug.out("subscription: " + sub.string())
        if sub.src_block_name == old_name then
          let new_subscription = LinkSubscription( sub.graph, new_name, sub.src_port, sub.dest_block_name, sub.dest_port, sub.callback )
          node.update( new_subscription )?
        end
        if sub.dest_block_name == old_name then
          let new_subscription = LinkSubscription( sub.graph, sub.src_block_name, sub.src_port, new_name, sub.dest_port, sub.callback )
          node.update( new_subscription )?
        end
      end
    end

  fun ref subscribe( subscription:LinkSubscription ) =>
    _subscriptions.push(subscription)
    subscription(_value)

  fun ref unsubscribe( subscription:LinkSubscription ) =>
    try
      for node in _subscriptions.nodes() do
        if node()? is subscription then
          node.remove()
        end
      end
    end

class val InputDescriptor
  let name:String
  let description: String
  let typ: String
  let addressable: Bool
  let target:String // for NestedBlocks only

  new val create( name':String, typ':String, description':String, addressable': Bool = false, target':String="" ) =>
    name = name'
    description = description'
    typ = typ'
    addressable = addressable'
    target=target'

  fun describe() : JObj val =>
    let j = JObj
      + ("id", name)
      + ("description", description)
      + ("type", typ )
      + ("addressable", addressable )
    j
