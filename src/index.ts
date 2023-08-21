import "dotenv/config";
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
import { PassThrough } from "node:stream";
import { FsStorage } from "./storage/fs";
import { S3Storage } from "./storage/s3";
import { pushAudioMessage } from "./line/pushAudioMessage";

const fastify = Fastify({
  logger: true,
});

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? `${process.cwd()}/output`;

/**
 * テキストから音声を生成する
 * ( wav生成 -> wavをm4aに変換 -> m4aアップロード )
 * 全部ファイルに書き出して逐次実行するので遅いかも？
 */
fastify.post("/audio", async function handler(request) {
  const text = (request.body as { text: string }).text;
  const audio = await generateAudio(text);

  const filename = `audio-${new Date().getTime()}-stream.m4a`;
  const filepath = path.join(OUTPUT_DIR, filename);
  FsStorage.writeSync(filepath, audio);

  const m4aPath = await convertWavToM4a(filepath);

  await S3Storage.writeAsync(filename, fs.readFileSync(m4aPath));
  const url = await S3Storage.getObjectUrl(filename);

  const duration = getAudioDurationInSeconds(audio);

  if (true) {
    await pushAudioMessage(url, text, duration);
  }

  return { duration, url };
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

  const saveStream = new PassThrough();
  const filename = `audio-${new Date().getTime()}-stream.m4a`;
  if (false) {
    saveStream.pipe(
      FsStorage.createWriteStream(path.join(OUTPUT_DIR, filename))
    );
  }
  if (true) {
    saveStream.pipe(S3Storage.createWriteStream(filename));
  }
  convertStream.pipe(saveStream);

  const [duration] = await Promise.all([
    getAudioDurationInSeconds_Stream(audioStream),
    waitForFinish(saveStream),
  ]);

  const url = await S3Storage.getObjectUrl(filename);

  if (true) {
    await pushAudioMessage(url, text, duration);
  }

  return { duration, url };
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
