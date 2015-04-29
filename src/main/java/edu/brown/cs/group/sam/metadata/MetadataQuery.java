package edu.brown.cs.group.sam.metadata;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;


public class MetadataQuery {

  private Connection conn;

  /**
   * Constructs a MapsQuery.
   * @param db The path to the database to connect to.
   * @throws ClassNotFoundException .
   * @throws SQLException .
   */
  public MetadataQuery(String db) throws ClassNotFoundException, SQLException {
    Class.forName("org.sqlite.JDBC");
    String urlToDB = "jdbc:sqlite:" + db;

    this.conn = DriverManager.getConnection(urlToDB);

    try (Statement stat = conn.createStatement()) {
      stat.executeUpdate("PRAGMA foreign_keys = ON;");
      stat.close();
    }
  }
}
