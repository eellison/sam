package edu.brown.cs.group.sam.metadata;

import java.io.File;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
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
  public MetadataQuery(String db) throws SQLException {
    this.conn = DriverManager.getConnection("jdbc:sqlite:" + db);

    filePathToSongInfo = new HashMap<>();
  }

  /**
   * Gets the SongInfo of the song from the given filePath.
   *
   * @param filePath
   * @return
   * @throws TikaException 
   * @throws SAXException 
   * @throws IOException 
   * @throws SQLException 
   */
  public SongInfo getSongInfo(String filePath) throws IOException,
      SAXException, TikaException, SQLException {
    if (filePathToSongInfo.containsKey(filePath)) {
      return filePathToSongInfo.get(filePath);
    }

    String query = "SELECT title, album, artist FROM songinfo WHERE filepath = ?";

    try (PreparedStatement ps = conn.prepareStatement(query)) {
      ps.setString(1, filePath);

      try (ResultSet rs = ps.executeQuery()) {
        SongInfo si;

        if (rs.next()) { //is in DB
          si = new SongInfo(filePath, rs.getString(1),
              rs.getString(2), rs.getString(3));
          filePathToSongInfo.put(filePath, si);

          return si;
        }

        return new SongInfo();
      }
    }
  }

  public SongInfo getSongInfo(File file) throws IOException,
      SAXException, TikaException, SQLException {
    return getSongInfo(file.getAbsolutePath());
  }

  /**
   * Inserts or replaces the given song information in the DB.
   *
   * @param filePath
   * @param title
   * @param album
   * @param artist
   * @return the value returned by calling executeUpdate on a
   * PreparedStatement
   * @throws SQLException
   */
  public int insertOrReplaceIntoSongInfo(String filePath, String title,
      String album, String artist) throws SQLException {
    SongInfo si = new SongInfo(filePath, title, album, artist);
    return insertOrReplaceSongInfo(si);
  }

  public int insertOrReplaceSongInfo(SongInfo si) throws SQLException {
    String query = "INSERT OR REPLACE INTO songinfo VALUES (?, ?, ?, ?);";

    try (PreparedStatement ps = conn.prepareStatement(query)) {
      ps.setString(1, si.getFilePath());
      ps.setString(2, si.getTitle());
      ps.setString(3, si.getAlbum());
      ps.setString(4, si.getArtist());

      try {
        int result = ps.executeUpdate();
        filePathToSongInfo.put(si.getFilePath(), si);
        return result;
      } finally {
        ps.close();
      }
    }
  }
}
