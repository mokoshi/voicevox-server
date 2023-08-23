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

const VOICEVOX_URL = process.env.VOICEVOX_URL;

export async function generateAudio(text: string): Promise<Buffer> {
  const audioQueryResponse = await axios.post(
    `${VOICEVOX_URL}/audio_query?speaker=${speaker}&text=${text}`
  );
  const audioQuery = audioQueryResponse.data;

  const synthesisResponse = await axios.post(
    `${VOICEVOX_URL}/synthesis?speaker=${speaker}`,
    audioQuery,
    { responseType: "arraybuffer" }
  );

  return synthesisResponse.data;
}

export async function generateAudio_Stream(text: string): Promise<Readable> {
  const audioQueryResponse = await axios.post(
    `${VOICEVOX_URL}/audio_query?speaker=${speaker}&text=${text}`
  );
  const audioQuery = audioQueryResponse.data;

  const synthesisResponse = await axios.post(
    `${VOICEVOX_URL}/synthesis?speaker=${speaker}`,
    audioQuery,
    { responseType: "stream" }
  );

  return synthesisResponse.data;
}
