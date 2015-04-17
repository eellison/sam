package edu.brown.cs.group.sam.panAlgorithm;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Point;


public class ClientPoint {
	
	private Point point;
	private String id, name;
	private double weighting;
	private double x;
	private double y;
	
	public ClientPoint(double[] point, String id, double weighting) {

		this.point = LocalGeo.createPoint(new Coordinate(point[0], point[1]));
		this.weighting = weighting;
		this.id = id;
		this.x = point[0];
		this.y = point[1];
		
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public double getWeighting() {
		return weighting;
	}

	public void setWeighting(double weighting) {
		this.weighting = weighting;
	}


	/**
	 * @return the point
	 */
	public Point getPoint() {
		return point;
	}

	/**
	 * @param point the point to set
	 */
	public void setPoint(Point point) {
		this.point = point;
	}

	public void setName(String name) {
		this.name = name;
	}
	public String getName() {
		return name;
	}

}
