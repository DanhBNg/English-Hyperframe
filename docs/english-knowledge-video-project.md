# English Knowledge Video Project - Standalone Spec

Tài liệu này dùng để triển khai một project HyperFrames mới từ thư mục trắng. Project tạo video chia sẻ kiến thức tiếng Anh từ một chủ đề đầu vào, ví dụ: `present perfect`, `how to use however`, `business email phrases`, `IELTS speaking part 2`, `phrasal verbs with get`.

Project cần có pipeline CLI/script để sinh nội dung, dựng composition HyperFrames, kiểm tra và render video. Ngoài CLI, project cần có một màn hình quản trị/test chạy bằng `npm run start` để nhập topic, generate thử, xem trạng thái pipeline và preview video trong trình duyệt. Không cần đóng gói desktop app và không cần hệ thống nhiều template.

## Mục Tiêu

Tạo một pipeline tự động:

1. Nhận đầu vào là tên một chủ đề tiếng Anh.
2. Dùng AI sinh kịch bản học tiếng Anh bằng tiếng Việt, có giải thích, ví dụ và bài tập ngắn.
3. Sinh voiceover tiếng Việt.
4. Sinh subtitle theo từng scene.
5. Build một `index.html` HyperFrames từ một template duy nhất.
6. Có một màn hình test nội bộ để nhập topic, chạy pipeline và xem preview.
7. Render video dọc 9:16, phù hợp TikTok/Reels/Shorts nhưng nội dung không quá ngắn.

Video phải có cảm giác như một bài giảng mini rõ ràng, không phải chỉ là vài headline lướt nhanh.

## Đầu Vào

Đầu vào tối thiểu:

```txt
topic = "Present perfect vs past simple"
```

Có thể mở rộng thêm:

```json
{
  "topic": "Present perfect vs past simple",
  "level": "A2-B1",
  "audience": "người Việt học tiếng Anh",
  "tone": "dễ hiểu, thực tế, có ví dụ đời sống",
  "duration_target_seconds": 180
}
```

Nếu người dùng chỉ nhập `topic`, hệ thống tự chọn:

- `level`: `A2-B1`
- `audience`: `người Việt học tiếng Anh`
- `tone`: `rõ ràng, gần gũi, có ví dụ`
- `duration_target_seconds`: `180`

## Đầu Ra

Mỗi lần generate tạo ra:

- `data/lesson.json`: kịch bản chuẩn hóa.
- `assets/audio/scene_01.mp3`, `scene_02.mp3`, ...
- `assets/subtitles/scene_01.srt`, `scene_02.srt`, ...
- `index.html`: composition HyperFrames hoàn chỉnh.
- `renders/*.mp4`: video sau khi render.

Màn hình test nội bộ cần hiển thị được:

- Form nhập topic, level, tone và duration target.
- Nút generate lesson.
- Nút tạo audio/subtitle.
- Nút build composition.
- Nút chạy check.
- Preview `index.html` trong iframe hoặc panel riêng.
- Log pipeline theo thời gian thực hoặc gần thời gian thực.
- Link tới file JSON, audio và video render nếu đã có.

## Thời Lượng Và Độ Sâu Nội Dung

Vì đây là nội dung kiến thức, video không nên quá ngắn. Mục tiêu mặc định:

- Tổng thời lượng: `150-240 giây`.
- Số scene: `8-10 scene`.
- Mỗi scene voiceover: `2-4 câu tiếng Việt`.
- Các scene giảng chính phải có ít nhất `2 ví dụ tiếng Anh`.
- Nếu có bài tập, phải có đáp án hoặc gợi ý ở scene sau.

Không tạo kịch bản kiểu chỉ nêu tiêu đề, buzzword hoặc checklist rỗng. Mỗi scene cần có một phần nội dung trực quan ở giữa màn hình.

## Định Hướng Nội Dung

Kịch bản nên linh hoạt theo chủ đề, không bắt buộc scene nào cũng giống nhau. Tuy vậy, một video học tiếng Anh tốt thường cần đủ các lớp sau:

1. Mở vấn đề: người học hay nhầm gì, vì sao chủ đề này quan trọng.
2. Mục tiêu bài học: sau video người xem làm được gì.
3. Giải thích khái niệm chính bằng tiếng Việt dễ hiểu.
4. Công thức, cấu trúc hoặc quy tắc dùng.
5. Ví dụ đúng trong ngữ cảnh thật.
6. So sánh lỗi sai hoặc trường hợp dễ nhầm.
7. Mini practice: cho người xem tự thử.
8. Đáp án và giải thích ngắn.
9. Tổng kết bằng 3-5 ý nhớ nhanh.
10. Gợi ý áp dụng sau video.

Với các topic khác nhau, có thể thay đổi format:

- Grammar: rule board, timeline, mistake correction, practice.
- Vocabulary: word map, collocation board, example table, usage warning.
- Pronunciation: mouth-position note, stress pattern, minimal pairs, shadowing drill.
- Business English: email/dialogue board, formal vs casual, phrase bank.
- IELTS/TOEIC: strategy board, sample answer, scoring notes, practice prompt.
- Phrasal verbs/idioms: meaning map, context examples, wrong-use warning.

## Định Hướng Hình Ảnh

Template duy nhất nên dùng phong cách bảng trắng có grid mờ:

- Nền chính: trắng ngà hoặc trắng hơi xám, ví dụ `#f8faf7`.
- Grid mờ: đường ngang/dọc rất nhẹ, không gây nhiễu subtitle.
- Phong cách chữ: marker, giáo trình, ghi chú lớp học.
- Màu nhấn: xanh navy, xanh lá, cam, đỏ sửa lỗi.
- Không dùng nền tối công nghệ.
- Không để scene chỉ có headline ở giữa màn hình.

Ví dụ CSS nền:

```css
body {
  background:
    linear-gradient(rgba(30, 64, 175, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30, 64, 175, 0.055) 1px, transparent 1px),
    #f8faf7;
  background-size: 34px 34px;
}
```

Các thành phần trực quan nên dùng:

- Whiteboard title block.
- Paper note card.
- Sticky note.
- Example table.
- Rule formula strip.
- Timeline line.
- Mistake correction board.
- Quiz card.
- Answer reveal.
- Dialogue bubbles.
- Pronunciation drill row.
- Recap checklist.

Không nhất thiết gọi mọi thứ là card/bento. Mục tiêu là scene luôn có nội dung nhìn được, có cấu trúc rõ, và phù hợp bài học.

## Font

Khuyến nghị:

- Tiếng Việt: `Be Vietnam Pro`.
- Tiếng Anh: `Inter`, `Arial`, hoặc dùng chung `Be Vietnam Pro`.
- Nên để font local trong `assets/fonts/`.
- Không phụ thuộc Google Fonts hoặc network runtime.

CSS gợi ý:

```css
@font-face {
  font-family: "Be Vietnam Pro";
  src: url("assets/fonts/BeVietnamPro-Regular.ttf") format("truetype");
  font-weight: 400;
}

@font-face {
  font-family: "Be Vietnam Pro";
  src: url("assets/fonts/BeVietnamPro-Bold.ttf") format("truetype");
  font-weight: 700;
}

body {
  font-family: "Be Vietnam Pro", Arial, sans-serif;
}
```

## Cấu Trúc Project Đề Xuất

```txt
english-knowledge-video/
  package.json
  index.html
  meta.json
  .env
  server/
    app.mjs
    routes/
      lesson.mjs
      pipeline.mjs
      files.mjs
  admin/
    index.html
    app.js
    style.css
  assets/
    audio/
    fonts/
    images/
    subtitles/
  data/
    lesson.json
  scripts/
    generate-lesson.mjs
    create-tts.mjs
    create-subtitles.mjs
    build-composition.mjs
    render.mjs
  templates/
    whiteboard/
      template.mjs
      scenes.mjs
      style.css
  docs/
    english-knowledge-video-project.md
```

## Package Scripts

```json
{
  "scripts": {
    "start": "node server/app.mjs",
    "generate": "node scripts/generate-lesson.mjs",
    "tts": "node scripts/create-tts.mjs",
    "subtitles": "node scripts/create-subtitles.mjs",
    "build": "node scripts/build-composition.mjs",
    "check": "hyperframes check",
    "render": "hyperframes render",
    "lesson": "npm run generate && npm run tts && npm run subtitles && npm run build && npm run check"
  }
}
```

Lệnh sử dụng:

```bash
npm run start
npm run lesson -- "Present perfect vs past simple"
npm run render
```

`npm run start` mở một local server cho màn hình test, ví dụ `http://localhost:3000`. Server này chỉ phục vụ admin UI, static assets, preview composition và các API nội bộ để gọi scripts. Không cần đăng nhập nếu chỉ chạy local.

## Luồng Pipeline

Pipeline có thể chạy bằng CLI hoặc qua màn hình test. Hai đường chạy phải dùng chung scripts lõi để tránh lệch hành vi:

- CLI gọi trực tiếp `scripts/*.mjs`.
- Admin UI gọi API local trong `server/app.mjs`.
- API local spawn cùng các script đó, ghi log và trả trạng thái cho UI.

### 1. Generate Lesson JSON

`scripts/generate-lesson.mjs` nhận topic từ CLI:

```bash
node scripts/generate-lesson.mjs "Present perfect vs past simple"
```

Script gọi AI để tạo `data/lesson.json`.

Yêu cầu quan trọng:

- JSON phải parse được.
- Không trả markdown.
- Không trả prose bên ngoài JSON.
- Nội dung tiếng Việt có dấu đầy đủ.
- Ví dụ tiếng Anh phải tự nhiên.
- Mỗi scene phải có `visual_type` và dữ liệu visual tương ứng.

### 2. TTS

`scripts/create-tts.mjs` đọc từng `scene.voiceover`, tạo audio riêng cho từng scene.

Voice gợi ý:

- `vi-VN-NamMinhNeural`
- fallback: `vi-VN-HoaiMyNeural`

Scene duration nên lấy từ audio thật, sau đó cộng thêm padding `0.5-1.0s` nếu cần.

### 3. Subtitle

Nếu có speech-to-text local thì dùng để tạo subtitle chính xác theo audio. Nếu chưa có, tạo subtitle fallback theo câu:

- Mỗi block 1-2 dòng.
- Không quá dài.
- Đồng bộ theo duration của scene.

### 4. Build Composition

`scripts/build-composition.mjs` đọc `data/lesson.json`, audio duration và subtitle để tạo `index.html`.

HyperFrames rule bắt buộc:

- Mỗi element có thời gian phải có `data-start`, `data-duration`, `data-track-index`.
- Element visible theo timeline phải có `class="clip"`.
- Timeline GSAP phải paused.
- Timeline đăng ký vào `window.__timelines`.
- Không dùng `Date.now()`, `Math.random()`, fetch network runtime.

### 5. Check Và Render

Sau khi build:

```bash
npm run check
npm run render
```

Phải sửa hết lỗi `hyperframes check` trước khi render chính thức.

## Schema Lesson JSON

Schema đề xuất:

```json
{
  "topic": "Present perfect vs past simple",
  "title": "Present Perfect và Past Simple: khác nhau ở đâu?",
  "audience": "người Việt học tiếng Anh",
  "level": "A2-B1",
  "duration_target_seconds": 180,
  "learning_goals": [
    "Biết khi nào dùng present perfect",
    "Biết khi nào dùng past simple",
    "Tránh 3 lỗi phổ biến khi nói về trải nghiệm"
  ],
  "scenes": [
    {
      "id": "scene_01",
      "kind": "hook",
      "headline": "Bạn có đang dùng sai thì?",
      "subheadline": "I have visited vs I visited",
      "voiceover": "Có một lỗi rất phổ biến khi học tiếng Anh: dùng present perfect và past simple lẫn lộn. Hai câu nhìn giống nhau, nhưng cảm giác thời gian lại khác hẳn. Trong video này, ta sẽ tách chúng bằng ví dụ dễ nhớ.",
      "visual_type": "whiteboard_title",
      "visual": {
        "main_text": "I have visited London.",
        "compare_text": "I visited London in 2020.",
        "note": "Một câu nói về trải nghiệm, một câu nói về thời điểm cụ thể."
      },
      "examples": [
        {
          "en": "I have visited London.",
          "vi": "Tôi đã từng đến London.",
          "note": "Nhấn vào trải nghiệm."
        },
        {
          "en": "I visited London in 2020.",
          "vi": "Tôi đã đến London năm 2020.",
          "note": "Nhấn vào thời điểm cụ thể."
        }
      ]
    }
  ],
  "recap": [
    "Present perfect nói về trải nghiệm hoặc kết quả liên quan tới hiện tại.",
    "Past simple nói về việc đã kết thúc tại một thời điểm cụ thể.",
    "Nếu có yesterday, last week, in 2020, thường dùng past simple."
  ]
}
```

## Scene Object

Mỗi scene nên có:

```json
{
  "id": "scene_03",
  "kind": "rule_explanation",
  "headline": "Quy tắc nhớ nhanh",
  "subheadline": "Có thời điểm cụ thể thì dùng past simple",
  "voiceover": "Cách nhớ đơn giản là: nếu câu trả lời cho câu hỏi 'khi nào?' rất rõ, hãy dùng past simple. Những mốc như yesterday, last night, in 2020, two days ago kéo câu về quá khứ đã đóng lại.",
  "visual_type": "rule_board",
  "visual": {
    "formula": "time finished -> past simple",
    "markers": ["yesterday", "last week", "in 2020", "two days ago"]
  },
  "examples": [
    {
      "en": "She watched the movie yesterday.",
      "vi": "Cô ấy xem phim hôm qua.",
      "note": "Yesterday là mốc đã kết thúc."
    }
  ],
  "practice": {
    "question": "Chọn câu đúng: I have seen / saw him yesterday.",
    "answer": "I saw him yesterday.",
    "explanation": "Có yesterday nên dùng past simple."
  }
}
```

## Visual Types

Template nên hỗ trợ các visual type sau. Mỗi type phải có layout riêng để video không bị lặp hình thức.

### `whiteboard_title`

Dùng cho hook hoặc mở bài.

Thành phần:

- Tiêu đề lớn.
- 1-2 câu ví dụ đối chiếu.
- Gạch chân marker.
- Một note nhỏ kiểu giáo viên ghi bảng.

### `learning_goals`

Dùng cho mục tiêu bài học.

Thành phần:

- 3 mục tiêu hiện lần lượt.
- Icon đơn giản bằng CSS hoặc emoji text nếu phù hợp.
- Mỗi mục tiêu có một dòng giải thích ngắn.

### `rule_board`

Dùng cho quy tắc, công thức, cấu trúc câu.

Thành phần:

- Formula strip.
- Keyword chips.
- Mũi tên hoặc dấu ngoặc chỉ logic.
- Ví dụ ngắn bên dưới.

### `example_table`

Dùng cho ví dụ song ngữ.

Thành phần:

- Bảng 2-3 dòng.
- Cột `English`, `Ý nghĩa`, `Ghi chú`.
- Highlight từ khóa trong câu tiếng Anh.

### `timeline_board`

Dùng cho ngữ pháp liên quan thời gian.

Thành phần:

- Trục thời gian ngang.
- Điểm quá khứ, hiện tại, tương lai.
- Marker cho hành động.
- Caption giải thích.

### `mistake_correction`

Dùng cho lỗi sai phổ biến.

Thành phần:

- Câu sai có dấu gạch đỏ.
- Câu đúng có dấu tick.
- Lý do sửa.
- Không dùng quá nhiều chữ trong một khung.

### `quiz_board`

Dùng cho practice.

Thành phần:

- Câu hỏi.
- 2-3 lựa chọn.
- Countdown bar hoặc progress dots.
- Chưa hiện đáp án ngay nếu scene sau là answer reveal.

### `answer_board`

Dùng cho đáp án.

Thành phần:

- Đáp án đúng.
- Giải thích 1-2 dòng.
- Ví dụ củng cố.

### `dialogue_board`

Dùng cho hội thoại hoặc business English.

Thành phần:

- Bubble A/B.
- Highlight phrase quan trọng.
- Note về tone: formal, casual, polite.

### `pronunciation_board`

Dùng cho phát âm.

Thành phần:

- Word hoặc phrase lớn.
- Stress pattern.
- Syllable split.
- 2-3 câu shadowing.

### `recap_board`

Dùng cho tổng kết.

Thành phần:

- 3-5 ý nhớ.
- Mỗi ý hiện lần lượt.
- Một câu áp dụng sau video.

## Animation Direction

Phong cách animation nên giống một bài giảng bảng trắng:

- Headline viết vào từ trái sang phải.
- Gạch chân marker quét qua từ khóa.
- Sticky note trượt nhẹ vào bảng.
- Example row hiện từng dòng.
- Step hoặc learning goal hiện lần lượt, không bung tất cả cùng lúc.
- Lỗi sai bị gạch đỏ trước, sau đó câu đúng hiện ra.
- Quiz hiện câu hỏi trước, lựa chọn sau.
- Recap tick từng dòng.

Không cần animation quá phức tạp. Quan trọng là rõ nhịp học, người xem hiểu đang nhìn vào đâu.

## Prompt AI Sinh Kịch Bản

Prompt nền:

```txt
Bạn là biên kịch video giáo dục tiếng Anh cho người Việt.

Hãy tạo kịch bản JSON cho một video dọc 9:16 dài khoảng 150-240 giây về chủ đề: "{{topic}}".

Yêu cầu nội dung:
- Giải thích bằng tiếng Việt có dấu đầy đủ.
- Người học mục tiêu: {{level}}, người Việt học tiếng Anh.
- Không viết quá ngắn. Mỗi scene phải có voiceover 2-4 câu.
- Video cần có 8-10 scene.
- Mỗi scene phải có headline, subheadline, voiceover, visual_type, visual data.
- Các scene giảng chính phải có ví dụ tiếng Anh tự nhiên, bản dịch tiếng Việt và ghi chú cách dùng.
- Nếu có quiz/practice thì phải có đáp án hoặc giải thích ở scene sau.
- Tránh nói chung chung. Phải có quy tắc, ví dụ, lỗi sai hoặc bài tập cụ thể.

Yêu cầu hình ảnh:
- Dùng phong cách bảng trắng có grid mờ.
- Mỗi scene phải có nội dung trực quan ở giữa màn hình.
- Không được tạo scene chỉ có headline.
- Chọn visual_type phù hợp trong danh sách:
  whiteboard_title, learning_goals, rule_board, example_table,
  timeline_board, mistake_correction, quiz_board, answer_board,
  dialogue_board, pronunciation_board, recap_board.

Trả về JSON hợp lệ, không markdown, không giải thích bên ngoài JSON.
```

## Admin/Test UI

Project cần có một màn hình test nội bộ để kiểm thử nhanh mà không phải nhớ nhiều lệnh CLI.

### Mục tiêu UI

Sau khi chạy:

```bash
npm run start
```

người dùng mở local URL và có thể:

1. Nhập topic tiếng Anh.
2. Chọn level, tone và duration target.
3. Bấm generate để tạo `lesson.json`.
4. Xem lesson JSON đã sinh ở dạng readable.
5. Bấm tạo TTS/subtitle.
6. Bấm build composition.
7. Xem preview composition trong iframe.
8. Bấm check để xem lỗi HyperFrames.
9. Bấm render nếu muốn xuất MP4.

### Layout UI đề xuất

UI nên đơn giản, thiên về công cụ nội bộ:

- Cột trái: form cấu hình.
- Cột giữa: pipeline status và log.
- Cột phải: preview video 9:16.
- Tab phụ: `Lesson JSON`, `Scenes`, `Assets`, `Check Output`.

Không cần dashboard phức tạp. Mục tiêu là test nhanh một topic và phát hiện lỗi nội dung/visual.

### Trạng thái pipeline

Mỗi job nên có trạng thái:

- `idle`
- `generating_lesson`
- `creating_audio`
- `creating_subtitles`
- `building_composition`
- `checking`
- `rendering`
- `done`
- `error`

UI phải hiển thị scene nào đã có audio, scene nào thiếu subtitle, và composition đã build lúc nào.

### API local đề xuất

```txt
GET  /                 -> admin/index.html
GET  /preview          -> index.html composition
GET  /api/lesson       -> đọc data/lesson.json
POST /api/generate     -> chạy generate lesson
POST /api/tts          -> chạy create TTS
POST /api/subtitles    -> chạy subtitle
POST /api/build        -> chạy build composition
POST /api/check        -> chạy hyperframes check
POST /api/render       -> chạy hyperframes render
GET  /api/status       -> trạng thái job hiện tại
GET  /api/logs         -> log gần nhất
```

Nếu muốn đơn giản hơn, có thể gộp:

```txt
POST /api/run-lesson
```

để chạy toàn bộ: generate -> tts -> subtitle -> build -> check.

### Quy tắc server

- Server chỉ chạy local.
- Không cần auth ở bản đầu tiên.
- Không dùng database.
- Trạng thái có thể lưu trong memory và ghi thêm `data/job-status.json`.
- Khi chạy command, phải stream hoặc append log để UI đọc được.
- Không cho phép chạy nhiều job cùng lúc trong bản đầu tiên, trừ khi đã thiết kế queue rõ ràng.
- Nếu đang có job chạy, UI disable các nút gây xung đột.

### Preview composition

Preview nên dùng iframe:

```html
<iframe src="/preview" class="preview-frame"></iframe>
```

Khung preview giữ tỉ lệ 9:16:

```css
.preview-shell {
  aspect-ratio: 9 / 16;
  width: min(360px, 100%);
  background: #111827;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: 0;
}
```

Màn hình admin không cần cùng phong cách bảng trắng với video. Admin UI nên gọn, rõ trạng thái và dễ debug.

## Template Duy Nhất

Template `templates/whiteboard/` nên tách thành:

- `template.mjs`: nhận lesson JSON và render HTML composition.
- `scenes.mjs`: các renderer theo `visual_type`.
- `style.css`: toàn bộ CSS cho whiteboard/grid/components.

Renderer gợi ý:

```js
export function renderScene(scene, index, timing) {
  switch (scene.visual_type) {
    case "whiteboard_title":
      return renderWhiteboardTitle(scene, index, timing);
    case "rule_board":
      return renderRuleBoard(scene, index, timing);
    case "example_table":
      return renderExampleTable(scene, index, timing);
    case "timeline_board":
      return renderTimelineBoard(scene, index, timing);
    case "mistake_correction":
      return renderMistakeCorrection(scene, index, timing);
    case "quiz_board":
      return renderQuizBoard(scene, index, timing);
    case "answer_board":
      return renderAnswerBoard(scene, index, timing);
    case "dialogue_board":
      return renderDialogueBoard(scene, index, timing);
    case "pronunciation_board":
      return renderPronunciationBoard(scene, index, timing);
    case "recap_board":
      return renderRecapBoard(scene, index, timing);
    default:
      return renderFallbackBoard(scene, index, timing);
  }
}
```

Fallback board không được rỗng. Nếu AI thiếu dữ liệu, fallback phải tự tạo:

- headline
- subheadline
- 3 bullet từ voiceover hoặc examples
- một note box

## Quy Tắc Không Được Để Scene Trống

Bất kỳ scene nào cũng phải có tối thiểu:

- headline
- subheadline hoặc note
- một visual chính
- ít nhất 2 dòng nội dung ở giữa màn hình

Nếu scene có `examples`, render example table.

Nếu scene có `practice`, render quiz hoặc answer board.

Nếu scene chỉ có `voiceover`, script build phải tách voiceover thành 3 bullet ngắn để render fallback.

Không được bỏ qua scene chỉ vì thiếu field phụ.

## Timing

Mỗi scene:

- `data-start`: tổng thời lượng các scene trước.
- `data-duration`: duration audio scene + padding.
- `data-track-index`: tăng theo layer hoặc giữ nhất quán theo layout.
- Root duration: tổng duration toàn bộ scene.

Animation trong scene nên tính theo phần trăm duration:

- 0-10%: headline/subheadline.
- 10-35%: visual chính.
- 35-75%: ví dụ, rule, practice.
- 75-95%: note hoặc recap mini.
- 95-100%: fade out.

## Subtitle

Subtitle nên đặt dưới cùng, nhưng không che nội dung:

- Vùng subtitle cao khoảng `90-130px`.
- Nền subtitle trắng trong hoặc navy nhạt, tùy tương phản.
- Text tiếng Việt rõ dấu.
- Không để subtitle đè lên quiz/answer.

## Env

`.env` đề xuất:

```env
AI_API_KEY=
AI_MODEL=
TTS_PROVIDER=edge
TTS_VOICE=vi-VN-NamMinhNeural
TTS_FALLBACK_VOICE=vi-VN-HoaiMyNeural
VIDEO_WIDTH=1080
VIDEO_HEIGHT=1920
FPS=30
DEFAULT_DURATION_SECONDS=180
ADMIN_PORT=3000
```

Nếu dùng provider khác cho AI hoặc TTS, giữ interface nội bộ ổn định:

```js
const lesson = await generateLesson({ topic, level, durationTargetSeconds });
const audio = await synthesizeVoice({ text, voice, outputPath });
```

## Ví Dụ Topic Và Scene Flow

### Topic: `Present perfect vs past simple`

Flow có thể là:

1. Hook: hai câu nhìn giống nhưng nghĩa khác.
2. Learning goals: phân biệt trải nghiệm và thời điểm cụ thể.
3. Rule board: present perfect liên quan tới hiện tại.
4. Timeline board: past simple nằm ở mốc đã kết thúc.
5. Example table: so sánh 3 cặp câu.
6. Mistake correction: lỗi với `yesterday`.
7. Quiz board: chọn thì đúng.
8. Answer board: giải thích đáp án.
9. Recap board: 4 quy tắc nhớ nhanh.

### Topic: `Polite email phrases`

Flow có thể là:

1. Hook: email đúng ngữ pháp nhưng nghe cộc.
2. Learning goals: viết lịch sự hơn.
3. Dialogue/email board: câu trực tiếp vs câu lịch sự.
4. Phrase bank: opening, request, follow-up.
5. Example table: 4 câu thay thế.
6. Mistake correction: câu quá blunt.
7. Practice: viết lại câu.
8. Answer reveal: mẫu câu tốt hơn.
9. Recap: 5 phrase dùng ngay.

### Topic: `Word stress in English`

Flow có thể là:

1. Hook: phát âm đúng âm nhưng sai trọng âm.
2. Learning goals: nghe và nói tự nhiên hơn.
3. Pronunciation board: stress pattern.
4. Example table: record, present, object.
5. Rule board: noun vs verb stress.
6. Shadowing drill: lặp theo nhịp.
7. Quiz: chọn trọng âm đúng.
8. Answer board.
9. Recap.

## Kiểm Tra Chất Lượng Nội Dung

Trước khi render, kiểm tra `data/lesson.json`:

- Có `8-10` scene.
- Mỗi scene có `headline`.
- Mỗi headline tiếng Việt có dấu nếu là tiếng Việt.
- Không có scene chỉ gồm tiêu đề.
- Mỗi scene có `voiceover` đủ dài.
- Mỗi scene có `visual_type`.
- Scene giảng chính có ví dụ hoặc rule cụ thể.
- Quiz có đáp án.
- Recap có ý rõ ràng.

Có thể viết validator:

```js
function validateLesson(lesson) {
  if (!Array.isArray(lesson.scenes) || lesson.scenes.length < 8) {
    throw new Error("Lesson must have at least 8 scenes.");
  }

  for (const scene of lesson.scenes) {
    if (!scene.headline) throw new Error(`${scene.id} missing headline`);
    if (!scene.voiceover || scene.voiceover.length < 120) {
      throw new Error(`${scene.id} voiceover too short`);
    }
    if (!scene.visual_type) throw new Error(`${scene.id} missing visual_type`);
  }
}
```

## Kiểm Tra Composition

Sau khi build `index.html`, chạy:

```bash
npm run check
```

Cần xử lý:

- 404 asset.
- Scene chồng lên nhau.
- Scene thiếu `clip`.
- Element thiếu `data-start`, `data-duration`, `data-track-index`.
- Contrast quá thấp.
- Text tràn khỏi khung.
- Subtitle che nội dung chính.

## Definition Of Done

Project được xem là đạt khi:

- Chạy được `npm run start` và mở được màn hình test local.
- UI nhập được topic và gọi được pipeline.
- UI preview được composition 9:16 sau khi build.
- UI hiển thị được log và lỗi check/render nếu có.
- Chạy được `npm run lesson -- "topic bất kỳ"`.
- Sinh được `data/lesson.json`.
- Sinh được audio cho từng scene.
- Build được `index.html`.
- `npm run check` không có error.
- Render được video MP4.
- Video có nền bảng trắng grid mờ.
- Không có scene trống.
- Nội dung đủ sâu, có giải thích và ví dụ.
- Font tiếng Việt hiển thị đúng dấu.

## Prompt Ngắn Để Gửi Cho Codex Trong Project Mới

```txt
Hãy triển khai project HyperFrames mới theo docs/english-knowledge-video-project.md.

Yêu cầu:
- Project tạo video dọc 9:16 về kiến thức tiếng Anh từ một topic đầu vào.
- Có màn hình test nội bộ chạy bằng npm run start để nhập topic, chạy pipeline, xem log và preview composition.
- Dùng một template duy nhất theo phong cách bảng trắng có grid mờ.
- Nội dung video dài khoảng 150-240 giây, 8-10 scene, có giải thích, ví dụ, lỗi sai hoặc bài tập.
- Không được để scene trống hoặc chỉ có headline.
- Có script generate lesson JSON bằng AI, TTS, subtitle fallback, build composition, check và render.
- Sau khi code xong, chạy npm run check và sửa hết lỗi.
```
