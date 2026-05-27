import { normalizeLesson, validateLesson } from "./lesson-schema.mjs";

export async function generateLessonWithAi(input, config) {
  if (!config.customApiBaseUrl || !config.customApiKey) {
    throw new Error("Missing CUSTOM_API_BASE_URL or CUSTOM_API_KEY in .env.");
  }

  const response = await fetch(`${config.customApiBaseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.customApiKey}`,
    },
    body: JSON.stringify({
      model: config.aiModel,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Bạn là biên kịch video giáo dục tiếng Anh cho người Việt. Luôn trả JSON hợp lệ, không markdown.",
        },
        {
          role: "user",
          content: buildLessonPrompt(input),
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AI request failed ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI response missing choices[0].message.content.");

  const lesson = normalizeLesson(JSON.parse(stripJsonFence(content)), {
    topic: input.topic,
    level: input.level,
    audience: input.audience,
    durationTargetSeconds: input.durationTargetSeconds,
  });
  validateLesson(lesson);
  return lesson;
}

export function buildLessonPrompt(input) {
  return `Hãy tạo kịch bản JSON cho video dọc 9:16 dài khoảng 150-240 giây về chủ đề: "${input.topic}".

Đầu vào:
- level: ${input.level}
- audience: ${input.audience}
- tone: ${input.tone}
- duration_target_seconds: ${input.durationTargetSeconds}

Yêu cầu nội dung:
- Giải thích bằng tiếng Việt có dấu đầy đủ.
- Video cần có 8-10 scene, mỗi scene có voiceover 2-4 câu.
- Mỗi scene phải có headline, subheadline, voiceover, visual_type, visual data.
- Các scene giảng chính phải có ví dụ tiếng Anh tự nhiên, bản dịch tiếng Việt và ghi chú cách dùng.
- Không tạo câu hỏi trắc nghiệm, không tạo lựa chọn A/B/C, không tạo scene quiz hoặc answer reveal.
- Nếu cần người học tự luyện, hãy dùng scene ứng dụng thực tế: đưa một câu mẫu, chỉ ra tín hiệu thời gian, rồi gợi ý cách tự áp dụng.
- Tránh nói chung chung. Phải có quy tắc, ví dụ, lỗi sai hoặc bài tập cụ thể.

Yêu cầu hinh ảnh:
- Dùng phong cách bảng trắng có grid mờ.
- Không được tạo scene chỉ có headline.
- Mỗi bento/card phải là một ý độc lập, đọc một mình vẫn có nghĩa.
- Không copy nguyên voiceover vào nhiều visual fields. Không lặp lại cùng một câu trong headline, subheadline, visual và examples.
- Chọn visual_type trong danh sách:
  whiteboard_title, learning_goals, rule_board, example_table,
  timeline_board, mistake_correction, mindmap_board, application_board,
  dialogue_board, pronunciation_board, recap_board.

Quy ước visual data:
- whiteboard_title: visual.main_text, visual.compare_text, visual.note.
- learning_goals: visual.goals là 3-4 mục học được sau video.
- rule_board: visual.formula hoặc visual.rule, kèm visual.markers hoặc visual.signals.
- example_table: visual.columns và visual.rows; rows là các hàng ví dụ cụ thể, không phải câu chung chung.
- timeline_board: visual.caption hoặc visual.note để giải thích mốc thời gian.
- mistake_correction: visual.mistakes = [{wrong, right, explanation}].
- mindmap_board: visual.center và visual.branches; mỗi branch là một nhánh ngắn có nghĩa.
- application_board: visual.scenario, visual.example, visual.signals_highlighted, visual.prompt hoặc visual.tip.
- dialogue_board: visual.lines là các câu thoại ngắn, tự nhiên.
- pronunciation_board: visual.word hoặc visual.phrase, visual.stress, visual.drills.
- recap_board: visual.points là các ý nhớ lại, không trùng nguyên văn với headline.

Schema JSON:
{
  "topic": string,
  "title": string,
  "audience": string,
  "level": string,
  "duration_target_seconds": number,
  "learning_goals": string[],
  "scenes": [{
    "id": "scene_01",
    "kind": string,
    "headline": string,
    "subheadline": string,
    "voiceover": string,
    "visual_type": string,
    "visual": object,
    "examples": [{"en": string, "vi": string, "note": string}],
    "practice": null
  }],
  "recap": string[]
}

Trả về JSON hợp lệ, không markdown, không giải thích bên ngoài JSON.`;
}

function stripJsonFence(text) {
  return String(text).replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
}
