const fs = require('fs');
const mammoth = require('mammoth');
const XLSX = require('xlsx');

async function main() {
  // 1. Convert DOCX to MD
  const docxPath = 'docs/seminar-AI.docx';
  const mdPath = 'docs/seminar-detail.md';
  if (fs.existsSync(docxPath)) {
    try {
      const result = await mammoth.extractRawText({path: docxPath});
      fs.writeFileSync(mdPath, result.value);
      console.log('Converted DOCX to MD successfully.');
    } catch (e) {
      console.error('Error extracting text from docx:', e);
    }
  }

  // 2. Define 15 deep questions (ICPC style)
  const questions = [
    {
      title: 'Khởi Nguyên',
      description: 'Mai vừa tiếp nhận dự án làm lại hệ thống ERP cho một tập đoàn sản xuất đồ gỗ. Khối lượng tài liệu quy trình cũ (SOP) lên đến hàng ngàn trang PDF. Theo phương pháp luận truyền thống, Mai sẽ mất hàng tuần chỉ để đọc hiểu. Nhớ lại triết lý "AI-First", cô quyết định dùng AI để thiết lập hệ thống tri thức. Tuy nhiên, hành động đầu tiên cô làm không phải là quăng tất cả tài liệu vào AI một cách mù quáng, mà là một bước tư duy nền tảng. Theo bạn, hành động đầu tiên và quan trọng nhất của Mai để làm chủ khối dữ liệu này là gì?',
      question_type: 'single',
      choices: JSON.stringify([
        'Cắt nhỏ file PDF thành nhiều phần và yêu cầu AI tóm tắt từng phần',
        'Lên danh sách các mục tiêu nghiệp vụ cốt lõi cần giải quyết trước khi cung cấp bối cảnh (context) cho AI',
        'Dùng Python viết một script OCR để chuyển đổi PDF sang text thuần túy',
        'Hỏi AI cách để tự động hóa toàn bộ nhà máy sản xuất gỗ'
      ]),
      correct_index: 1,
      correct_answer: '',
      explanation: 'Sự khác biệt của một AI-Driven BA là bắt đầu từ tư duy giải quyết vấn đề (Problem-Solving) và mục tiêu nghiệp vụ, chứ không phải bị lệ thuộc vào công cụ. Cần xác định mục tiêu trước khi Prompt.',
      tags: 'Tư duy AI,Problem Solving',
      difficulty: 1,
      topic_group_name: 'Chiến lược phân tích'
    },
    {
      title: 'Nghịch Lý Lựa Chọn',
      description: 'Dự án đang trong giai đoạn đề xuất kiến trúc hệ thống. Mai dùng một LLM để phân tích và so sánh 3 giải pháp kiến trúc: Microservices, Monolithic và Serverless. AI đưa ra một bảng so sánh vô cùng thuyết phục, phân tích hàng loạt ưu điểm vượt trội và kết luận nên chọn Serverless vì khả năng mở rộng vô hạn. Tuy nhiên, với vai trò là BA, Mai biết rằng đội ngũ Dev hiện tại của công ty chỉ có kinh nghiệm bảo trì Monolithic, và ngân sách hạ tầng cho dự án này cực kỳ eo hẹp. Mai cần áp dụng những "Bộ lọc chống ảo tưởng" nào trước khi chốt phương án tư vấn cho khách hàng?',
      question_type: 'multiple',
      choices: JSON.stringify([
        'Bộ lọc Công nghệ (Đánh giá giới hạn của bản thân LLM đang sử dụng)',
        'Bộ lọc Nghiệp vụ (Đánh giá tính khả thi dựa trên năng lực hiện tại của tổ chức)',
        'Bộ lọc Giá trị thực (Cân đối giữa ROI và chi phí bảo trì thực tế)',
        'Bộ lọc Đạo đức (Đảm bảo kiến trúc không vi phạm quyền riêng tư)'
      ]),
      correct_index: '',
      correct_answer: JSON.stringify([1, 2]),
      explanation: 'AI thường gợi ý giải pháp tốt nhất về mặt lý thuyết (sách giáo khoa). BA phải dùng Bộ lọc Nghiệp vụ (nhân lực thực tế) và Bộ lọc Giá trị thực (chi phí) để bẻ lái giải pháp cho phù hợp.',
      tags: 'Thẩm định,Kiến trúc',
      difficulty: 3,
      topic_group_name: 'Thẩm định giải pháp'
    },
    {
      title: 'Dòng Chảy Hỗn Loạn',
      description: 'Trong một dự án siêu tốc, khách hàng liên tục thay đổi yêu cầu kinh doanh, khiến tài liệu đặc tả (SRS) của Mai bị lỗi thời (out-of-date) ngay khi vừa viết xong. Mai quyết định dẹp bỏ phương pháp Thác nước (Waterfall) và chuyển sang luồng làm việc "Hyper-Agile" được trợ lực bởi AI (như Antigravity hoặc Cursor). Hãy giúp Mai sắp xếp vòng đời quản lý Yêu cầu siêu tốc theo tư duy hiện đại nhất.',
      question_type: 'ordering',
      choices: JSON.stringify([
        'Thu thập các ý tưởng rời rạc và yêu cầu thô từ khách hàng (Voice records, sticky notes)',
        'Đưa yêu cầu thô vào AI Agent kèm theo bối cảnh dự án để sinh nhánh User Stories nền tảng',
        'Dùng AI để sinh nhanh các bản phác thảo giao diện (Wireframes/Prototypes) từ User Stories',
        'Cầm Prototype tương tác trực quan với khách hàng để chốt phương án và điều chỉnh ngay lập tức',
        'AI tự động cập nhật lại các tài liệu đặc tả và test cases dựa trên Prototype cuối cùng'
      ]),
      correct_index: '',
      correct_answer: '[]',
      explanation: 'Đây là quy trình định hướng (Directing) thay vì thu thập (Elicitation) tuyến tính. Đi từ ý tưởng thô -> AI tạo Story -> AI tạo Prototype -> Tương tác trực quan chốt đơn -> AI cập nhật tài liệu.',
      tags: 'Agile,Quy trình',
      difficulty: 4,
      topic_group_name: 'Chiến lược phân tích'
    },
    {
      title: 'Bức Tranh Mảnh Ghép',
      description: 'Công việc BA đòi hỏi sự đa nhiệm. Mai đang phải xử lý 4 tác vụ khó nhằn trong dự án ERP: (A) Tự động hóa việc phân tích luồng code cũ để tìm Business Rules; (B) Thiết kế giao diện Dashboard phân tích dữ liệu; (C) Chuyển biên bản họp thành danh sách công việc; (D) Xây dựng kế hoạch triển khai dài hạn. Mai có trong tay một bộ công cụ gồm các "vũ khí AI". Hãy ghép nối công cụ AI/Tính năng phù hợp nhất để Mai đạt hiệu suất tối đa.',
      question_type: 'matching',
      choices: JSON.stringify([
        'Tìm ẩn số Business Rules từ mã nguồn dự án cũ (Legacy Code)',
        'Tạo phác thảo giao diện (Wireframe) từ đoạn mô tả văn bản',
        'Xử lý hội thoại tự nhiên từ biên bản họp thành danh sách Task',
        'Hoạch định chiến lược và kế hoạch triển khai (Roadmap)'
      ]),
      correct_index: '',
      correct_answer: JSON.stringify([
        'Cursor / Claude Code (AI tích hợp IDE)',
        'V0 / Midjourney / Figma AI (AI Design)',
        'ChatGPT / Claude (LLM xử lý ngôn ngữ tự nhiên)',
        'Antigravity / Trợ lý AI lập kế hoạch'
      ]),
      explanation: 'Sử dụng đúng công cụ cho đúng bài toán là kỹ năng AI Tools Proficiency cốt lõi của một AI-Driven BA.',
      tags: 'AI Tools,Ứng dụng',
      difficulty: 2,
      topic_group_name: 'Kỹ năng làm việc với AI'
    },
    {
      title: 'Lời Thì Thầm Của Máy',
      description: 'Mai đang sử dụng tính năng Agentic AI của Antigravity để phân tích một quy trình đối soát tài chính phức tạp. Mai viết Prompt: "Hãy phân tích quy trình này và đưa ra các ngoại lệ (Edge cases)". AI trả về một danh sách các ngoại lệ rất ngô nghê, thiếu tính đặc thù ngành tài chính. Nhận ra "Điểm mù khẩu lệnh", Mai quyết định nâng cấp câu lệnh của mình bằng kỹ thuật Role-Prompting và Context-Seeding. Đâu là câu lệnh (Prompt) thể hiện đúng triết lý của một chuyên gia BA thực chiến?',
      question_type: 'single',
      choices: JSON.stringify([
        '"Bạn là một BA. Hãy nghĩ ra thêm nhiều trường hợp lỗi cho luồng tài chính này nhé."',
        '"Đóng vai trò là một Senior BA chuyên ngành Tài chính kế toán. Dựa vào bộ quy tắc chuẩn mực kế toán VAS kèm theo [tài liệu hệ thống hiện tại], hãy chỉ ra 5 lỗ hổng thất thoát dòng tiền có thể xảy ra ở bước chuyển khoản đối soát, và đề xuất hướng xử lý kỹ thuật."',
        '"Hãy mô tả lại quy trình đối soát tài chính dưới dạng bảng biểu để tôi dễ đọc hơn."',
        '"Viết cho tôi một câu lệnh SQL để truy vấn tất cả các giao dịch đối soát bị lỗi trong hệ thống."'
      ]),
      correct_index: 1,
      correct_answer: '',
      explanation: 'Prompt thực chiến phải có Role (Senior BA Tài chính), Context (Chuẩn mực VAS, tài liệu hiện tại), và Task rõ ràng (tìm 5 lỗ hổng thất thoát dòng tiền, đề xuất xử lý).',
      tags: 'Prompting,Thực chiến',
      difficulty: 4,
      topic_group_name: 'Kỹ năng làm việc với AI'
    },
    {
      title: 'Đứt Gãy Kết Nối',
      description: 'Trong cuộc họp với Giám đốc Sản xuất của nhà máy gỗ, Mai tự tin mở màn hình và dùng Cursor trình chiếu trực tiếp (live-preview) một nguyên mẫu phần mềm (prototype) được sinh ra siêu nhanh bằng AI. Nhưng thay vì ấn tượng, vị Giám đốc lại tỏ ra giận dữ. Ông phàn nàn rằng giao diện này tuy hiện đại nhưng bắt công nhân phải bấm quá nhiều nút, phá vỡ thói quen làm việc 20 năm của họ. Không khí cuộc họp đóng băng. Đứng trước tình huống này, kỹ năng "độc bản" nào của Mai cần được kích hoạt ngay lập tức mà không một AI nào làm thay được?',
      question_type: 'multiple',
      choices: JSON.stringify([
        'Viết lại Prompt cho Cursor ngay tại chỗ để AI tự động vẽ lại giao diện ít nút hơn',
        'Kỹ năng thấu cảm (Empathy): Lắng nghe nỗi sợ thay đổi của vị giám đốc để xoa dịu cảm xúc',
        'Tư duy phản biện (Critical Thinking): Phân tích nhanh tại sao thói quen 20 năm lại quan trọng hơn giao diện đẹp',
        'Kỹ năng phân tích dữ liệu (Data Literacy): Đưa ra số liệu chứng minh giao diện mới tiết kiệm thời gian hơn'
      ]),
      correct_index: '',
      correct_answer: JSON.stringify([1, 2]),
      explanation: 'Khi xung đột xảy ra, EQ (Sự thấu cảm) và Tư duy phản biện để hiểu bản chất sự bảo thủ của người dùng là vũ khí duy nhất để gỡ rối chính trị dự án. Mọi cố gắng dùng AI lúc này đều vô tác dụng.',
      tags: 'EQ,Thấu cảm',
      difficulty: 3,
      topic_group_name: 'Trí tuệ cảm xúc'
    },
    {
      title: 'Chiếc Hộp Pandora',
      description: 'Một ngân hàng thuê công ty của Mai xây dựng mô hình AI tự động chấm điểm tín dụng (Credit Scoring). Ban Giám đốc ngân hàng ra chỉ thị: "Hãy thiết kế luồng quy trình để hệ thống duyệt vay mang lại lợi nhuận cao nhất bất chấp mọi yếu tố". Sau khi dùng AI chạy mô phỏng giả lập dữ liệu, Mai bàng hoàng phát hiện ra: Mô hình tự động đánh tụt điểm tín dụng và từ chối các khoản vay của phụ nữ mang thai (do rủi ro nghỉ thai sản giảm thu nhập). Hành động tiếp theo của Mai quyết định việc cô có phải là một "AI-Driven BA" mang tư duy làm chủ hay không. Hãy sắp xếp các bước xử lý thể hiện Trách nhiệm đạo đức cao nhất.',
      question_type: 'ordering',
      choices: JSON.stringify([
        'Đình chỉ ngay luồng mô phỏng và lưu lại các bằng chứng phân biệt đối xử của mô hình',
        'Áp dụng Bộ lọc Pháp lý & Đạo đức (Ethics Filter) để đánh giá mức độ vi phạm luật bình đẳng',
        'Tổng hợp báo cáo rủi ro thương hiệu và pháp lý nếu ngân hàng đưa mô hình này vào thực tế',
        'Lên lịch họp khẩn với Ban Giám đốc ngân hàng để đối thoại và trình bày rủi ro',
        'Đề xuất các ràng buộc (Constraints) và trọng số công bằng vào thuật toán để tái huấn luyện mô hình'
      ]),
      correct_index: '',
      correct_answer: '[]',
      explanation: 'BA phải là người đứng ra chịu trách nhiệm giải trình (Accountability) và kiểm soát thiên kiến (Bias) của AI. Quy trình chuẩn: Dừng -> Đánh giá -> Báo cáo -> Cảnh báo -> Đề xuất sửa chữa.',
      tags: 'Đạo đức,Rủi ro,Ethics',
      difficulty: 5,
      topic_group_name: 'Tính trách nhiệm'
    },
    {
      title: 'Vũ Điệu Của Dữ Liệu',
      description: 'Để trau dồi "Vũ khí mới" trong thời đại số, Mai đang học thêm kỹ năng Phân tích dữ liệu (Data Literacy). Cô có một file Excel chứa lịch sử 10,000 giao dịch thương mại điện tử bị hủy đơn. Thay vì tự tạo bảng Pivot, Mai muốn mượn sức AI (như Advanced Data Analysis của ChatGPT) để tìm ra "Insight" kinh doanh. Đâu là cách tiếp cận thể hiện tư duy của một BA thay vì một thợ gõ dữ liệu?',
      question_type: 'matching',
      choices: JSON.stringify([
        'Hành động của thợ gõ (Thụ động)',
        'Hành động của BA tập sự (Phụ thuộc)',
        'Hành động của AI-Driven BA (Định hướng)',
        'Hành động rủi ro (Vi phạm)'
      ]),
      correct_index: '',
      correct_answer: JSON.stringify([
        '"Vẽ cho tôi biểu đồ tỷ lệ hủy đơn theo tháng."',
        '"File dữ liệu này nói về cái gì, hãy tìm ra lý do hủy đơn giúp tôi."',
        '"Dựa vào file dữ liệu, hãy tìm mối tương quan giữa thời gian giao hàng trễ và lý do hủy đơn, đồng thời đề xuất 3 quy trình logistics cần cải tiến."',
        'Upload trực tiếp dữ liệu thô có chứa số điện thoại và email khách hàng lên Public AI'
      ]),
      explanation: 'AI-Driven BA luôn gắn liền phân tích dữ liệu với mục tiêu cải tiến nghiệp vụ (Logistics) và tuyệt đối tuân thủ bảo mật.',
      tags: 'Data Literacy,Insight',
      difficulty: 1,
      topic_group_name: 'Nâng cấp kỹ năng'
    },
    {
      title: 'Đứng Trên Vai Người Khổng Lồ',
      description: 'Mai được giao tiếp quản một hệ thống Node.js Legacy khổng lồ không có bất kỳ dòng tài liệu nào (Zero Documentation). Nhiệm vụ của cô là tìm ra các quy tắc tính chiết khấu (Discount Rules) đang ẩn sâu trong hàng trăm file code. Mai quyết định sử dụng Claude Code (hoặc Cursor) để rà quét. Tuy nhiên, hệ thống liên tục báo lỗi quá giới hạn ngữ cảnh (Context Window Limit) hoặc trả về kết quả ảo giác vì codebase quá lớn. Kỹ thuật phân tích nào sau đây thể hiện tư duy hệ thống (Systems Thinking) xuất sắc nhất của Mai để giải quyết triệt để bài toán này?',
      question_type: 'single',
      choices: JSON.stringify([
        'Bỏ cuộc với AI và tải toàn bộ code về máy đọc thủ công từng dòng một',
        'Viết một câu lệnh yêu cầu AI phân tích toàn bộ cấu trúc thư mục và tự động đoán quy tắc',
        'Áp dụng chiến lược Chia để trị (Divide & Conquer): Yêu cầu AI vẽ Dependency Graph trước, khoanh vùng chính xác các file liên quan đến module thanh toán, rồi mới dùng AI phân tích sâu các file đó',
        'Mua ngay bản trả phí đắt nhất của AI để tăng tối đa giới hạn Context Window'
      ]),
      correct_index: 2,
      correct_answer: '',
      explanation: 'Tư duy hệ thống giúp BA biết cách chia nhỏ bài toán. Không một AI nào có thể tiêu hóa toàn bộ hệ thống lớn ngay lập tức. Chia để trị và phân tích theo Dependency là phương pháp thực chiến cao thủ.',
      tags: 'Tư duy hệ thống,Claude Code',
      difficulty: 5,
      topic_group_name: 'Tư duy hệ thống'
    },
    {
      title: 'Bóng Đêm Ảo Giác',
      description: 'Hiện tượng AI Hallucination (Ảo giác AI) là bóng ma đáng sợ nhất đối với một BA. Trong lúc phân tích yêu cầu tích hợp cổng thanh toán trực tuyến, AI tự tin bịa ra một API endpoint giả mạo của PayPal và hướng dẫn Mai viết đặc tả kỹ thuật dựa trên API không tồn tại đó. Những kỹ năng cốt lõi nào của BA sẽ đóng vai trò là "chiếc khiên" bảo vệ hệ thống khỏi những đoạn tài liệu sai lệch này?',
      question_type: 'multiple',
      choices: JSON.stringify([
        'Kỹ năng viết truy vấn SQL thành thạo để kiểm tra cơ sở dữ liệu',
        'Tư duy Phản biện (Critical Thinking): Luôn đặt câu hỏi nghi ngờ và cross-check thông tin từ các nguồn tài liệu chính thống (Official API Docs)',
        'Sự nhạy bén về Nghiệp vụ (Business Acumen): Nhận ra luồng dữ liệu do AI đề xuất không logic với chuẩn mực kế toán tài chính',
        'Kỹ năng giao tiếp xuất sắc với khách hàng'
      ]),
      correct_index: '',
      correct_answer: JSON.stringify([1, 2]),
      explanation: 'Tư duy phản biện (chứng thực nguồn gốc) và Sự nhạy bén nghiệp vụ (đánh giá tính logic) là hai tấm khiên chống lại ảo giác của AI.',
      tags: 'Hallucination,Phản biện',
      difficulty: 3,
      topic_group_name: 'Thẩm định giải pháp'
    },
    {
      title: 'Cạm Bẫy Đóng Gói',
      description: 'Khi sử dụng Agentic AI của Antigravity để hỗ trợ thiết kế cơ sở dữ liệu, Mai nhận được một bản vẽ sơ đồ thực thể liên kết (ERD) hoàn hảo về mặt học thuật (đạt chuẩn hóa 3NF). Mọi thứ đều được chia nhỏ thành các bảng rời rạc để tránh trùng lặp dữ liệu. Tuy nhiên, bằng kinh nghiệm thực chiến, Mai biết rằng hệ thống báo cáo (Reporting) của dự án này cần truy xuất hàng triệu bản ghi mỗi giây, nếu join hàng chục bảng 3NF sẽ làm sập server. Hãy sắp xếp các bước Mai cần làm để biến kết quả "sách giáo khoa" của AI thành một giải pháp "thực chiến".',
      question_type: 'ordering',
      choices: JSON.stringify([
        'Tiếp nhận bản thiết kế ERD chuẩn hóa (3NF) từ kết quả khởi tạo của AI',
        'Phân tích yêu cầu phi chức năng (NFR): Nhận diện bài toán thắt cổ chai hiệu suất khi truy vấn báo cáo',
        'Chủ động bẻ gãy quy tắc: Xác định các khu vực dữ liệu cần Phi chuẩn hóa (Denormalization)',
        'Viết Prompt yêu cầu AI tái cấu trúc lại một phần ERD: Chấp nhận dư thừa dữ liệu để tối ưu tốc độ đọc',
        'Chốt kiến trúc cơ sở dữ liệu thực chiến và trình bày lý do bảo vệ thiết kế trước đội Dev'
      ]),
      correct_index: '',
      correct_answer: '[]',
      explanation: 'BA cần vượt ra khỏi giới hạn lý thuyết để tối ưu cho môi trường thực tế (Performance NFR). Quá trình này đòi hỏi kiến thức kiến trúc phần mềm và bản lĩnh đưa ra quyết định.',
      tags: 'NFR,Kiến trúc,Thực chiến',
      difficulty: 4,
      topic_group_name: 'Chiến lược phân tích'
    },
    {
      title: 'Phép Cân Bằng',
      description: 'Để sống sót và thăng tiến, Mai đang tự lập ra một Bản đồ Năng lực (Capability Map). Cô cần rạch ròi giữa những năng lực máy móc có thể tăng cường (Machine Augmented) và những tố chất vĩnh cửu thuộc về con người (Human Core). Hãy giúp Mai phân định các năng lực này.',
      question_type: 'matching',
      choices: JSON.stringify([
        'Tạo ra hàng loạt bộ test case bao phủ mọi rẽ nhánh nghiệp vụ',
        'Xây dựng niềm tin và sự đồng thuận giữa nhiều phòng ban lợi ích đối lập',
        'Khám phá "Pain-point" ngầm ẩn sau những yêu cầu vô lý của khách hàng',
        'Tổng hợp tài liệu chuẩn mực SRS/BRD từ các nguồn thông tin rời rạc'
      ]),
      correct_index: '',
      correct_answer: JSON.stringify([
        'Machine Augmented (Giao cho AI)',
        'Human Core (Tố chất con người)',
        'Human Core (Tố chất con người)',
        'Machine Augmented (Giao cho AI)'
      ]),
      explanation: 'Việc sinh testcase hay viết tài liệu là thế mạnh của AI. Việc thấu hiểu pain-point và đàm phán chính trị nội bộ là tố chất bất biến của con người.',
      tags: 'Phân định,Vai trò',
      difficulty: 2,
      topic_group_name: 'Định hướng giải pháp'
    },
    {
      title: 'Giới Hạn Tối Thượng',
      description: 'Tại một tập đoàn công nghệ hàng đầu, có ý kiến đề xuất sa thải toàn bộ đội ngũ BA để thay thế bằng các Hệ thống AI Tự Hành (Autonomous Agents). Các hệ thống này được chứng minh là có thể đọc email khách hàng, tự tổng hợp yêu cầu, tự động vẽ quy trình và tự sinh code. Mọi người hoang mang tột độ. Tuy nhiên, Giám đốc Công nghệ (CTO) đã bác bỏ ý kiến này và khẳng định vai trò của Mai (một Senior AI-Driven BA) là "Giới hạn tối thượng không thể chạm tới". Lý do cốt lõi mang tính bản chất nào bảo vệ vị thế độc tôn của Mai?',
      question_type: 'single',
      choices: JSON.stringify([
        'AI Tự hành yêu cầu chi phí vận hành (Token) quá lớn, đắt hơn trả lương cho con người',
        'AI không có khả năng nhận thức rủi ro đạo đức, không có địa vị pháp lý để chịu trách nhiệm giải trình (Accountability) trước pháp luật và xã hội khi hệ thống sinh ra quyết định sai lầm',
        'Khách hàng không biết cách gõ tiếng Anh để giao tiếp với AI Tự hành',
        'AI Tự hành chưa thể sinh ra mã nguồn các ngôn ngữ lập trình cổ điển như COBOL'
      ]),
      correct_index: 1,
      correct_answer: '',
      explanation: 'Tính chịu trách nhiệm (Accountability) là biên giới cuối cùng AI không thể vượt qua. Máy móc có thể tự hành, nhưng khi hệ thống gây tai nạn, chỉ có con người mới chịu trách nhiệm trước pháp luật.',
      tags: 'Bản chất,Tầm nhìn',
      difficulty: 5,
      topic_group_name: 'Tính trách nhiệm'
    },
    {
      title: 'Khoảng Trống Bất Biến',
      description: 'Trong các cuộc phỏng vấn tuyển dụng BA thế hệ mới, thay vì hỏi về cách vẽ UML, nhà tuyển dụng bắt đầu đưa ra các bài toán kinh doanh mở và yêu cầu ứng viên giải quyết cùng AI. Họ nhận ra rằng những BA xuất sắc nhất không phải là người viết Prompt dài nhất, mà là người biết hỏi đúng câu hỏi. Tố chất nào quyết định năng lực "hỏi đúng câu hỏi" (Ask the right questions) để khai phá sức mạnh AI?',
      question_type: 'multiple',
      choices: JSON.stringify([
        'Khả năng nhớ thuộc lòng hàng ngàn mẫu Prompt có sẵn trên mạng',
        'Tư duy hệ thống (Systems Thinking) để nhìn thấy cấu trúc của vấn đề',
        'Sự hiểu biết sâu sắc về Ngữ cảnh nghiệp vụ (Domain Knowledge)',
        'Tốc độ gõ phím và kỹ năng tiếng Anh tuyệt đỉnh'
      ]),
      correct_index: '',
      correct_answer: JSON.stringify([1, 2]),
      explanation: 'Để đặt đúng câu hỏi, BA cần hiểu sâu nghiệp vụ (Domain Knowledge) và có khả năng xâu chuỗi vấn đề (Systems Thinking). Prompting chỉ là bề mặt.',
      tags: 'Năng lực lõi,Tuyển dụng',
      difficulty: 2,
      topic_group_name: 'Nâng cấp kỹ năng'
    },
    {
      title: 'Khải Hoàn Ca',
      description: 'Vượt qua mọi định kiến, hoang mang và khủng hoảng, Mai đã thiết lập thành công mô hình làm việc "AI-Driven BA" cho toàn bộ chi nhánh. Tốc độ ra mắt sản phẩm tăng gấp 3, độ hài lòng khách hàng đạt đỉnh, và quan trọng nhất, Mai tìm lại được ngọn lửa đam mê với nghề. Nhìn lại chặng đường, Mai đúc kết một hành trình "Tiến hóa nhận thức" kinh điển mà bất kỳ BA nào cũng phải đi qua để sống sót trong kỷ nguyên số. Hãy sắp xếp hành trình tiến hóa vĩ đại đó.',
      question_type: 'ordering',
      choices: JSON.stringify([
        'Sợ hãi và Chối bỏ (Fear & Denial): Cảm thấy bị đe dọa, tẩy chay AI và bám víu vào kinh nghiệm cũ',
        'Ảo tưởng và Lệ thuộc (Illusion & Dependency): Ngợp trước sức mạnh AI, dùng AI bừa bãi và nhắm mắt tin tưởng mọi kết quả',
        'Khủng hoảng định hướng (Lost): Nhận ra AI sinh ra nhiều rác hơn là giá trị, hoang mang về con đường phát triển',
        'Thức tỉnh và Làm chủ (Awakening & Mastery): Tích hợp AI làm đòn bẩy, áp dụng các bộ lọc chuyên gia để kiểm soát hoàn toàn hệ thống',
        'Tiến hóa hội tụ (Evolution): Trở thành nhà thiết kế giải pháp chiến lược, nơi EQ của con người hòa quyện cùng IQ của máy móc'
      ]),
      correct_index: '',
      correct_answer: '[]',
      explanation: 'Hành trình tiến hóa đi từ Sợ hãi -> Ảo tưởng (lạm dụng) -> Khủng hoảng -> Làm chủ -> Tiến hóa hoàn toàn. Đây là khải hoàn ca của một BA chân chính.',
      tags: 'Tiến hóa,Tầm nhìn',
      difficulty: 4,
      topic_group_name: 'Tầm nhìn tương lai'
    }
  ];

  const wb = XLSX.utils.book_new();

  // Sheet 1: Câu hỏi
  const wsQuestions = XLSX.utils.json_to_sheet(questions);
  XLSX.utils.book_append_sheet(wb, wsQuestions, "Câu hỏi");

  // Sheet 2: Hướng dẫn
  const guideData = [
    ["HƯỚNG DẪN SỬ DỤNG FILE IMPORT CÂU HỎI", "", "", ""],
    ["", "", "", ""],
    ["CỘT", "MÔ TẢ", "GIÁ TRỊ HỢP LỆ", "VÍ DỤ"],
    ["title", "Tiêu đề ngắn gọn của câu hỏi", "Chuỗi văn bản (bắt buộc)", "The Awakening"],
    ["description", "Nội dung đề bài / tình huống", "Chuỗi văn bản (bắt buộc)", "Mai là..."],
    ["question_type", "Loại câu hỏi", "single | multiple | matching | ordering", "single"],
    ["choices", "Mảng các đáp án", "Chuỗi JSON mảng", "[\"A\", \"B\"]"],
    ["correct_index", "Chỉ dùng cho SINGLE", "Số nguyên, bắt đầu từ 0", "1"],
    ["correct_answer", "Dùng cho MULTIPLE / MATCHING", "Chuỗi JSON mảng", "[0, 2]"],
    ["explanation", "Giải thích", "Chuỗi văn bản", "Bởi vì..."],
    ["tags", "Nhãn phân loại", "Chuỗi (cách nhau dấu phẩy)", "AI, BA"],
    ["difficulty", "Mức độ khó", "0 đến 5", "3"],
    ["topic_group_name", "Nhóm chủ đề", "Chuỗi (cách nhau dấu phẩy)", "BA, Logic"]
  ];
  const wsGuide = XLSX.utils.aoa_to_sheet(guideData);
  XLSX.utils.book_append_sheet(wb, wsGuide, "Hướng dẫn");
  
  const excelPath = 'public/sample-questions-import.xlsx';
  XLSX.writeFile(wb, excelPath);
  console.log('Generated Excel successfully at', excelPath);
}

main().catch(console.error);
