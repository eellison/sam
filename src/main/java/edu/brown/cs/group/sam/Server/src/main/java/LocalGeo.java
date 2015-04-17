import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.CoordinateSequence;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.impl.CoordinateArraySequence;


public final class LocalGeo {
	
	public static Point createPoint(Coordinate c1) {
		
		Coordinate[] coord = new Coordinate[1];
		coord[0] = new Coordinate(c1.x, c1.y);
		CoordinateSequence seq = new CoordinateArraySequence(coord);
		return new Point(seq, new GeometryFactory());
		
	}
	
	


}
