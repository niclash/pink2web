
class _Logger
  var _level:LogLevel
  let _stdout: OutStream
  let _stderr: OutStream

  new create(  stdout: OutStream, stderr: OutStream, level:LogLevel ) =>
    _stdout = stdout
    _stderr = stderr
    _level = level

  fun ref set_log_level(level':LogLevel) =>
    _level = level'

  fun box apply(level: LogLevel) : Bool val =>
    level() >= _level()

  fun box log( level:LogLevel, value:String, loc:SourceLoc val = __loc): Bool =>
    if level() >= Error() then
      _stderr.print(LogFormatter(consume value, level, loc))
    else
      _stdout.print(LogFormatter(consume value, level, loc))
    end
    true

type LogLevel is
  ( Fine
  | Info
  | Warn
  | Error
  )

primitive Fine is Stringable
  fun apply(): U32 => 0
  fun string():String iso^ => "Fine".clone()

primitive Info is Stringable
  fun apply(): U32 => 1
  fun string():String iso^ => "Info".clone()

primitive Warn is Stringable
  fun apply(): U32 => 2
  fun string():String iso^ => "Warn".clone()

primitive Error is Stringable
  fun apply(): U32 => 3
  fun string():String iso^ => "Error".clone()

primitive LogFormatter
  fun apply(msg: String, level:LogLevel, loc: SourceLoc): String =>
    var file_name: String = loc.file()
    try
      let last_slash = file_name.rfind("/")?
      file_name = file_name.substring(last_slash+1)
    end
    let file_linenum: String  = loc.line().string()
    let file_linepos: String  = loc.pos().string()

    (recover String(file_name.size()
      + file_linenum.size()
      + file_linepos.size()
      + msg.size()
      + 4)
    end)
     .> append(file_name)
     .> append(":")
     .> append(file_linenum)
     .> append(":")
     .> append(file_linepos)
     .> append(": ")
     .> append(msg)
