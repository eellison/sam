package edu.brown.cs.group.sam.metadata;


/**
 * Contains metadata information for a particular song.
 *
 * @author young-raekim
 *
 */
public class SongInfo {

  private String title;
  private String album;
  private String artist;
  private String filePath;

  public SongInfo() {}

  public SongInfo(String title, String album, String artist,
      String filePath) {
    this.title = title;
    this.album = album;
    this.artist = artist;
    this.filePath = filePath;
  }

}
