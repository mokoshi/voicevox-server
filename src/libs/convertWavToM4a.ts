import ffmpeg from "fluent-ffmpeg";

export async function convertWavToM4a(wavPath: string): Promise<string> {
  const outputPath = `${wavPath}.m4a`;
  return new Promise((resolve, reject) => {
    ffmpeg(wavPath)
      .on("error", (e) => reject(e))
      .on("end", () => resolve(outputPath))
      .save(outputPath);
  });
}
