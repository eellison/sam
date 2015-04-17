import java.util.HashMap;
import java.util.Map;

import com.vividsolutions.jts.geom.Coordinate;


public class MusicServer {
	
	private GuiHandler gh;
	private StreamServer ss;
	private AmplitudePanner ap;
	private DatabaseManager dm;
	private Coordinate currentPoint;
	
	private Map<String, ClientPoint> clients;
	private String password, socketAdd;

	public MusicServer(GuiHandler gh, DatabaseManager dm, StreamServer ss) {
		
		this.gh = gh;
		this.dm = dm;
		this.ss = ss;
		
		this.gh.receiveSongChoices(dm.getSongChoices());
		
		ap = new AmplitudePanner();
		clients = new HashMap<String, ClientPoint>();
		socketAdd = ss.getStreamAddr();
	}
	
	public void changeMusic(String songName) {
		ss.stream(dm.getSound(songName));
		
	}
	
		
	public void setClients(ClientPoint[] clientA) {
		ap.setClients(clientA);
		
		for (ClientPoint c: clientA) {
			clients.put(c.getId(), c);
		}
	}
	
	public Map<String, Double> changeFocus(double[] point) {
		currentPoint = new Coordinate(point[0], point[1]);
		return ap.calcluteVolume(new Coordinate(point[0], point[1]));
	}
	
	
	public void removeClient(ClientPoint client) {
		ap.removeClient(client);
		clients.remove(client);
	}
	public void addClient(ClientPoint client) {
		ap.addClient(client);
		clients.put(client.getId(), client);
	}
	
	public String authenticate(String password, String address) {
		if (!this.password.equals(password))  {
			return null;
		}	else {
			double[] coord = ss.getPosition(address);
			String id = address;
			double weighting = ss.getWeighting(address);
			String name = ss.getName(address);
			ClientPoint newClient = new ClientPoint(coord, id, weighting);
			newClient.setName(name);
			
			addClient(newClient);
			return socketAdd;
		}	
	}
	
	public boolean removeClient(String address) {
		return (clients.remove(address)!=null);
	}
	
	
	
	
}
