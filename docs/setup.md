# Cài đặt và chạy project

## Yêu cầu

- Node.js 22 trở lên.
- npm.
- Python nếu dùng Edge TTS miễn phí.
- ffmpeg để đọc duration audio và render video ổn định.

Kiểm tra nhanh:

```bash
node --version
npm --version
ffmpeg -version
```

## Cài dependency

```bash
npm install
```

Nếu dùng Edge TTS:

```bash
python -m pip install edge-tts
```

## Cấu hình env

```bash
copy .env.example .env
```

Điền ít nhất:

```env
CUSTOM_API_BASE_URL=https://chat.trollllm.xyz/v1
CUSTOM_API_KEY=your_api_key
AI_MODEL=claude-sonnet-4-6
USE_LARVOICE=false
```

## Chạy admin UI

```bash
npm run start
```

Server sẽ in URL admin, ví dụ `http://localhost:3000`. Nếu port 3000 đang bận, app tự dùng port kế tiếp.

## Tạo video

Trong admin UI, nhập chủ đề như `Mệnh đề quan hệ` hoặc `Thì quá khứ`, rồi bấm **Tạo video**.

Luồng chạy gồm:

1. Sinh `data/lesson.json`.
2. Tạo audio trong `assets/audio`.
3. Tạo subtitle trong `assets/subtitles`.
4. Build `index.html`.
5. Chạy HyperFrames check.
6. Render MP4 vào `renders`.
