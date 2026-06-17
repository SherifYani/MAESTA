import os

file_path = r'c:\Users\aboam\Documents\MAESTA-chat-bot\services\agent\agents\rag_graph.py'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove trailing whitespace and ensure newline at end of file
new_lines = [line.rstrip() + '\n' for line in lines]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Sanitized {file_path}")
