use "../app"
use "../blocktypes"
use "../drivers"
use "../graphs"
use "../protocol"
use "../system"
use "../web"

use "collections"
use "net"
use "promises"
use "websocket"

class RuntimeEngine
  let _graphs:Graphs
  let _blocktypes:BlockTypes
  let _context: SystemContext
  var _rest: (RestServer|None) = None
  var _websocketListener: (WebSocketListener|None) = None

  new create( config: RuntimeConfiguration, authorizer: Authorizer, blocktypes:BlockTypes, context: SystemContext ) =>
    _context = context
    _blocktypes = blocktypes
    _graphs = Graphs( blocktypes, context )
    let host = config.host
    let port = config.port
    let fbp = Fbp(config.engine_id, _graphs, blocktypes, authorizer, context)
    let ws_port:String val = (port+1).string()

    let tcplauth: TCPListenAuth = TCPListenAuth(context.auth())
    _websocketListener = WebSocketListener(tcplauth,ListenNotify(fbp,context),host,ws_port)
    context(Info) and context.log(Info, "Web directory: "+config.webdir)
    context(Info) and context.log(Info, "Start Page: "+config.startpage)
    context(Info) and context.log(Info, "Started to listen: ws://"+host+":"+ws_port)
    _rest = RestServer(host, port, config.webdir, config.startpage, context )

    let drivers = Drivers(context)
    for driver in config.drivers.values() do
      context(Info) and context.log(Info, "Loading " + driver )
      drivers.load(driver)
    else
      context(Info) and context.log(Info, "Loading no drivers." )
    end

    context(Info) and context.log(Info, "Drivers available " )
    let p = Promise[String]
    p.next[None]( { (driver) => context.log( Info, "  " + driver) } )
    drivers.available(p)
    drivers.start()

  fun load_graph(filename:String) =>
    let loader = Loader(_graphs, _blocktypes, _context)
    let p = Promise[(String, Graph|None)]
    p.next[None]( { (pair) =>
      (let id:String, let graph:(Graph|None)) = pair
      match graph
      | let g:Graph =>
        g.start()
        _context(Info) and _context.log(Info, "Main graph: " + id )
      else
        _context(Error) and _context.log(Error, "Unable to load " + filename )
      end
    })
    loader.load_from_file( filename, p )


