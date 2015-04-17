package edu.brown.cs.group.sam.server;

import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DisconnectListener;

public abstract class Server {
  protected String address;
  protected int port;
  protected SocketIOServer server;
  protected byte[] data;

  public Server(String address, int port) {
    this.address = address;
    this.port = port;

    Configuration config = new Configuration();
    config.setHostname(address);
    config.setPort(port);

    this.server = new SocketIOServer(config);
  }

  public void run() {
    this.setupServer();
    server.start();
  }

  private void setupServer() {    
    server.addConnectListener(new ConnectListener() {
      @Override
      public void onConnect(SocketIOClient client) {
        // client connected to server
        System.err.println("Server: Client connected");
      }
    });

    server.addDisconnectListener(new DisconnectListener() {
      @Override
      public void onDisconnect(SocketIOClient client) {
        // client disconnected from server
        System.err.println("Server: Client disconnected");
      }
    });
  }

  public abstract void broadcast();

  public void setData(byte[] data) {
    this.data = data;
  }

  public void close() {
    server.stop();
  }
}