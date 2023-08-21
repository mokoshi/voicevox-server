import { Readable } from "node:stream";

/**
 * https://www.youfit.co.jp/archives/1418
 * https://rimever.hatenablog.com/entry/2019/06/01/083000
 * (音声データの総バイト数) / (1 秒あたりバイト数の平均) で音声の秒数を計算している
 * RIFF 形式は各チャンクのデータはリトルエンディアンで格納されているよ
 */
export function getAudioDurationInSeconds(wavData: Buffer): number {
  const bytesPerSecond = wavData.readUInt32LE(28);
  const totalBytes = wavData.readUInt32LE(40);
  return totalBytes / bytesPerSecond;
}

/**
 * Stream の先頭から 44 バイト読み込んでから getAudioDurationInSeconds を呼ぶ
 * 長さがわかったらストリームの監視をやめる
 */
export async function getAudioDurationInSeconds_Stream(
  wavData: Readable
): Promise<number> {
  return new Promise((resolve, reject) => {
    let buffer: Buffer = Buffer.alloc(0);

    function onData(data: Buffer) {
      buffer = Buffer.concat([buffer, data]);
      if (buffer.length >= 44) {
        resolve(getAudioDurationInSeconds(buffer));
        wavData.removeListener("data", onData);
        wavData.removeListener("end", onEnd);
        wavData.removeListener("error", onError);
      }
    }
    function onEnd() {
      reject(new Error("the stream finished before getting the duration."));
    }
    function onError(e: Error) {
      reject(e);
    }
    wavData.on("data", onData).on("end", onEnd).on("error", onError);
  });
}
