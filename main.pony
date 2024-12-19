use "./app"
use "./blocktypes"
use "./drivers"
use "./engine"
use "./graphs"
use "./protocol"
use "./system"
use "./web"
use "cli"
use "collections"
use "files"
use "jay"
use "net"
use pi = "raspi"
use "promises"
use "websocket"

actor Main

  new create( env: Env ) =>
    pi.RPi.wiringPiSetup()
    try
      env.out.print( "CLI:" )
      for arg in env.args.values() do
        env.out.print( "  " + arg )
      end
      handle_cli(env)?
    else
      env.err.print( "Can not handle command line." )
      env.exitcode(-1)  // some kind of coding error
    end

  fun ref handle_cli(env:Env)? =>
    let args:Array[String] val = env.args
    let vars:Array[String] val = env.vars
    let auth:AmbientAuth val = env.root
    let cs = CommandSpec.parent("pink2web", "Flow Based Programming engine", [
            OptionSpec.bool("warn", "Warn Logging Level" where default' = false)
            OptionSpec.bool("info", "Info Logging Level" where default' = false)
            OptionSpec.bool("fine", "Fine Logging Level" where default' = false)
            OptionSpec.string("basedir", "Base directory" where default' = ".")
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
            let basedir:String = c.option("basedir").string()
            let context:SystemContext = SystemContext(auth, env.out, env.err, level, FilePath(FileAuth(auth), basedir))
            let blocktypes:BlockTypes = BlockTypes(context)
            match c.fullname()
            | "pink2web/list/types" => list_types(blocktypes, context)
            | "pink2web/run/daemon" =>
                let config = _create_runtime_configuration( c )
                let engine = RuntimeEngine( config, blocktypes, context )
                let filenames = _load_process_list(context)
                for filename in filenames.values() do
                  context(Fine) and context.log(Fine, "Starting graph " + filename)
                  engine.load_graph(filename)
                end
            | "pink2web/run/process" =>
                let config = _create_runtime_configuration( c )
                let engine = RuntimeEngine( config, blocktypes, context )
                let filenames = c.arg( "filenames" ).string()
                for filename in filenames.split(":").values() do
                  context(Fine) and context.log(Fine, "Starting graph " + filename)
                  engine.load_graph(filename)
                end
            | "pink2web/describe/type" => describe_type(c.arg("typename" ).string(),blocktypes,context)
            | "pink2web/describe/topology" => 
                describe_topology(c.arg("filename").string(),blocktypes,context)
            end
      | let ch: CommandHelp =>
          ch.print_help(env.out)
      | let se: SyntaxError =>
          env.err.print(se.string())
          error
      end

  fun _load_process_list(context':SystemContext):Array[String] =>
    let result = Array[String]()
    try
      var file' = FilePath(FileAuth(context'.auth()), "/var/lib/pink2web/processes.json" )
      if not file'.exists() then
        file' = FilePath(FileAuth(context'.auth()), "./docs/processes.json" )
      end
      context'(Fine) and context'.log( Fine, "Loading processes from " + file'.path )
      let content: String = Files.read_text_from_pathname(file'.path, FileAuth(context'.auth()))?
      let root = JParse.from_string( content )? as JArr
      for jobj in root.values() do
        let name = jobj.string()
        result.push(name)
      end
    end
    result

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
      OptionSpec.string("secret", "The secret needed to connect" where default' = "1234")
      OptionSpec.i64("port", "Port number to listen on" where default' = 3568)
      OptionSpec.string_seq("load-driver", "Driver to be loaded.(may be used many times)")
    ],[
      CommandSpec.leaf( "process", "Run the process.", [
      ], [
        ArgSpec.string("filenames", "List of json files containing the graphs to start.", "" )
      ] )?
    ])?

  fun list_types(blocktypes:BlockTypes, context:SystemContext) =>
    let promise = Promise[Map[String, BlockTypeDescriptor val] val]
    promise.next[None]( { (m:Map[String, BlockTypeDescriptor val] val) =>
      for t in m.keys() do
        context.to_stdout( t )
      end
    })
    let m = blocktypes.list_types(promise)

  fun describe_type(typ:String, blocktypes:BlockTypes, context:SystemContext) =>
    let promise = Promise[JObj]
    promise.next[None]( { (json:JObj) =>
      context.to_stdout( json.string() )
    })
    let json = blocktypes.describe_type( typ, promise )

  fun describe_topology(filename:String, blocktypes:BlockTypes, context:SystemContext) =>
    context(Fine) and context.log( Fine, "Describe topology" )
    let graphs = Graphs( blocktypes, context )
    let loader = Loader( graphs, blocktypes, context )

    let promise = Promise[JObj]
    promise.next[None]( { (json: JObj) =>
      context(Fine) and context.log( Fine, "Topology Description" )
      context.to_stdout( json.string() )
      graphs.shutdown()
    } )

    let loadpromise = Promise[(String, Graph|None)]
    loadpromise.next[None]( { (pair) =>
      (let id:String, let graph:(Graph|None)) = pair
      match graph
      | let g:Graph => g.describe( promise )
      else
        context(Error) and context.log( Error, "Unable to load " + filename )
      end
    })
    loader.load_from_file( filename, loadpromise )?

  fun run_application(filename:String, graphs: Graphs, blocktypes:BlockTypes, context:SystemContext, promise:Promise[(String,Graph|None)]) =>
    None

  fun _create_runtime_configuration( c: Command ): RuntimeConfiguration =>
    let secret = c.option("secret").string()
    let host = c.option("host").string()
    let p = c.option("port")
    var port = p.i64().u32()
    // bug in cli, default port isn't working properly
    if port == 0 then port = 3568 end
    var path:String = c.option("webdir").string()
    if path == "" then path = Path.cwd() + "/frontend/src" end
    var startpage:String = c.option("startpage").string()
    if startpage == "" then startpage = "login" end
    let driversToLoad = c.option("load-driver").string_seq()
    RuntimeConfiguration( secret, host, port, path, startpage, driversToLoad )

