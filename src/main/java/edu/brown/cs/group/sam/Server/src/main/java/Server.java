
public abstract class Server {
	
	public abstract void run();
	
	public abstract void listen();
	
	public abstract void receive(ClientConnection c, byte[] b);
	
	public abstract void send(ClientConnection c, byte[] b);
	

}
