package edu.brown.cs.group.sam;

import java.sql.SQLException;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;

public class Main {
  private String[] args;
  private static final int DEFAULT_PORT = 3335;
  private static final int DEFAULT_S_PORT = 4000;
  private static final String DEFAULT_ADDR = "localhost";
  private static final String DEFAULT_DB =
      "src/main/resources/static/metadata/metadata.sqlite3";

  public static void main(String[] args) {
    new Main(	args).run();
  }

  private Main(String[] args) {
    this.args = args;
  }

  /* parse arguments then start spark gui */
  private void run() {
    // parse the arguments
    OptionParser parser = new OptionParser();

    OptionSpec<Integer> portSpec =
        parser.accepts("port").withRequiredArg().ofType(Integer.class);
    OptionSpec<String> serverSpec =
        parser.accepts("server").withRequiredArg().ofType(String.class);
    OptionSpec<String> dbSpec =
        parser.accepts("db").withRequiredArg().ofType(String.class);

    OptionSet options = null;
    try {
      options = parser.parse(args);
    } catch (joptsimple.OptionException e) {
      System.err.println("ERROR: Issue Parsing Arguments");
      System.exit(1);
    }

    int port = DEFAULT_PORT;
    if (options.has("port")) {
      port = options.valueOf(portSpec);
    }

    String address = DEFAULT_ADDR;
    if (options.has("server")) {
      address = options.valueOf(serverSpec);
    }

    String db = DEFAULT_DB;
    if (options.has("db")) {
      db = options.valueOf(dbSpec);
    }

    // start the gui
    try {
      SamGui gui = new SamGui(port, address, db);
      gui.runSparkServer();

      // add a hook to shut down the server:
      Thread mainThread = Thread.currentThread();
      Runtime.getRuntime().addShutdownHook(new Thread() {
        @Override
        public void run() {
          try {
            mainThread.join();
          } catch (InterruptedException e) {
            System.err.println("ERROR: InterruptedException in main");
          } finally {
            gui.shutdown();
          }
        }
      });
    } catch (SQLException e1) {
      // TODO Auto-generated catch block
      // not sure if this try catch block is the best idea...
      e1.printStackTrace();
    }
  }
}
