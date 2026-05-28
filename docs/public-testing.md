# Cho người khác test mà không cần clone project

Project này có thể chạy như một web app local. Để người khác test mà không cần clone repo, cần có một máy/server chạy app, sau đó chia sẻ URL web cho họ.

Có hai cách triển khai thực tế.

## Cách 1: Chia sẻ nhanh từ máy của bạn bằng tunnel

Cách này phù hợp để demo nhanh cho 1-2 người. Máy của bạn vẫn chạy pipeline, người khác chỉ mở link web.

1. Chạy app:

```bash
npm run start
```

2. Lấy URL local được in ra, ví dụ:

```text
http://localhost:3000
```

3. Dùng một công cụ tunnel như Cloudflare Tunnel hoặc ngrok để public URL local đó.

Ví dụ với Cloudflare Tunnel:

```bash
cloudflared tunnel --url http://localhost:3000
```

Ví dụ với ngrok:

```bash
ngrok http 3000
```

4. Gửi URL public cho người test.

Lưu ý:

- Máy của bạn phải bật trong lúc người khác test.
- Nếu họ bấm **Tạo video**, request sẽ dùng API key trong `.env` trên máy bạn.
- Không nên public link rộng rãi nếu chưa có auth hoặc giới hạn lượt generate.

## Cách 2: Deploy lên VPS/server riêng

Cách này phù hợp hơn nếu muốn người khác test bất cứ lúc nào.

Server cần có:

- Node.js 22 trở lên.
- npm.
- Python nếu dùng Edge TTS.
- `edge-tts` nếu `USE_LARVOICE=false`.
- ffmpeg.
- Chrome/Chromium hoặc môi trường đủ để HyperFrames render.

Các bước trên server:

```bash
git clone https://github.com/DanhBNg/English-Hyperframe.git
cd English-Hyperframe
npm install
cp .env.example .env
```

Cấu hình `.env`:

```env
CUSTOM_API_BASE_URL=https://chat.trollllm.xyz/v1
CUSTOM_API_KEY=your_api_key
AI_MODEL=claude-sonnet-4-6
USE_LARVOICE=false
FALLBACK_TO_EDGE_TTS=true
ADMIN_PORT=3000
```

Nếu dùng Edge TTS:

```bash
python -m pip install edge-tts
```

Chạy app:

```bash
npm run start
```

Sau đó dùng Nginx/Caddy hoặc panel hosting để proxy domain public về port app.

## Preview video trên web

Admin UI có hai chế độ preview:

- `Composition`: xem `index.html` HyperFrames sau khi build.
- `Video đã render`: xem file MP4/WebM mới nhất trong thư mục `renders`.

Sau khi pipeline render xong, tab `Video đã render` sẽ tự lấy video mới nhất từ `/renders/<file>` và hiển thị bằng thẻ `<video controls>`.

## Bảo mật khi public

Bản hiện tại là admin tool nội bộ, chưa có đăng nhập. Nếu đưa lên internet công khai, cần hiểu rõ:

- Ai có link cũng có thể bấm generate.
- Mỗi lần generate có thể tốn quota AI/TTS.
- API key nằm trên server, không lộ ra browser, nhưng vẫn bị tiêu hao nếu người lạ dùng app.

Khuyến nghị:

- Chỉ gửi link cho người cần test.
- Dùng tunnel có thời hạn khi demo nhanh.
- Nếu deploy dài hạn, đặt app sau basic auth, Cloudflare Access, VPN hoặc reverse proxy có mật khẩu.

## Không phù hợp với static hosting

Project này không thể deploy đầy đủ lên GitHub Pages hoặc static hosting thuần, vì cần server để:

- Gọi AI API.
- Tạo TTS.
- Ghi file audio/subtitle/render.
- Chạy HyperFrames render.

Static hosting chỉ phù hợp để host video MP4 đã render sẵn, không phù hợp để người khác tự nhập topic và tạo video mới.
