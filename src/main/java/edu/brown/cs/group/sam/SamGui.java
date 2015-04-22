package edu.brown.cs.group.sam;

import it.sauronsoftware.jave.EncoderException;
import it.sauronsoftware.jave.InputFormatException;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import com.vividsolutions.jts.geom.Coordinate;

import edu.brown.cs.group.sam.mp3converter.Mp3Encoder;
import edu.brown.cs.group.sam.panAlgorithm.AmplitudePanner;
import edu.brown.cs.group.sam.panAlgorithm.ClientPoint;
import edu.brown.cs.group.sam.server.MusicServer;
import edu.brown.cs.group.sam.sparkgui.SparkGui;
import spark.ModelAndView;
import spark.QueryParamsMap;
import spark.Request;
import spark.Response;
import spark.Route;
import spark.Spark;
import spark.TemplateViewRoute;

/**
 * Class that extends the basic implementation of a spark graphical user
 * interface.
 *
 * This handles the requests made by the front end for back-end information.
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
  private edu.brown.cs.group.sam.server.MusicServer server;
  private AmplitudePanner ap;
  private Map<String, ClientPoint> allClients;
  private AtomicInteger clientId;

  public SamGui(int port, String address, int sPort) {
    this.port = port;
    serverAddress = address;
    serverPort = sPort;
    ap = new AmplitudePanner();
    allClients = new HashMap<String, ClientPoint>();
    clientId = new AtomicInteger();
  }

  /**
   * This method runs the spark server at the given port and then sets up get
   * and post requests.
   *
   * @param port The port number at which to run the spark server
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
    Spark.post("/connectClient", new ConnectClientHandler(clientId));
    Spark.get("/clients", new ClientPosHandler(ap));
    Spark.post("/updatePosition", new UpdatePosHandler(ap));
    Spark.post("/mp3encode", new Mp3EncodeHandler());
    Spark.post("/changeFocus", new FocusHandler(ap));
  }

  /**
   * Class that models the response when the home page is loaded on the
   * front-end.
   *
   * @author plscott
   *
   */
  private class HomeHandler implements TemplateViewRoute {
    /**
     * Method that handles get requests from the home page on the front-end.
     *
     * @param req the request
     * @param res the response
     */
    @Override
    public ModelAndView handle(Request req, Response res) {
      Map<String, Object> variables =
          new ImmutableMap.Builder<String, Object>().build();

      return new ModelAndView(variables, "home.ftl");
    }
  }

  /**
   * Class that models the response when the server page is loaded on the
   * front-end.
   *
   * @author plscott
   *
   */
  private class ServerHandler implements TemplateViewRoute {
    /**
     * Method that handles get requests from the server page on the front-end.
     *
     * @param req the request
     * @param res the response
     */
    @Override
    public ModelAndView handle(Request req, Response res) {
      Map<String, Object> variables =
          new ImmutableMap.Builder<String, Object>().build();

      return new ModelAndView(variables, "server.ftl");
    }
  }

  /**
   * Class that models the response when the client page is loaded on the
   * front-end.
   *
   * @author plscott
   *
   */
  private class ClientHandler implements TemplateViewRoute {
    /**
     * Method that handles get requests from the client page on the front-end.
     *
     * @param req the request
     * @param res the response
     */
    @Override
    public ModelAndView handle(Request req, Response res) {
      Map<String, Object> variables =
          new ImmutableMap.Builder<String, Object>().build();

      return new ModelAndView(variables, "client.ftl");
    }
  }

  /**
   * Class that models the response when the songs page is loaded on the
   * front-end.
   *
   * @author plscott
   *
   */
  private class SongsHandler implements TemplateViewRoute {
    /**
     * Method that handles get requests from the songs page on the front-end.
     *
     * @param req the request
     * @param res the response
     */
    @Override
    public ModelAndView handle(Request req, Response res) {
      Map<String, Object> variables =
          new ImmutableMap.Builder<String, Object>().build();

      return new ModelAndView(variables, "songs.ftl");
    }
  }

  /**
   * Class that returns output volume for a class
   *
   * @author eselliso
   *
   */
  private static class VolumeHandler implements Route {
    private AmplitudePanner ap;

    /**
     * Constructed with ap
     *
     * @param ap - amplitude panner needed
     */
    public VolumeHandler(AmplitudePanner ap) {
      this.ap = ap;
    }

    /**
     * Method that handles get volume output of clients page on the front-end.
     *
     * @param req the request
     * @param res the response
     */
    @Override
    public Object handle(Request req, Response res) {

      QueryParamsMap map = req.queryMap();
      
      String id = map.value("id");
      System.out.println(id);
      Map<String, ClientPoint> clients = ap.getClients();
      double weight = 1;
      if (ap.getCoordinate()==null) {
        weight = 1;
      }
      else if (ap.getClients().get(id)==null) {
        weight = 1;
      }
      else {
        weight = ap.getVolume(id);
      }
      Map<String, Object> variables = ImmutableMap.of("volume", weight);
      return GSON.toJson(variables);
    }
  }

  /**
   * Class that returns all positions of clients
   *
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
      List<HashMap<String, Object>> clientInfo = new ArrayList<HashMap<String, Object>>();
      for (ClientPoint c: allClients.values()) {
        
        HashMap<String, Object> client = new HashMap<String, Object>();
        client.put("x", c.getPoint().getCoordinate().x);
        client.put("y", c.getPoint().getCoordinate().y);
        client.put("id", c.getId());
        clientInfo.add(client);
      } 
      Map<String, Object> variables =
          ImmutableMap.of("clients", clientInfo);
      
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

      Map<String, Object> variables =
          new ImmutableMap.Builder<String, Object>()
              .put("message", message).put("id", clientNumber)
              .put("server_url", serverAddress)
              .put("server_port", serverPort).put("success", 0).build();

      return GSON.toJson(variables);
    }
  }

  /**
   * Class to handle updating of position
   *
   * @author eselliso
   *
   */
  private class UpdatePosHandler implements Route {
    AmplitudePanner ap;

    /**
     * Instantiated withh reference to the Amplitude Panner
     *
     * @param ap
     */
    public UpdatePosHandler(AmplitudePanner ap) {
      this.ap = ap;
    }

    @Override
    public Object handle(Request request, Response response) {
      QueryParamsMap map = request.queryMap();

      String x1 = map.value("x");
      String y1 = map.value("y");
      String id = map.value("id");
      String name = request.queryMap().value("name");


      System.out.println(x1);
      System.out.println(request);
      Double x = Double.parseDouble(x1);
      Double y = Double.parseDouble(y1);
      double[] pos = { x, y };
      ClientPoint client = ap.getClients().get(id);
      if (client != null) {
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
   * Handles changing focus
   *
   * @author eselliso
   *
   */
  private class FocusHandler implements Route {
    AmplitudePanner ap;

    /**
     * Instantiated withh reference to the Amplitude Panner
     *
     * @param ap
     */
    public FocusHandler(AmplitudePanner ap) {
      this.ap = ap;
    }

    @Override
    public Object handle(Request request, Response response) {
      QueryParamsMap map = request.queryMap();

      String x1 = map.value("x");
      String y1 = map.value("y");
      Double x = Double.parseDouble(x1);
      Double y = Double.parseDouble(y1);
      Coordinate c1 = new Coordinate(x, y);
      ap.calcluteVolume(c1);
      String message = "Success";
      Map<String, Object> variables =
          ImmutableMap.of("message", message, "success", 0);
      return GSON.toJson(variables);
    }
  }

  /**
   * Class that handles the gui request to start the music server.
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
      } else {
        // just for testing: set file and broadcast
        String path = "/Users/Peter/Desktop/bittersweet.mp3";
        File file = new File(path);
        server.setMusicFile(file);
        server.broadcast();
      }

      Map<String, Object> variables =
          new ImmutableMap.Builder<String, Object>().build();

      return GSON.toJson(variables);
    }
  }

  /**
   * Route for encoding most audio files to .mp3.
   *
   * @author yk46
   *
   */
  private class Mp3EncodeHandler implements Route {

    @Override
    public Object handle(Request req, Response res) {
      System.out.println("HI");
      QueryParamsMap qm = req.queryMap();
      File song = GSON.fromJson(qm.value("song"), File.class);
      System.out.println(song.getName());

      try {
        return GSON.toJson(Mp3Encoder.encode(song));
      } catch (IllegalArgumentException e) {
        // TODO Auto-generated catch block
        System.err.println("1");
      } catch (InputFormatException e) {
        // TODO Auto-generated catch block
        System.err.println("2");
      } catch (EncoderException e) {
        // TODO Auto-generated catch block
        System.err.println("3");
      }

      return song;
    }

  }

  public void shutdown() {
    server.close();
  }
}