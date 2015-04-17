
public abstract class StreamServer {

	public abstract double[] getPosition(String address);

	public abstract double getWeighting(String address);

	public abstract String getName(String address);

	public abstract String getStreamAddr();

	public abstract void stream(Object sound);

}
