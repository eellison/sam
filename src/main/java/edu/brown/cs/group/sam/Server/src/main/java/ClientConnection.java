
public interface ClientConnection {
	
	public ServerConnection connect(String address, String password);
	
	public String receive(ServerConnection s, byte[] b);
	
	 
	

}
