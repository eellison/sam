package edu.brown.cs.yk46.autocorrect.ranking.ngram;

public class Unigram extends Ngram {

  String wordA;

  public Unigram(String wordA) {
    this.wordA = wordA;
  }

  @Override
  public String getWordA() {
    return wordA;
  }

  @Override
  public String getAllWords() {
    return wordA;
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = prime * result + ((wordA == null) ? 0 : wordA.hashCode());
    return result;
  }

  @Override
  public boolean equals(Object o) {
    if(this == o) {
      return true;
    }

    if(!(o instanceof Unigram)) {
      return false;
    }

    Unigram x = (Unigram) o;

    return (x.wordA.equals(wordA));
  }

}
