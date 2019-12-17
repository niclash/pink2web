use "jay"


primitive Util
  fun _parse( n: JObj ): (String,String, (I64|NotSet))? =>
    ( _prop(n, "node")? , _prop(n,"port")?, _index(n)? )

  fun _prop(n:JObj, prop:String): String ? =>
    try
      n(prop) as String
    else
      @printf[I32](("parse error for '" + prop + "', " + n.string() + "\n").cstring())
      error
    end
    
  fun _index(n:JObj): (I64|NotSet) ? =>
    try
      n("index") as (I64|NotSet)
    else
      @printf[I32](("parse error for 'index': " + n.string() + "\n").cstring())
      error
    end
