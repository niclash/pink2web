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
    let tcplauth = TCPListenAuth(context.auth())
    let fileauth = FileAuth(context.auth())
    let jennet = Jennet(tcplauth, context.stdout(), host', port'.string())
    jennet.get("/index.html", _RedirectTo(redirectTo) )
    jennet.post("/contacts", _ContactRequest(Path.cwd() + "/feedback.yaml", basedir + "/acknowledge.html", context) )
    jennet.get("/", _RedirectTo(redirectTo) )

    jennet.serve_dir(fileauth, "/css/*filepath", basedir + "/assets/css")
    jennet.serve_dir(fileauth, "/js/*filepath", basedir + "/assets/js")
    jennet.serve_dir(fileauth, "/images/*filepath", basedir + "/assets/images")
    jennet.serve_dir(fileauth, "/editor/*filepath", basedir + "/modules/editor")
    jennet.serve_dir(fileauth, "/pinkflow/*filepath", basedir + "/modules/pinkflow")
    jennet.serve_file(fileauth, "/pink2web", basedir + "/pink2web.html")
    jennet.serve_file(fileauth, "/contacts", basedir + "/contacts.html")
    (consume jennet).serve(ServerConfig(host', port'.string()))

class val _RedirectTo is RequestHandler
  let _location:String

  new val create(location:String) =>
    _location = location

  fun apply(c: Context): Context iso^ =>
    c.respond(StatusResponse(StatusMovedPermanently, [("Location", _location)]))
    consume c

