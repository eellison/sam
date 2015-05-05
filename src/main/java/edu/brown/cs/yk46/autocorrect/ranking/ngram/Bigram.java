package edu.brown.cs.yk46.autocorrect.ranking.ngram;

public class Bigram extends Ngram {

  String wordA;
  String wordB;

  public Bigram(String wordA, String wordB) {
    this.wordA = wordA;
    this.wordB = wordB;
  }

  @Override
  public String getWordA() {
    return wordA;
  }

  public String getWordB() {
    return wordB;
  }

  @Override
  public String getAllWords() {
    return wordA + " " + wordB;
  }

  /* (non-Javadoc)
   * @see java.lang.Object#hashCode()
   */
  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((wordA == null) ? 0 : wordA.hashCode());
    result = prime * result + ((wordB == null) ? 0 : wordB.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object o) {
    if(o == this){
      return true;
    }

    if(!(o instanceof Bigram)) {
      return false;
    }

    Bigram x = (Bigram)o;

    return (x.wordA.equals(wordA) && x.wordB.equals(wordB));
  }
}
