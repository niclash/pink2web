use "files"
use "jennet"
use "../mail"
use "valbytes"

use "../system"

class val _ContactRequest is RequestHandler
  let _logfile: FilePath
  let _ackfile: FilePath
  let _auth: AmbientAuth

  new val create(logfile': String, ackfile': String, auth:AmbientAuth)? =>
    _logfile = FilePath(auth, logfile', recover val FileCaps+FileRemove+FileCreate+FileLookup+FileWrite+FileSeek+FileRead+FileSync+FileStat end)?
    _ackfile = FilePath(auth, ackfile', recover val FileCaps+FileRead+FileStat end)?
    _auth = auth

  fun val apply(ctx: Context): Context iso^ =>
    let body:ByteArrays = ctx.body
    let query = FormHandler(body.string())

    with file = File.create(_logfile) do
      file.seek_end(0)
      match file.errno()
      | FileOK =>
        file.write( "-" )
        var first:Bool = true
        for (key,value) in query.pairs() do
          if first then file.write( " " ) else file.write( "  " ) end
          first = false
          file.write( key )
          file.write( ": " )
          file.write( value )
          file.write( "\n" )
        end
        file.write("\n")
        file.flush()
      | FileError =>
        Print("logfile opened: FileError")
      | FileEOF =>
        Print("logfile opened: FileEOF")
      | FileBadFileNumber =>
        Print("logfile opened: FileBadFileNumber")
      | FileExists =>
        Print("logfile opened: FileExists")
      | FilePermissionDenied =>
        Print("logfile opened: FilePermissionDenied")
      end
    end
    try
      let txt = Files.read_text_from_path(_logfile)?
      SendMail(_auth, "Niclas Hedhman", "niclas@hedhman.org", "Site Feedback", txt )
      _logfile.remove()
    else
      Print("Unable to send email")
    end
    _ServeFile(consume ctx, _ackfile)

