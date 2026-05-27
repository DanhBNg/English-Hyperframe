# English HyperFrame

Tool tạo video dọc 9:16 cho nội dung học tiếng Anh bằng HyperFrames. Luồng chính: nhập chủ đề, AI viết lesson JSON, tạo voiceover, tạo subtitle, build `index.html`, check layout và render MP4.

## Tính năng chính

- Admin UI cục bộ với một nút **Tạo video** và log realtime.
- Sinh lesson bằng API OpenAI-compatible qua `CUSTOM_API_BASE_URL`.
- Model mặc định: `claude-sonnet-4-6`.
- TTS bằng LarVoice khi `USE_LARVOICE=true`; tự fallback sang Edge TTS miễn phí nếu bật `FALLBACK_TO_EDGE_TTS=true`.
- Template whiteboard dùng font Be Vietnam Pro để tránh lỗi tiếng Việt.
- Video không có quiz trắc nghiệm, không có nhãn level như A1-A9/A2-B1 trong scene.
- Renderer đọc đúng `visual` data để tránh bento/card trùng nội dung hoặc vô nghĩa.

## Cài đặt nhanh

```bash
npm install
```

Tạo `.env` từ mẫu:

```bash
copy .env.example .env
```

Cấu hình tối thiểu:

```env
CUSTOM_API_BASE_URL=https://chat.trollllm.xyz/v1
CUSTOM_API_KEY=your_api_key
AI_MODEL=claude-sonnet-4-6
USE_LARVOICE=false
```

Nếu dùng Edge TTS miễn phí, cài Python package:

```bash
python -m pip install edge-tts
```

## Chạy bằng giao diện

```bash
npm run start
```

Mở URL được in ra terminal, thường là:

```text
http://localhost:3000
```

Nếu port 3000 bận, server tự chuyển sang port kế tiếp và in URL mới.

## Chạy bằng CLI

```bash
npm run lesson -- "Mệnh đề quan hệ"
```

Hoặc chạy từng bước:

```bash
npm run generate -- "Thì quá khứ"
npm run tts
npm run subtitles
npm run build
npm run check
npm run render
```

## Tài liệu

- [Cài đặt và cấu hình](docs/setup.md)
- [Biến môi trường](docs/environment.md)
- [Luồng tạo video](docs/pipeline.md)
- [Kiến trúc project](docs/architecture.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Spec dự án gốc](docs/english-knowledge-video-project.md)

## Kiểm tra chất lượng

Sau khi sửa template hoặc composition:

```bash
npm test
npm run check
```

`npm run check` chạy lint, validate và inspect bằng HyperFrames.
