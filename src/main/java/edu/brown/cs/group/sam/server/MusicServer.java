package edu.brown.cs.group.sam.server;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import com.corundumstudio.socketio.BroadcastOperations;

public class MusicServer extends Server {

  public MusicServer(String address, int port) {
    super(address, port);
  }

  @Override
  public void broadcast() {
  	System.out.println("BROADCASTING");
    BroadcastOperations br = server.getBroadcastOperations();
    boolean newSong = false;

    try (InputStream stream = new ByteArrayInputStream(data)) {
      int length = data.length; // size of packet to send
      byte[] b = new byte[length];

      while (stream.read(b, 0, length) != -1) {
        Object[] info = new Object[3];

        info[0] = b.clone();
        info[1] = newSong;
        info[3] = data.length;

        br.sendEvent("data", info);

        if (newSong) {
          newSong = false;
        }
      }
    } catch (IOException e) {
      System.err.println("ERROR: Issue streaming content");
      System.exit(1);
    }
  }

  public void setMusicFile(File file) {
  	byte[] bytes = new byte[(int) file.length()];

  	try (FileInputStream fis = new FileInputStream(file);
  			BufferedInputStream bis = new BufferedInputStream(fis)) {
  		bis.read(bytes);
  	} catch (FileNotFoundException e) {
  		System.err.println("ERROR: File not found");
  		this.setData(bytes);
  	} catch (IOException e) {
  		System.err.println("ERROR: Exception reading in file");
  		this.setData(bytes);
  	}

  	this.setData(bytes);
  }
}