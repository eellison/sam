package edu.brown.cs.group.sam.server;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import com.corundumstudio.socketio.AckRequest;
import com.corundumstudio.socketio.BroadcastOperations;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.listener.DataListener;
import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;

public class MusicServer extends Server {
  /* a GSON object for communicating with the GUI */
  private static final Gson GSON = new Gson();

  /* a key used for RTC peer to peer connections */
  private static final String PEER_KEY = "gwrci6wk3boi529";
  private String serverId = "";
  private List<String> clientIds = new ArrayList<String>();

  public MusicServer(String address, int port) {
    super(address, port);
    this.addListeners();
  }

  public void addListeners() {
    server.addEventListener("offer", String.class, new DataListener<String>() {
      @Override
      public void onData(SocketIOClient client, String data,
          AckRequest ackSender) throws Exception {
        sendOffer(data);
      }
    });

    server.addEventListener("answer", String.class, new DataListener<String>() {
      @Override
      public void onData(SocketIOClient client, String data,
          AckRequest ackSender) throws Exception {
        sendAnswer(data);
      }
    });

    server.addEventListener("play", Boolean.class, new DataListener<Boolean>() {
      @Override
      public void onData(SocketIOClient client, Boolean data,
          AckRequest ackSender) throws Exception {
        if (!data) {
          playSong();
        }
      }
    });

    server.addEventListener("peer_key", String.class, new DataListener<String>() {
      @Override
      public void onData(SocketIOClient client, String data,
          AckRequest ackSender) throws Exception {
        client.sendEvent("peer_key", PEER_KEY);
      }
    });

    server.addEventListener("server_id", String.class, new DataListener<String>() {
      @Override
      public void onData(SocketIOClient client, String data,
          AckRequest ackSender) throws Exception {
        serverId = data;
      }
    });

    server.addEventListener("client_id", String.class, new DataListener<String>() {
      @Override
      public void onData(SocketIOClient client, String data,
          AckRequest ackSender) throws Exception {
        clientIds.add(data);
        client.sendEvent("server_id", serverId);
      }
    });

    server.addEventListener("candidate", String.class, new DataListener<String>() {
      @Override
      public void onData(SocketIOClient client, String data,
          AckRequest ackSender) throws Exception {
        Collection<SocketIOClient> clients = server.getAllClients();
        System.out.println("candidate");
        for (SocketIOClient c: clients) {
          if (!c.equals(clients)) {
            c.sendEvent("candidate", data);
          }
        }
      }
    });
  }

  public void sendOffer(String offer) {
    BroadcastOperations br = server.getBroadcastOperations();
    br.sendEvent("offer", offer);
  }

  public void sendAnswer(String answer) {
    BroadcastOperations br = server.getBroadcastOperations();
    br.sendEvent("answer", answer);
  }

  /* METHOD FOR TESTING ONLY!! */
  public void playSong() {
    // just for testing: set file and broadcast
    String path = "/Users/Peter/Desktop/bittersweet.mp3";
    File file = new File(path);
    this.setMusicFile(file);
    this.broadcast();
  }

  @Override
  public void broadcast() {
  	if (data == null) {
  	  return;
  	}

    System.out.println("BROADCASTING");
    BroadcastOperations br = server.getBroadcastOperations();

    try (InputStream stream = new ByteArrayInputStream(data)) {
      int length = data.length; 
      byte[] b = new byte[length];

      while (stream.read(b, 0, length) != -1) {
        Map<String, Object> variables = new ImmutableMap.Builder<String, Object>()
            .put("song", b).put("client_ids", clientIds).build();

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