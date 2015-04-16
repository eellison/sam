package edu.brown.cs.group.sam;

import joptsimple.OptionParser;
import joptsimple.OptionSet;
import joptsimple.OptionSpec;

public class Main {
  private String[] args;
  private static final int DEFAULT_PORT = 3333;

  public static void main(String[] args) {
    new Main(args).run();
  }

  private Main(String[] args) {
    this.args = args;
  }

  /* parse arguments then start spark gui */
  private void run() {
    // parse the arguments
    OptionParser parser = new OptionParser();

    OptionSpec<Integer> portSpec = parser.accepts("port")
        .withRequiredArg().ofType(Integer.class);

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

    SamGui gui = new SamGui();
    gui.runSparkServer(port);
  }
}
