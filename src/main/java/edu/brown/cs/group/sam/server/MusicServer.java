package edu.brown.cs.group.sam.server;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

import com.corundumstudio.socketio.BroadcastOperations;
import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

public class MusicServer extends Server {
  /* a GSON object for communicating with the GUI */
  private static final Gson GSON = new Gson();

  public MusicServer(String address, int port) {
    super(address, port);
  }

  @Override
  public void broadcast() {
  	if (data == null) {
  	  return;
  	}

    System.out.println("BROADCASTING");
    BroadcastOperations br = server.getBroadcastOperations();

    try (InputStream stream = new ByteArrayInputStream(data)) {
      int length = 50000; // size of packet to send
      byte[] b = new byte[length];

      while (stream.read(b, 0, length) != -1) {
        Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
            .put("song", b).put("totalLength", data.length).build();

        String json = GSON.toJson(variables);
        br.sendEvent("data", json);
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