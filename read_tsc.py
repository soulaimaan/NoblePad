
import os

def read_tsc_output():
    file_path = 'tsc_output.txt'
    if not os.path.exists(file_path):
        print("File not found")
        return

    try:
        # Try different encodings
        encodings = ['utf-16le', 'utf-8', 'utf-16']
        content = None
        for enc in encodings:
            try:
                with open(file_path, 'r', encoding=enc) as f:
                    content = f.read()
                print(f"Read successfully with {enc}")
                break
            except Exception:
                continue

        if content:
            # Print only lines containing errors to reduce volume
            lines = content.splitlines()
            error_count = 0
            for line in lines:
                if 'error' in line.lower() or '.ts' in line or '.tsx' in line:
                    print(line)
                    error_count += 1
            print(f"\nTotal error lines found: {error_count}")
        else:
            print("Could not read file with any encoding")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    read_tsc_output()
