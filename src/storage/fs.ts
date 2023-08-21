import fs from "node:fs";
import { Stream } from "node:stream";

export const FsStorage = {
  createWriteStream(path: string) {
    const stream = new Stream.PassThrough();
    stream.pipe(fs.createWriteStream(path));
    return stream;
  },

  writeSync(path: string, data: Buffer) {
    fs.writeFileSync(path, data);
  },
};
