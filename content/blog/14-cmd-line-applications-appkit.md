---
title:  "Running Command-Line Applications from a Mac App"
date: 2020-04-12
layout: post
tags: post
blurb: "You probably don't want to embed a command-line application in your Mac app. But if you do, I'll guide you along the dynamic library and Xcode configuration journey."
---

I've been writing a [Mac app](/webpic) that runs command-line applications under the hood. This app presents itself as a nice wrapper around a few different image-processing command-line applications: you could download my app and "free yourself" from having to manage these command-line image processors yourself.

The idea of building a GUI around a command-line app is well-trodden territory. Git clients are a common example of this genre.[^0] Often, though, these applications assume that you already have the command-line tool installed, and I didn't want to make that assumption with the app I'm building. I wanted some way to embed the command line app binary in my Mac app so that you could download the app on a fresh computer, on any supported version of MacOS, and be able to use it.

I ultimately figured out how, and will tell you soon, but first...

# You likely don't want to do this.

This isn't a typical way of going about running other dependent programs from your program. If you're building a GUI around Git, you'd likely want to include [libgit2](https://libgit2.org/)—a C library for interacting with Git—as a dependency, rather than bundling the `git` command-line executable. If you're processing JPEG images, you'd want to [build and use the libjpeg C API](https://github.com/libjpeg-turbo/libjpeg-turbo/blob/master/BUILDING.md#build-procedure) instead of building libjpeg and including the [`jpegtran` executable](https://linux.die.net/man/1/jpegtran). If you have a library for interacting with the software, you get more natural code hooks for directly interacting with the service, rather than trying to go through a frontend designed for humans.[^1] This library will often give you more power and control. It'll be faster, since you won't be spinning up a new process just to run some code. You'll be more easily able to distribute the library, and the library will often work on more targets.[^2]

You might not want to work with the whole software library, though, especially if it's designed for more complex use cases than yours. You might be sure you can do everything you want to do from the command-line interface. You might not care about the portability concerns, or the additional time and computing overhead that starting a new process will take. If that sounds like you, then carry on.

# But if you're sure, here's how you do it:

I downloaded the program (in my case, `jpegtran`) from [Homebrew](https://brew.sh). This downloaded the compiled binary to my machine. (Alternatively, you could compile jpegtran yourself.) I then located the freshly-installed binary on my disk:

```
$ which jpegtran
/usr/local/bin/jpegtran
```

That's the file I want to embed in my application bundle and call from my code. I copied the file into my Xcode project, in a special but arbitrary directory I had already made. I called it `lib`, for "Libraries."

```
$ cp /usr/local/bin/jpegtran ~/project/Project/lib/
```

Now, you need to tell Xcode that it should copy the `lib` directory when it creates the *application bundle*. In Xcode, go to your project settings and click on your target. In the top navigation bar, you'll see a "Build Phases" tab, and once you select that tab, you'll see "Copy Bundle Resources" as one of the build phases. Expand that build phase, and drag and drop the `lib` directory from Finder into the list of bundle resources.

![](https://files.jameslittle.me/images/tmp/xc1.png)

Now, build and run the app, right click on the icon in the dock, and select "Options → Show in Finder". Right click on the application in the Finder window, hold down option, and select "Show Package Contents". You'll be able to see the contents of the application bundle, including your `lib` directory (under `Contents/Resources`).

For standalone binaries, that's all the embedding you need to do. When you build (and later distribute) your application, the application bundle will have the binary in its `lib` directory, from where your application will be able to programmatically run it:

```swift
let p = Process()
p.executableURL = "Contents/Resources/lib/jpegtran"
p.arguments = ["-progressive", "-verbose", "-optimize", myInputFilePathString]

do {
    let outputHandle = try FileHandle(forUpdating: self.output)
    self.p.standardOutput = outputHandle
    self.p.standardError = self.standardErrorPipe

    try self.p.run()
} catch {
    print("error!")
}
```

This probably won't work, though. It's highly likely that you're not working with a standalone binary; instead, your binary probably depends on one or more **dynamic libraries**. Dynamic libraries (sometimes called *dylibs*) are libraries of code that are installed on the computer in a shared library space, and linked with the executable at runtime. They are contrasted with static libraries, which are "burned into" the executable during compilation. If your binary depends on any dynamic libraries, those dylibs are not guaranteed to be included on the user's system.[^3] we have to first include those dylibs in the application bundle, then tweak the binary so it will tell the linker to look for those dylibs in the application bundle instead of in the shared library space.

## Wait, what?

Each binary contains a list of the name and location of each dylib it depends upon. Those names are set during compilation, so they'll be accurate for whatever system they're compiled for. You can list the dylibs a given application depends on using `otool`:

```
$ otool -L /usr/local/bin/jpegtran
/usr/local/bin/jpegtran:
	/usr/lib/libSystem.B.dylib (compatibility version 1.0.0, current version 1281.0.0)
```

This shows that `jpegtran` relies on one dylib, and that dylib is located at `/usr/lib/libSystem.B.dylib`. Your goal for the rest of the article is to patch the `jpegtran` binary so that instead of pointing in `/usr/lib`, a location outside the app sandbox, it instead points at the same dylib that we'll copy into the application bundle.

## Alright.

To include the dylib in our application bundle, we create a new directory next to `lib` (I called it `frameworks`), and copy the dylib into that directory:

```
$ cp /usr/lib/libSystem.B.dylib ~/project/Project/frameworks/
```

Create a new "Copy Files" build phase and set the destination to "Frameworks". Drag your newly-copied dylib from the Finder to the list of files in Xcode. When you build your project, you should see the dylib in `Contents/Frameworks`.

![](https://files.jameslittle.me/images/tmp/xc2.png)

Now, your dylibs will be included whenever you build and distribute your application, you just need to point your executable towards the dylib's new home.

Usually, the executable points to an absolute file path. We don't know where the application bundle will live on disk, so we can't use an absolute path here. Fortunately, `dyld` (the macOS linker) recognizes some keywords that let us build up a relative path instead. For example, `@executable_path` will be replaced by the path of the binary that requested that dylib. With the `install_name_tool` utility, we can change the executable so that it points to a dylib path relative to `@executable_path`. Since the structure of the application binary will always be the same, we can be confident that our relative paths will always resolve.

As a reminder, here are the relevant files as seen in the application bundle:

<pre style="line-height: 1.2"><code>Project.app
├─ Contents
   ├─ Resources
   │  ├─ lib
   │     ├─ jpegtran
   ├─ Frameworks
      ├─ libSystem.B.dylib
</code></pre>

We use this command to reconfigure `jpegtran` to point to a new location for `libSystem.B.dylib`:

```
$ cd project/Project/lib
$ sudo install_name_tool \
   -change "/usr/lib/libSystem.B.dylib" \
   "@executable_path/../../Frameworks/libSystem.B.dylib \
   jpegtran
```

If the Swift code to run `jpegtran` didn't work before, it should work now. When your app runs `jpegtran`, `jpegtran` will no longer ask for a dylib outside the app sandbox; instead, it will ask for a dylib within the application bundle.

If your binary relies on multiple dylibs, you will have to go through this process for each one. Sometimes, you might encounter a dylib that depends on another dylib. You can use the same tools (`otool` and `install_name_tool`) to reconfigure the dylib, just as you did to reconfigure the executable.

# That was exhausting.

Yes.

# Resources

- [@bdash on StackOverflow, answering "How to set dyld_library_path in Xcode"](https://stackoverflow.com/a/15106738/3841018)
- ["@executable path, @load path and @rpath" by Greg Hurrell (@wincent)](https://wincent.com/wiki/@executable_path,_@load_path_and_@rpath)
- [Mike Ash: "Linking and Install Names"](https://www.mikeash.com/pyblog/friday-qa-2009-11-06-linking-and-install-names.html)



[^0]: Just like with actual works of art, you can get into weird subgenres here: the subgenre of "GUIs around a command-line app" is "Terminal-based GUIs around a command-line app", like [GRV](https://github.com/rgburke/grv).

[^1]: It's not entirely natural to think of a command-line application as a frontend designed for humans, especially since there are so many tools (like Bash scripts) that programmatically interact with command-line interfaces.

[^2]: A term which here means "the set of computers, processors, and/or operating systems you want to compile your code to work with."

[^3]: Even if they were, a sandboxed Mac application can't access files (including dynamic libraries) outside the application bundle unless given specific permission. If you try to call a dylib from within the sandbox, it'll fail.