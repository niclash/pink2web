use "collections"
use "metric"
use "../../system"

actor Link2WebPt1000 is ExpansionCard
  let _listeners:List[ExpansionCardListener] = List[ExpansionCardListener]
  let _context:SystemContext
  let _revision:U16
  let _slot:U8

  new create(slot:U8, revision:U16, config:Array[U8] val,context:SystemContext) =>
    _slot = slot
    _context = context
    _revision = revision

  be add_listener( listener:ExpansionCardListener ) =>
    _listeners.push( listener )

  be remove_listener( listener':ExpansionCardListener ) =>
    for listener in _listeners.nodes() do
      try
        if listener()? is listener' then
          listener.remove()
        end
      end
    end

  be update() =>
    let value:(String|I64|F64|Metric|Bool) = _update()
    for listener in _listeners.values() do
      listener.notify(value)
    end

  fun _update(): (String|I64|F64|Metric|Bool) =>
    F64(0)

