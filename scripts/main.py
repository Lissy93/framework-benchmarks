import os

def main():
    readme_path = os.path.join(os.path.dirname(__file__), 'README.txt')
    try:
        with open(readme_path, 'r', encoding='utf8') as f:
            data = f.read()
        print('\033[34m' + data)
    except Exception as err:
        print(f'Error reading README.txt: {err}')
        exit(1)

if __name__ == "__main__":
    main()
