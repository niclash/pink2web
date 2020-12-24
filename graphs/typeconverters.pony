
interface box TypeConverter
  fun string( v:Any box): String val

primitive DefaultConverter is TypeConverter
  fun string( v:Any box): String val =>
    try
      (v as Stringable).string()
    else
      "<not stringable>"
    end

primitive ToF64
  fun apply( v:Any val): F64 val =>
    match v
    | let r: F64 => r
    | let r: String => try r.f64()? else try r.string().f64()? else F64(0) end end
    | let r: Stringable => try r.string().f64()? else F64(0) end
    else
      F64(0)
    end
