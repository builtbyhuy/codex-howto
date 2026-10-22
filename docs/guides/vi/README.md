# Bắt đầu dùng Codex bằng một bài thực hành thật

**Phạm vi ngôn ngữ:** hướng dẫn nhập môn này có năm bản ngôn ngữ. Toàn bộ 60 bài học chi tiết, mã thực hành, phần xem tệp nguồn và câu hỏi kiểm tra vẫn bằng tiếng Anh. Chọn ngôn ngữ của hướng dẫn không đồng nghĩa với dịch toàn bộ khóa học.

Cập nhật hướng dẫn **22/10/2026**. Tài liệu sản phẩm được kiểm tra ngày **21/10/2026**; tính năng có thể khác theo phiên bản, hệ điều hành, tài khoản và chính sách tổ chức.

[English](../en/README.md) · [Tiếng Việt](../vi/README.md) · [中文](../zh/README.md) · [日本語](../ja/README.md) · [Українська](../uk/README.md)

## 1. Bắt đầu với một dự án có thể tự kiểm tra

Codex là tác nhân lập trình: có thể đọc tệp dự án, đề xuất chỉnh sửa và sử dụng công cụ được cấp. Hãy bắt đầu trong ứng dụng máy tính, nơi dự án, cuộc trò chuyện và bản xem trước nằm trong cùng không gian làm việc. Làm theo [hướng dẫn ứng dụng chính thức](https://learn.chatgpt.com/docs/app) để cài đặt và đăng nhập. Nếu đã cài, kiểm tra bản đang dùng trước. Chọn Codex rồi mở thư mục thực hành riêng; đăng nhập thành công chưa chứng minh đã mở đúng dự án.

Mở [bài đầu tiên](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s01-01) và tải [Orbit Notes](https://codex-howto.hokhachuy1234.chatgpt.site/labs/project-workflow.zip). Giải nén; gói giữ cấu trúc `labs/project-workflow/` bên trong thư mục giải nén. Từ thư mục của bài thực hành, chạy:

```text
node create-workspace.cjs
```

Lệnh cần Node.js 20+ có sẵn và trả về đường dẫn thư mục tạm mới. Mở chính xác thư mục đó trong Codex. Nếu chưa có Node, có thể sao chép `starter/` bằng trình quản lý tệp, nhưng phải ghi nhận rằng chưa chạy kiểm tra mã. Để tài liệu cá nhân ngoài bài tập.

## 2. Yêu cầu bằng chứng trước khi cho sửa

Sau khi mở đúng thư mục, gửi:

```text
Chỉ đọc: xác nhận thư mục làm việc thực tế. Đọc README.md, AGENTS.md và notes.json. Nêu mục đích dự án, bốn mã ghi chú và cho biết tài liệu có địa chỉ triển khai hay không. Kiểm tra package.json có tồn tại trước khi chấp nhận hướng dẫn chạy kiểm tra trong README. Không sửa tệp hoặc cài đặt gì.
```

Tự đối chiếu câu trả lời với các tệp. Bốn mã dữ liệu hư cấu là `n1`, `n2`, `n3`, `n4`. Không có địa chỉ triển khai được ghi lại. README của bản khởi đầu yêu cầu `npm test`, nhưng không có `package.json`: đây là chỉ dẫn sai được cài vào bài tập. Câu trả lời đúng phải chỉ ra mâu thuẫn, không bịa địa chỉ website hoặc cài thêm thư viện để che nó. `AGENTS.md` chứa hướng dẫn dự án; sự tồn tại của tệp chưa chứng minh mọi phiên bản Codex đều tìm thấy và tuân theo.

## 3. Sửa một lỗi và kiểm tra kết quả

Trong bản sao riêng, ghi nhận tình trạng ban đầu:

```text
node --test checks.cjs
node cli.cjs REVIEW
```

Kết quả dự kiến: **4 kiểm tra đạt, 2 kiểm tra lỗi**. Tìm kiếm phải khớp chuỗi con, không phân biệt hoa thường và bỏ khoảng trắng thừa quanh từ khóa. Giao Codex sửa `notes.cjs`, giữ nguyên các đối tượng ghi chú và thứ tự, đồng thời đổi hướng dẫn README.md sang lệnh kiểm tra thật. Giữ nguyên `notes.json`, `checks.cjs`, `WORK-NOTE.md`. Sau đó chạy lại:

```text
node --test checks.cjs
node cli.cjs "  REVIEW  "
```

Mục tiêu là **6 kiểm tra đạt**, cùng hai dòng `n1: Review launch checklist` và `n3: Review documentation`. Tự mở các tệp đã sửa. Lời báo hoàn thành không thay thế kết quả kiểm tra. Nếu còn lỗi, đưa nguyên đầu ra liên quan cho Codex và yêu cầu chỉnh nhỏ đúng chỗ. Không xóa kiểm tra đang lỗi hay chép đè cả dự án bằng đáp án. Gói có lời giải và tiêu chí để đối chiếu sau khi tự làm.

Tiếp theo, thêm một đoạn README hữu ích rồi thử một tiêu đề không muốn giữ. Khôi phục riêng tiêu đề, giữ lại đoạn mới. Đây là phục hồi có giới hạn; mở cuộc trò chuyện khác không tự khôi phục tệp. Nếu đã có Git, bài tùy chọn giúp xem thay đổi so với vùng chuẩn bị; phần minh họa commit riêng giải thích lịch sử bền vững. Vùng chuẩn bị và commit là hai loại mốc khác nhau.

## 4. Đi theo lộ trình mười mô-đun

Khóa học có **60 bài**, theo thứ tự dưới đây. Skill là gói hướng dẫn tái sử dụng; MCP là giao thức kết nối công cụ và dữ liệu; tác nhân con nhận phần việc được giao; hook xử lý một sự kiện được hỗ trợ; plugin đóng gói các khả năng liên quan để phân phối. Các bài sau giải thích cách thiết lập và điều kiện sử dụng từng loại.

| Giai đoạn | Mô-đun và số bài |
| --- | --- |
| Cơ bản | [Lệnh và phiên đầu tiên](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s01-01) — 6; [Hướng dẫn dự án và bộ nhớ](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s02-01) — 5; [Phục hồi và Git](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s08-01) — 5; [CLI](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s10-01) — 5 |
| Trung cấp | [Skills](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s03-01) — 6; [Hooks](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s06-01) — 7; [MCP](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s05-01) — 6; [Tác nhân con](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s04-01) — 7 |
| Nâng cao | [Tính năng nâng cao](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s09-01) — 7; [Plugins](https://codex-howto.hokhachuy1234.chatgpt.site/#lesson/s07-01) — 6 |

Mỗi bài có mục tiêu, giải thích, ví dụ, bài tập, bằng chứng cần kiểm tra, đáp án và câu hỏi kiến thức. Tự làm trước khi mở đáp án. Thời lượng hiển thị chỉ là ước tính, không phải cam kết thành thạo.

## 5. Hiểu bảy gói thực hành chứng minh điều gì

[Thư viện thực hành](https://codex-howto.hokhachuy1234.chatgpt.site/#labs) có bảy gói tải riêng. `project-workflow` dạy dự án đầu và phục hồi; `cli-pipeline` kiểm tra sự kiện của tiến trình và báo cáo trích xuất; `skill-workflow` cung cấp quy trình đánh giá tái sử dụng cùng chương trình hỗ trợ xác định; `mcp-workbench` trao đổi thông điệp JSON-RPC thật giữa các tiến trình cục bộ; `delegation-capstone` tích hợp hai phần việc; `hook-policy` phát lại sự kiện và kiểm tra bằng chứng gắn với tệp; `workflow-plugin` kết hợp skill, công cụ và tài nguyên kết nối.

Chương trình cục bộ thực sự chạy, nhưng dữ liệu hư cấu, sự kiện tổng hợp và giao việc mô phỏng đều được ghi rõ. Công cụ hỗ trợ vượt kiểm tra không chứng minh Codex đã gọi skill, chọn công cụ MCP, tạo tác nhân con hay kích hoạt hook. Nhánh thực hành trực tiếp trong ứng dụng giải thích cách quan sát riêng các việc đó. Đọc README của từng gói, dùng bản sao mới và phân biệt lỗi chủ ý của bài tập với kiểm tra của lời giải.

## 6. Chọn đúng hướng dẫn cho từng giao diện

**Ứng dụng** có dự án, cuộc trò chuyện và bảng xem thay đổi. **CLI** là chương trình chạy trong terminal: thư mục hiện tại và cờ lệnh rất quan trọng. **Tiện ích IDE** nằm trong trình soạn thảo: phải xác nhận thư mục dự án và dùng điều khiển của tiện ích. Không dán lệnh CLI vào cuộc trò chuyện rồi mặc định nó điều khiển ứng dụng. Kiểm tra menu và tính năng thực tế của bản đang cài, theo đúng nhánh hướng dẫn của bài. Không đưa khóa API hay dữ liệu bí mật vào bài tập. Tham khảo [CLI](https://learn.chatgpt.com/docs/codex/cli), [đăng nhập](https://learn.chatgpt.com/docs/auth), [quyền thực thi](https://learn.chatgpt.com/docs/agent-approvals-security).

## 7. Lưu tiến độ hoặc chạy website tại máy

Không cần tài khoản học. Mở bài sẽ ghi nhận tiến độ; đánh dấu hoàn tất sau khi kiểm tra. Tiến độ và đáp án nằm trong trình duyệt, gắn với địa chỉ website: bản cục bộ và bản công khai có dữ liệu riêng. Xuất bản sao tiến độ trong Source library trước khi đổi máy hoặc xóa dữ liệu trình duyệt, rồi nhập ở nơi mới. Chế độ riêng tư hoặc chặn bộ nhớ có thể làm mất khả năng lưu. Website không tự chạy ví dụ terminal.

Nếu Git và Node.js 20+ đã có sẵn:

```text
git clone https://github.com/builtbyhuy/codex-howto.git
cd codex-howto
node scripts/server.cjs
```

Mở `http://127.0.0.1:4173/`, giữ terminal chạy, nhấn Ctrl+C để dừng. Không cần cài gói hay biên dịch framework. Dùng máy chủ này thay vì mở trực tiếp index.html. Trình đọc tương tác cần JavaScript.

## Nguồn, phản hồi và quyền sử dụng

Đây là hướng dẫn cộng đồng độc lập, không liên kết với OpenAI, Anthropic hoặc tác giả trang tham khảo, và không cấp chứng chỉ. Lộ trình tham khảo [Claude How-To](https://luongnv.com/claude-howto/), còn hướng dẫn Codex được viết lại dựa trên khả năng đã xác minh. [Kho nguồn](https://github.com/builtbyhuy/codex-howto) có ghi xuất xứ và [thông báo bên thứ ba](https://github.com/builtbyhuy/codex-howto/blob/main/THIRD-PARTY-NOTICES.md). [Thông báo MIT gốc](https://github.com/builtbyhuy/codex-howto/blob/main/assets/licenses/claude-howto-MIT.txt) cùng giấy phép phông chữ, biểu tượng, Mermaid và schema được giữ riêng; công khai không đồng nghĩa cấp một giấy phép chung mới cho mọi nội dung.

Báo lỗi qua [GitHub Issues](https://github.com/builtbyhuy/codex-howto/issues/new), kèm mã bài, giao diện/phiên bản và mô tả đã loại dữ liệu nhạy cảm. Xóa khóa bí mật, đường dẫn cá nhân. Nếu sản phẩm khác bài học, kiểm tra tài liệu chính thức được dẫn: ngày xác minh là mốc bằng chứng, không phải bảo đảm cho mọi bản phát hành tương lai.
