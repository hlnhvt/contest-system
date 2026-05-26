const XLSX = require('xlsx');

const questions = [
  {
    title: "Sự Thức Tỉnh",
    description: "Mai là một chuyên viên Business Analyst tại tập đoàn công nghệ X. Gần đây, thị trường biến động mạnh, khách hàng ngày càng thiếu kiên nhẫn. Thay vì chờ đợi vài tháng cho quy trình thu thập yêu cầu theo mô hình Thác nước (Waterfall), họ mong muốn nhìn thấy kết quả và nguyên mẫu giải pháp ngay lập tức. Khách hàng cũng yêu cầu các giải pháp tự động hoá thông minh (Intelligent Automation). Giữa áp lực đó, Mai nhận ra mình không thể tiếp tục cách làm cũ. Theo bạn, nguyên nhân cốt lõi nào buộc Mai và các BA phải thay đổi cách làm việc trong kỷ nguyên AI?",
    question_type: "single",
    choices: JSON.stringify([
      "Vì AI có thể viết code nhanh hơn lập trình viên",
      "Khách hàng đòi hỏi tốc độ cao và các giải pháp AI-Native thông minh",
      "Sếp của Mai muốn cắt giảm nhân sự BA",
      "Vì quy trình Agile đã lỗi thời"
    ]),
    correct_index: 1,
    correct_answer: "",
    explanation: "Sự dịch chuyển từ phía thị trường đòi hỏi tốc độ và các giải pháp AI-Native thay vì chỉ CRUD thông thường.",
    tags: "Bối cảnh,Thị trường",
    difficulty: 1,
    topic_group_name: "Bối cảnh, Thị trường"
  },
  {
    title: "Chiếc Cầu Nối",
    description: "Sau khi nhận ra sự cấp thiết phải thay đổi, Mai quyết định áp dụng công cụ GenAI (như ChatGPT) vào công việc hàng ngày của mình. Trong một dự án ngân hàng, khách hàng cung cấp một danh sách các ý tưởng sơ khởi và biên bản họp lộn xộn. Mai sử dụng AI để giúp xử lý tài liệu này. Vai trò đắc lực nhất của GenAI đối với Mai trong quá trình làm 'cầu nối' này là gì?",
    question_type: "multiple",
    choices: JSON.stringify([
      "Văn bản hóa nhanh các ý tưởng sơ khởi thành bộ khung (Baseline)",
      "Đưa ra các quyết định nghiệp vụ cuối cùng thay cho khách hàng",
      "Rút ngắn thời gian tạo tài liệu đặc tả (SRS/User Story)",
      "Tự động ký kết hợp đồng pháp lý với khách hàng"
    ]),
    correct_index: "",
    correct_answer: JSON.stringify([0, 2]),
    explanation: "GenAI giúp BA chuyển hóa nhanh ý tưởng thành tài liệu, rút ngắn chu kỳ phản hồi.",
    tags: "GenAI,Cầu nối",
    difficulty: 2,
    topic_group_name: "Kỹ năng BA, AI"
  },
  {
    title: "Cạm Bẫy Của Lính Mới",
    description: "Mai có một người em khóa dưới tên là Nam, vừa mới ra trường và được nhận vào làm Junior BA. Khi được giao phân tích một hệ thống quản lý kho, Nam đã sao chép toàn bộ yêu cầu của khách hàng đưa vào ChatGPT và nhận lại một danh sách User Stories rất dài và chi tiết. Nam ngay lập tức copy toàn bộ danh sách này đem nộp cho sếp mà không chỉnh sửa gì. Theo kinh nghiệm của Mai, hành động của Nam phản ánh rào cản lớn nhất nào của nhóm BA Fresher khi tiếp cận AI?",
    question_type: "single",
    choices: JSON.stringify([
      "Khủng hoảng định hướng nghề nghiệp",
      "Quán tính tư duy và cái tôi chuyên gia",
      "Thiếu kiến thức nền tảng để thẩm định AI và phụ thuộc hoàn toàn",
      "Lo sợ rủi ro rò rỉ dữ liệu bảo mật"
    ]),
    correct_index: 2,
    correct_answer: "",
    explanation: "BA ít kinh nghiệm thường thiếu khả năng thẩm định, coi AI là chân lý và lười tư duy sâu.",
    tags: "Rào cản,Fresher",
    difficulty: 2,
    topic_group_name: "Rào cản"
  },
  {
    title: "Lạc Lối Giữa Dòng Chuyển Giao",
    description: "Nhìn thấy các đồng nghiệp trẻ như Nam dùng AI tạo tài liệu quá nhanh, Mai (một BA đã có 3 năm kinh nghiệm) bắt đầu rơi vào trạng thái hoang mang. Cô cảm thấy kỹ năng vẽ luồng Jira hay viết Confluence của mình đang bị lu mờ. Trong nỗi lo sợ bị bỏ lại (FOMO), Mai định đăng ký một loạt khóa học về lập trình thuật toán Python và Data Science chuyên sâu để 'bắt kịp thời đại AI'. Việc Mai đang làm phản ánh bẫy tâm lý nào của nhóm BA Middle?",
    question_type: "multiple",
    choices: JSON.stringify([
      "Sự cẩn trọng thái quá về bảo mật dữ liệu",
      "Sự mơ hồ về định hướng cốt lõi của BA",
      "Bỏ qua kỹ năng lõi là tư duy nghiệp vụ để chạy theo kỹ thuật mù quáng",
      "Sợ phải đập đi xây lại quy trình làm việc chuẩn"
    ]),
    correct_index: "",
    correct_answer: JSON.stringify([1, 2]),
    explanation: "Nhóm Middle dễ bị khủng hoảng định hướng, chạy theo code/AI mù quáng mà quên mất kỹ năng lõi của BA.",
    tags: "Middle BA,Khủng hoảng",
    difficulty: 3,
    topic_group_name: "Rào cản"
  },
  {
    title: "Nghịch Lý Chuyên Gia",
    description: "Mai mang những băn khoăn của mình đến hỏi anh Hùng - một Senior BA với 10 năm kinh nghiệm. Khi nhắc đến việc dùng AI tạo tài liệu, anh Hùng gạt phắt: 'Anh đã thử dùng nó một lần, kết quả ngô nghê và sai lệch thực tế lắm. Đừng dùng AI làm dự án thật, nó chỉ để giải trí thôi. Cứ làm theo bộ quy chuẩn template anh đã xây dựng 5 năm nay là tốt nhất!'. Thái độ của anh Hùng là minh chứng cho rào cản nào của Senior BA?",
    question_type: "single",
    choices: JSON.stringify([
      "Lười tư duy sâu và đặt câu hỏi",
      "Định kiến công nghệ và ngại thay đổi quy trình đã có (Quán tính tư duy)",
      "Thiếu khả năng trực quan hóa dữ liệu",
      "Bị ngợp trước quá nhiều công cụ AI mới"
    ]),
    correct_index: 1,
    correct_answer: "",
    explanation: "Senior BA thường có cái tôi chuyên gia và ngại thay đổi các quy trình chuẩn chỉnh đã dày công xây dựng.",
    tags: "Senior BA,Định kiến",
    difficulty: 2,
    topic_group_name: "Rào cản"
  },
  {
    title: "Ba Cửa Ải",
    description: "Sau khi vượt qua những hoang mang ban đầu, Mai quyết định phải làm chủ công nghệ thay vì để nó làm chủ mình. Khi nhận được một bộ giải pháp hệ thống do AI tạo sinh ra cực kỳ bóng bẩy và chuyên nghiệp, Mai không vội tin ngay. Cô hiểu rằng AI có thể bị 'ảo giác' (hallucination). Mai quyết định xây dựng một quy trình thẩm định nghiêm ngặt. Để trở thành 'Bộ lọc chống ảo tưởng', Mai cần sử dụng những bộ lọc nào dưới đây để đánh giá kết quả của AI?",
    question_type: "multiple",
    choices: JSON.stringify([
      "Bộ lọc Thiết kế UI/UX",
      "Bộ lọc Nghiệp vụ (khả thi và giá trị thực tế)",
      "Bộ lọc Pháp lý & Bảo mật",
      "Bộ lọc Giá trị thực (giải quyết đúng Pain-point)"
    ]),
    correct_index: "",
    correct_answer: JSON.stringify([1, 2, 3]),
    explanation: "BA đóng vai trò thẩm định qua 3 bộ lọc: Nghiệp vụ, Pháp lý & Bảo mật, Giá trị thực.",
    tags: "Thẩm định,Bộ lọc",
    difficulty: 3,
    topic_group_name: "Kỹ năng BA, AI"
  },
  {
    title: "Dòng Chảy Khai Phá",
    description: "Trong một dự án mới phát triển phần mềm y tế, Mai muốn quy chuẩn hóa các bước sử dụng AI. Hãy giúp Mai sắp xếp thứ tự hợp lý của các bước làm việc từ lúc nhận yêu cầu thô đến lúc ra giải pháp cuối cùng.",
    question_type: "ordering",
    choices: JSON.stringify([
      "Thu thập yêu cầu thô (Biên bản họp, ghi chú)",
      "Cung cấp yêu cầu thô cho AI kèm theo Prompt kỹ thuật",
      "AI sinh ra kịch bản nền tảng (Baseline) và cấu trúc khung",
      "Thẩm định kết quả qua 3 bộ lọc (Nghiệp vụ, Bảo mật, Giá trị)",
      "Hoàn thiện giải pháp và phản hồi cho khách hàng"
    ]),
    correct_index: "",
    correct_answer: "",
    explanation: "Quy trình hợp lý: Có yêu cầu thô -> Dùng Prompt với AI -> Nhận Baseline -> Thẩm định -> Hoàn thiện.",
    tags: "Quy trình,AI Pipeline",
    difficulty: 4,
    topic_group_name: "Quy trình"
  },
  {
    title: "Lời Thì Thầm Khách Hàng",
    description: "Mai tham gia một buổi Elicitation (Thu thập yêu cầu) vô cùng phức tạp với 5 bên liên quan. Không ai có cùng tiếng nói, các yêu cầu đan chéo và phi cấu trúc. Mai có cả tập tài liệu chép tay và ghi âm cuộc họp. Lúc này, năng lực nào của NLP (Xử lý ngôn ngữ tự nhiên) sẽ giúp Mai giải quyết 'nỗi đau' này tốt nhất?",
    question_type: "single",
    choices: JSON.stringify([
      "Thiết kế giao diện UI tự động từ file ghi âm",
      "Dự đoán chi phí dự án theo thời gian thực",
      "Trích xuất và phân loại yêu cầu từ văn bản phi cấu trúc một cách nhanh chóng",
      "Tự động gửi email mắng khách hàng vì yêu cầu mâu thuẫn"
    ]),
    correct_index: 2,
    correct_answer: "",
    explanation: "NLP hỗ trợ đắc lực trong việc trích xuất và tóm tắt yêu cầu từ các luồng thông tin phi cấu trúc.",
    tags: "NLP,Elicitation",
    difficulty: 2,
    topic_group_name: "AI, Kỹ năng BA"
  },
  {
    title: "Vũ Khí Chuyên Gia",
    description: "Để chuẩn bị cho cuộc đánh giá hiệu suất cuối năm, Mai cần tự phân loại các kỹ năng mình đã rèn luyện được thành 2 nhóm: Kỹ năng Kỹ thuật (Hard Skills) và Kỹ năng Mềm (Soft Skills). Hãy giúp Mai nối đúng nhóm cho mỗi kỹ năng dưới đây.",
    question_type: "matching",
    choices: JSON.stringify([
      "Critical Thinking (Tư duy phản biện)",
      "Data Literacy (Hiểu biết dữ liệu)",
      "Empathy (Sự thấu cảm khách hàng)",
      "AI Tools Proficiency (Sử dụng thành thạo công cụ AI)"
    ]),
    correct_index: "",
    correct_answer: JSON.stringify([
      "Soft Skills",
      "Hard Skills",
      "Soft Skills",
      "Hard Skills"
    ]),
    explanation: "Critical Thinking và Empathy là Soft Skills; Data Literacy và AI Tools là Hard Skills.",
    tags: "Kỹ năng,Phân loại",
    difficulty: 3,
    topic_group_name: "Kỹ năng BA"
  },
  {
    title: "Điểm Chạm Con Người",
    description: "Trong một dự án triển khai CRM, Mai phát hiện ra đội Sales đang cố tình chống đối việc nhập liệu vào hệ thống mới vì họ sợ bị kiểm soát. AI đã phân tích dữ liệu hành vi và chỉ ra rằng tốc độ nhập liệu đang giảm, nhưng AI không thể biết tại sao. Mai đã rủ trưởng nhóm Sales đi uống cà phê, lắng nghe những lo lắng thầm kín của họ và điều chỉnh quy trình để họ thấy an tâm hơn. Tố chất 'bất biến' nào của con người mà Mai đã thể hiện ở đây?",
    question_type: "single",
    choices: JSON.stringify([
      "Tư duy hệ thống (Systems Thinking)",
      "Khả năng trực quan hóa dữ liệu",
      "Trí tuệ cảm xúc (EQ) và khả năng thấu cảm (Empathy)",
      "Kỹ năng Prompt Engineering"
    ]),
    correct_index: 2,
    correct_answer: "",
    explanation: "Sự thấu cảm và trí tuệ cảm xúc giúp BA xử lý các mâu thuẫn chính trị và tâm lý trong tổ chức mà AI không thể làm.",
    tags: "EQ,Empathy",
    difficulty: 1,
    topic_group_name: "Tố chất BA"
  },
  {
    title: "Sức Nặng Trách Nhiệm",
    description: "Hệ thống AI đề xuất một tính năng tối ưu hóa lộ trình giao hàng, giúp công ty tiết kiệm 20% chi phí nhưng lại khiến tài xế làm việc vất vả hơn và nguy cơ lách luật lao động cao. Đứng trước đề xuất này của AI, Mai quyết định bác bỏ vì nhận thấy rủi ro pháp lý và ảnh hưởng xấu đến văn hóa công ty. Qua hành động này, những tố chất nào của Mai đã bù đắp cho sự thiếu hụt của AI?",
    question_type: "multiple",
    choices: JSON.stringify([
      "Tư duy hệ thống (Systems Thinking) để nhìn nhận bài toán tổng thể",
      "Khả năng tạo mockup giao diện nhanh chóng",
      "Sự nhạy bén nghiệp vụ và khả năng chịu trách nhiệm (Accountability)",
      "Tốc độ gõ phím và soạn thảo văn bản"
    ]),
    correct_index: "",
    correct_answer: JSON.stringify([0, 2]),
    explanation: "AI không có mục tiêu nghiệp vụ dài hạn hay chịu trách nhiệm pháp lý. BA phải dùng Tư duy hệ thống và Sự chịu trách nhiệm để dẫn dắt quyết định.",
    tags: "Accountability,Systems Thinking",
    difficulty: 3,
    topic_group_name: "Tố chất BA"
  },
  {
    title: "Ngôn Ngữ Của Dữ Liệu",
    description: "Để làm việc hiệu quả với đội ngũ Data Scientist trong dự án xây dựng mô hình dự đoán xu hướng mua hàng, Mai nhận ra mình không cần phải tự tay viết code Python, nhưng cô bắt buộc phải biết cách đọc hiểu báo cáo dữ liệu và trực quan hóa các bảng biểu (bằng PowerBI/Tableau) để dịch lại ngôn ngữ dữ liệu sang ngôn ngữ kinh doanh cho Giám đốc. Kỹ năng Mai đang sử dụng được gọi là gì?",
    question_type: "single",
    choices: JSON.stringify([
      "Machine Learning Engineering",
      "Data Literacy (Hiểu biết dữ liệu)",
      "Cloud Computing",
      "Cybersecurity"
    ]),
    correct_index: 1,
    correct_answer: "",
    explanation: "Data Literacy (Hiểu biết dữ liệu) là khả năng đọc, hiểu, và giao tiếp hiệu quả về dữ liệu.",
    tags: "Data Literacy,Hard Skills",
    difficulty: 2,
    topic_group_name: "Kỹ năng BA"
  },
  {
    title: "Đường Lên Đỉnh",
    description: "Hành trình tiến hóa của một Business Analyst truyền thống để trở thành một 'AI-Powered BA' trải qua nhiều cột mốc. Dựa trên trải nghiệm của Mai, hãy sắp xếp các cột mốc sau theo trình tự phát triển lý tưởng.",
    question_type: "ordering",
    choices: JSON.stringify([
      "Nắm vững các kỹ năng lõi của BA (Tư duy phân tích, giao tiếp, nghiệp vụ)",
      "Làm quen với AI qua các tác vụ cơ bản (Sửa lỗi chính tả, dịch thuật)",
      "Học cách viết Prompt chuyên sâu để Brainstorm và tạo khung tài liệu (Baseline)",
      "Sử dụng 3 bộ lọc để thẩm định và kiểm soát chất lượng đầu ra của AI",
      "Tích hợp AI làm cốt lõi để đưa ra giải pháp kinh doanh thông minh (AI-Driven)"
    ]),
    correct_index: "",
    correct_answer: "",
    explanation: "Quá trình tiến hóa: Lõi BA -> Dùng cơ bản -> Viết Prompt sâu -> Thẩm định -> AI-Driven BA.",
    tags: "Lộ trình,Tiến hóa",
    difficulty: 4,
    topic_group_name: "Định hướng"
  },
  {
    title: "Kim Chỉ Nam",
    description: "Sau nhiều tháng làm việc cùng AI, Mai được công ty vinh danh là BA xuất sắc nhất năm. Trong bài phát biểu chia sẻ kinh nghiệm, Mai đúc kết lại một nguyên tắc làm việc kim chỉ nam cho các BA trong thời đại số: Luôn nghĩ đến việc ứng dụng AI để tối ưu hóa công việc, nhưng không bao giờ ỷ lại hoàn toàn vào nó mà bỏ quên sự tương tác con người. Nguyên tắc này trong tiếng Anh được tóm gọn bằng cụm từ nào?",
    question_type: "single",
    choices: JSON.stringify([
      "AI-First, but Not AI-Only",
      "AI-Only, No Human",
      "Human-First, Reject AI",
      "Waterfall over Agile"
    ]),
    correct_index: 0,
    correct_answer: "",
    explanation: "Nguyên tắc 'AI-First, but Not AI-Only' nhấn mạnh việc tận dụng tối đa AI nhưng vẫn giữ lại vai trò quyết định và thấu cảm của con người.",
    tags: "Nguyên tắc,AI-First",
    difficulty: 1,
    topic_group_name: "Định hướng, AI"
  },
  {
    title: "Chương Cuối",
    description: "Nhìn lại chặng đường đã qua, từ những bỡ ngỡ ban đầu đến lúc trở thành một AI-Powered BA thực thụ, Mai tự hỏi về câu hỏi kinh điển: 'Liệu AI có thay thế BA không?'. Dựa vào những kinh nghiệm xương máu và những phân tích tại hội thảo, câu trả lời chính xác nhất phản ánh đúng bản chất của sự dịch chuyển này là gì?",
    question_type: "multiple",
    choices: JSON.stringify([
      "AI chắc chắn sẽ thay thế toàn bộ BA trong vòng 5 năm tới",
      "AI không thay thế BA, nhưng một BA biết dùng AI sẽ thay thế BA không biết dùng",
      "AI chỉ là một trào lưu nhất thời, không ảnh hưởng đến nghề BA",
      "BA sở hữu tư duy AI và sự nhạy bén nghiệp vụ sẽ trở thành tài sản vô giá không thể thay thế"
    ]),
    correct_index: "",
    correct_answer: JSON.stringify([1, 3]),
    explanation: "AI là công cụ đòn bẩy. Sự kết hợp giữa năng lực AI và tư duy/tố chất con người mới là yếu tố quyết định.",
    tags: "Tương lai,Kết luận",
    difficulty: 2,
    topic_group_name: "Bối cảnh"
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

XLSX.writeFile(wb, 'public/sample-questions-import.xlsx');
console.log("File created: public/sample-questions-import.xlsx");
