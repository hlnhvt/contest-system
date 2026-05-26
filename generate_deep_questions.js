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

  // 2. Define 15 deep questions
  const questions = [
    {
      title: 'Linh Hồn Của Cỗ Máy',
      description: 'Mai là một BA Fresher vừa gia nhập công ty phần mềm X. Ngày đầu tiên đi làm, cô chứng kiến đội Dev sử dụng một công cụ AI để tự động sinh ra mã nguồn từ vài dòng mô tả ngắn gọn. Thậm chí, một số tài liệu quy trình cũng được AI tự động vẽ ra nhanh chóng. Mai cảm thấy hoang mang và tự hỏi: "Nếu AI có thể tự động hóa việc viết code và vẽ quy trình, vậy giá trị cốt lõi của một BA thực thụ nằm ở đâu để không bị thay thế?". Bạn hãy giúp Mai xác định đâu là câu trả lời đúng nhất mang tính bản chất của nghề BA.',
      question_type: 'single',
      choices: JSON.stringify([
        'Khả năng tạo ra các tài liệu SRS/User Story bóng bẩy, chuẩn chỉnh',
        'Khả năng thấu cảm, tư duy phản biện và giao tiếp giải quyết xung đột với khách hàng',
        'Khả năng viết code nhanh hơn AI',
        'Khả năng thiết kế giao diện UI/UX đẹp mắt'
      ]),
      correct_index: 1,
      correct_answer: '',
      explanation: 'Giá trị cốt lõi của BA là trí tuệ cảm xúc, khả năng thấu cảm và tư duy phản biện - những thứ AI chưa thể thay thế.',
      tags: 'Bản chất BA,Fresher',
      difficulty: 1,
      topic_group_name: 'Vai trò cốt lõi'
    },
    {
      title: 'Lời Thì Thầm Của Dữ Liệu',
      description: 'Trong một dự án xây dựng hệ thống CRM, Mai muốn dùng ChatGPT để khởi tạo khung tài liệu User Story. Nhận ra Prompt ngây ngô sẽ cho ra kết quả vô dụng, Mai quyết định xây dựng một quy trình Prompting chuyên nghiệp từng bước một. Hãy giúp Mai sắp xếp trình tự hợp lý nhất để có một câu lệnh Prompt chất lượng cao.',
      question_type: 'ordering',
      choices: JSON.stringify([
        'Xác định rõ vai trò của AI (Ví dụ: "Đóng vai một Senior BA chuyên về CRM...")',
        'Cung cấp bối cảnh (Context) và mục tiêu nghiệp vụ cụ thể của dự án',
        'Cung cấp các dữ liệu đầu vào hoặc ví dụ mẫu (Examples)',
        'Đưa ra yêu cầu cụ thể về định dạng đầu ra (Output Format)',
        'Yêu cầu AI tự kiểm tra và phản biện lại kết quả vừa tạo (Self-Critique)'
      ]),
      correct_index: '',
      correct_answer: '[]',
      explanation: 'Một Prompt tốt cần đi từ thiết lập vai trò, bối cảnh, cung cấp dữ liệu, chỉ định đầu ra và cuối cùng là vòng lặp phản biện.',
      tags: 'Prompting,Kỹ năng',
      difficulty: 2,
      topic_group_name: 'Kỹ năng làm việc với AI'
    },
    {
      title: 'Bộ Lọc Chống Ảo Tưởng',
      description: 'Trở thành một "AI Powered BA", Mai sử dụng AI để brainstorm các Edge Cases (Trường hợp ngoại lệ) cho chức năng thanh toán trực tuyến. AI liệt kê ra 20 trường hợp, trong đó có những trường hợp rất hiếm gặp và đòi hỏi chi phí phát triển cực lớn. Nhớ lại nguyên tắc làm việc mới, Mai hiểu rằng mình không thể trở thành "người chuyển phát tài liệu" của AI. Cô cần đóng vai trò là chuyên gia thẩm định thông qua các bộ lọc. Những bộ lọc tối cao nào Mai cần áp dụng trước khi đưa các Edge Cases này vào backlog? (Chọn nhiều đáp án)',
      question_type: 'multiple',
      choices: JSON.stringify([
        'Bộ lọc Nghiệp vụ (Tính khả thi và giá trị thực tế)',
        'Bộ lọc Ngôn ngữ (Đảm bảo văn phong chuyên nghiệp)',
        'Bộ lọc Pháp lý & Bảo mật (Đảm bảo tuân thủ tiêu chuẩn an toàn)',
        'Bộ lọc Giá trị thực (Giải quyết đúng nỗi đau gốc rễ của khách hàng)'
      ]),
      correct_index: '',
      correct_answer: JSON.stringify([0, 2, 3]),
      explanation: 'BA cần đóng vai trò là chuyên gia thẩm định thông qua 3 bộ lọc: Nghiệp vụ, Pháp lý & Bảo mật, và Giá trị thực.',
      tags: 'Thẩm định,Bộ lọc',
      difficulty: 3,
      topic_group_name: 'Thẩm định giải pháp'
    },
    {
      title: 'Nghệ Thuật Đàm Phán',
      description: 'Cuộc họp giữa bộ phận Kinh doanh (của khách hàng) và Đội Kỹ thuật (của công ty Mai) diễn ra vô cùng căng thẳng. Khách hàng yêu cầu một tính năng "phải có ngay" nhưng kỹ thuật khẳng định "không thể làm kịp trong 2 tuần". Bầu không khí ngột ngạt và đầy thất vọng. Mai đang ở giữa cuộc chiến này. Cô có thể mang theo laptop có cài mô hình AI tiên tiến nhất. Liệu AI có thể thay thế Mai giải quyết được tình huống này không, và tại sao?',
      question_type: 'single',
      choices: JSON.stringify([
        'Có. AI sẽ tính toán thời gian và phân chia task tối ưu nhất để ép cả hai bên đồng ý',
        'Không. AI có thể phân tích dữ liệu nhưng không thể cảm nhận được sự thất vọng, thấu cảm và xây dựng lòng tin để gỡ rối xung đột giữa người với người',
        'Có. AI sẽ gửi một bức email xin lỗi khách hàng cực kỳ mượt mà',
        'Không. Vì AI chưa được cấp quyền truy cập vào Jira hay Confluence của dự án'
      ]),
      correct_index: 1,
      correct_answer: '',
      explanation: 'AI không có Trí tuệ cảm xúc (Emotional Intelligence) và Sự thấu cảm (Empathy) để quản lý mâu thuẫn chính trị trong tổ chức.',
      tags: 'EQ,Đàm phán',
      difficulty: 4,
      topic_group_name: 'Trí tuệ cảm xúc'
    },
    {
      title: 'Ngã Ba Đường',
      description: 'Để không bị đào thải trong kỷ nguyên AI, Mai nhận ra mình cần bổ sung "vũ khí" mới. Cô quyết định phân loại rõ ràng đâu là Kỹ năng Kỹ thuật (Hard Skills) cần học, đâu là Kỹ năng Mềm (Soft Skills) vô giá. Hãy giúp Mai nối đúng nhóm cho mỗi kỹ năng.',
      question_type: 'matching',
      choices: JSON.stringify([
        'Tư duy phản biện để thẩm định đầu ra của AI',
        'Sử dụng PowerBI để trực quan hóa dữ liệu (Data Literacy)',
        'Sự thấu cảm và đàm phán giải quyết xung đột (Empathy)',
        'Thành thạo các công cụ tạo sinh (AI Tools Proficiency)'
      ]),
      correct_index: '',
      correct_answer: JSON.stringify([
        'Soft Skills',
        'Hard Skills',
        'Soft Skills',
        'Hard Skills'
      ]),
      explanation: 'Tư duy phản biện và thấu cảm là Soft Skills không thể thay thế. Data Literacy và AI Tools là Hard Skills mới của kỷ nguyên AI.',
      tags: 'Kỹ năng mới,Hard Skills',
      difficulty: 2,
      topic_group_name: 'Nâng cấp kỹ năng'
    },
    {
      title: 'Cái Bẫy Của Kinh Nghiệm',
      description: 'Sếp trực tiếp của Mai là anh Tuấn, một Senior BA với hơn 10 năm kinh nghiệm. Anh Tuấn luôn tự hào về bộ template tài liệu chuẩn mực mà anh mất nhiều năm xây dựng. Khi Mai đề xuất dùng AI để tự động hóa một số khâu viết tài liệu, anh Tuấn gạt phắt: "AI chỉ để giải trí, ảo tưởng lắm, không làm dự án thật được đâu. Đừng lười biếng mà phá hỏng quy trình". Là một người am hiểu làn sóng AI, bạn đánh giá rào cản cốt lõi nhất mà anh Tuấn đang vướng phải là gì?',
      question_type: 'single',
      choices: JSON.stringify([
        'Thiếu hụt kỹ năng tiếng Anh và nền tảng lập trình cơ bản',
        'Định kiến với công nghệ mới và sự ngại thay đổi quy trình chuẩn (Quán tính tư duy của chuyên gia)',
        'Áp lực đồng lứa (Peer pressure) và nỗi sợ hãi AI sẽ cướp đi công việc',
        'Không có ngân sách để mua các bản quyền phần mềm AI On-premise'
      ]),
      correct_index: 1,
      correct_answer: '',
      explanation: 'Senior BA dễ vướng vào rào cản định kiến công nghệ và không muốn thay đổi quy trình đã quen thuộc (quán tính tư duy).',
      tags: 'Senior BA,Rào cản',
      difficulty: 3,
      topic_group_name: 'Tư duy chuyển đổi'
    },
    {
      title: 'Chuyển Trạng Thái',
      description: 'Một tập đoàn tài chính lớn tìm đến công ty Mai. Trách nhiệm BA được giao phó cho Mai. Thay vì cách làm cũ, Mai áp dụng quy trình "Intelligent Automation" ứng dụng AI. Hãy giúp Mai sắp xếp thứ tự hợp lý của các bước làm việc từ lúc nhận yêu cầu thô đến lúc ra giải pháp cuối cùng theo mô hình AI-Driven BA.',
      question_type: 'ordering',
      choices: JSON.stringify([
        'Thu thập các yêu cầu phi cấu trúc thô (Biên bản họp, ý tưởng rời rạc)',
        'Cung cấp bối cảnh (Context) và yêu cầu thô cho AI kèm theo Prompt kỹ thuật',
        'AI nhanh chóng sinh ra kịch bản nền tảng (Baseline) và tài liệu sơ khởi',
        'Áp dụng 3 bộ lọc để thẩm định chất lượng và tính khả thi của kết quả AI',
        'Tương tác trực quan và chốt phương án hoàn thiện với khách hàng'
      ]),
      correct_index: '',
      correct_answer: '[]',
      explanation: 'Sự dịch chuyển lớn của BA là dùng AI xử lý yêu cầu thô, sau đó thẩm định và nhanh chóng tương tác với khách hàng thay vì làm việc tuyến tính.',
      tags: 'Requirement,Chiến lược',
      difficulty: 4,
      topic_group_name: 'Chiến lược phân tích'
    },
    {
      title: 'Món Quà Thời Gian',
      description: 'Dự án A yêu cầu hoàn thành bộ tài liệu đặc tả (SRS) đồ sộ. Nhờ ứng dụng kỹ năng Prompt xuất sắc, Mai dùng AI và chỉ mất 1 ngày để hoàn thành thay vì 5 ngày ròng rã như trước đây (tiết kiệm 80% thời gian). Nhìn vào quỹ thời gian dư ra vô cùng lớn này, hướng đi nào sau đây là phù hợp nhất với vị thế của một "AI-Driven BA" thay vì một người thợ viết tài liệu?',
      question_type: 'single',
      choices: JSON.stringify([
        'Dùng 4 ngày còn lại để nghỉ ngơi hoặc giải trí vì đã hoàn thành KPI',
        'Chuyển hẳn sang làm Tester (QC) để bọc lót cho khâu kiểm thử',
        'Dùng quỹ thời gian đó để tư duy hệ thống sâu hơn, làm việc chặt chẽ hơn với Stakeholder để đào sâu vấn đề và gia tăng tỷ lệ chốt giải pháp',
        'Nhận thêm 4 dự án tương đương nữa để cày KPI số lượng tài liệu'
      ]),
      correct_index: 2,
      correct_answer: '',
      explanation: 'AI giải phóng thời gian làm việc chân tay để BA tập trung vào công việc tư duy chiến lược và tương tác khách hàng.',
      tags: 'Hiệu suất,Giá trị',
      difficulty: 1,
      topic_group_name: 'Quản trị hiệu suất'
    },
    {
      title: 'Bảo Chứng Niềm Tin',
      description: 'Trong quá trình phân tích dữ liệu giao dịch của khách hàng (một ngân hàng) nhằm tối ưu quy trình thẩm định vay, Mai dự định sao chép 10,000 dòng dữ liệu hồ sơ thực tế chưa qua xử lý (Raw Data) đẩy lên một nền tảng Public AI để nhờ nó phát hiện quy luật. Xét theo góc độ đạo đức nghề nghiệp và các rào cản ứng dụng AI, hành động của Mai đã vi phạm nghiêm trọng vào bộ lọc kiểm định nào?',
      question_type: 'single',
      choices: JSON.stringify([
        'Bộ lọc Nghiệp vụ (Business Filter)',
        'Bộ lọc Ngôn ngữ (Language Filter)',
        'Bộ lọc Giá trị thực (Value Filter)',
        'Bộ lọc Pháp lý & Bảo mật (Privacy & Security Filter) với nguy cơ rò rỉ dữ liệu tổ chức'
      ]),
      correct_index: 3,
      correct_answer: '',
      explanation: 'Đẩy dữ liệu nhạy cảm lên Public AI vi phạm nghiêm trọng bộ lọc Pháp lý & Bảo mật.',
      tags: 'Bảo mật,Rủi ro',
      difficulty: 2,
      topic_group_name: 'Bảo mật và Rủi ro'
    },
    {
      title: 'Trách Nhiệm Cuối Cùng',
      description: 'Dự án đang trong giai đoạn nước rút (Agile Sprint). Khách hàng liên tục thay đổi luồng nghiệp vụ kinh doanh. Để chạy đua tiến độ, Mai dùng AI sinh ra một thiết kế luồng quy trình (workflow) mới cực nhanh và chuyển thẳng cho đội Dev mà bỏ qua bước rà soát chéo. Khi Release, luồng này bị sai logic cơ bản khiến hệ thống thất thoát tiền. Giám đốc chất vấn: "Tại sao luồng này lại sai?". Mai biện minh: "Do AI nó viết ra như vậy". Dưới góc nhìn chuyên nghiệp của nghề BA trong kỷ nguyên số, câu trả lời này phản ánh sự thiếu hụt tố chất bất biến nào?',
      question_type: 'single',
      choices: JSON.stringify([
        'Trí tuệ cảm xúc (Emotional Intelligence)',
        'Sự nhạy bén về Nghiệp vụ & Khả năng chịu trách nhiệm (Accountability) trước giải pháp',
        'Tư duy thiết kế (Design Thinking)',
        'Kiến thức chuyên sâu về Prompt Engineering'
      ]),
      correct_index: 1,
      correct_answer: '',
      explanation: 'AI không thể chịu trách nhiệm trước pháp luật hay công ty. BA phải là người kiểm soát và chịu trách nhiệm giải trình (Accountability) cuối cùng.',
      tags: 'Trách nhiệm,Đạo đức',
      difficulty: 3,
      topic_group_name: 'Tính trách nhiệm'
    },
    {
      title: 'Bức Tranh Tổng Thể',
      description: 'Hệ thống mà Mai phụ trách đòi hỏi tích hợp từ nhiều nền tảng kế toán cũ kỹ (Legacy systems) khác nhau, đan xen với bối cảnh văn hóa phòng ban phức tạp và những quy định ngầm của doanh nghiệp (Office Politics). Mai nhận ra rằng dù AI rất xuất sắc trong việc tìm câu trả lời từ dữ liệu cấu trúc, nó hoàn toàn bất lực trong việc giải bài toán này. Kỹ năng vô hình nào của Mai đang tỏa sáng mạnh mẽ nhất, khẳng định sự vượt trội của con người so với cỗ máy?',
      question_type: 'single',
      choices: JSON.stringify([
        'Kỹ năng thống kê dữ liệu Data Literacy',
        'Khả năng thao tác với các phần mềm thiết kế UI',
        'Tư duy hệ thống (Systems Thinking) và Khả năng giải quyết bài toán phức tạp (Complex Problem Solving)',
        'Kỹ năng viết truy vấn dữ liệu SQL thuần thục'
      ]),
      correct_index: 2,
      correct_answer: '',
      explanation: 'Tư duy hệ thống giúp kết nối các mảng kiến thức rời rạc, văn hóa và yếu tố con người - điều AI chưa thể liên kết linh hoạt.',
      tags: 'Tư duy hệ thống,Bài toán phức tạp',
      difficulty: 4,
      topic_group_name: 'Tư duy hệ thống'
    },
    {
      title: 'Căn Bệnh Sao Chép',
      description: 'Vũ - một Fresher BA mới được nhận vào team của Mai - nổi tiếng với năng lực tạo ra những tập User Story dài hàng chục trang chỉ trong nháy mắt nhờ ChatGPT. Tuy nhiên, khi Tech Lead hỏi xoáy về logic phân quyền nghiệp vụ bên dưới các Story đó, Vũ lúng túng và không thể giải thích nổi. Mai nhận ra Vũ đang mắc phải "Bẫy của Junior" kinh điển khi sử dụng AI. Những biểu hiện cốt lõi nào minh chứng cho căn bệnh này? (Chọn nhiều đáp án)',
      question_type: 'multiple',
      choices: JSON.stringify([
        'Bị ngợp trước khối lượng từ ngữ bóng bẩy của AI, coi kết quả đó là chân lý và sao chép vô thức',
        'Dành quá nhiều thời gian để thẩm định chéo kết quả sinh ra từ AI',
        'Lười tư duy sâu, đánh mất cơ hội rèn luyện logic cấu trúc qua việc tự phân tích, tự sai và tự sửa',
        'Có thói quen nghi ngờ và phản biện mọi kết quả mà AI cung cấp'
      ]),
      correct_index: '',
      correct_answer: JSON.stringify([0, 2]),
      explanation: 'BA Fresher thường thiếu kiến thức nền tảng để thẩm định AI, dễ lười tư duy sâu và lệ thuộc vào kết quả của máy.',
      tags: 'Fresher,Sai lầm',
      difficulty: 1,
      topic_group_name: 'Lỗi thường gặp của Fresher'
    },
    {
      title: 'Đường Lên Đỉnh',
      description: 'Hành trình tiến hóa của một Business Analyst truyền thống để trở thành một "AI-Powered BA" xuất sắc đòi hỏi phải đi qua những nấc thang nhận thức. Hãy giúp Mai sắp xếp các cột mốc sau theo trình tự phát triển lý tưởng từ thấp đến cao.',
      question_type: 'ordering',
      choices: JSON.stringify([
        'Nắm vững các kỹ năng lõi của BA (Tư duy hệ thống, phân tích nghiệp vụ, giao tiếp)',
        'Bắt đầu sử dụng AI qua các tác vụ cơ bản (Sửa lỗi chính tả, dịch thuật)',
        'Thành thạo kỹ năng Prompting chuyên sâu để sinh tài liệu khung (Baseline)',
        'Sử dụng các bộ lọc chuyên gia để thẩm định và kiểm soát rủi ro từ AI',
        'Tích hợp AI làm cốt lõi để đưa ra giải pháp kinh doanh thông minh (AI-Driven)'
      ]),
      correct_index: '',
      correct_answer: '[]',
      explanation: 'Sự tiến hóa phải đi từ gốc rễ nghiệp vụ, dùng AI cơ bản, sau đó là brainstorm sâu, thẩm định chặt chẽ và vươn tới cấp độ giải pháp AI-Driven.',
      tags: 'Lộ trình,Tiến hóa',
      difficulty: 3,
      topic_group_name: 'Triết lý nghề nghiệp'
    },
    {
      title: 'Khoảng Trống Giá Trị',
      description: 'Một khách hàng Startup đặt bài toán: "Tôi muốn làm ứng dụng AI dự đoán tỷ số bóng đá". Thay vì cắm đầu viết ngay SRS, Mai quyết định áp dụng Tư duy thiết kế (Design Thinking) kết hợp sức mạnh của AI để tìm ra "nỗi đau" (pain-point) thực sự (chính là muốn giữ chân người dùng lâu hơn trên app). Hãy giúp Mai sắp xếp các bước tiếp cận đúng chuẩn của một BA chuyên nghiệp.',
      question_type: 'ordering',
      choices: JSON.stringify([
        'Đồng cảm (Empathize): Lắng nghe sâu và khám phá nỗi đau gốc rễ của khách hàng',
        'Định nghĩa (Define): Tái định nghĩa lại bài toán từ dự đoán tỷ số sang tính năng Cộng đồng',
        'Sáng tạo (Ideate): Dùng AI để Brainstorm và mở rộng vô số các ý tưởng mới lạ',
        'Mô phỏng (Prototype): Mượn AI sinh nhanh một bản phác thảo giao diện/quy trình',
        'Kiểm thử (Test): Đem bản phác thảo đi trình bày để lấy phản hồi ngay lập tức từ Stakeholders'
      ]),
      correct_index: '',
      correct_answer: '[]',
      explanation: 'Quy trình Design Thinking kinh điển: Empathize -> Define -> Ideate (với AI) -> Prototype (với AI) -> Test.',
      tags: 'Design Thinking,Giải pháp',
      difficulty: 3,
      topic_group_name: 'Định hướng giải pháp'
    },
    {
      title: 'Đích Đến Tối Thượng',
      description: 'Hành trình vượt qua định kiến, trau dồi tri thức và áp dụng các bộ lọc giá trị đã giúp Mai chính thức trở thành một "AI-Driven BA" xuất sắc. Cô không còn cảm giác sợ hãi mà thực sự coi AI như một người đồng nghiệp đắc lực, nơi sự sắc lạnh của Trí tuệ Nhân tạo (AI) được hòa quyện hoàn hảo với sự ấm áp của Trí tuệ Cảm xúc (EQ) con người. Đứng trên đỉnh cao của sự thấu ngộ, Mai đã nhận ra một sự thật phũ phàng nhưng cũng đầy kiêu hãnh của nghề nghiệp. Theo tinh thần của Seminar, câu nói nào dưới đây đúc kết chính xác nhất chân lý sống còn của nghề BA trong kỷ nguyên số?',
      question_type: 'single',
      choices: JSON.stringify([
        'AI sẽ hoàn toàn thay thế và xóa sổ vai trò của Business Analyst trong vòng 5 năm tới',
        'AI không thay thế bạn, nhưng một BA biết dùng AI và có tư duy AI sẽ thay thế bạn',
        'Chỉ những BA có khả năng viết mã lập trình AI trực tiếp mới có thể tồn tại',
        'Nghề BA thực ra sẽ không thay đổi gì cả, AI chỉ là một trào lưu nhất thời rồi sẽ qua đi'
      ]),
      correct_index: 1,
      correct_answer: '',
      explanation: 'Chân lý: Công nghệ không thể tự động thay thế con người, nhưng con người làm chủ công nghệ sẽ chiến thắng.',
      tags: 'Tầm nhìn,Kết luận',
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
