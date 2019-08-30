use "json"

interface Input[TYPE: Any val]  is ToJson
  fun ref set( newValue: TYPE)
  fun value() : this->TYPE
  fun description() : String val =>
    ""

class InputImpl[TYPE: Any val]
  var _name: String val
  var _value: TYPE
  var _description: String val

  new create(name: String val, initialValue: TYPE, descr: String val) =>
    _name = name
    _description = descr
    _value = consume initialValue

  fun value() : this->TYPE =>
    _value

  fun ref set( newValue: TYPE) =>
    _value = consume newValue

  fun description() : String val =>
    _description

  fun to_json() : JsonObject ref^ =>
    JsonObject
