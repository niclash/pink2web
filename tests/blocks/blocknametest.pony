use "../../blocks"

use "ponytest"

actor Main is TestList

  new create(env: Env) =>
    PonyTest(env, this)

  new make() =>
    None

  fun tag tests(test: PonyTest) =>
    test(BlockNameTest)

  
class iso BlockNameTest is UnitTest

  fun name():String => "BlockName Test"

  fun apply(h: TestHelper)? =>
    let testvalues: Array[(String,String)] = [
      ("a", "1")
      ("a", "12")
      ("a", "123")
      ("a", "1234")
      ("a", "12345")
      ("a", "1123456")
      ("ab", "1")
      ("ab", "12")
      ("ab", "123")
      ("ab", "1234")
      ("ab", "12345")
      ("ab", "1123456")
      ("abc", "1")
      ("abc", "12")
      ("abc", "123")
      ("abc", "1234")
      ("abc", "12345")
      ("abc", "1123456")
      ("abcd", "1")
      ("abcd", "12")
      ("abcd", "123")
      ("abcd", "1234")
      ("abcd", "12345")
      ("abcd", "1123456")
    ]
    for (part1, part2) in testvalues.values() do 
      h.assert_eq[String](part1,  BlockName(part1+"."+part2)?._1 )
      h.assert_eq[String](part2,  BlockName(part1+"."+part2)?._2 )
    end
    
    
