package edu.brown.cs.group.sam.filesystem;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/*
 * TODO:
 * POST /queryFilesystem
 * {path : ""}
 * {path : "/home/..."}
 * 
 * return
 * {
 * files : [{name : "song.mp3", path : "/home/..."}, ...]
 * directories : [{name : "Mutual Benefit", path : "/home/..."}, ...]
 * }
 */
/**
 * 
 *
 * @author yk46
 *
 */
public class FilesystemViewer {

  @SuppressWarnings("unused")
  private FilesystemObject[] files;
  @SuppressWarnings("unused")
  private FilesystemObject[] directories;

  public FilesystemViewer(File path) {
    setFilesAndDirectories(path);
  }

  public FilesystemViewer(String path) {
    this(new File(path));
  }

  private void setFilesAndDirectories(File path) {
    List<FilesystemObject> filesList = new ArrayList<>();
    List<FilesystemObject> directoriesList = new ArrayList<>();

    File[] directory = path.listFiles();
    if (path.getName().equals("")) {
      directory = new File(System.getProperty("user.home")).listFiles();
    }

    for (File fileOrDirectory : directory) {
      if (fileOrDirectory.isHidden()) {
        continue;
      }

      if (fileOrDirectory.isFile()) {
        filesList.add(new FilesystemObject(fileOrDirectory.getName(), fileOrDirectory.getAbsolutePath()));
      } else if (fileOrDirectory.isDirectory()) {
        directoriesList.add(new FilesystemObject(fileOrDirectory.getName(), fileOrDirectory.getAbsolutePath()));
      }
    }

    files = filesList.toArray(new FilesystemObject[0]);
    directories = directoriesList.toArray(new FilesystemObject[0]);
  }

  private static class FilesystemObject {
    @SuppressWarnings("unused")
    private String name;
    @SuppressWarnings("unused")
    private String path;

    protected FilesystemObject(String name, String path) {
      this.name = name;
      this.path = path;
    }
  }
}
