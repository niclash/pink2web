
use blocks = "./blocks"

// Other stuff

use "../app"
use "../system"
use "../graphs"
use "../blocktypes"


use "collections"
use "debug"
use "files"
use "jay"
use "ponytest"
use "promises"

actor Main is TestList

  new create(env: Env) =>
    PonyTest(env, this)

  new make() =>
    None

  fun tag tests(test: PonyTest) =>
    blocks.Main.make().tests( test )
    test(_BlockTest("add/add-test.json"))

  
class iso _BlockTest is UnitTest
  let _pathname: String 

  new iso create( pathname:String ) =>
    _pathname = pathname
    
  fun name():String => _pathname

  fun apply(h: TestHelper)? =>
  
    // 0. set up test application
    let testcase:Array[(Array[(String,String)] val,Assertion, Graph)] = setup( h )?
    h.long_test(100000000)  // indicate long test.
    
    // 1. For each topology
    for (inputs,assertion,graph) in testcase.values() do
      
      // The following construct is to ensure that all blocks in the topology has started before we start inputting data
      let promise = Promise[JObj]
      promise.next[None]( { (json: JObj) => 
        assertion.run( inputs, graph )
      } )
      graph.describe( promise )
      
    end
    
    None

  fun setup(h: TestHelper): Array[(Array[(String,String)] val,Assertion, Graph)] ?=>
    let env:Env = h.env
    let context = SystemContext(env, Warn)?
    let blocktypes = BlockTypes(context)
    let graphs = Graphs( blocktypes, context )
    let loader = Loader(graphs, blocktypes, context)
    let root: JObj = parse_test(_pathname, env)?
    let result = Array[(Array[(String,String)] val,Assertion, Graph)]
    for test_descr in root.keys() do
      let unittest = root(test_descr) as JObj
      let topology = unittest("topology") as String
      (let dir, let file) = Path.split(_pathname)
      let testdefinition = Path.join(dir,topology)
      (let graph_name, let test_graph) = loader.load( testdefinition )?

      let factory = AssertionFactory(h)
      let assertion_block = factory.create_block("assertions", context, 50, 50) as Assertion
      let descriptor = factory.block_type_descriptor()
      test_graph.register_block( assertion_block, "assertions", descriptor )
      
      let inputs: JArr val = unittest("inputs") as JArr
      let feed = recover val 
        let f = Array[(String,String)]
        for inp' in inputs.values() do
          let inp = inp' as JObj
          let input_name = inp.keys().next()?
          let input_value = inp(input_name) as String
          f.push( (input_name, input_value) )
        end
        f
      end
      let expects: JArr val = unittest("expects") as JArr
      let assertions = Set[String]
      for expectation in expects.values() do
        let exp = expectation as JObj
        let expectations:Array[Any val] val = recover
          let e = Array[Any val]
          for output_ref in exp.keys() do
            assertions.set(output_ref)
            let output_value = exp(output_ref) as JObj
            let typ:String = output_value("type") as String
            let expected:String = output_value("value") as String
            match typ
            | "nil" => e.push( None )
            | "number" => e.push( expected.f64()? )
            | "bool" => e.push( expected.bool()? )
            | "text" => e.push( expected )
            else
              h.fail("Test harness contains unknown type: " + typ )
            end
          end
          e
        end
        assertion_block.add_expectation( expectations )
      end
      for output_name in assertions.values() do
        (let src_block, let src_output) = BlockName(output_name)?
        test_graph.connect( src_block, src_output, "assertions", "equality" )
      end
      test_graph.start()
      result.push((feed,assertion_block, test_graph))
    end
    result
    
  fun parse_test(pathname:String, env:Env): JObj ? =>
    try
      let content = Files.read_text_from_pathname(pathname, env.root)?
      try
        let json = JParse.from_string( content )?
          try
            json as JObj
          else
            env.err.print("The root object in test document is not an Object.")
            error
          end
      else
        env.err.print("Test document is not a correctly formatted JSON document." )
        error
      end
    else
      env.err.print("Unable to read" + _pathname )
      error
    end
