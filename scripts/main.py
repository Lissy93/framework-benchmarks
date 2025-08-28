import os
import re

MAGENTA = '\033[95m'
CYAN = '\033[96m' 
WHITE = '\033[97m'
BLUE = '\033[94m'
BOLD = '\033[1m'
RESET = '\033[0m'

def main():
    readme_path = os.path.join(os.path.dirname(__file__), 'README.txt')
    try:
        with open(readme_path, 'r', encoding='utf8') as f:
            data = f.read()
        
        # Color section headers (lines with === and inner text)
        data = re.sub(r'(=+.*=+)', f'{MAGENTA}\\1{RESET}', data)
        
        # Color box drawing characters
        box_chars = '┌┐└┘├┤┬┴┼─│╭╮╰╯├┤┬┴┼═║╔╗╚╝╠╣╦╩╬'
        for char in box_chars:
            data = data.replace(char, f'{CYAN}{char}{RESET}')
        
        # Color remaining text white
        lines = data.split('\n')
        colored_lines = []
        for line in lines:
            if re.match(r'^[\U0001F300-\U0001FAFF]', line):
                line = f'{MAGENTA}{BOLD}{line}{RESET}'
            if not re.search(r"  +", line) and re.search(r"─+.*─+", line):
                line = line.replace(' ', ' ' + CYAN)
            if not (MAGENTA in line or CYAN in line):
                line = f'{WHITE}{line}{RESET}'
            colored_lines.append(line)
        
        print('\n'.join(colored_lines))
        
    except Exception:
        with open(readme_path, 'r', encoding='utf8') as f:
            print(f'{BLUE}{f.read()}{RESET}')

if __name__ == "__main__":
    main()
