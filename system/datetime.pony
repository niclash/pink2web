use "time"


primitive DateTime

  fun now():PosixDate val =>
    recover val
      (let s, let ns) = Time.now()
      PosixDate(s, ns)
    end
    
  fun format_iso( datetime: PosixDate val): String val =>
    try
      datetime.format("%Y-%m-%d %H:%M:%S UTC")?
    else
      // should not be possible
      "<internal error in format_iso()>"
    end
    
