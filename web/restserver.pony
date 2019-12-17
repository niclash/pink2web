use "jennet"
use "logger"
use "net"
use "format"

use "../system"

actor RestServer
  
  new create( host': String, port': U32, basedir:String, context: SystemContext ) =>
    context.log("Rest Server starting on: " + host' + ":" + port'.string())
    let auth = context.auth()
    let jennet = Jennet(auth, context.stdout(), port'.string())
    jennet.serve_file(auth, "/index", basedir + "/index.html")
    jennet.serve_file(auth, "/editor", basedir + "/editor.html")
    jennet.serve_dir(auth, "/", basedir)
    
    try
      (consume jennet).serve()?
    else
      context.log("invalid routes.")
    end
