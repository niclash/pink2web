use "logger"

interface Input[TYPE: Any val]
  fun ref set( newValue: TYPE)
  fun value() : this->TYPE


class InputImpl[TYPE: Any val]
  var _name: String val
  var _value: TYPE
  var _log: Logger[String] val

  new create(name: String val, initialValue: TYPE, logger:Logger[String val] val) =>
    _name = name
    _value = consume initialValue
    _log = logger

  fun value() : this->TYPE =>
    _value

  fun ref set( newValue: TYPE) =>
    match newValue
    |
        let v:Stringable => _log(Fine) and _log.log( _name + " = " + v.string() )
    else
        _log(Fine) and _log.log( _name + " = <non-printable value>" )
    end
    _value = consume newValue

