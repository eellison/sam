package edu.brown.cs.group.sam;

import it.sauronsoftware.jave.EncoderException;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import org.apache.tika.exception.TikaException;
import org.xml.sax.SAXException;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import com.vividsolutions.jts.geom.Coordinate;

import edu.brown.cs.group.sam.filesystem.FilesystemViewer;
import edu.brown.cs.group.sam.metadata.MetadataQuery;
import edu.brown.cs.group.sam.metadata.MetadataReader;
import edu.brown.cs.group.sam.metadata.SongInfo;
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
  private static MusicServer server;
  private AmplitudePanner ap;
  private AtomicBoolean mute;
  private AtomicInteger clientId;
  private MetadataQuery mq;

  public SamGui(int port, String address, int sPort, String db)
      throws SQLException {
    this.port = port;
    serverAddress = address;
    serverPort = sPort;
    ap = new AmplitudePanner();
    clientId = new AtomicInteger();
    mq = new MetadataQuery(db);
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
    AtomicBoolean quickUpdate = new AtomicBoolean();
    mute = new AtomicBoolean(false);
    Spark.get("/volume", new VolumeHandler(ap, quickUpdate, mute));
    Spark.post("/connectClient", new ConnectClientHandler(clientId));
    Spark.get("/clients", new ClientPosHandler(ap));
    Spark.post("/updatePosition", new UpdatePosHandler(ap, quickUpdate));
    Spark.post("/mute", new MuteHandler(mute));
    Spark.post("/mp3encode", new Mp3EncodeHandler());
    Spark.post("/chooseMusicDirectory", new MusicDirectoryHandler(mq));
    Spark.post("/changeFocus", new FocusHandler(ap, mute));
    Spark.post("/queryFilesystem", new FilesystemHandler());
    Spark.post("/playSong", new PlaySongHandler());
    Spark.post("/editMetadata", new MetadataHandler(mq));
    Spark.post("/getIP", new IPAddressHandler());
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
    private AtomicBoolean quickUpdate, mute;

    /**
     * Constructed with ap
     *
     * @param ap - amplitude panner needed
     */
    public VolumeHandler(AmplitudePanner ap, AtomicBoolean quickUpdate, AtomicBoolean mute) {
      this.ap = ap;
      this.quickUpdate = quickUpdate;
      this.mute = mute;
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
      if (Double.isNaN(weight)) {
    	  weight = 1;
      }
      System.out.println("Volume handler");
      System.out.println(mute.get());
      if (mute.get()) {
    	  weight = 0;
      }
      Map<String, Object> variables =
          ImmutableMap.of("volume", weight, "quick", quickUpdate.get());
      System.out.println(variables);
      return GSON.toJson(variables);
    }
  }
  private static class IPAddressHandler implements Route {

	@Override
	public Object handle(Request arg0, Response arg1) {
		
		String address = "";
		boolean success = true;
	    InetAddress ip = null;;
		try {
			ip = InetAddress.getLocalHost();			
		} catch (UnknownHostException e) {
			success = false;
		}
		if (success) {
			String[]  addr = ip.getHostAddress().split("/");
			address = addr[addr.length-1];
		}
	    Map<String, Object> variables =
	    		ImmutableMap.of("success", success, "address", address);

		// TODO Auto-generated method stub
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
        Double volume = ap.getVolume(c.getId());
        if (volume==null) {
        	volume = 0.;
        }
        client.put("volume", volume);
        System.out.println(ap.getVolume(c.getId()));
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
    AtomicBoolean quickUpdate;

    /**
     * Instantiated withh reference to the Amplitude Panner
     *
     * @param ap
     */
    public UpdatePosHandler(AmplitudePanner ap, AtomicBoolean quickUpdate) {
      this.quickUpdate = quickUpdate;
      this.ap = ap;
    }

    @Override
    public Object handle(Request request, Response response) {
      QueryParamsMap map = request.queryMap();

      String x1 = map.value("x");
      String y1 = map.value("y");
      String id = map.value("id");
      Boolean quick =
          Boolean.parseBoolean(request.queryMap().value("quick"));
      quickUpdate.set(quick);
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
  private class MuteHandler implements Route {
	  
	AtomicBoolean mute;
	    
	public MuteHandler(AtomicBoolean mute) {
	  this.mute = mute;
	}

	@Override
	public Object handle(Request request, Response response) {
		System.out.println("mute");
		mute.set(!mute.get());
		System.out.println("Mute handler");
		System.out.println(mute.get());
		Map<String, Object> variables = ImmutableMap.of("message", "success");
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
    AtomicBoolean mute;

    /**
     * Instantiated withh reference to the Amplitude Panner
     *
     * @param ap
     */
    public FocusHandler(AmplitudePanner ap, AtomicBoolean mute) {
      this.ap = ap;
      this.mute = mute;
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

      Map<String, ClientPoint> allClients = ap.getClients();
      List<HashMap<String, Object>> clientInfo =
          new ArrayList<HashMap<String, Object>>();

      for (ClientPoint c : allClients.values()) {

        HashMap<String, Object> client = new HashMap<String, Object>();
        Double xc = c.getPoint().getCoordinate().x;
        if (xc == null) {
        	xc = -50.;
        }
        Double yc = c.getPoint().getCoordinate().y;
        if (xc == null) {
        	yc = -50.;
        }
        client.put("x", xc);
        client.put("y", yc);
        client.put("id", c.getId());
        Double volume = ap.getVolume(c.getId());
        if (volume == null) {
        	volume = 0.0000001;
        }
        if (mute.get()) { 
        	volume = 0.;
        }
        client.put("volume", volume);
        clientInfo.add(client);
      }

      Map<String, Object> variables =
          ImmutableMap.of("message", message, "success", 0, "clients", clientInfo);
      System.out.println(variables);
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
      }

      Map<String, Object> variables =
          new ImmutableMap.Builder<String, Object>()
          .put("socket_url", serverAddress)
          .put("socket_port", serverPort).build();

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
      } catch (IllegalArgumentException | EncoderException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }

      return song;
    }

  }

  /**
   * Grabs and loads all metadata info for the songs in the given directory.
   *
   * @author young-raekim
   *
   */
  private static class MusicDirectoryHandler implements Route {

    private static final List<String> DECODEABLE = Arrays.asList("4xm",
        "MTV", "RoQ", "aac", "ac3", "aiff", "alaw", "amr", "apc", "ape",
        "asf", "au", "avi", "avs", "bethsoftvid", "c93", "daud", "dsicin",
        "dts", "dv", "dxa", "ea", "ea_cdata", "ffm", "film_cpk", "flac",
        "flic", "flv", "gif", "gxf", "h261", "h263", "h264", "idcin",
        "image2", "image2pipe", "ingenient", "ipmovie", "libnut", "m4v",
        "matroska", "mjpeg", "mm", "mmf", "mov", "mp4", "m4a", "3gp",
        "3g2", "mj2", "mp3", "mpc", "mpc8", "mpeg", "mpegts", "mpegtsraw",
        "mpegvideo", "mulaw", "mxf", "nsv", "nut", "nuv", "ogg", "psxstr",
        "rawvideo", "redir", "rm", "rtsp", "s16be", "s16le", "s8", "sdp",
        "shn", "siff", "smk", "sol", "swf", "thp", "tiertexseq", "tta",
        "txd", "u16be", "u16le", "u8", "vc1", "vmd", "voc", "wav",
        "wc3movie", "wsaud", "wsvqa", "wv", "yuv4mpegpipe");

    private MetadataQuery mq;

    public MusicDirectoryHandler(MetadataQuery mq) {
      this.mq = mq;
    }

    @Override
    public Object handle(Request req, Response res) {
      QueryParamsMap qm = req.queryMap();
      String musicDirectoryPath = qm.value("dir");
      File musicDirectory = new File(musicDirectoryPath);

      if (musicDirectory.getName().equals("")) {
        musicDirectory = new File(System.getProperty("user.home"));
      }

      File[] files = musicDirectory.listFiles();

      List<SongInfo> songs =
          getSongInfoFromFlattenedDirectory(files, new ArrayList<>());

      return GSON.toJson(songs.toArray(new SongInfo[0]));
    }

    private List<SongInfo> getSongInfoFromFlattenedDirectory(File[] files,
        List<SongInfo> songs) {
      for (File f : files) {
        if (f.isDirectory()) {
          songs.addAll(getSongInfoFromFlattenedDirectory(f.listFiles(),
              new ArrayList<>()));
        }

        String[] fileNameArr = f.getName().split("\\.");
        String fileType = "";

        if (fileNameArr.length > 1) {
          fileType = fileNameArr[1];
        }

        if (DECODEABLE.contains(fileType)) {
          SongInfo si;
          try {
            si = mq.getSongInfo(f);
          } catch (IOException | SAXException | TikaException
              | SQLException e1) {
            si = getMissingSongInfo(f);
          }

          if (si.getFilePath() == null) {
            si = getMissingSongInfo(f);
          }

          songs.add(si);
        }
      }

      return songs;
    }

    private SongInfo getMissingSongInfo(File f) {
      SongInfo si;
      try {
        si = MetadataReader.getAudioMetadata(f);
      } catch (IOException | SAXException | TikaException e) {
        si = new SongInfo(f.getAbsolutePath());
      }

      try {
        mq.insertOrReplaceSongInfo(si);
      } catch (SQLException e) {
        // TODO Auto-generated catch block
      }

      return si;
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

  private static class PlaySongHandler implements Route {

    @Override
    public Object handle(Request req, Response res) {
      QueryParamsMap qm = req.queryMap();
      String songPath = qm.value("songPath");
      File song = new File(songPath);

      String[] fileNameArr = song.getName().split("\\.");
      String fileType = "";

      if (fileNameArr.length > 1) {
        fileType = fileNameArr[1];
      }

//      if (!fileType.equals("mp3")) {
//        song = new File(fileNameArr[0] + ".mp3");
//        if (!song.exists()) {
//          try {
//            song = Mp3Encoder.encode(song); // this should
//            // effectively be doing nothing
//            /* Do something here to add in metadata */
//          } catch (IllegalArgumentException | EncoderException e) {
//            // TODO Auto-generated catch block
//            e.printStackTrace();
//          }
//        }
//      }

      // now that we have the song play it
      server.setMusicFile(song);
      server.broadcast();
      
      Map<String, Object> variables =
          new ImmutableMap.Builder<String, Object>()
              .build();

      return GSON.toJson(variables);
    }

  }

  private class MetadataHandler implements Route {

    private MetadataQuery mq;

    public MetadataHandler(MetadataQuery mq) {
      this.mq = mq;
    }

    @Override
    public Object handle(Request req, Response res) {
      QueryParamsMap qm = req.queryMap();
      String filePath = qm.value("filePath");
      String title = qm.value("title");
      String album = qm.value("album");
      String artist = qm.value("artist");

      try {
        mq.insertOrReplaceIntoSongInfo(filePath, title, album, artist);
      } catch (SQLException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }

      return null;
    }

  }

  public void shutdown() {
    server.close();
  }
}