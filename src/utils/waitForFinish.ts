import { Writable } from "stream";

export function waitForFinish(stream: Writable) {
  return new Promise((resolve, reject) => {
    stream.on("finish", resolve).on("error", reject);
  });
}
