package edu.brown.cs.group.sam;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

import spark.ModelAndView;
import spark.Request;
import spark.Response;
import spark.Route;
import spark.Spark;
import spark.TemplateViewRoute;
import edu.brown.cs.group.sam.panAlgorithm.AmplitudePanner;
import edu.brown.cs.group.sam.panAlgorithm.ClientPoint;
import edu.brown.cs.group.sam.server.MusicServer;
import edu.brown.cs.group.sam.server.Server;
import edu.brown.cs.group.sam.sparkgui.SparkGui;

/**
 * Class that extends the basic implementation of
 * a spark graphical user interface.
 *
 * This handles the requests made by the front end for
 * back-end information.
 *
 * @author plscott
 *
 */
public class SamGui extends SparkGui {
  /* a GSON object for communicating with the GUI */
  private static final Gson GSON = new Gson();

  // instance variables declared
  private int port;
  private String serverAddress;
  private int serverPort;
  private Server server;
  private AmplitudePanner ap;
  private Map<String, ClientPoint> allClients;
  private AtomicInteger clientId;

  public SamGui(int port, String address, int sPort) {
    this.port = port;
    this.serverAddress = address;
    this.serverPort = sPort;
    ap = new AmplitudePanner();
    allClients = new HashMap<String, ClientPoint>();
    clientId = new AtomicInteger();
  }

  /**
   * This method runs the spark server at the given port
   * and then sets up get and post requests.
   *
   * @param port The port number at which to run the
   * spark server
   */
  public void runSparkServer() {
    super.runSparkServer(port);

    // set up spark get requests to set up the pages
    Spark.get("/home", new HomeHandler(), super.getEngine());
    Spark.get("/server", new ServerHandler(), super.getEngine());
    Spark.get("/client", new ClientHandler(), super.getEngine());
    Spark.get("/songs", new SongsHandler(), super.getEngine());
    // set up post handlers for interactions with gui
    Spark.post("/startServer", new StartServerHandler());
    Spark.get("/volume", new VolumeHandler(ap));
    Spark.get("/connect", new ConnectClientHandler(clientId));
    Spark.get("/allClients", new ClientPosHandler(ap));
  }

  /**
   * Class that models the response when the home page
   * is loaded on the front-end.
   *
   * @author plscott
   *
   */
  private class HomeHandler implements TemplateViewRoute {
    /**
     * Method that handles get requests from the home
     * page on the front-end.
     *
     * @param req the request
     * @param res the response
     */
    @Override
    public ModelAndView handle(Request req, Response res) {
      Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
          .build();

      return new ModelAndView(variables, "home.ftl");
    }
  }

  /**
   * Class that models the response when the server page
   * is loaded on the front-end.
   *
   * @author plscott
   *
   */
  private class ServerHandler implements TemplateViewRoute {
    /**
     * Method that handles get requests from the server
     * page on the front-end.
     *
     * @param req the request
     * @param res the response
     */
    @Override
    public ModelAndView handle(Request req, Response res) {
      Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
          .build();

      return new ModelAndView(variables, "server.ftl");
    }
  }

  /**
   * Class that models the response when the client page is
   * loaded on the front-end.
   *
   * @author plscott
   *
   */
  private class ClientHandler implements TemplateViewRoute {
    /**
     * Method that handles get requests from the client
     * page on the front-end.
     *
     * @param req the request
     * @param res the response
     */
    @Override
    public ModelAndView handle(Request req, Response res) {
      Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
          .build();

      return new ModelAndView(variables, "client.ftl");
    }
  }

  /**
   * Class that models the response when the songs page is
   * loaded on the front-end.
   *
   * @author plscott
   *
   */
  private class SongsHandler implements TemplateViewRoute {
    /**
     * Method that handles get requests from the songs
     * page on the front-end.
     *
     * @param req the request
     * @param res the response
     */
    @Override
    public ModelAndView handle(Request req, Response res) {
      Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
          .build();

      return new ModelAndView(variables, "songs.ftl");
    }
  }
  /**
   * Class that returns output volume for a class
   * @author eselliso
   *
   */
  private static class VolumeHandler implements Route {

    private AmplitudePanner ap;
    /**
     * Constructed with ap
     * @param ap - amplitude panner needed
     */
    public VolumeHandler(AmplitudePanner ap) {
      this.ap = ap;
    }
    /**
     * Method that handles get volume output of clients
     * page on the front-end.
     *
     * @param req the request
     * @param res the response
     */
    @Override
    public Object handle(Request req, Response res) {
      
      Map<String, String> map = req.params();
      String id = map.get("id");
      double weight = ap.getVolume(id);
      Map<String, Object> variables =
          ImmutableMap.of("volume", weight);
      return GSON.toJson(variables);
    }
  }
  /**
   * Class that returns all positions of clients 
   * @author eselliso
   *
   */
  private static class ClientPosHandler implements Route {
    
    private AmplitudePanner ap;

    public ClientPosHandler(AmplitudePanner ap) {
      this.ap = ap;
    }
    
    @Override
    public Object handle(Request request, Response response) {
      
      Map<String, ClientPoint> allClients = ap.getClients();
      Map<String, Object> variables =
          ImmutableMap.of("clients", allClients);
      return GSON.toJson(variables);
    }
  }
  
  private class ConnectClientHandler implements Route {
    
    AtomicInteger clientNum;
    
    public ConnectClientHandler(AtomicInteger clientCounter) {
      clientNum = clientCounter;
    }
       
    @Override
    public Object handle(Request request, Response response) {
      
      int clientNumber = clientNum.incrementAndGet();
      
      String message = "Successful";
      
      int success = 0;
      
      
      Map<String, Object> variables =
          ImmutableMap.of("message", message, "id", clientNumber, "success", 0);
      return GSON.toJson(variables);

    }
    
    
  }
  
  
  private class UpdatePosHandler implements Route {

    AmplitudePanner ap;
    
    public UpdatePosHandler(AmplitudePanner ap) {
      this.ap = ap;
    }
    
    @Override
    public Object handle(Request request, Response response) {
      
      Map<String, String> map = request.params();
      
      String id = map.get("id");
      Double x = Double.parseDouble(map.get("x"));
      Double y = Double.parseDouble(map.get("y"));
      double[] pos = {x, y};
      ClientPoint client = ap.getClients().get(id);
      if (client!=null) {
        ap.removeClient(client);
      }
      client = new ClientPoint(pos, id, 1);
      ap.addClient(client);
      String message = "Success";
      Map<String, Object> variables =
          ImmutableMap.of("message", message, "success", 0);
      return GSON.toJson(variables);
    }

  }


  /**
   * Class that handles the gui request to start the
   * music server.
   *
   * @author plscott
   *
   */
  private class StartServerHandler implements Route {
    @Override
    public Object handle(Request req, Response res) {
      if (server == null) {
        server = new MusicServer(serverAddress, serverPort);
        server.run(); 
      }

      Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
          .build();

      return GSON.toJson(variables);
    }
  }

  public void shutdown() {
    server.close();
  }
}