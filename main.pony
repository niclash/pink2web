use "./app"
use "./blocktypes"
use "./graphs"
use "./system"
use "./web"
use "cli"
use "collections"
use "jay"
use "logger"
use "promises"
use "websocket"

actor Main
  var _rest: (RestServer|None) = None
  var _websocketListener: (WebSocketListener|None) = None
  
  new create( env: Env ) =>
    try
      let context: SystemContext = handle_cli(env)?
      //_rest = RestServer("localhost:8384", context )
    else
      env.err.print( "Unable to get Environment Root. Internal error?" )
      env.exitcode(-1)  // some kind of coding error
    end

  fun ref handle_cli(env:Env): SystemContext ? =>
    let context = SystemContext(env, Info)?
    let blocktypes:BlockTypes val = BlockTypes(context)
    let cs = CommandSpec.parent("pink2web", "Flow Based Programming engine", [ 
            OptionSpec.bool("warn", "Warn Logging Level" where default' = false)
            OptionSpec.bool("info", "Info Logging Level" where default' = false)
            OptionSpec.bool("fine", "Fine Logging Level" where default' = false)
        ],  [ 
            list_command()?; run_command()?; describe_command()? 
        ] )? .> add_help()?

    let cmd =
      match CommandParser(cs).parse(env.args, env.vars)
      | let c: Command => 
            match c.fullname()
            | "pink2web/list/types" => list_types(blocktypes, context)
            | "pink2web/run/process" => 
                let graph = run_process(c.arg("filename" ).string(), blocktypes, context )?
                _websocketListener = WebSocketListener( env.root as AmbientAuth, BroadcastListenNotify(graph, blocktypes), "10.10.139.242","3569")
            | "pink2web/describe/type" => describe_type(c.arg("typename" ).string(), blocktypes, context )
            | "pink2web/describe/topology" => describe_topology(c.arg("filename" ).string(), blocktypes, context )?
            end
      | let ch: CommandHelp =>
          ch.print_help(env.out)
          env.exitcode(0)
          error
      | let se: SyntaxError =>
          env.out.print(se.string())
          env.exitcode(1)
          error
      end

    context

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
    let loader = Loader(blocktypes, context)
    let graph = loader.load( filename )?
    let promise = Promise[JArr]
    promise.next[None]( { (json: JArr) => 
      context(Fine) and context.log( "Topology Description" )
      context.to_stdout( json.string() ) 
    } )
    graph.describe( promise )
    
  fun run_process(filename:String, blocktypes:BlockTypes, context:SystemContext): Graph ? =>
    let loader = Loader(blocktypes, context)
    let graph = loader.load( filename )?  
    graph.start()
    graph
