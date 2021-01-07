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
      jennet.get("/index.html", _RedirectTo(redirectTo) )
      jennet.post("/contacts", _ContactRequest(Path.cwd() + "/feedback.yaml", basedir + "/acknowledge.html", context.auth())? )
      jennet.get("/", _RedirectTo(redirectTo) )

      jennet.serve_dir(auth, "/css/*filepath", basedir + "/assets/css")?
      jennet.serve_dir(auth, "/js/*filepath", basedir + "/assets/js")?
      jennet.serve_dir(auth, "/images/*filepath", basedir + "/assets/images")?
      jennet.serve_dir(auth, "/editor/*filepath", basedir + "/modules/editor")?
      jennet.serve_dir(auth, "/pinkflow/*filepath", basedir + "/modules/pinkflow")?
      jennet.serve_file(auth, "/pink2web", basedir + "/pink2web.html")?
      jennet.serve_file(auth, "/contacts", basedir + "/contacts.html")?
      (consume jennet).serve(ServerConfig(where port' = port'.string()))
    else
      context(Error) and context.log(Error, "invalid routes.")
    end

class val _RedirectTo is RequestHandler
  let _location:String

  new val create(location:String) =>
    _location = location

  fun apply(c: Context): Context iso^ =>
    c.respond(StatusResponse(StatusMovedPermanently, [("Location", _location)]))
    consume c

