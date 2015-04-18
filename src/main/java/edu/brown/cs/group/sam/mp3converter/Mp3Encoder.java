package edu.brown.cs.group.sam.mp3converter;

import it.sauronsoftware.jave.AudioAttributes;
import it.sauronsoftware.jave.Encoder;
import it.sauronsoftware.jave.EncoderException;
import it.sauronsoftware.jave.EncodingAttributes;
import it.sauronsoftware.jave.InputFormatException;

import java.io.File;

public class Mp3Encoder {

  /**
   * Encodes the audio file with the given url input to .mp3.
   *
   * @param url
   * @throws IllegalArgumentException
   * @throws InputFormatException
   * @throws EncoderException
   */
  public static String encode(String url) throws IllegalArgumentException, InputFormatException, EncoderException {
    File source = new File(url);
    String sourceName = source.getAbsolutePath().split("\\.")[0];
    File target = new File(sourceName + ".mp3");
    AudioAttributes audio = new AudioAttributes();
    audio.setCodec("libmp3lame");
    audio.setBitRate(new Integer(128000));
    audio.setChannels(new Integer(1));
    audio.setSamplingRate(new Integer(44100));
    EncodingAttributes attrs = new EncodingAttributes();
    attrs.setFormat("mp3");
    attrs.setAudioAttributes(audio);
    Encoder encoder = new Encoder();
    encoder.encode(source, target, attrs);

    return target.getAbsolutePath();
  }

  /**
   * Encodes the audio file with the given url input to .mp3.
   *
   * @param url
   * @throws IllegalArgumentException
   * @throws InputFormatException
   * @throws EncoderException
   */
  public static File encode(File file) throws IllegalArgumentException, InputFormatException, EncoderException {
    File source = file;
    String sourceName = source.getAbsolutePath().split("\\.")[0];
    File target = new File(sourceName + ".mp3");
    AudioAttributes audio = new AudioAttributes();
    audio.setCodec("libmp3lame");
    audio.setBitRate(new Integer(128000));
    audio.setChannels(new Integer(1));
    audio.setSamplingRate(new Integer(44100));
    EncodingAttributes attrs = new EncodingAttributes();
    attrs.setFormat("mp3");
    attrs.setAudioAttributes(audio);
    Encoder encoder = new Encoder();
    encoder.encode(source, target, attrs);

    return target;
  }
}
