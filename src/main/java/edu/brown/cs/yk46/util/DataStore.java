package edu.brown.cs.yk46.util;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

public abstract class DataStore {

  public void readFile(File dataFile) throws IOException {
    BufferedReader br = new BufferedReader(new FileReader(dataFile));

    String dataLine = br.readLine();

    while(dataLine != null) {
      storeData(dataLine);

      dataLine = br.readLine();
    }

    br.close();
  }

  protected abstract void storeData(String dataLine);

}
