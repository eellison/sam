package edu.brown.cs.group.sam.metadata;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;

import org.apache.tika.exception.TikaException;
import org.xml.sax.SAXException;


public class MetadataQuery {

  private Connection conn;

  private Map<String, SongInfo> filePathToSongInfo;

  /**
   * Constructs a MapsQuery.
   * @param db The path to the database to connect to.
   * @throws ClassNotFoundException .
   * @throws SQLException .
   */
  public MetadataQuery(String db) throws ClassNotFoundException, SQLException {
    this.conn = DriverManager.getConnection("jdbc:sqlite:" + db);

    try (Statement stat = conn.createStatement()) {
      stat.executeUpdate("PRAGMA foreign_keys = ON;");
      stat.close();

      filePathToSongInfo = new HashMap<>();
    }
  }

  /**
   * Gets the SongInfo of the song from the given filePath.
   *
   * @param filePath
   * @return
   */
  public SongInfo getSongInfo(String filePath) {
    if (filePathToSongInfo.containsKey(filePath)) {
      return filePathToSongInfo.get(filePath);
    }

    try {
      MetadataReader.getAudioMetadata(filePath);
    } catch (IOException | SAXException | TikaException e) {
      return new SongInfo(); //empty SongInfo
    }

    return null;
  }

//  public SongInfo getSongInfo(File url) {
//    
//  }
  
  public void addSongInfo() {
    
  }
}
