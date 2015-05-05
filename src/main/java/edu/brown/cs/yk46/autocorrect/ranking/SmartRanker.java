package edu.brown.cs.yk46.autocorrect.ranking;

import java.awt.Point;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

import edu.brown.cs.yk46.autocorrect.ranking.ngram.Ngram;

public class SmartRanker implements Comparator<Ngram> {

  private static final int FIRST_BEFORE_SECOND = -1; 
  private static final int EQUAL = 0;
  private static final int SECOND_BEFORE_FIRST = 1;
  private static final Map<Character, Point> KEYBOARD;
  static {
    KEYBOARD = new HashMap<>();
    KEYBOARD.put('z', new Point(0,0));
    KEYBOARD.put('x', new Point(1,0));
    KEYBOARD.put('c', new Point(2,0));
    KEYBOARD.put('v', new Point(3,0));
    KEYBOARD.put('b', new Point(4,0));
    KEYBOARD.put('n', new Point(5,0));
    KEYBOARD.put('m', new Point(6,0));
    KEYBOARD.put('a', new Point(0,1));
    KEYBOARD.put('s', new Point(1,1));
    KEYBOARD.put('d', new Point(2,1));
    KEYBOARD.put('f', new Point(3,1));
    KEYBOARD.put('g', new Point(4,1));
    KEYBOARD.put('h', new Point(5,1));
    KEYBOARD.put('j', new Point(6,1));
    KEYBOARD.put('k', new Point(7,1));
    KEYBOARD.put('l', new Point(8,1));
    KEYBOARD.put('q', new Point(0,2));
    KEYBOARD.put('w', new Point(1,2));
    KEYBOARD.put('e', new Point(2,2));
    KEYBOARD.put('r', new Point(3,2));
    KEYBOARD.put('t', new Point(4,2));
    KEYBOARD.put('y', new Point(5,2));
    KEYBOARD.put('u', new Point(6,2));
    KEYBOARD.put('i', new Point(7,2));
    KEYBOARD.put('o', new Point(8,2));
    KEYBOARD.put('p', new Point(9,2));
  }

  private String last;

  public SmartRanker(String last) {
    this.last = last;
  }

  @Override
  public int compare(Ngram n1, Ngram n2) {
    String n1Str = n1.getAllWords();
    String n2Str = n2.getAllWords();

    double n1Dist = keyboardDistance(last, n1Str);
    double n2Dist = keyboardDistance(last, n2Str);

    return Double.compare(n1Dist, n2Dist);
  }

  /**
   * Calculates the sum distance in the corresponding letters between s1 and s2.
   * For example, keyboardDistance("dog", "fph") would return 3.0.
   * 
   * @param s1
   * @param s2
   * @return
   */
  private double keyboardDistance(String s1, String s2) {
    int smallerStringLength = Math.min(s1.length(), s2.length());
    double keyboardDistance = 0.0;

    for(int i = 0; i < smallerStringLength; i++) {
      Point s1Key = KEYBOARD.get(s1.charAt(i));
      Point s2Key = KEYBOARD.get(s2.charAt(i));

      if(s1Key == null || s2Key == null) {
        continue;
      }

      keyboardDistance += s1Key.distance(s2Key);
    }

    //punish responses that are not similar in length
    keyboardDistance += Math.abs(s1.length() - s2.length());

    return keyboardDistance;
  }
}
