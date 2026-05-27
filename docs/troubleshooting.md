# Troubleshooting

## Port 3000 bị chiếm

Lỗi thường gặp:

```text
Error: listen EADDRINUSE: address already in use :::3000
```

Hiện server đã tự fallback sang port kế tiếp. Chạy:

```bash
npm run start
```

Rồi dùng URL được in ra terminal, ví dụ `http://localhost:3001`.

Nếu muốn đổi port mặc định:

```env
ADMIN_PORT=3002
```

## Model không được hỗ trợ

Lỗi ví dụ:

```text
Model 'gpt-4o-mini' is not supported
```

Đặt model trong `.env`:

```env
AI_MODEL=claude-sonnet-4-6
```

## LarVoice trả 404

Lỗi ví dụ:

```text
LarVoice create failed 404: Not Found
```

Cách xử lý thực tế:

```env
FALLBACK_TO_EDGE_TTS=true
```

Khi LarVoice lỗi, script sẽ tự dùng Edge TTS. Nếu muốn dùng Edge TTS ngay từ đầu:

```env
USE_LARVOICE=false
```

## Edge TTS không chạy

Cài package Python:

```bash
python -m pip install edge-tts
```

Nếu máy có nhiều Python, set biến:

```env
PYTHON=C:\Path\To\python.exe
```

## Card trong video bị trùng hoặc đọc vô nghĩa

Nguyên nhân thường là lesson thiếu `visual` field đúng theo `visual_type`.

Renderer hiện đã ưu tiên các field chuyên biệt và lọc trùng. Nếu vẫn gặp nội dung kém, generate lại lesson sau khi prompt đã được cập nhật:

```bash
npm run generate -- "Chủ đề cần làm"
npm run build
npm run check
```

## HyperFrames warning track quá dày

Warning dạng:

```text
timeline_track_too_dense
```

Đây là warning về khả năng bảo trì timeline, không phải lỗi render. Nếu cần tối ưu sâu hơn, tách scene group thành sub-composition trong `compositions/`.
