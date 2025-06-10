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
use "promises"
use "websocket"

use "debug"
use "./protocol/network"


actor Main

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
    let auth:AmbientAuth val = env.root
    let cs = CommandSpec.parent("pink2web", "Flow Based Programming engine", [
            OptionSpec.bool("warn", "Warn Logging Level" where default' = false)
            OptionSpec.bool("info", "Info Logging Level" where default' = false)
            OptionSpec.bool("fine", "Fine Logging Level" where default' = false)
            OptionSpec.string("basedir", "Base directory" where default' = ".")
            OptionSpec.string("confdir", "Configuration directory" where default' = "/etc/pink2web")
        ],  [
            list_command()?; run_command()?; describe_command()?
        ] )? .> add_help()?

    let cmd = match CommandParser(cs).parse(args, vars)
    | let c: Command =>
        let level:LogLevel = if c.option("fine").bool() then Fine
                             else if c.option("info").bool() then Info
                             else if c.option("warn").bool() then Warn
                             else Error end end end
        let basedir = FilePath(FileAuth(auth), c.option("basedir").string() )
        let confdir = FilePath(FileAuth(auth), c.option("confdir").string() )
        let context:SystemContext = SystemContext(auth, env.out, env.err, level, basedir, confdir, Io)
        let blocktypes:BlockTypes = BlockTypes(context)
        let authorizer = Authorizer(_load_users(c, context)?, context)
        match c.fullname()
        | "pink2web/list/types" => list_types(blocktypes, context)
        | "pink2web/run/daemon" =>
            let config = _create_runtime_configuration( c )
            let engine = RuntimeEngine( config, authorizer, blocktypes, context )
            _load_processes(context, engine)
        | "pink2web/run/process" =>
            let config = _create_runtime_configuration( c )
            let engine = RuntimeEngine( config, authorizer, blocktypes, context )
            let filenames = c.arg( "filenames" ).string()
            for filename in filenames.split(":").values() do
              context(Fine) and context.log(Fine, "Starting graph " + filename)
              engine.load_graph(filename)
            end
        | "pink2web/describe/type" => describe_type(c.arg("typename" ).string(),blocktypes,context)
        | "pink2web/describe/topology" =>
          describe_topology(FilePath(FileAuth(context.auth()), c.arg("filename").string()),blocktypes,context)
        end
    | let ch: CommandHelp =>
      let json = JObj
        + ("graph", "123")
        + ("name", "a name")
        + ("description", "nothing")
        + ("uptime", I64(123))
        + ("running", true)
        + ("started", true)
        + ("debug", false)
        let msg = Message("network", "status", json ).string()
        Debug("Network Status:" + msg.string())

      ch.print_help(env.out)
    | let se: SyntaxError =>
        env.err.print(se.string())
        error
    end

  fun _load_processes(context':SystemContext, engine:RuntimeEngine) =>
    try
      var dir' = context'.filelocations().base_directory.join("graphs/")?
      if not dir'.exists() then
        context'(Error) and context'.log(Error, "Starting graph " + dir'.path)
        error
      end
      context'(Fine) and context'.log( Fine, "Loading processes from " + dir'.path )
      dir'.walk( {(p,entries) =>
        for n in entries.values() do
          engine.load_graph(n)
          context'(Fine) and context'.log(Fine, "Starting graph " + n)
        end
      })
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
      OptionSpec.string("id", "Identity of the engine" where default' = "dev-1234")
      OptionSpec.string("webdir", "Directory of web resources" where default' = "")
      OptionSpec.string("startpage", "Start page on the web server" where default' = "")
      OptionSpec.string("host", "Host interface to connect to" where default' = "0.0.0.0")
      OptionSpec.string("users", "Name of file containing users and their passwords" where default' = "")
      OptionSpec.i64("port", "Port number to listen on" where default' = 3568)
      OptionSpec.string_seq("load-drivers", "Driver to be loaded. Driver configuration in $CONFDIR/drivers/$driver.conf. If empty, load default.conf")
    ],[
      CommandSpec.leaf( "process", "Run the process.", [], [ ArgSpec.string("filenames", "List of json files containing the graphs to start.", "" )])?
      CommandSpec.leaf( "daemon", "Run as daemon.", [], [])?
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

  fun describe_topology(path:FilePath, blocktypes:BlockTypes, context:SystemContext) =>
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
      (let filename:String, let graph:(Graph|None)) = pair
      match graph
      | let g:Graph => g.describe( promise )
      else
        context(Error) and context.log( Error, "Unable to load " + filename )
      end
    })
    loader.load_from_file( path.path, loadpromise )

  fun run_application(filename:String, graphs: Graphs, blocktypes:BlockTypes, context:SystemContext, promise:Promise[(String,Graph|None)]) =>
    None

  fun _create_runtime_configuration( c: Command ): RuntimeConfiguration =>
    let host = c.option("host").string()
    let p = c.option("port")
    var port = p.i64().u32()
    // bug in cli, default port isn't working properly
    if port == 0 then port = 3568 end
    var path:String = c.option("webdir").string()
    if path == "" then path = Path.cwd() + "/frontend/src" end
    var startpage:String = c.option("startpage").string()
    if startpage == "" then startpage = "login" end
    let driversToLoad = c.option("load-drivers").string_seq()
    var engine_id:String = c.option("id").string()
    RuntimeConfiguration( engine_id, host, port, path, startpage, driversToLoad )

  fun _load_users( c: Command, context: SystemContext ): Map[String,String] iso^ ? =>
    var users:Map[String,String] iso = Map[String,String]
    let users_file = c.option("users").string()
    if users_file.size() > 0 then
      let path = FilePath(FileAuth(context.auth()), users_file)
      match OpenFile(path)
      | let file: File =>
        for line in file.lines() do
          let split:Array[String] = line.split("=")
          users(split(0)?) = split(1)?
        end
      else
        context(Error) and context.log(Error, "Error opening users file '" + users_file + "'")
      end
    else
      // TODO: Remove soon
      users("niclas") = "123"
      // Later FAIL here
      // error
    end
    consume users