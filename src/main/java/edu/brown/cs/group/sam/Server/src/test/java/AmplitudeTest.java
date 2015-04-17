import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.junit.BeforeClass;
import org.junit.Test;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Point;



public class AmplitudeTest {
	
	@Test
	public void testPoint() {
		
		AmplitudePanner ap = new AmplitudePanner();

		
		double[] p1 = {0, 0};
		ClientPoint client = new ClientPoint(p1, "1", 1);
		
		ap.addClient(client);
		
		Map<String, Double> map = ap.calcluteVolume(new Coordinate(0, 0));
		
		assert(map.get("1")==1);			
	}
	
	@Test
	public void testTwoPointsInBounds() {
		
		
		AmplitudePanner ap = new AmplitudePanner();
		
		double[] p1 = {0, 0};
		ClientPoint client = new ClientPoint(p1, "1", 1);
		ap.addClient(client);
		
		double[] p2 = {2, 2};
		ClientPoint client2 = new ClientPoint(p2, "2", 1);
		ap.addClient(client2);

		Map<String, Double> map = ap.calcluteVolume(new Coordinate(1, 1));
		Set<String> keyset = map.keySet();
		
		assert(map.get("1").equals(map.get("2")));
		assert(map.get("1").equals(.5));
	}
	
	@Test
	public void testTwoPointsOutOfBounds() {
		
		AmplitudePanner ap = new AmplitudePanner();
		
		double[] p1 = {0, 0};
		ClientPoint client = new ClientPoint(p1, "1", 1);
		ap.addClient(client);
		
		double[] p2 = {2, 2};
		ClientPoint client2 = new ClientPoint(p2, "2", 1);
		ap.addClient(client2);

		Map<String, Double> map = ap.calcluteVolume(new Coordinate(2, 0));
		Set<String> keyset = map.keySet();
		
		assert(map.get("1").equals(map.get("2")));		
		
		assert(map.get("1").equals((Math.sqrt(.5)/2.)));		
	}
	
	@Test
	public void testMultipleOutOfHull() {
		
		AmplitudePanner ap = new AmplitudePanner();
		
		double[] p1 = {0, 0};
		ClientPoint client = new ClientPoint(p1, "1", 1);
		ap.addClient(client);
		
		
		double[] p2 = {2, 0};
		ClientPoint client2 = new ClientPoint(p2, "2", 1);
		ap.addClient(client2);
		
		double[] p3 = {0, 2};
		ClientPoint client3 = new ClientPoint(p3, "3", 1);
		ap.addClient(client3);

		double[] p4 = {2, 2};
		ClientPoint client4 = new ClientPoint(p4, "4", 1);
		ap.addClient(client4);

		Coordinate c1 = new Coordinate(3, 3);
		Point pc1 = LocalGeo.createPoint(c1);
		
		double dist = 0;
		Coordinate newc1 = ap.placeWithinHull(pc1, dist);
		
		System.out.println(newc1.x);
		System.out.println(newc1.y);

		assert(newc1.x==2);
		assert(newc1.y==2);
		
		System.out.println(dist);
		
		Coordinate c2 = new Coordinate(3, 1);
		
		Point pc2 = LocalGeo.createPoint(c2);
		
		Coordinate newc2 = ap.placeWithinHull(pc2, dist);
		
		assert(newc2.x==2.0);
		assert(newc2.y==1.0);		
		System.out.println(newc2.x);
		System.out.println(newc2.y);
			
		Map<String, Double> map = ap.calcluteVolume(c2);
		
		Set<String> keyset = map.keySet();
		
		double total = 0;
		
		for (String s: keyset) {
			total += map.get(s);
		}
		
		assert(map.get("2").equals(map.get("3")));
		assert(map.get("1").equals(map.get("4")));
		
		map = ap.calcluteVolume(newc2);
		
		keyset = map.keySet();
		
		double total1 = 0;
		for (String s: keyset) {
			total1 += map.get(s);
		}
		assert((total1/total)==ap.totalDistAway(c2)/ap.totalDistAway(newc2));
				
	}
	
	@Test
	public void testMultiplePoints() {
		
		AmplitudePanner ap = new AmplitudePanner();
		
		Map<String, Coordinate> coordMap = new HashMap<String, Coordinate>();

		double[] p1 = {0, 0};
		ClientPoint client = new ClientPoint(p1, "1", 1);
		coordMap.put("1", client.getPoint().getCoordinate());
		
		ap.addClient(client);
		
		double[] p2 = {2, 0};
		ClientPoint client2 = new ClientPoint(p2, "2", 1);
		coordMap.put("2", client2.getPoint().getCoordinate());

		ap.addClient(client2);
		
		double[] p3 = {0, 2};
		ClientPoint client3 = new ClientPoint(p3, "3", 1);
		coordMap.put("3", client3.getPoint().getCoordinate());

		ap.addClient(client3);

		double[] p4 = {2, 2};
		ClientPoint client4 = new ClientPoint(p4, "4", 1);
		coordMap.put("4", client4.getPoint().getCoordinate());

		ap.addClient(client4);
		
		double[] p5 = {5, 4};
		ClientPoint client5 = new ClientPoint(p5, "5", 1);
		coordMap.put("5", client5.getPoint().getCoordinate());

		ap.addClient(client5);
		
		double[] p6 = {5, -1};
		ClientPoint client6 = new ClientPoint(p6, "5", 1);
		coordMap.put("6", client6.getPoint().getCoordinate());

		
		ap.addClient(client5);

		Map<String, Double> map = ap.calcluteVolume(new Coordinate(4, 1));
		
		Set<String> keyset = map.keySet();
		
		String[] set = new String[keyset.size()];
		int i = 0;
		double dist = 0;
		for (String s: keyset) {
			set[i] =  s;
			i++;
			dist += map.get(s);
		}
		System.out.println(dist);
		dist = Math.round(dist*10000)/10000;
		assert(dist==1);
		
		Coordinate compare = new Coordinate(4, 1);
		Coordinate newcompare = ap.placeWithinHull(LocalGeo.createPoint(compare), 0);

		for (i = 0; i < keyset.size(); i++) {
			for (int j=0; j< keyset.size(); j++) {
				if (i != j) {
					
					Coordinate coord1 = coordMap.get(set[i]);
					Coordinate coord2 = coordMap.get(set[j]);
					
					
					double dist1 = ap.cartesianDist(coord1,
							compare, 0);
					double dist2 = ap.cartesianDist(coordMap.get(set[j]), 
									compare, 0);
					boolean closer = (dist1 < dist2);
					
					double vol1 = map.get(set[i]);
					double vol2 = map.get(set[j]);
					
					boolean closer2 = (map.get(set[i]) > map.get(set[j]));
					assert(closer==closer2);
					if (closer!=closer2) {
						System.out.println("break");
					}
					System.out.println(closer==closer2);
				}
			}
		}
		
		
		
		
		
	}
	
	
	
	
	


}
