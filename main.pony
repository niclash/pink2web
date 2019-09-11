use "./app"
use "./blocktypes"
use "./blocks"
use "./system"
use "logger"
use "cli"
use "json"

actor Main
  let _context: SystemContext val
  let _manager: BlockManager tag
  let _env: Env
  
  new create( env: Env ) =>
    _env = env
    _context = recover SystemContext(env) end
    _manager = BlockManager(_context)
    try
      handle_cli()?
    else
      _context(Error) and _context.log( "Unable to get Environment Root. Internal error?" )
      env.exitcode(-1)  // some kind of coding error
    end


  fun handle_cli() ? =>
    let cs = CommandSpec.parent("pink2web", "Flow Based Programming engine", [ 
        ],  [ 
            list_command()?; run_command()?; describe_command()? 
        ] )? .> add_help()?

    let cmd =
      match CommandParser(cs).parse(_env.args, _env.vars)
      | let c: Command => 
            match c.fullname()
            | "pink2web/list/types" => list_types()
            | "pink2web/run/process" => run_process(c.arg("filename" ).string() )?
            | "pink2web/describe/type" => describe_type(c.arg("typename" ).string() )
            | "pink2web/describe/topology" => describe_topology(c.arg("filename" ).string() )?
            end
      | let ch: CommandHelp =>
          ch.print_help(_env.out)
          _env.exitcode(0)
          return
      | let se: SyntaxError =>
          _env.out.print(se.string())
          _env.exitcode(1)
          return
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
    ],[
      CommandSpec.leaf( "process", "Run the process.", [
      ], [
        ArgSpec.string("filename", "Name of json file containing the process to run.", None )
      ] )?
    ])?

  fun list_types() =>
     let printer: PrintJson val = PrintJson(_env.out)
    _manager.list_types( { (jt) => printer.print( jt ) } )
    
  fun describe_type(typ:String) =>
     let printer: PrintJson val = PrintJson(_env.out)
    _manager.describe_type( typ, { (jt) => printer.print( jt ) } )
    
  fun describe_topology(filename:String) ? =>
     let printer: PrintJson val = PrintJson(_env.out)
     let loader = Loader(_manager, _context, _env.root as AmbientAuth)
     loader.load( filename )
    _manager.describe_topology( { (jt) => printer.print( jt ) } )
    
  fun run_process(filename:String) ? =>
     let loader = Loader(_manager, _context, _env.root as AmbientAuth)
     loader.load( filename )
     _manager.start()

class val PrintJson
   let _out: OutStream
   
   new val create( out: OutStream) =>
     _out = out
    
  fun print( types: JsonType ) =>
    match consume types
    |  let s: JsonObject=>
      _out.print( s.string() )
    |  let s: JsonArray =>
      _out.print( s.string() )
    |  let s: String =>
      _out.print( s )
    |  let s: None =>
      _out.print( "<None>" )
    |  let s: Bool =>
      _out.print( s.string()  )
    |  let s: I64 =>
      _out.print( s.string()  )
    |  let s: F64 =>
      _out.print( s.string()  )
    end

 
