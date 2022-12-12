use "metric"

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
  fun apply( value:Any val):F64 =>
    match value
    | let v:Float => v.f64()
    | let v:Signed => v.f64()
    | let v:Metric => v.value()
    | let v:Bool => if v then 1.0 else 0.0 end
    | let v:String => try v.f64()? else 0 end
    else
      0
    end

primitive ToI64
  fun apply( value:Any val):I64 =>
    match value
    | let v:Float => v.i64()
    | let v:Signed => v.i64()
    | let v:Metric => v.value().i64()
    | let v:Bool => if v then 1 else 0 end
    | let v:String => try v.i64()? else 0 end
    else
      0
    end

primitive ToU64
  fun apply( value:Any val):U64 =>
    match value
    | let v:Float => v.u64()
    | let v:Signed => v.u64()
    | let v:Metric => v.value().u64()
    | let v:Bool => if v then 1 else 0 end
    | let v:String => try v.u64()? else 0 end
    else
      0
    end

primitive ToBool
  fun apply(value:Any val):Bool =>
    match value
    | let v:Bool => v
    | let v:F64 => v != F64(0)
    | let v:Metric => v.value().f64() != F64(0)
    | let v:U64 => v != U64(0)
    | let v:I64 => v != I64(0)
    | let v:F32 => v != F32(0)
    | let v:String => v == "true"
    else
      false
    end
