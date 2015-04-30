package edu.brown.cs.group.sam;
import static spark.Spark.*;
import spark.*;

public class Main {
  private String[] args;
  private static final int DEFAULT_PORT = 3333;
  private static final int DEFAULT_S_PORT = 7780;
  private static final String DEFAULT_ADDR = "localhost";

  public static void main(String[] args) {
    new Main(args).run();
  }

  private Main(String[] args) {
    this.args = args;
  }

  /* parse arguments then start spark gui */
  private void run() {
   
    
    
//    // parse the arguments
//    OptionParser parser = new OptionParser();
//
//    OptionSpec<Integer> portSpec =
//        parser.accepts("port").withRequiredArg().ofType(Integer.class);
//    OptionSpec<String> serverSpec =
//        parser.accepts("server").withRequiredArg().ofType(String.class);
//    OptionSpec<Integer> serverPortSpec =
//        parser.accepts("sport").withRequiredArg().ofType(Integer.class);

//    OptionSet options = null;
//    try {
//      options = parser.parse(args);
//    } catch (joptsimple.OptionException e) {
//      System.err.println("ERROR: Issue Parsing Arguments");
//      System.exit(1);
//    }
//
    int port = DEFAULT_PORT;
//    if (options.has("port")) {
//      port = options.valueOf(portSpec);
//    }

    String address = DEFAULT_ADDR;
//    if (options.has("server")) {
//      address = options.valueOf(serverSpec);
//    }

    int sPort = DEFAULT_S_PORT;
//    if (options.has("sport")) {
//      sPort = options.valueOf(serverPortSpec);
//    }
    Spark.externalStaticFileLocation("src/main/resources/static");
    Spark.setPort(port);
    get("/hello", (req, res) -> "Hello World");
//    Spark.get(new Route("/hello") {
//       @Override
//       public Object handle(Request request, Response response) {
//          return "Hello World!";
//       }
//    });
    

    // start the gui
//    SamGui gui = new SamGui(port, address, sPort);
//    gui.runSparkServer();

    // add a hook to shut down the server:
//    Thread mainThread = Thread.currentThread();
//    Runtime.getRuntime().addShutdownHook(new Thread() {
//      @Override
//      public void run() {
//        try {
//          mainThread.join();
//        } catch (InterruptedException e) {
//          System.err.println("ERROR: InterruptedException in main");
//        } finally {
//          gui.shutdown();
//        }
//      }
//    });
  }
}
