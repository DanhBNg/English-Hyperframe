# Biến môi trường

Không commit `.env`. Dùng `.env.example` làm mẫu.

## AI

| Biến | Bắt buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- |
| `CUSTOM_API_BASE_URL` | Có | | Base URL OpenAI-compatible, ví dụ `https://chat.trollllm.xyz/v1`. |
| `CUSTOM_API_KEY` | Có | | API key cho endpoint AI. |
| `AI_MODEL` | Không | `claude-sonnet-4-6` | Model dùng để sinh lesson. |

## TTS

| Biến | Bắt buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- |
| `USE_LARVOICE` | Không | `false` | `true` để dùng LarVoice, `false` để dùng Edge TTS miễn phí. |
| `LARVOICE_API_KEY` | Khi dùng LarVoice | | API key LarVoice. |
| `LARVOICE_VOICE_ID` | Không | `1` | Voice ID LarVoice. Hiện đang dùng voice Thanh Tùng qua ID này. |
| `LARVOICE_API_BASE_URL` | Không | `https://larvoice.com/api` | Base URL LarVoice. |
| `FALLBACK_TO_EDGE_TTS` | Không | `true` | Nếu LarVoice lỗi, tự chuyển sang Edge TTS. |
| `EDGE_TTS_VOICE` | Không | `vi-VN-NamMinhNeural` | Voice Edge TTS chính. |
| `TTS_FALLBACK_VOICE` | Không | `vi-VN-HoaiMyNeural` | Voice Edge TTS dự phòng. |

## App

| Biến | Bắt buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- |
| `ADMIN_PORT` | Không | `3000` | Port admin UI. Nếu bận, server tự tìm port kế tiếp. |
| `DEFAULT_DURATION_SECONDS` | Không | `180` | Mục tiêu độ dài video. |
| `VIDEO_WIDTH` | Không | `1080` | Chiều rộng composition. |
| `VIDEO_HEIGHT` | Không | `1920` | Chiều cao composition. |
