package edu.brown.cs.group.sam;

import it.sauronsoftware.jave.EncoderException;
import it.sauronsoftware.jave.InputFormatException;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import org.farng.mp3.AbstractMP3Tag;
import org.farng.mp3.MP3File;
import org.farng.mp3.TagException;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import com.vividsolutions.jts.geom.Coordinate;

import edu.brown.cs.group.sam.filesystem.FilesystemViewer;
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
    Spark.post("/musicdirectory", new MusicDirectoryHandler());
    Spark.post("/changeFocus", new FocusHandler(ap));
    Spark.post("/queryFilesystem", new FilesystemHandler());
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
      if (ap.getCoordinate() == null) {
        weight = 1;
      } else if (ap.getClients().get(id) == null) {
        weight = 1;
      } else {
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
      List<HashMap<String, Object>> clientInfo =
          new ArrayList<HashMap<String, Object>>();
      for (ClientPoint c : allClients.values()) {

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
      QueryParamsMap qm = req.queryMap();
      String song = GSON.fromJson(qm.value("filePath"), String.class);

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

  private static class MusicDirectoryHandler implements Route {

    private static final Map<String, Song> SONGS = new HashMap<>();
    private static final List<String> DECODED_TYPES = Arrays.asList("4xm",
        "MTV", "RoQ", "aac", "ac3", "aiff", "alaw", "amr", "apc", "ape",
        "asf", "au", "avi", "avs", "bethsoftvid", "c93", "daud", "dsicin",
        "dts", "dv", "dxa", "ea", "ea_cdata", "ffm", "film_cpk", "flac",
        "flic", "flv", "gif", "gxf", "h261", "h263", "h264", "idcin",
        "image2", "image2pipe", "ingenient", "ipmovie", "libnut", "m4v",
        "matroska", "mjpeg", "mm", "mmf", "mov,mp4,m4a,3gp,3g2,mj2",
        "mp3", "mpc", "mpc8", "mpeg", "mpegts", "mpegtsraw", "mpegvideo",
        "mulaw", "mxf", "nsv", "nut", "nuv", "ogg", "psxstr", "rawvideo",
        "redir", "rm", "rtsp", "s16be", "s16le", "s8", "sdp", "shn",
        "siff", "smk", "sol", "swf", "thp", "tiertexseq", "tta", "txd",
        "u16be", "u16le", "u8", "vc1", "vmd", "voc", "wav", "wc3movie",
        "wsaud", "wsvqa", "wv", "yuv4mpegpipe");

    private class Song {
      private String title;
      private String album;
      private String artist;
      private String filePath;

      public Song(String title, String album, String artist,
          String filePath) {
        this.title = title;
        this.album = album;
        this.artist = artist;
        this.filePath = filePath;

        SONGS.put(filePath, this);
      }

      public Song getSong(String id) {
        return SONGS.get(id);
      }
    }

    @Override
    public Object handle(Request req, Response res) {
      QueryParamsMap qm = req.queryMap();
      String musicDirectory = qm.value("dir");
      String encode = qm.value("encode");

      File[] files = new File(musicDirectory).listFiles();

      List<Song> songs = new ArrayList<>();

      for (File f : files) {
        String[] fileNameArr = f.getName().split("\\.");
        String fileType = "";

        if (fileNameArr.length > 1) {
          fileType = fileNameArr[1];
        }

        if (fileType.equalsIgnoreCase("mp3")) {
          try {
            songs.add(makeSong(f));
          } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
          } catch (TagException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
          }
        } else {
          if (encode.equals("encode")) {
            if (DECODED_TYPES.contains(fileType)) {
              try {
                File mp3File = Mp3Encoder.encode(f);
                songs.add(makeSong(mp3File));
              } catch (IllegalArgumentException e) {
                System.err.println("1");
              } catch (InputFormatException e) {
                System.err.println(e);
                System.err.println("2");
              } catch (EncoderException e) {
                System.err.println("3");
              } catch (IOException e) {
                e.printStackTrace();
              } catch (TagException e) {
                e.printStackTrace();
              }
            }
          }
        }
      }

      return GSON.toJson(songs.toArray(new Song[0]));
    }

    private Song makeSong(File mp3File) throws IOException, TagException {
      MP3File mp3 = new MP3File(mp3File);
      AbstractMP3Tag tag;
      if (mp3.hasID3v1Tag()) {
        tag = mp3.getID3v1Tag();
      } else if (mp3.hasID3v2Tag()) {
        tag = mp3.getID3v2Tag();
      } else if (mp3.hasFilenameTag()) {
        tag = mp3.getFilenameTag();
      } else {
        return new Song("", "", "", mp3File.getAbsolutePath());
      }

      return new Song(tag.getSongTitle(), tag.getAlbumTitle(),
          tag.getLeadArtist(), mp3File.getAbsolutePath());
    }
  }

  private class FilesystemHandler implements Route {

    @Override
    public Object handle(Request req, Response res) {
      QueryParamsMap qm = req.queryMap();
      String path = qm.value("path");

      if (path == null) {
        path = "";
      }

      FilesystemViewer viewer = new FilesystemViewer(path);
      return GSON.toJson(viewer);
    }

  }

  public void shutdown() {
    server.close();
  }
}
