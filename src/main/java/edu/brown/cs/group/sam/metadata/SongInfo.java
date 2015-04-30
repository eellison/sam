package edu.brown.cs.group.sam.metadata;



/**
 * Contains metadata information for a particular song.
 *
 * @author young-raekim
 *
 */
public class SongInfo {

  private String filePath;
  private String title;
  private String album;
  private String artist;

  public SongInfo() {}

  public SongInfo(String filePath) {
    this.filePath = filePath;
  }

  public SongInfo(String filePath, String title,
      String album, String artist) {
    this.filePath = filePath;
    this.title = title;
    this.album = album;
    this.artist = artist;
  }

  /**
   * @return the filePath
   */
  public String getFilePath() {
    return filePath;
  }

  /**
   * @return the title
   */
  public String getTitle() {
    return title;
  }

  /**
   * @return the album
   */
  public String getAlbum() {
    return album;
  }

  /**
   * @return the artist
   */
  public String getArtist() {
    return artist;
  }

}
