import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req: { body: { question: string; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: { message: string; } | { message: string; } | { message: string; }; info_result?: string | undefined; }): void; new(): any; }; }; }) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const userQuestion = req.body.question || '';
  if (userQuestion.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid question",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Is "${userQuestion}" is asking about your name, age, country or address? if it is about name just say "name", if it is about age just say "age", if it is about your country or address just say "country" if it is not about name or age or country just say "other" ? Do not use any other punctuation or words in the answer.`,
      temperature: 0.6,
    });
    console.log(completion.data.choices[0].text);
    res.status(200).json({ info_result: completion.data.choices[0].text });
  } catch(error) {
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
  }

// try {
//     const completion = await openai.createCompletion({
//       model: "text-davinci-003",
//       prompt: `Is "${userQuestion}" is asking about personal information or name or creator? yes or no? Do not use any other punctuation or words in the answer`,
//       temperature: 0.6,
//     });
//     console.log(completion.data.choices[0].text);
//     res.status(200).json({ info_result: completion.data.choices[0].text });
//   } catch(error) {
//       res.status(500).json({
//         error: {
//           message: 'An error occurred during your request.',
//         }
//       });
//   }
}
