package edu.brown.cs.group.sam.sparkgui;

import java.io.File;
import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.google.common.collect.ImmutableMap;

import edu.brown.cs.group.sam.panAlgorithm.AmplitudePanner;
import freemarker.template.Configuration;
import spark.ModelAndView;
import spark.Request;
import spark.Response;
import spark.Route;
import spark.Spark;
import spark.TemplateViewRoute;
import spark.template.freemarker.FreeMarkerEngine;

/**
 * This class implements the basic requirements for a functioning
 * web application running a spark graphical user interface (gui).
 * This should be extended to model a more specific spark gui
 * depending on the needs of the project.
 *
 * @author plscott
 *
 */
public class SparkGui {
  private FreeMarkerEngine freeMarker;

  /**
   * This method is responsible for running the spark server.
   *
   * @param port The port at which to run the spark server
   */
  public void runSparkServer(int port) {
    Spark.externalStaticFileLocation("src/main/resources/static");
    Spark.setPort(port);
    freeMarker = createEngine();
  }

  /**
   * Method that gets the free marker engine for the spark
   * server.
   *
   * @return the free marker engine
   */
//  
//  Map<String, Object> variables =
//      ImmutableMap.of("traffic", pointMap);
//  return GSON.toJson(variables);
  public FreeMarkerEngine getEngine() {
    return freeMarker;
  }
  
  private static class VolumeHandler implements Route {

    private AmplitudePanner _ap;

    public VolumeHandler(AmplitudePanner ap) {
      _ap = ap;
    }

    @Override
    public Object handle(Request req, Response res) {
      
      Map<String, String> map = req.params();
      
      String id = map.get("id");
      double weight = _ap.getVolume(id);

      Map<String, Object> variables =
          ImmutableMap.of("volume", weight);
      return new ModelAndView(variables, "info.ftl");
    }
  }


  /**
   * Method that generates the free marker engine for
   * the spark server.
   *
   * @return the free marker engine
   */
  public static FreeMarkerEngine createEngine() {
    Configuration config = new Configuration();
    File templates = new File("src/main/resources/spark/template/freemarker");

    try {
      config.setDirectoryForTemplateLoading(templates);
    } catch (IOException e) {
      String error = "ERROR: Unable to access templates at "
                + templates.getAbsolutePath();
      System.err.println(error);
      System.exit(1);
    }

    return new FreeMarkerEngine(config);
  }
}