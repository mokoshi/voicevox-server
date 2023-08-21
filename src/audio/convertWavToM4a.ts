import ffmpeg from "fluent-ffmpeg";
import { Readable, Writable } from "node:stream";

export async function convertWavToM4a(wavPath: string): Promise<string> {
  const outputPath = `${wavPath}.m4a`;
  return new Promise((resolve, reject) => {
    ffmpeg(wavPath)
      .on("error", (e) => reject(e))
      .on("end", () => resolve(outputPath))
      .save(outputPath);
  });
}

export function convertWavToM4a_Stream(streamIn: Readable): Writable {
  /**
   * 色々と試行錯誤したがむずい
   * 先頭から再生可能なフォーマットでないとストリーミングで出力できない
   * mp4 はオプションを付与してやれば先頭から再生可能になるっぽい？
   * https://trac.ffmpeg.org/wiki/Encode/AAC#ProgressiveDownload
   */
  return ffmpeg(streamIn)
    .addOutputOptions(
      "-movflags +frag_keyframe+separate_moof+omit_tfhd_offset+empty_moov"
    )
    .audioCodec("aac")
    .format("mp4")
    .pipe();

  /**
   * adts でも良いのか...？
   */
  return ffmpeg(streamIn).audioCodec("aac").format("adts").pipe();
}
