import sys
path = r'd:\Seminar-BA\contest-system\public\admin\index.html'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def find_line(pattern):
    for i, line in enumerate(lines):
        if pattern in line:
            return i + 1
    return -1

print("nav-practice:", find_line("nav-practice"))
print("pane-questions hidden:", find_line("id=\"pane-questions\" class=\"hidden\""))
print("id=\"qDifficulty\"", find_line("id=\"qDifficulty\""))
print("let contests = [];", find_line("let contests = [];"))
print("await loadQuestions();", find_line("await loadQuestions();"))
print("const tabs = ['contests'", find_line("const tabs = ['contests'"))
print("tab === 'airequests'", find_line("tab === 'airequests'"))
print("btnFilterBookmark", find_line("id=\"btnFilterBookmark\""))
print("diffColors[q.difficulty]", find_line("diffColors[q.difficulty]"))
print("diffText.split('|')[1]", find_line("diffText.split('|')[1]"))
print("row.difficulty", find_line("row.difficulty"))
print("data.forEach((q, i)", find_line("data.forEach((q, i)"))
print("col-span-2 text-gray-800", find_line("col-span-2 text-gray-800"))
print("if (res.imported) {", find_line("if (res.imported) {"))
print("editQuestion", find_line("function editQuestion"))
print("filterQuestions() {", find_line("function filterQuestions() {"))
print("filterBookmarkOnly &&", find_line("filterBookmarkOnly &&"))
print("<!-- QUESTIONS -->", find_line("<!-- QUESTIONS -->"))
print("<!-- CONTESTS TAB -->", find_line("<!-- CONTESTS TAB -->"))
