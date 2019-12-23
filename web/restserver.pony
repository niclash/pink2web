use "files"
use "format"
use "jennet"
use "http"
use "net"

use "../system"

actor RestServer
  
  new create( host': String, port': U32, basedir:String, context: SystemContext ) =>
    context.log("Rest Server starting on: " + host' + ":" + port'.string())
    let auth = context.auth()
    let jennet = Jennet(auth, context.stdout(), port'.string())
    jennet.get("/", RedirectTo("editor/index.html" ) )
    jennet.serve_dir(auth, "/css/*filepath", basedir + "/ui/css")
    jennet.serve_dir(auth, "/js/*filepath", basedir + "/ui/js")
    jennet.serve_dir(auth, "/node_modules/*filepath", basedir + "/ui/node_modules")
    jennet.serve_dir(auth, "/editor/*filepath", basedir + "/ui/src/apps/editor")
    
    try
      (consume jennet).serve()?
    else
      context.log("invalid routes.")
    end

class val RedirectTo is Handler
  let _location:String
  
  new val create(location:String) =>
    _location = location
    
  fun apply(c: Context, req: Payload val): Context iso^ =>
    let res = Payload.response()
    res.status = 301
    res("Location") = _location
    c.respond(req, consume res)
    consume c
