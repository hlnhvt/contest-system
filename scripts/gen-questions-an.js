const XLSX = require('xlsx');
const path = require('path');

const questions = [
  {
    title: "Người bạn đồng hành trong IDE",
    description: `An là một lập trình viên backend mới vào nghề, đang làm việc tại một công ty phần mềm chuyên phát triển hệ thống quản lý cho doanh nghiệp. Một ngày, trưởng nhóm giới thiệu cho An công cụ GitHub Copilot — một trợ lý lập trình AI được tích hợp trực tiếp vào VS Code. Trưởng nhóm giải thích rằng Copilot có thể đọc hiểu ngữ cảnh từ các đoạn code và comment đã có, sau đó tự động đề xuất đoạn code tiếp theo mà không cần lập trình viên gõ từng ký tự. An thử ngay bằng cách viết một hàm tính tổng danh sách số nguyên: chỉ cần gõ tên hàm và một dòng comment mô tả mục đích, Copilot đã đề xuất toàn bộ phần thân hàm hoàn chỉnh trong vòng vài giây. An cảm thấy rất hứng thú nhưng cũng bắt đầu tự hỏi: trong số những lợi ích được quảng cáo, điều gì thực ra KHÔNG phải là thế mạnh của Copilot?`,
    question_type: "single",
    choices: JSON.stringify(["Giảm thời gian gõ code cho các đoạn lặp đi lặp lại", "Đề xuất cú pháp và API phù hợp với ngữ cảnh hiện tại của file code", "Đảm bảo toàn bộ code được tạo ra hoàn toàn không có lỗi logic và lỗ hổng bảo mật", "Hỗ trợ nhiều ngôn ngữ lập trình phổ biến như Python, Java, JavaScript, Go"]),
    correct_index: 2,
    correct_answer: "",
    explanation: "GitHub Copilot là công cụ gợi ý code dựa trên AI, nhưng nó không đảm bảo code tạo ra là đúng về logic hay an toàn về bảo mật. Lập trình viên vẫn phải review kỹ trước khi sử dụng — đây là hiểu lầm phổ biến nhất về Copilot.",
    tags: "AI,Developer,Copilot",
    difficulty: 1
  },
  {
    title: "An và deadline không thể trượt",
    description: `Sau vài tuần làm việc, An được giao nhiệm vụ viết unit test cho một module xử lý đơn hàng có nhiều điều kiện phân nhánh phức tạp: giảm giá theo hạng khách hàng (Bạch Kim, Vàng, Bạc), kiểm tra tồn kho theo từng kho vùng miền, và xử lý thanh toán đa phương thức. Tổng cộng module có hơn 30 nhánh logic khác nhau và An ước tính sẽ mất 2–3 ngày để viết test thủ công. An quyết định thử dùng ChatGPT: paste toàn bộ source code hàm vào và yêu cầu AI sinh test case bao phủ các boundary condition. ChatGPT trả về một danh sách 20 test case trong vài phút. Tuy nhiên khi An chạy thử, 4 test case bị fail vì ChatGPT hiểu sai một điều kiện nghiệp vụ đặc thù: công ty áp dụng giảm giá tối đa 15% cho khách Bạch Kim nhưng chỉ vào thứ Sáu — quy tắc này không được ghi rõ trong code mà nằm trong tài liệu đặc tả nội bộ. An rút ra bài học và điều chỉnh cách tiếp cận. Đâu là chiến lược đúng nhất để khắc phục tình huống trên?`,
    question_type: "single",
    choices: JSON.stringify(["Dùng toàn bộ test case do AI sinh ra mà không cần chỉnh sửa vì AI đã phân tích đầy đủ source code", "Cung cấp thêm tài liệu đặc tả nghiệp vụ cụ thể trong prompt để AI hiểu đúng context trước khi sinh test", "Chỉ dùng AI cho các hàm đơn giản, tuyệt đối không dùng cho logic nghiệp vụ phức tạp", "Thay thế hoàn toàn việc viết test bằng AI để tối đa hóa tốc độ giao hàng"]),
    correct_index: 1,
    correct_answer: "",
    explanation: "Khi prompt thiếu context nghiệp vụ, AI dễ hiểu sai yêu cầu đặc thù. Bổ sung tài liệu đặc tả, ví dụ minh họa hoặc mô tả điều kiện biên cụ thể vào prompt giúp AI sinh test case chính xác hơn đáng kể. AI là trợ lý, không thể tự suy luận nghiệp vụ ẩn.",
    tags: "AI,Testing,Prompt",
    difficulty: 2
  },
  {
    title: "Reviewer không bao giờ mệt",
    description: `Dự án của An ngày càng phát triển, số lượng Pull Request tăng từ 5 lên 20 PR mỗi tuần khiến quá trình review bị nghẽn cổ chai nghiêm trọng. Team lead quyết định tích hợp một công cụ AI review code tự động vào pipeline CI/CD — công cụ này sẽ phân tích mỗi PR và để lại comment gợi ý trước khi có reviewer con người. An được giao đánh giá hiệu quả thực tế sau hai sprint thử nghiệm. Kết quả thu thập được: AI phát hiện nhiều vấn đề về coding style, naming convention không nhất quán, và một số đoạn code trùng lặp (code smell). Tuy nhiên AI hoàn toàn không bắt được các lỗi liên quan đến sai nghiệp vụ (ví dụ: tính sai công thức chiết khấu vì hiểu nhầm yêu cầu), và đôi khi đưa ra gợi ý refactor không phù hợp với kiến trúc event-driven riêng của hệ thống. Dựa trên phân tích đó, đâu là những nhận định ĐÚNG về vai trò của AI trong code review?`,
    question_type: "multiple",
    choices: JSON.stringify(["AI phù hợp để kiểm tra tuân thủ coding convention và phát hiện code smell tự động", "AI có thể thay thế hoàn toàn việc review thủ công của senior developer trong mọi trường hợp", "AI giúp giảm tải công việc review lặp đi lặp lại, để senior developer tập trung vào logic nghiệp vụ", "AI đặc biệt mạnh trong việc phát hiện lỗi logic nghiệp vụ phức tạp mà con người hay bỏ sót", "AI cần được cung cấp thêm context về kiến trúc và quy tắc riêng của dự án để cho kết quả phù hợp hơn"]),
    correct_index: "",
    correct_answer: JSON.stringify([0, 2, 4]),
    explanation: "AI code review mạnh ở convention, style và pattern phổ biến. Tuy nhiên AI không thể thay thế review của con người về logic nghiệp vụ và kiến trúc đặc thù. Kết hợp AI (lọc vấn đề cơ bản) + human (kiểm tra logic sâu) là cách tiếp cận tối ưu.",
    tags: "AI,Developer,CodeReview",
    difficulty: 3
  },
  {
    title: "Khi An suýt gửi nhầm báo cáo",
    description: `An đảm nhận thêm vai trò BA (Business Analyst) trong một dự án chuyển đổi số cho một chuỗi bán lẻ. Khách hàng gửi một tài liệu yêu cầu dài 40 trang với nhiều đoạn mô tả không rõ ràng và mâu thuẫn nhau — chẳng hạn: "Hệ thống cần xử lý đơn hàng nhanh và đảm bảo trải nghiệm người dùng thân thiện nhất có thể." An quyết định dùng Claude AI để hỗ trợ: paste từng phần tài liệu vào và yêu cầu AI liệt kê các yêu cầu chức năng, phi chức năng, và các điểm còn mơ hồ cần làm rõ với stakeholder. AI trả về một danh sách có cấu trúc tốt, đẹp mắt, bao gồm cả các câu hỏi confirm. An cảm thấy hài lòng và sắp gửi thẳng cho khách hàng. Nhưng trước khi gửi, đồng nghiệp lướt qua và phát hiện 3 yêu cầu trong danh sách của AI nghe rất hợp lý nhưng hoàn toàn không có trong tài liệu gốc. An nhận ra mình suýt phạm một sai lầm nghiêm trọng. Đâu là rủi ro cốt lõi mà An vừa trải qua?`,
    question_type: "single",
    choices: JSON.stringify(["AI bị giới hạn context window nên đọc sai các trang cuối của tài liệu dài", "AI có thể tạo ra các yêu cầu nghe có vẻ hợp lý nhưng thực ra không có trong tài liệu gốc — hiện tượng hallucination", "AI không hỗ trợ phân tích tài liệu tiếng Việt vì dữ liệu huấn luyện chủ yếu là tiếng Anh", "AI luôn bỏ qua các yêu cầu phi chức năng vì chúng không có cấu trúc rõ ràng"]),
    correct_index: 1,
    correct_answer: "",
    explanation: "Hallucination là hiện tượng AI tự sinh ra nội dung nghe hợp lý nhưng không có trong nguồn gốc. Đây là rủi ro thực sự và phổ biến khi dùng AI phân tích tài liệu yêu cầu. BA phải verify từng mục AI sinh ra đối chiếu với tài liệu gốc trước khi dùng.",
    tags: "AI,BA,Hallucination,Requirements",
    difficulty: 2
  },
  {
    title: "Đúng người, đúng việc",
    description: `Sau nhiều tháng thử nghiệm, An đã tích lũy được kinh nghiệm thực tế với nhiều công cụ AI khác nhau trong công việc phát triển phần mềm. Một buổi chia sẻ kinh nghiệm nội bộ được tổ chức, An được yêu cầu chuẩn bị bảng hướng dẫn lựa chọn công cụ AI phù hợp: với mỗi tình huống công việc cụ thể, nên dùng loại công cụ AI nào là tối ưu nhất. An đã thử nghiệm và đánh giá 4 công cụ đại diện cho 4 nhóm AI khác nhau trong quy trình phát triển phần mềm. Trong buổi thuyết trình, An đưa ra 4 tình huống công việc thực tế và yêu cầu người nghe ghép đúng từng tình huống với công cụ phù hợp nhất. Hãy giúp An hoàn thành bảng ghép đôi này.`,
    question_type: "matching",
    choices: JSON.stringify(["GitHub Copilot", "ChatGPT / Claude", "Playwright AI / Testim", "Miro AI / FigJam AI"]),
    correct_index: "",
    correct_answer: JSON.stringify(["Gợi ý và hoàn thiện code trực tiếp trong IDE khi lập trình", "Phân tích tài liệu yêu cầu, viết user story và tạo nội dung văn bản", "Tự động hóa kiểm thử giao diện người dùng (UI automation test)", "Tạo sơ đồ luồng nghiệp vụ và phác thảo wireframe nhanh"]),
    explanation: "Mỗi nhóm công cụ AI được tối ưu cho một loại tác vụ: Copilot cho code completion, LLM (ChatGPT/Claude) cho xử lý ngôn ngữ và phân tích văn bản, AI testing framework cho UI automation, và AI diagramming cho thiết kế quy trình.",
    tags: "AI Tools,BA,Developer,Testing",
    difficulty: 3
  },
  {
    title: "Bước nào trước, bước nào sau?",
    description: `Sau khi áp dụng AI vào kiểm thử được vài tháng, An được team lead giao nhiệm vụ chuẩn hóa và viết tài liệu quy trình kiểm thử mới cho cả team — quy trình này tích hợp AI vào từng bước một cách có hệ thống. An nghiên cứu các tài liệu về AI-Augmented Testing, tham khảo kinh nghiệm thực tế của nhiều công ty, và tổng hợp lại thành 5 hoạt động cốt lõi. Tuy nhiên khi trình bày trước team, An vô tình để các bước bị xáo trộn thứ tự trên slide. Đây là điều quan trọng vì nếu thực hiện sai thứ tự — ví dụ dùng AI sinh test case trước khi có đặc tả rõ ràng, hoặc chạy test trước khi review kết quả AI — sẽ gây lãng phí công sức và bỏ sót lỗi nghiêm trọng. Hãy sắp xếp lại đúng thứ tự 5 bước trong quy trình kiểm thử có hỗ trợ AI từ đầu đến cuối.`,
    question_type: "ordering",
    choices: JSON.stringify(["Xác định phạm vi kiểm thử, tiêu chí chấp nhận và đặc tả đầu vào/đầu ra", "Dùng AI sinh test case dựa trên đặc tả và yêu cầu đã được xác nhận", "Review và hiệu chỉnh test case do AI tạo ra theo nghiệp vụ và kiến trúc thực tế", "Thực thi test case và ghi nhận kết quả thực tế", "Phân tích kết quả, báo cáo bug và cập nhật lại bộ test suite"]),
    correct_index: "",
    correct_answer: "",
    explanation: "Thứ tự đúng: xác định phạm vi → AI sinh test case → con người review → thực thi → phân tích & cải tiến. Bỏ qua bước review của con người dễ dẫn đến test case sai hoặc thiếu coverage nghiệp vụ quan trọng.",
    tags: "AI,Testing,Workflow,Process",
    difficulty: 2
  },
  {
    title: "An học phép thuật hỏi đáp",
    description: `Sau khi đã quen với việc dùng AI cơ bản, An bắt đầu nghiên cứu sâu về Prompt Engineering — nghệ thuật viết prompt để AI trả lời chính xác và có chiều sâu hơn. An đọc tài liệu về Chain-of-Thought (CoT), Few-shot prompting, Role prompting, Tree-of-Thought và kỹ thuật tự phê bình (self-critique). Trong một buổi thực hành thực tế, An đối mặt với bài toán phân tích rủi ro toàn diện cho một dự án xây dựng hệ thống thanh toán trực tuyến: cần AI liệt kê đầy đủ và có cơ sở các rủi ro kỹ thuật, nghiệp vụ, bảo mật, pháp lý và vận hành. Đây là bài toán yêu cầu tư duy đa chiều và có độ phức tạp cao — một câu hỏi đơn giản một dòng rõ ràng là không đủ. An muốn chọn đúng kỹ thuật prompt để có kết quả toàn diện nhất. Đâu là những kỹ thuật PHỤC HỢP cho tình huống phân tích rủi ro phức tạp này?`,
    question_type: "multiple",
    choices: JSON.stringify(["Role prompting: yêu cầu AI đóng vai chuyên gia quản lý rủi ro phần mềm có 10 năm kinh nghiệm", "Chain-of-Thought: yêu cầu AI lần lượt phân tích từng khía cạnh rủi ro trước khi tổng hợp danh sách cuối", "Few-shot: cung cấp 1–2 ví dụ về cách phân tích rủi ro đúng chuẩn trước khi đặt câu hỏi thật", "Zero-shot một dòng: 'Liệt kê rủi ro của hệ thống thanh toán' mà không cung cấp thêm context nào", "Yêu cầu AI tự đánh giá lại câu trả lời và bổ sung những điểm còn thiếu trong vòng thứ hai"]),
    correct_index: "",
    correct_answer: JSON.stringify([0, 1, 2, 4]),
    explanation: "Role prompting, CoT, Few-shot và self-critique đều giúp AI phân tích sâu hơn và toàn diện hơn với bài toán phức tạp. Zero-shot một dòng thường cho kết quả nông và thiếu sót với bài toán đa chiều như phân tích rủi ro hệ thống thanh toán.",
    tags: "AI,Prompt Engineering,BA,Strategy",
    difficulty: 4
  },
  {
    title: "Con số đẹp, lòng chưa yên",
    description: `Team của An nhận được cảnh báo từ hệ thống CI/CD: module thanh toán của sản phẩm chỉ đạt 62% line coverage, trong khi chính sách kỹ thuật yêu cầu tối thiểu 80% mới được merge vào nhánh main. Deadline còn 2 ngày, An quyết định dùng AI để sinh thêm test case bổ sung. An cung cấp cho AI: toàn bộ source code của module (450 dòng), báo cáo coverage hiện tại chỉ ra các dòng chưa được chạy qua, và yêu cầu AI sinh test case bao phủ các branch còn thiếu. AI trả về 18 test case mới, sau khi chạy, chỉ số coverage nhảy lên 83% — vượt ngưỡng yêu cầu. An tự hào merge code và đóng task. Nhưng hai tuần sau, production bị báo lỗi ở chính module thanh toán — một trường hợp tính sai số tiền hoàn trả khi áp dụng đồng thời hai loại voucher. Trong buổi post-mortem, senior tester chỉ ra vấn đề mấu chốt. Vấn đề đó là gì?`,
    question_type: "single",
    choices: JSON.stringify(["AI không thể sinh test cho các trường hợp kết hợp nhiều điều kiện cùng lúc, đây là giới hạn kỹ thuật của LLM", "Coverage tăng không đồng nghĩa với chất lượng test tốt: test có thể chạy qua dòng code mà không có assertion kiểm tra đúng kết quả nghiệp vụ", "Lỗi xuất phát từ môi trường staging khác production, không liên quan đến test case AI sinh ra", "Nên dùng mutation testing thay vì line coverage, nhưng công cụ mutation testing hiện tại không tương thích với AI"]),
    correct_index: 1,
    correct_answer: "",
    explanation: "Coverage là điều kiện cần nhưng chưa đủ. AI có xu hướng tối ưu metric coverage bằng cách tạo test 'chạy qua' code mà không có assertion nghiệp vụ chặt chẽ. Test case cần kiểm tra đúng KẾT QUẢ, không chỉ thực thi được dòng code.",
    tags: "AI,Testing,Coverage,Quality,Anti-pattern",
    difficulty: 4
  },
  {
    title: "Bốn con đường thu thập thông tin",
    description: `An đang tham gia một khóa học nâng cao về Business Analysis kết hợp AI. Trong buổi học về Requirements Elicitation, giảng viên giới thiệu 4 kỹ thuật thu thập yêu cầu truyền thống và đặt câu hỏi thực hành: với mỗi kỹ thuật, AI hiện tại có thể hỗ trợ theo cách nào hiệu quả nhất? An đã trải nghiệm thực tế với cả 4 kỹ thuật trong các dự án trước đó và có đủ cơ sở để trả lời. Đây là bài tập giúp BA hiểu rõ AI không chỉ là "công cụ viết lách" mà còn có thể được tích hợp sâu vào từng phương pháp thu thập yêu cầu khác nhau. Hãy giúp An ghép đúng từng kỹ thuật elicitation với ứng dụng AI phù hợp nhất.`,
    question_type: "matching",
    choices: JSON.stringify(["Phỏng vấn stakeholder (Stakeholder Interview)", "Phân tích tài liệu sẵn có (Document Analysis)", "Workshop nhóm có điều phối (Facilitated Workshop)", "Quan sát quy trình thực tế (Observation / Job Shadowing)"]),
    correct_index: "",
    correct_answer: JSON.stringify(["AI tổng hợp bộ câu hỏi phỏng vấn và phân tích transcript ghi âm để trích xuất yêu cầu ẩn", "AI trích xuất yêu cầu, phát hiện mâu thuẫn và tóm tắt điểm chính từ tài liệu sẵn có", "AI tạo agenda, tóm tắt kết quả thảo luận và gợi ý các điểm chưa được đề cập", "AI phân tích log hệ thống và dữ liệu hành vi người dùng để bổ sung cho quan sát trực tiếp"]),
    explanation: "AI có thể hỗ trợ đa dạng các kỹ thuật elicitation: sinh câu hỏi và phân tích transcript cho interview; so sánh và trích xuất cho document analysis; tóm tắt workshop; phân tích dữ liệu hành vi cho observation.",
    tags: "AI,BA,Requirements,Elicitation",
    difficulty: 3
  },
  {
    title: "Khi An đặt quá nhiều niềm tin",
    description: `Sau hơn một năm áp dụng AI rộng rãi trong công việc, An được mời tham gia hội đồng đánh giá nội bộ về chiến lược AI của công ty. Câu hỏi trọng tâm được đặt ra: "Đâu là những rủi ro thực sự khi team phụ thuộc quá nhiều vào AI trong toàn bộ quy trình phát triển phần mềm?" An nhớ lại nhiều sự cố trong năm vừa qua: một lần AI sinh ra đoạn code xử lý mã hóa sai thuật toán (dùng MD5 thay vì bcrypt cho password) nhưng vẫn pass CI/CD vì test coverage chỉ kiểm tra cú pháp; một lần AI phân tích tài liệu yêu cầu bỏ sót hoàn toàn một ràng buộc pháp lý về bảo vệ dữ liệu cá nhân theo Nghị định 13; và một lần team giảm 40% thời gian code review vì tin tưởng AI quá mức khiến một race condition nghiêm trọng không được phát hiện. Dựa trên những sự cố có thực đó, đâu là các rủi ro CÓ CƠ SỞ khi phụ thuộc thái quá vào AI?`,
    question_type: "multiple",
    choices: JSON.stringify(["Kỹ năng tư duy phân tích và debug độc lập của team bị mai một dần theo thời gian (AI deskilling)", "AI có thể tự học và thay đổi hành vi trong quá trình vận hành mà không cần cập nhật model", "Code do AI sinh ra có thể chứa lỗ hổng bảo mật tinh vi nếu không được review bởi chuyên gia bảo mật", "AI LLM luôn tạo ra output giống hệt nhau với cùng một input, giúp kết quả hoàn toàn xác định và dễ kiểm soát", "Phụ thuộc vào dịch vụ AI bên ngoài tạo ra rủi ro gián đoạn khi API thay đổi giá hoặc ngừng hoạt động", "AI hiện tại có thể tự động nhận diện và tuân thủ đầy đủ mọi ràng buộc pháp lý địa phương mà không cần con người kiểm soát"]),
    correct_index: "",
    correct_answer: JSON.stringify([0, 2, 4]),
    explanation: "Ba rủi ro có cơ sở: (0) deskilling khi team không luyện tập tư duy độc lập; (2) lỗ hổng bảo mật trong code AI sinh ra; (4) rủi ro phụ thuộc dịch vụ bên ngoài. Các câu còn lại là quan niệm sai: LLM không tự học trong runtime, LLM có tính ngẫu nhiên (temperature > 0), và AI hiện tại không đủ khả năng tuân thủ pháp lý địa phương tự động.",
    tags: "AI,Ethics,BA,Developer,Risk,Security",
    difficulty: 5
  },
  {
    title: "An vẽ bản đồ cho cả công ty",
    description: `Công ty của An quyết định chuẩn hóa và mở rộng quy mô ứng dụng AI vào toàn bộ Software Development Life Cycle (SDLC) sau một năm thử nghiệm thành công ở quy mô nhỏ. An được giao xây dựng lộ trình triển khai chính thức gồm 6 giai đoạn cho toàn công ty 120 nhân sự kỹ thuật. Sau nhiều buổi họp với CTO, trưởng nhóm kỹ thuật, team pháp lý và bộ phận HR, An đúc kết được 6 hoạt động bắt buộc cần thực hiện. Điều quan trọng là các hoạt động này phải được thực hiện theo ĐÚNG THỨ TỰ — sai thứ tự có thể dẫn đến vi phạm bảo mật dữ liệu, lãng phí ngân sách đào tạo hoặc kháng cự từ nhân viên. Ví dụ: triển khai rộng trước khi xây chính sách sẽ gây vi phạm compliance; đào tạo trước khi thí điểm sẽ khó tạo được case study thực tế thuyết phục. Hãy giúp An sắp xếp đúng thứ tự 6 giai đoạn trong lộ trình tích hợp AI vào SDLC.`,
    question_type: "ordering",
    choices: JSON.stringify(["Đánh giá hiện trạng quy trình và xác định các điểm đau cụ thể cần AI giải quyết", "Xây dựng chính sách sử dụng AI: bảo mật dữ liệu, quyền riêng tư, kiểm soát chất lượng và trách nhiệm giải trình", "Thí điểm AI trên một dự án nhỏ có phạm vi giới hạn và thu thập dữ liệu đo lường hiệu quả", "Đào tạo toàn team về công cụ AI được chọn và kỹ năng Prompt Engineering dựa trên case study thực tế", "Triển khai AI vào toàn bộ SDLC kèm theo cơ chế giám sát và phản hồi liên tục", "Đánh giá toàn diện sau 3–6 tháng vận hành và điều chỉnh chiến lược AI phù hợp"]),
    correct_index: "",
    correct_answer: "",
    explanation: "Thứ tự đúng: đánh giá hiện trạng → xây dựng chính sách → thí điểm → đào tạo (dựa trên case study thực) → triển khai rộng → đánh giá lại. Bỏ qua chính sách hoặc thí điểm trước khi đào tạo là hai sai lầm phổ biến nhất khi tổ chức áp dụng AI quy mô lớn.",
    tags: "AI,SDLC,Strategy,Architecture,Governance",
    difficulty: 4
  },
  {
    title: "Hai tỷ đồng và một bài học",
    description: `Dự án lớn nhất trong sự nghiệp của An là phát triển hệ thống AI hỗ trợ phê duyệt hợp đồng cho một công ty bảo hiểm hàng đầu. Hệ thống sử dụng Large Language Model để phân tích điều khoản hợp đồng và đưa ra khuyến nghị chấp thuận hoặc từ chối kèm mức độ tin cậy (confidence score). Sau 3 tháng vận hành, một sự cố nghiêm trọng xảy ra: hệ thống AI phê duyệt một hợp đồng chứa điều khoản loại trừ trách nhiệm bất lợi cho công ty — điều khoản này được viết theo cấu trúc pháp lý phức tạp và không phổ biến. Nhân viên xử lý ca đó đã bỏ qua bước review thủ công vì tin tưởng vào confidence score 94% của AI. Tổng thiệt hại ước tính lên đến 2 tỷ đồng. Hội đồng quản trị triệu tập họp khẩn. An — người đã thiết kế quy trình nghiệp vụ của hệ thống — nhận ra rằng sự cố này đáng lẽ đã được ngăn chặn ngay từ giai đoạn thiết kế nếu tuân thủ đúng các nguyên tắc Responsible AI. Theo nguyên tắc thiết kế AI có trách nhiệm, biện pháp nào NÊN ĐƯỢC tích hợp từ đầu để phòng ngừa loại sự cố này?`,
    question_type: "single",
    choices: JSON.stringify(["Tăng ngưỡng confidence threshold lên 99% và chặn AI đưa ra khuyến nghị khi dưới ngưỡng đó", "Thiết kế quy trình Human-in-the-loop bắt buộc: AI chỉ đóng vai trò khuyến nghị, quyết định phê duyệt cuối cùng phải do con người có thẩm quyền ký xác nhận", "Thay thế hoàn toàn AI bằng hệ thống rule-based truyền thống để đảm bảo tính xác định và kiểm soát được", "Yêu cầu AI giải thích chi tiết lý do cho mọi khuyến nghị (Explainability) và lưu đầy đủ audit trail để truy vết sau sự cố"]),
    correct_index: 1,
    correct_answer: "",
    explanation: "Human-in-the-loop là nguyên tắc nền tảng của Responsible AI cho các quyết định có tác động pháp lý và tài chính cao. AI nên là công cụ hỗ trợ ra quyết định, không được trao quyền quyết định cuối cùng trong các tình huống rủi ro cao. Tăng threshold không giải quyết root cause; rule-based system có hạn chế về linh hoạt; explainability quan trọng nhưng không đủ nếu thiếu human oversight.",
    tags: "AI,Ethics,BA,Legal,Responsible AI,Governance",
    difficulty: 5
  }
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(questions, {
  header: ['title','description','question_type','choices','correct_index','correct_answer','explanation','tags','difficulty']
});

// Điều chỉnh độ rộng cột
ws['!cols'] = [
  { wch: 45 },   // title
  { wch: 100 },  // description
  { wch: 12 },   // question_type
  { wch: 80 },   // choices
  { wch: 14 },   // correct_index
  { wch: 30 },   // correct_answer
  { wch: 80 },   // explanation
  { wch: 35 },   // tags
  { wch: 10 },   // difficulty
];

XLSX.utils.book_append_sheet(wb, ws, 'Questions');

const outPath = path.join(__dirname, '..', 'public', 'questions-an-ai-journey-v2.xlsx');
XLSX.writeFile(wb, outPath);
console.log('Created:', outPath);
