use "../app"
use "../system"
use "../blocks"
use "../blocktypes"

use "collections"
use "files"
use "jay"
use "ponytest"

actor Main is TestList

new create(env: Env) =>
    PonyTest(env, this)

  fun tag tests(test: PonyTest) =>
    test(BlockTest("add/add-test.json"))

  
class iso BlockTest is UnitTest
  let _pathname: String 
  
  new iso create( pathname:String ) =>
    _pathname = pathname
    
  fun name():String => _pathname

  fun apply(h: TestHelper)? =>
    // 0. set up test application
    setup( h.env )?
    // 1. Feed events to the topology
    // 2. Collect the result from Assertion block
    // 3. for r in result do
    // 4.   pick next expectated
    // 5.   h.assert_eq[TYPE](expected, r)
    None

  fun setup(env:Env): Map[String,(String,String)] ? =>
    let context = SystemContext(env)
    let blocktypes = BlockTypes(context)
    let loader = Loader(blocktypes, context)
    
    let content = Files.read_lines_from_pathname(_pathname, env.root)?
    let root = JParse.from_string( content )? as JObj
    let topology = root("topology") as String
    
    (let dir, let file) = Path.split(_pathname)
    
    let testdefinition = Path.join(dir,topology)
        
    let test_app = loader.load( testdefinition )?
    let testname = root("name")
    test_app.create_block( "Assertions", "Assertion" )
    let inputs: JArr val = root("inputs") as JArr
    let expects: JArr val = root("expects") as JArr
    let assertions = Map[String,(String,String)]
    for expectation in expects.values() do
      let exp = expectation as JObj
      for output_ref in exp.keys() do
        let output_value = exp(output_ref) as JObj
        let typ:String = output_value("type") as String
        let expected:String = output_value("value") as String
        assertions(output_ref) = (typ, expected) 
      end
    end
    for output_name in assertions.keys() do
      let len = output_name.size().isize()
      let pos = output_name.rfind(".")?
      let src_block:String val = output_name.substring(0,len-pos)
      let src_output:String val = output_name.substring( (len-pos)+1)
      test_app.connect( src_block, src_output, "Assertions", "equality" )
    end

    assertions
