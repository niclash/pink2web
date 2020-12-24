I have been fascinated by event-driven systems, not in the modern sense where events fly over the network to trigger action at the other end, but the programming model where each internal "object" has N event types to indicate what it is doing, and that anything else can subscribe to such events.

This dramatically increases decoupling, as the event producer has no idea who is subscribing or why. But we can go one step further and view each object as a reactor to incoming events. That requires an external agent to do the binding of event producers and event consumers.

In a typical object oriented programming language, such as Java or C#, it is required that the programmer does absolutely everything right, to ensure that events don't contain shared mutable state, which is often a lot harder to do correctly, than it sounds on paper.

An Actor-based programming model makes the task a lot easier. But Akka can't make such promises and even well-intended programmers (like myself) will end up doing the wrong thing, sometimes even making the sacrifice for well-intended reasons "now", to only bite you badly later. 

Erlang, the canonical actor language, achieves this by having everything immutable and the language can ensure that there is no shared mutable state. And I have been fiddling with Erlang (and its more syntax-friendly sibling Elixir) on and off for the last 5 years or so, but there are two things that have been bothering me to no end; performance is one, but more so the dynamic typing drives me nuts. I make syntax mistakes, I forget which type is in which variable or which position in a tuple. Sorry, but I have a computer that is really good at that, so why can't I let it do that?

So, by pure coincidence, not even sure what it was, I stumbled across a mostly unknown language called Pony Language. The list of features just blows my mind, in no particular order

* Actors are first class citizens, like Erlang
* Object Oriented - but no class inheritance
* Strongly, statically typed
* Generics
* Data race free - no locks available and no locks in the runtime
* Garbage collection - but no "stop the world"
* High performance - compiles to binary. 
* C foreign function - Calls to/from C without special tools
* No "null pointers" - All variables/members/aliases must be initialized.
* Union types - variable can contain an arbitrarily typed values.
* Intersection types - multiple types must be present.
* No Exceptions - Simpler "error" system
* Pattern Matching on both values and types
* Asynchronous methods, rather than messages in an inbox to be read. No out-of-order handling of sent messages.
* No fat runtime or vm to run on.
* Security system based around a capabilities model
* Reference Capabilities - WHAT? 

The Reference Capabilities (refcap) really got me off guard. And it was a hard concept to understand at first. And it is still (10 days of full-time programming) not intuitively coming to me.

What the designers of Pony have realized is that it is possible to have constraints on the references to objects, and not only on the objects themselves. In a regular OO language, you can make a class immutable by restricting access to member variables and have no mutating code in the class. But in Pony, it is possible to declare the reference, also called an alias, to an object as immutable, and the compiler's type system will ensure that this is not violated. Yes, really!! And it is beyond the scope of this article to explain how that is even possible.

This feature is my new best friend. I HATE it so much, because it forces me to do the right thing. I can't do the "well, in this case it doesn't matter, because I know X" excuse. And it has forced me to re-think structure of my beloved event-driven system, with blocks reacting to incoming events and producing events, that a separate system binds together to applications.

But once I submit to the IRON FIST of the compiler, I don't need to worry about thread-safety, cast problems, null pointers and what not. It will work as I have written it, seen at its "local scope". No global interference of circumstantial action, that I forgot to think about, can upset the code that I am looking at on my screen.

Speaking of code, I think Pony syntax is quite nice. Python-like but without the non-sense of identation-sensitivity (the number one reason for me to stay away from Python). Let's take a piece from my own codebase (now ~1600 lines of code, not counting comments or blank lines)


```
type Linkable is ( Number | Bool | String )

class Link[TYPE: Linkable val]
  let block: Block tag
  let input: String
  
  new create( destBlock: Block tag, destInput: String ) =>
    block = destBlock
    input =  destInput
    
  fun update( new_value: Linkable ) =>
    block.update(input, new_value )
  
  fun describe(): (String,Block tag) =>
    (input, block)
```
