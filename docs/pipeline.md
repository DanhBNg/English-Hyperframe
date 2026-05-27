# Luồng tạo video

## Luồng đầy đủ

```bash
npm run lesson -- "Mệnh đề quan hệ"
```

Script này chạy:

1. `scripts/generate-lesson.mjs`
2. `scripts/create-tts.mjs`
3. `scripts/create-subtitles.mjs`
4. `scripts/build-composition.mjs`
5. `npm run check`

Admin UI dùng thêm bước `npm run render` để xuất MP4.

## Các file sinh ra

| File/folder | Nguồn tạo | Ý nghĩa |
| --- | --- | --- |
| `data/lesson.json` | AI | Kịch bản lesson gồm scenes, voiceover, examples và visual data. |
| `assets/audio/*.mp3` | TTS | Voiceover từng scene. |
| `assets/subtitles/*.srt` | Subtitle script | Subtitle từng scene. |
| `data/audio-manifest.json` | TTS | Đường dẫn audio và duration. |
| `data/subtitle-manifest.json` | Subtitle script | Subtitle blocks theo scene. |
| `data/timing-manifest.json` | Build script | Start/duration của từng scene. |
| `index.html` | Template build | Composition HyperFrames chính. |
| `renders/*.mp4` | HyperFrames render | Video xuất cuối. |

## Nguyên tắc nội dung

- Không tạo quiz trắc nghiệm hoặc lựa chọn A/B/C.
- Không hiển thị nhãn level như A1-A9 hoặc A2-B1 trong scene.
- Headline cần nổi bật, nhưng nội dung trong card phải đọc độc lập và không lặp nguyên văn voiceover.
- Scene giảng chính nên có quy tắc, ví dụ, lỗi sai hoặc ứng dụng thực tế.
- Mindmap chỉ dùng khi phù hợp với nội dung phân nhánh.

## Kiểm tra

```bash
npm test
npm run check
```

`npm run check` gồm HyperFrames lint, validate và inspect layout.
