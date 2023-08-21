import axios from "axios";

export async function pushAudioMessage(
  url: string,
  text: string,
  duration: number
) {
  await axios.post(
    "https://api.line.me/v2/bot/message/push",
    {
      to: process.env.LINE_USER_ID,
      messages: [
        {
          type: "text",
          text,
        },
        {
          type: "audio",
          originalContentUrl: url,
          duration: duration * 1000,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
    }
  );
}
