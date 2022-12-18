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
  fun apply( value:(String|I64|F64|Metric|Bool)):F64 =>
    match value
    | let v:F64 => v.f64()
    | let v:I64 => v.f64()
    | let v:Metric => v.value()
    | let v:Bool => if v then 1.0 else 0.0 end
    | let v:String => try v.f64()? else 0 end
    end

primitive ToI64
  fun apply( value:(String|I64|F64|Metric|Bool)):I64 =>
    match value
    | let v:F64 => v.i64()
    | let v:I64 => v.i64()
    | let v:Metric => v.value().i64()
    | let v:Bool => if v then 1 else 0 end
    | let v:String => try v.i64()? else 0 end
    end

primitive ToU64
  fun apply( value:(String|I64|F64|Metric|Bool)):U64 =>
    match value
    | let v:F64 => v.u64()
    | let v:I64 => v.u64()
    | let v:Metric => v.value().u64()
    | let v:Bool => if v then 1 else 0 end
    | let v:String => try v.u64()? else 0 end
    end

primitive ToBool
  fun apply(value:(String|I64|F64|Metric|Bool)):Bool =>
    match value
    | let v:Bool => v
    | let v:F64 => v != F64(0)
    | let v:Metric => v.value().f64() != F64(0)
    | let v:I64 => v != I64(0)
    | let v:String => v == "true"
    end

primitive DefaultValue
  fun apply(typ':String):(String|I64|F64|Metric|Bool) =>
    match typ'
    | "bool" => false
    | "number" => F64(0)
    | "string" => ""
    else
      F64(0)
    end
