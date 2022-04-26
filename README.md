Prettybad/Web (a/k/a "gimmicky TypeScript hacks")
==========================================================================
In keeping with my life motto, "I bet I could make a pretty bad {x}," this
is a pretty bad web server. It is pretty bad, honestly. It is motivated by
some pretty bad questions, such as:

What if a web server really tried to push the TypeScript compiler?
* Like, wow, that web server is mostly types, why would you do that?

What if you literally could not serve a request...
* Unless you type it and write a strongly-typed parser for it? And,
* Unless that request parses successfully? And,

What if a request is assumed to fail...
* Until you write exhaustive handlers for all of its failure cases?
* And the compiler tells you if your code can handle it?
* And when it fails it tells the user why?

What kinds of wacky libraries of types and functions would you need to
make that happen? And more importantly: at what cost?

Well if you get a kick out of cheering (or jeering) at crazy people
online, you should get out your megaphone... because I think I have the
answers.

Status
--------------------------------------------------------------------------
The primary components of Prettybad/Web are: Parsers, Handlers, Routers,
and Errors. Secondary compenents include various utility types, and the
Fallible library for representing computations that may not succeed.

As of 2022-04-25, the Fallible library is in-progress at the same time as
foundational work for Parsers. The remaining components have not yet been
started.

Design
==========================================================================
Parsers, Routers, Handlers, and Errors
--------------------------------------------------------------------------
Prettybad/Web is a couple types (and some functions for enforcing them):

Parsers,  which validate your data while making bad states unrepresentable
Handlers, which look at parsed requests and figure out how to respond
Routers,  which assign parsers and handlers to URLs your server hosts
Errors,   which are sanitized and can explain themselves to users

That is all you need. Put Prettybad/Web types in all the right places, and
it will not matter whether you use Express or Fastify or Hapi or just
node.js built-in HTTP: your service will be pretty bad, guaranteed.

Origin Story; or, a Parody of Acronyms
==========================================================================
I was reading the docs for a popular new web framework for node.js, which
we will call "yet another web framework, lol," or yawfl ("ya-awful").

Yawfl brags about being written in TypeScript, and its marketing boldly
claims that it will solve all your problems and that it can serve all
kinds of websites.

Yawfl implements all the acronyms for you: S-O-L-I-D, O-O-P, F-P, R-P, and
even combinations of the acronyms, like F-R-P. Yes, Yawfl has all the
letters you need.

Yawfl uses all the best tools and configures them to turn on all the fancy
experimental things, so you can have reflection-only metadata on your data
and decorators on all the things you want to decorate. Your code will run
through so many compilers before Yawfl is done with it, it will be imbued
with life, and it might even be a Chess Grandmaster.

Yawfl shares ideas with all the coolest libraries of 2010, like Angular,
and it works with all the best servers underneath, like Express. Yes, if
you do not know Yawfl, pretty soon you, too, will be obsolete!

Yawfl even does labor for you: it generates API schemas and it can
scaffold a template for anything you need. Do you write code like a game
of mad libs? Then Yawfl is for you!

By the time I stopped reading, I was looking at dot-diagrams of boxes with
funny names with them that had arrows to each other, and none of it had
anything to do with serving requests over the internet.

So I asked myself: what if I wrote yet another Yawfl? But instead of
implementing all the acronyms and configuring your entire stack, and
scaffolding everything and folding all your laundry, what would it do? It
would not force you to write your web server in The One Best Way. It would
be generic, really just a specification, almost. It would really push
TypeScript to its limits, to make sure whatever web server you want to
write, it gets written well.

So what to call it? Yet-another yet-another... uh, Yayafwl? Well, my brain
has not implemented tail-call optimization, and I do not want my head to
explode spewing call stacks everywhere, so that will not do. Since I call
things I build "prettybad {thing}," the first name to come to mind was
"prettybad web."

That was that, and here it is.
