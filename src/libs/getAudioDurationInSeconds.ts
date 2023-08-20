/**
 * https://www.youfit.co.jp/archives/1418
 * https://rimever.hatenablog.com/entry/2019/06/01/083000
 * (音声データの総バイト数) / (1 秒あたりバイト数の平均) で音声の秒数を計算している
 * RIFF 形式は各チャンクのデータはリトルエンディアンで格納されているよ
 */
export function getAudioDurationInSeconds(wavData: Buffer) {
  const bytesPerSecond = wavData.readUInt32LE(28);
  const totalBytes = wavData.readUInt32LE(40);
  return totalBytes / bytesPerSecond;
}
