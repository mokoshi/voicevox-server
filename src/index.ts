import Fastify from "fastify";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { generateAudio } from "./libs/generateAudio";
import { getAudioDurationInSeconds } from "./libs/getAudioDurationInSeconds";
import { convertWavToM4a } from "./libs/convertWavToM4a.js";

const fastify = Fastify({
  logger: true,
});

// 後で環境変数化
const env = {
  OUTPUT_DIR: `${process.cwd()}/output`,
};

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

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
