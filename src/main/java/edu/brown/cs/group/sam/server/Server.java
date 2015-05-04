package edu.brown.cs.group.sam.server;

import com.corundumstudio.socketio.Configuration;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DisconnectListener;

public abstract class Server {
  protected String address;
  protected SocketIOServer server;
  protected byte[] data;
  private int port;

  public Server(String address) {
    this.address = address;

    Configuration config = new Configuration();
    config.setHostname(address);

    boolean exit = true;
    for (int port = 7777; port < 7785; port++) {
      try {
        config.setPort(port);
        this.server = new SocketIOServer(config);
        server.start();
      } catch (Exception e) {
        // the current port does not work
        continue;
      }

      this.port = port;
      break;
    }
  }

  public void run() {
    this.setupServer();
    //server.start();
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

  protected void setData(byte[] data) {
    this.data = data;
  }

  public void close() {
    server.stop();
  }
  
  public int getPort() {
    return this.port;
  }
}