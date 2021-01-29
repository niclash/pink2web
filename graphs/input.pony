use "collections"
use "jay"
use "../system"

trait Input is Stringable
  fun ref set( new_value: Any val)
  fun ref set_initial( initial_value: Any val)
  fun value() : Any val
  fun name() : String
  fun description() : String
  fun descriptor() : InputDescriptor
  fun ref set_description( new_description:String )
  fun describe(): JObj val
  fun ref subscribe( subscription:LinkSubscription )
  fun ref unsubscribe( subscription:LinkSubscription )

class InputImpl is Input
  let _name: String
  var _value: Any val
  var _initial: Any val
  var _description: String
  let _descriptor:InputDescriptor
  let _converter:TypeConverter box
  var _subscriptions: Array[LinkSubscription] = Array[LinkSubscription]

  new create(container_name: String, descriptor':InputDescriptor, initialValue: Any val, description': String  = "", converter:TypeConverter = DefaultConverter ) =>
    _name = descriptor'.name
    _description = description'
    _descriptor = descriptor'
    _value = initialValue
    _converter = converter
    _initial = None

  fun value() : Any val =>
    _value

  fun name() : String =>
    _name

  fun ref set( new_value: Any val) =>
    _value = new_value
    for subscr in _subscriptions.values() do
      subscr(new_value)
    end

  fun ref set_initial( initial_value: Any val) =>
    _value = initial_value
    _initial = initial_value

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

  fun ref subscribe( subscription:LinkSubscription ) =>
    _subscriptions.push(subscription)
    subscription(_value)

  fun ref unsubscribe( subscription:LinkSubscription ) =>
    try
      _subscriptions.delete( _subscriptions.find( subscription )? )?
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
