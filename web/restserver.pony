use "files"
use "format"
use "jennet"
use "http_server"
use "net"

use "../system"

actor RestServer

  new create( host': String, port': U32, basedir:String, context: SystemContext ) =>
    context.log("Rest Server starting on: " + host' + ":" + port'.string() + ", basedir=" + basedir)
    let auth = context.auth()
    let jennet = Jennet(auth, context.stdout(), host', port'.string())
    jennet.get("/", RedirectTo("index.html" ) )
    try
      jennet.serve_dir(auth, "/css/*filepath", basedir + "/ui/css")?
      jennet.serve_dir(auth, "/js/*filepath", basedir + "/ui/js")?
      jennet.serve_dir(auth, "/node_modules/*filepath", basedir + "/ui/node_modules")?
      jennet.serve_dir(auth, "/editor/*filepath", basedir + "/ui/src/apps/editor")?

      (consume jennet).serve(ServerConfig(where port' = port'.string()))
    else
      context.log("invalid routes.")
    end

class val RedirectTo is RequestHandler
  let _location:String

  new val create(location:String) =>
    _location = location

  fun apply(c: Context): Context iso^ =>
    c.respond(StatusResponse(StatusMovedPermanently, [("Location", _location)]))
    consume c
