const XLSX = require('xlsx');

async function main() {
  const questions = [
    {
      title: 'Điểm Mù Khẩu Lệnh',
      description: 'Mai đang sử dụng Claude để phân tích một tài liệu nghiệp vụ (BRD) dài 50 trang. Tuy nhiên, AI liên tục trả về các đoạn tóm tắt chung chung, lan man và hoàn toàn bỏ sót các quy tắc ngoại lệ (Edge Cases) ẩn sâu trong tài liệu. Theo kỹ năng Prompting cấp độ chuyên gia của một BA, Mai cần kết hợp những kỹ thuật nào vào câu lệnh để "ép" AI phải đào sâu và trả về kết quả sắc bén nhất?',
      question_type: 'multiple',
      choices: JSON.stringify([
        'Sử dụng "Negative Prompting": Chỉ định rõ ràng những gì AI KHÔNG ĐƯỢC làm hoặc không được tự biên dịch.',
        'Sử dụng "Chunking & Chain-of-Thought": Cắt nhỏ tài liệu và yêu cầu AI suy luận từng bước một.',
        'Sử dụng "Hype Prompting": Chèn thêm câu "Bạn là AI thông minh nhất vũ trụ, hãy phân tích cái này" để kích hoạt toàn bộ trí thông minh.',
        'Sử dụng "Structured Output": Ép AI phải trả về kết quả theo định dạng khắt khe (VD: JSON hoặc Bảng với các cột Cụ thể).',
        'Tăng thông số Temperature lên 1.0 để AI có khả năng sáng tạo ra các ngoại lệ chưa từng có.'
      ]),
      correct_index: '',
      correct_answer: JSON.stringify([0, 1, 3]),
      explanation: 'Để AI hết lan man và tập trung vào Edge Cases, BA cần ép định dạng đầu ra (Structured Output), giới hạn sự sáng tạo (Negative Prompting) và bắt AI suy luận đa bước (Chain-of-Thought). Việc tăng Temperature hay Hype Prompting chỉ làm tăng khả năng sinh ra ảo giác (Hallucination).',
      tags: 'Prompting, Kỹ năng BA',
      difficulty: 3,
      topic_group_name: 'Kỹ năng làm việc với AI'
    },
    {
      title: 'Kẻ Phản Biện Tàn Nhẫn',
      description: 'Trong quá trình Prompt AI để lên ý tưởng (Brainstorming) cho luồng thanh toán quốc tế, Mai nhận thấy AI liên tục "nịnh hót" và đồng tình với mọi ý tưởng ngớ ngẩn mà cô cố tình đưa ra để thử nghiệm. Trợ lý AI đang bị mắc kẹt trong hiệu ứng "Hội thoại đóng" (Echo Chamber). Những kỹ thuật Prompting nào dưới đây giúp Mai biến AI thành một "Kẻ phản biện" (Devil\'s Advocate) thực thụ thay vì một trợ lý chỉ biết vâng lời?',
      question_type: 'multiple',
      choices: JSON.stringify([
        '"Hãy liệt kê 5 điểm yếu chí mạng trong giải pháp tôi vừa đưa ra, và bảo vệ quan điểm phản biện của bạn dựa trên tiêu chuẩn bảo mật PCI-DSS."',
        '"Tuyệt vời, giải pháp của tôi không có lỗ hổng nào đúng không? Hãy làm nó mượt mà hơn."',
        'Ép AI sử dụng Framework "Six Thinking Hats" (6 chiếc nón tư duy) và yêu cầu AI chỉ được phép đội Nón Đen (Black Hat) trong toàn bộ phiên hội thoại.',
        '"Hãy đóng vai một khách hàng cực kỳ khó tính và tìm mọi cách bắt bẻ luồng trải nghiệm (UX) này."',
        'Sử dụng kỹ thuật "Self-Correction": Ép AI tự tìm ra điểm mù trong chính câu trả lời phân tích trước đó của nó.'
      ]),
      correct_index: '',
      correct_answer: JSON.stringify([0, 2, 3, 4]),
      explanation: 'Để phá vỡ Echo Chamber, BA phải chủ động cấp quyền và ép buộc AI phản biện thông qua: Persona khách hàng khó tính, Framework Nón Đen, Self-Correction, hoặc yêu cầu thẳng việc bắt bẻ các điểm yếu.',
      tags: 'Prompting, Critical Thinking',
      difficulty: 4,
      topic_group_name: 'Trí tuệ cảm xúc'
    },
    {
      title: 'Kiến Trúc Meta-Prompt',
      description: 'Khi sử dụng Antigravity để thiết lập một Agentic AI có nhiệm vụ tự động đánh giá các bản phác thảo giao diện (Wireframe) dựa trên Heuristic của Nielsen, Mai cần thiết kế một "Meta-Prompt" (Câu lệnh hệ thống / System Prompt) cực kỳ phức tạp. Hãy sắp xếp các thành phần cốt lõi của một Meta-Prompt theo cấu trúc chuẩn mực nhất dành cho một Expert BA.',
      question_type: 'ordering',
      choices: JSON.stringify([
        'Khởi tạo Ngữ cảnh và Vai trò cốt lõi (Context & Persona)',
        'Định nghĩa Ranh giới và Dữ liệu đầu vào (Constraints & Input Specs)',
        'Quy định Chuỗi suy luận và Phương pháp phân tích (Step-by-step Logic / Framework)',
        'Cung cấp các Ví dụ mẫu (Few-Shot Examples) để hiệu chuẩn giọng điệu và độ chi tiết',
        'Định dạng cấu trúc đầu ra mong muốn (Output Formatting / JSON / Tables)'
      ]),
      correct_index: '',
      correct_answer: '[]',
      explanation: 'Cấu trúc Meta-prompt kinh điển đi từ Tổng quan đến Chi tiết: Persona (Ai) -> Constraints (Phạm vi) -> Logic (Làm thế nào) -> Examples (Mẫu thế nào) -> Output (Trả về cái gì).',
      tags: 'Prompting, Systems Thinking',
      difficulty: 5,
      topic_group_name: 'Chiến lược phân tích'
    }
  ];

  const wb = XLSX.utils.book_new();

  const wsQuestions = XLSX.utils.json_to_sheet(questions);
  XLSX.utils.book_append_sheet(wb, wsQuestions, "Câu hỏi");

  const excelPath = 'public/prompt-questions-import.xlsx';
  XLSX.writeFile(wb, excelPath);
  console.log('Generated Excel successfully at', excelPath);
}

main().catch(console.error);
