import Fastify from "fastify";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { generateAudio, generateAudio_Stream } from "./audio/generateAudio";
import {
  getAudioDurationInSeconds,
  getAudioDurationInSeconds_Stream,
} from "./audio/getAudioDurationInSeconds";
import {
  convertWavToM4a,
  convertWavToM4a_Stream,
} from "./audio/convertWavToM4a.js";
import { waitForFinish } from "./utils/waitForFinish";

const fastify = Fastify({
  logger: true,
});

// 後で環境変数化
const env = {
  OUTPUT_DIR: `${process.cwd()}/output`,
};

/**
 * テキストから音声を生成する
 * ( wav生成 -> wavをm4aに変換 -> m4aアップロード )
 * 全部ファイルに書き出して逐次実行するので遅いかも？
 */
fastify.post("/audio", async function handler(request) {
  const text = (request.body as { text: string }).text;
  const audio = await generateAudio(text);

  const duration = getAudioDurationInSeconds(audio);
  const filePath = path.join(
    env.OUTPUT_DIR,
    `audio-${new Date().getTime()}.wav`
  );
  fs.writeFileSync(filePath, audio);

  const m4aPath = await convertWavToM4a(filePath);
  return { duration, filePath, m4aPath };
});

/**
 * テキストから音声を生成する
 * ( wav生成 -> wavをm4aに変換 -> m4aアップロード )
 * オンメモリで処理するので早いかも？
 */
fastify.post("/audio-stream", async function handler(request) {
  const text = (request.body as { text: string }).text;
  const audioStream = await generateAudio_Stream(text);

  const convertStream = convertWavToM4a_Stream(audioStream);

  const filePath = path.join(
    env.OUTPUT_DIR,
    `audio-${new Date().getTime()}-stream.m4a`
  );
  const saveStream = convertStream.pipe(fs.createWriteStream(filePath));

  const [duration] = await Promise.all([
    getAudioDurationInSeconds_Stream(audioStream),
    waitForFinish(saveStream),
  ]);

  return { duration };
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
