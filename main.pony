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
use "net"
use "promises"
use "websocket"

actor Main
  var _rest: (RestServer|None) = None
  var _websocketListener: (WebSocketListener|None) = None
  
  new create( env: Env ) =>
    try
      handle_cli(env)?
    else
      env.err.print( "Can not handle command line." )
      env.exitcode(-1)  // some kind of coding error
    end

  fun ref handle_cli(env:Env)? =>
    let args:Array[String] val = env.args
    let vars:Array[String] val = env.vars
    let auth:AmbientAuth val = env.root as AmbientAuth
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
            let level:LogLevel = if c.option("fine").bool() then Fine
                                 else if c.option("info").bool() then Info
                                 else if c.option("warn").bool() then Warn
                                 else Error end end end
            let context:SystemContext = SystemContext(auth, env.out, env.err, level)
            let blocktypes:BlockTypes val = BlockTypes(context)
            match c.fullname()
            | "pink2web/list/types" => list_types(blocktypes, context)
            | "pink2web/run/process" =>
                context(Fine) and context.log(Fine, "Starting process")
                let filename = c.arg("filename").string()
                let host = c.option("host").string()
                let p = c.option("port")
                context(Info) and context.log( Info, "--port=" + p.i64().string() )
                var port = p.i64().u32()
                // bug in cli, default port isn't working properly
                if port == 0 then port = 3568 end
                let graphs = Graphs( blocktypes, context )
                (let main_graph:String,let graph:Graph) = run_process(filename,graphs,blocktypes,context)?
                let fbp = Fbp("619362b3-1aee-4dca-b109-bef38e0e1ca8", main_graph, graphs, blocktypes, context)
                let ws_port:String val = (port+1).string()
                _websocketListener = WebSocketListener(auth,ListenNotify(fbp,context),host,ws_port)
                var path:String = c.option("webdir").string()
                if path == "" then path = Path.cwd() + "/ui/src" end
                var startpage:String = c.option("startpage").string()
                if startpage == "" then startpage = "login" end
                context(Info) and context.log(Info, "Web directory:"+path)
                context(Info) and context.log(Info, "Start Page:"+startpage)
                context(Info) and context.log(Info, "Started to listen: ws://"+host+":"+ws_port)
                _rest = RestServer(host, port,  path, startpage, context )
            | "pink2web/describe/type" => describe_type(c.arg("typename" ).string(),blocktypes,context)
            | "pink2web/describe/topology" => 
                describe_topology(c.arg("filename").string(),blocktypes,context)?
            end
      | let ch: CommandHelp =>
          ch.print_help(env.out)
      | let se: SyntaxError =>
          env.err.print(se.string())
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
      OptionSpec.string("webdir", "Directory of web resources" where default' = "")
      OptionSpec.string("startpage", "Start page on the web server" where default' = "")
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
    context(Fine) and context.log( Fine, "Describe topology" )
    let graphs = Graphs( blocktypes, context )
    let loader = Loader( graphs, blocktypes, context )
    (let id:String, let graph:Graph) = loader.load( filename )?
    let promise = Promise[JObj]
    promise.next[None]( { (json: JObj) => 
      context(Fine) and context.log( Fine, "Topology Description" )
      context.to_stdout( json.string() ) 
      graphs.shutdown()
    } )
    graph.describe( promise )
    
  fun run_process(filename:String, graphs: Graphs, blocktypes:BlockTypes, context:SystemContext):(String, Graph) ? =>
    let loader = Loader(graphs, blocktypes, context)
    (let id:String, let graph:Graph) = loader.load( filename )?  
    graph.start()
    context(Info) and context.log(Info, "Main graph: " + id )
    (id, graph)
