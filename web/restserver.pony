use "collections"
use "files"
use "format"
use "http_server"
use "jennet"
use "net"
use "valbytes"

use "../system"

actor RestServer

  new create( host': String, port': U32, basedir:String, redirectTo:String, context: SystemContext ) =>
    context(Info) and context.log(Info, "Rest Server starting on: " + host' + ":" + port'.string() + ", basedir=" + basedir)
    let auth = context.auth()
    let jennet = Jennet(auth, context.stdout(), host', port'.string())
    try
      jennet.get("/index.html", RedirectTo(redirectTo) )
      jennet.post("/contacts", ContactRequest(Path.cwd() + "/feedback.yaml", basedir + "/acknowledge.html", context.auth())? )
      jennet.get("/", RedirectTo(redirectTo) )

      jennet.serve_dir(auth, "/css/*filepath", basedir + "/assets/css")?
      jennet.serve_dir(auth, "/js/*filepath", basedir + "/assets/js")?
      jennet.serve_dir(auth, "/images/*filepath", basedir + "/assets/images")?
      jennet.serve_dir(auth, "/editor/*filepath", basedir + "/modules/editor")?
      jennet.serve_dir(auth, "/pinkflow/*filepath", basedir + "/modules/pinkflow")?
      jennet.serve_file(auth, "/login", basedir + "/login.html")?
      jennet.serve_file(auth, "/pink2web", basedir + "/pink2web.html")?
      jennet.serve_file(auth, "/contacts", basedir + "/contacts.html")?
      (consume jennet).serve(ServerConfig(where port' = port'.string()))
    else
      context(Error) and context.log(Error, "invalid routes.")
    end

class val ContactRequest is RequestHandler
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
      let txt = Files.read_lines_from_path(_logfile)?
      SendMail(_auth, "Niclas Hedhman", "niclas@hedhman.org", "Site Feedback", txt )
      _logfile.remove()
    else
      Print("Unable to send email")
    end
    ServeFile(consume ctx, _ackfile)

class val RedirectTo is RequestHandler
  let _location:String

  new val create(location:String) =>
    _location = location

  fun apply(c: Context): Context iso^ =>
    c.respond(StatusResponse(StatusMovedPermanently, [("Location", _location)]))
    consume c

primitive ServeFile
  fun apply(ctx:Context iso, filepath:FilePath): Context iso^ =>
    try
      var bs = ByteArrays
      with file = OpenFile(filepath) as File do
        while true do
          let chunk:Array[U8] iso = file.read(2048)
          if chunk.size() == 0 then break end
          bs = bs + consume chunk
        end
      end
      ctx.respond(StatusResponse(StatusOK), bs)
    else
      ctx.respond(StatusResponse(StatusNotFound))
    end
    consume ctx

