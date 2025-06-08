use "collections"
use "../../system"

actor ColibriPt1000 is ColibriExpansionCard
  let _listeners:List[ColibriExpansionCardNotify] = List[ColibriExpansionCardNotify]
  let _context:SystemContext
  let _revision:U16
  let _slot:U8

  new create(slot:U8, revision:U16, config:Array[U8] val,context:SystemContext) =>
    _slot = slot
    _context = context
    _revision = revision

  be add_listener( listener:ColibriExpansionCardNotify ) =>
    _listeners.push( listener )

  be remove_listener( listener':ColibriExpansionCardNotify ) =>
    for listener in _listeners.nodes() do
      try
        if listener()? is listener' then
          listener.remove()
        end
      end
    end

  be update() =>
    let value:Linkable = _update()
    for listener in _listeners.values() do
      listener.notify(value)
    end

  fun _update(): Linkable =>
    F64(0)

