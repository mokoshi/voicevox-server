import axios from "axios";
import { Readable } from "stream";

const ずんだもん = {
  ノーマル: 3,
  あまあま: 1,
  ツンツン: 7,
  セクシー: 5,
  ささやき: 22,
  ヒソヒソ: 38,
};

const speaker = ずんだもん.ノーマル;

export async function generateAudio(text: string): Promise<Buffer> {
  const audioQueryResponse = await axios.post(
    `http://127.0.0.1:50021/audio_query?speaker=${speaker}&text=${text}`
  );
  const audioQuery = audioQueryResponse.data;

  const synthesisResponse = await axios.post(
    `http://127.0.0.1:50021/synthesis?speaker=${speaker}`,
    audioQuery,
    { responseType: "arraybuffer" }
  );

  return synthesisResponse.data;
}

export async function generateAudio_Stream(text: string): Promise<Readable> {
  const audioQueryResponse = await axios.post(
    `http://127.0.0.1:50021/audio_query?speaker=${speaker}&text=${text}`
  );
  const audioQuery = audioQueryResponse.data;

  const synthesisResponse = await axios.post(
    `http://127.0.0.1:50021/synthesis?speaker=${speaker}`,
    audioQuery,
    { responseType: "stream" }
  );

  return synthesisResponse.data;
}
