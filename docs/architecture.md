# Kiến trúc project

## Thư mục chính

| Đường dẫn | Vai trò |
| --- | --- |
| `admin/` | Giao diện điều khiển cục bộ. |
| `server/` | HTTP server cho admin UI và API chạy pipeline. |
| `scripts/` | Các bước generate lesson, TTS, subtitle, build composition. |
| `scripts/lib/` | Helper env, schema, timing, ffmpeg, TTS, AI. |
| `templates/whiteboard/` | Template HTML/CSS/scene renderer cho video. |
| `assets/fonts/` | Font Be Vietnam Pro dùng trong composition. |
| `data/` | Lesson và manifest sinh ra khi chạy pipeline. |
| `renders/` | MP4 xuất ra sau khi render. |
| `tests/` | Unit tests cho env, schema, timing, renderer và server port. |
| `docs/` | Tài liệu vận hành và thiết kế. |

## Luồng server

`server/app.mjs` phục vụ:

- `/` admin UI.
- `/preview` composition `index.html`.
- `/api/run-lesson` chạy toàn bộ pipeline.
- `/api/status`, `/api/logs`, `/api/lesson` để UI đọc trạng thái.

Server dùng `server/ports.mjs` để tự tìm port trống nếu `ADMIN_PORT` bị chiếm.

## Luồng render scene

`templates/whiteboard/scenes.mjs` nhận từng scene trong `data/lesson.json` và render HTML theo `visual_type`.

Các renderer ưu tiên field chuyên biệt:

- `rule_board`: `formula`, `rule`, `markers`, `signals`.
- `example_table`: `columns`, `rows`.
- `mistake_correction`: `mistakes[].wrong/right/explanation`.
- `application_board`: `scenario`, `example`, `signals_highlighted`, `prompt`, `tip`.
- `recap_board`: `points`.

Nếu thiếu dữ liệu, renderer mới fallback sang headline/subheadline/voiceover. Nội dung cũng được lọc trùng trước khi đưa vào card.

## HyperFrames

`templates/whiteboard/template.mjs` tạo `index.html` với:

- `data-composition-id="main"`.
- `data-start`, `data-duration`, `data-track-index` cho các timed elements.
- Audio clips riêng.
- Subtitle clips riêng.
- GSAP timeline paused và đăng ký vào `window.__timelines["main"]`.
