use "./app"
use "./blocktypes"
use "./graphs"
use "./protocol"
use "./system"
use "./web"
use "cli"
use "collections"
use "files"
use "jay"
use "logger"
use "net"
use "promises"
use "websocket"

class MyConnectionNotify is TCPConnectionNotify
  let _env:Env
  
  new create( env:Env ) => _env = env

  fun ref accepted(conn: TCPConnection ref) =>
    _env.out.print("NH: Accepted")

  fun ref proxy_via(host: String, service: String): (String, String) =>
    _env.out.print("NH: proxy_via")
    (host, service)

  fun ref connecting(conn: TCPConnection ref, count: U32) =>
    _env.out.print("NH: Connecting")
    None

  fun ref connected(conn: TCPConnection ref) =>
    _env.out.print("NH: Connected")
    None

  fun ref connect_failed(conn: TCPConnection ref) =>
    _env.out.print("NH: Connect Failed")
    

  fun ref auth_failed(conn: TCPConnection ref) =>
    _env.out.print("NH: Auth Failed")

  fun ref sent(conn: TCPConnection ref, data: ByteSeq): ByteSeq =>
    _env.out.print("NH: Sent")
    data

  fun ref sentv(conn: TCPConnection ref, data: ByteSeqIter): ByteSeqIter =>
    _env.out.print("NH: SentV")
    data

  fun ref received(
    conn: TCPConnection ref,
    data: Array[U8] iso,
    times: USize)
    : Bool
  =>
    _env.out.print("NH: Received")
    true

  fun ref expect(conn: TCPConnection ref, qty: USize): USize =>
    _env.out.print("NH: Expect")
    qty

  fun ref closed(conn: TCPConnection ref) =>
    _env.out.print("NH: Closed")
    None

  fun ref throttled(conn: TCPConnection ref) =>
    _env.out.print("NH: Throttled")
    None

  fun ref unthrottled(conn: TCPConnection ref) =>
    _env.out.print("NH: Unthrottled")
    None


class MyListener is TCPListenNotify
  let _env:Env
  new create( env:Env ) => _env = env
  fun ref listening(listen: TCPListener ref) =>
    _env.out.print("NH: Listening")

  fun ref not_listening(listen: TCPListener ref) =>
    _env.out.print("NH: Not Listening")

  fun ref closed(listen: TCPListener ref) =>
    _env.out.print("NH: Closed")

  fun ref connected(listen: TCPListener ref): TCPConnectionNotify iso^  =>
    _env.out.print("NH: Connected")
    recover MyConnectionNotify(_env) end

actor Main
  var _rest: (RestServer|None) = None
  var _websocketListener: (WebSocketListener|None) = None
  
  new create( env: Env ) =>
    let context = try
      SystemContext(env, Info)?
    else
      env.err.print( "Unable to get Environment Root. Internal error?" )
      env.exitcode(-1)  // some kind of coding error
      return
    end
    try
    
     let listener = TCPListener( env.root as AmbientAuth, recover MyListener(env) end, "2001:470:ed82:0:5060:909a:f1e7:5ef2","5353")
      handle_cli(context, env.args, env.vars, env.root as AmbientAuth)?
    else
      env.err.print( "Can not handle command line." )
      env.exitcode(-1)  // some kind of coding error
    end

  fun ref handle_cli(context:SystemContext, args:Array[String] val, vars:Array[String] val, auth:AmbientAuth )? =>
    let blocktypes:BlockTypes val = BlockTypes(context)
    let cs = CommandSpec.parent("pink2web", "Flow Based Programming engine", [ 
            OptionSpec.bool("warn", "Warn Logging Level" where default' = false)
            OptionSpec.bool("info", "Info Logging Level" where default' = false)
            OptionSpec.bool("fine", "Fine Logging Level" where default' = false)
        ],  [ 
            list_command()?; run_command()?; describe_command()? 
        ] )? .> add_help()?
    
    let cmd =
      match CommandParser(cs).parse(args, vars)
      | let c: Command => 
            match c.fullname()
            | "pink2web/list/types" => list_types(blocktypes, context)
            | "pink2web/run/process" =>
                context.log( "Starting process")
                let filename = c.arg("filename").string()
                let host = c.option("host").string()
                let p = c.option("port")
                context.log( "--port=" + p.i64().string() )
                var port = p.i64().u32()
                // bug in cli, default port isn't working properly
                if port == 0 then port = 3568 end
                let graphs = Graphs( blocktypes, context )
                (let main_graph:String,let graph:Graph) = run_process(filename,graphs,blocktypes,context)?
                let fbp = Fbp("619362b3-1aee-4dca-b109-bef38e0e1ca8", main_graph, graphs, blocktypes, context)
                let ws_port:String val = (port+1).string()
                _websocketListener = WebSocketListener(auth,ListenNotify(fbp,context),host,ws_port)
                context(Info) and context.log("Started to listen: ws://"+host+":"+ws_port)
                _rest = RestServer(host, port,  Path.cwd(), context )
            | "pink2web/describe/type" => describe_type(c.arg("typename" ).string(),blocktypes,context)
            | "pink2web/describe/topology" => 
                describe_topology(c.arg("filename" ).string(),blocktypes,context)?
            end
      | let ch: CommandHelp =>
          ch.print_help(context.stdout())
      | let se: SyntaxError =>
          context.log(se.string())
          error
      end

  fun list_command() : CommandSpec ? =>
    CommandSpec.parent("list", "", [
    ],[
      CommandSpec.leaf( "types", "List types", [], [] )?
    ])?
    
  fun describe_command() : CommandSpec ? =>
    CommandSpec.parent("describe", "Describe a part of the system", [
    ],[
      CommandSpec.leaf( "type", "List types", [], [
        ArgSpec.string("typename", "Name of type to be described.", None )
      ] )?
      CommandSpec.leaf( "topology", "List types", [], [
        ArgSpec.string("filename", "Name of toppology to be described.", None )
      ] )?
    ])?
    
  fun run_command() : CommandSpec ?=>
    CommandSpec.parent("run", "", [
      OptionSpec.string("host", "Host interface to connect to" where default' = "0.0.0.0")
      OptionSpec.i64("port", "Port number to listen on" where default' = 3568)
    ],[
      CommandSpec.leaf( "process", "Run the process.", [
      ], [
        ArgSpec.string("filename", "Name of json file containing the process to run.", None )
      ] )?
    ])?

  fun list_types(blocktypes:BlockTypes, context:SystemContext) =>
    let m = blocktypes.list_types()
    for t in m.keys() do
      context.to_stdout( t ) 
    end
     
  fun describe_type(typ:String, blocktypes:BlockTypes, context:SystemContext) =>
    let json = blocktypes.describe_type( typ )
    context.to_stdout( json.string() )    
    
  fun describe_topology(filename:String, blocktypes:BlockTypes, context:SystemContext) ? =>
    context(Fine) and context.log( "Describe topology" )
    let graphs = Graphs( blocktypes, context )
    let loader = Loader( graphs, blocktypes, context )
    (let id:String, let graph:Graph) = loader.load( filename )?
    let promise = Promise[JObj]
    promise.next[None]( { (json: JObj) => 
      context(Fine) and context.log( "Topology Description" )
      context.to_stdout( json.string() ) 
      graphs.shutdown()
    } )
    graph.describe( promise )
    
  fun run_process(filename:String, graphs: Graphs, blocktypes:BlockTypes, context:SystemContext):(String, Graph) ? =>
    let loader = Loader(graphs, blocktypes, context)
    (let id:String, let graph:Graph) = loader.load( filename )?  
    graph.start()
    context.log("Main graph: " + id )
    (id, graph)
