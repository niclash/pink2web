use "collections"
use "logger"

interface Output[TYPE: Any val] 
  fun ref set( newValue: TYPE val )
  fun value() : this->TYPE
  fun ref connect(destBlock: Block tag, input: String val)

class OutputImpl[TYPE: Any val] 
  var _value: TYPE
  var _name: String val
  var _dest: List[Link[TYPE] val] ref
  var _log: Logger[String] val
  
  new create(name: String val, initialValue: TYPE, logger:Logger[String val] val) =>
    _name = name
    _value = initialValue
    _dest = List[Link[TYPE] val]
    _log = logger

  fun value() : this->TYPE =>
    _value
    
  fun ref set( newValue: TYPE val ) =>
    match newValue
    |
        let v:Stringable => _log(Fine) and _log.log( _name + " = " + v.string() )
    end
    for dest in _dest.values() do
      dest.update( newValue )
      _log(Fine) and _log.log( _name + " send!"  )
    end
    _value = newValue

  fun ref connect(destBlock: Block tag, input: String val) =>
    _log(Fine) and _log.log( _name + " connect to " + input )
    var link:Link[TYPE] val = recover Link[TYPE](destBlock, input) end
    _dest.push(link)

